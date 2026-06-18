<#
.SYNOPSIS
  Create the 4 Novacademy membership recurring prices in Stripe and print the
  STRIPE_PRICE_* env lines. Works in TEST or LIVE mode.

.DESCRIPTION
  Uses the Stripe CLI so no secret key is ever passed on the command line or
  pasted anywhere. Authorize once with `stripe login` (grants test + live),
  then run this with -Live to target live mode.

  Idempotent-ish: reuses an existing active product named "Novacademy
  Membership" instead of creating a duplicate. Prices are always created fresh
  (Stripe prices are immutable), so run this ONCE per mode and capture the IDs.

.EXAMPLE
  # one-time: authorize the CLI (opens a browser)
  stripe login

  # test mode (sanity check):
  ./scripts/create-membership-prices.ps1

  # live mode (real prices):
  ./scripts/create-membership-prices.ps1 -Live
#>
param(
  [switch]$Live
)

$ErrorActionPreference = 'Stop'

# Locate the Stripe CLI (winget install puts it under WinGet\Packages).
$stripe = (Get-Command stripe -ErrorAction SilentlyContinue).Source
if (-not $stripe) {
  $stripe = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet" -Recurse -Filter stripe.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
}
if (-not $stripe) { throw "Stripe CLI not found. Install: winget install Stripe.StripeCli" }

$modeFlag = if ($Live) { '--live' } else { '' }
$modeName = if ($Live) { 'LIVE' } else { 'TEST' }
Write-Host "Targeting $modeName mode." -ForegroundColor Cyan
if ($Live) {
  Write-Host "About to create REAL, customer-facing prices. Ctrl+C now to abort." -ForegroundColor Yellow
  Start-Sleep -Seconds 4
}

function Stripe-Json {
  param([string[]]$CliArgs)
  $allArgs = @($CliArgs)
  if ($modeFlag) { $allArgs += $modeFlag }
  # The CLI writes version-check + plugin-hint lines to stderr. In PS 5.1 those get
  # wrapped as terminating NativeCommandErrors under -ErrorActionPreference Stop, so
  # relax it just around the native call and detect real failures via the exit code.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $raw = & $stripe @allArgs 2>$null
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) { throw "stripe $($CliArgs -join ' ') failed (exit $code)" }
  # Strip any stray hint tag that lands on stdout, just in case.
  $clean = ($raw | Where-Object { $_ -notmatch 'claude-code-hint' }) -join "`n"
  $obj = $clean | ConvertFrom-Json
  # The CLI can return a Stripe API error body WITH exit code 0 (e.g. a restricted
  # key lacking permission), so check for an error object explicitly.
  if ($obj.error) { throw "Stripe API error: $($obj.error.message)" }
  return $obj
}

$PRODUCT_NAME = 'Novacademy Membership'

# Reuse an existing active membership product if present.
$products = (Stripe-Json @('products','list','--limit','100')).data
$prod = $products | Where-Object { $_.active -and $_.name -eq $PRODUCT_NAME } | Select-Object -First 1
if ($prod) {
  Write-Host "Reusing product $($prod.id)"
} else {
  $prod = Stripe-Json @('products','create','--name', $PRODUCT_NAME, '-d', 'description=Full access to every Novacademy course while your membership is active.')
  Write-Host "Created product $($prod.id)"
}

# (env var name, nickname, amount in cents, interval, interval_count, lookup_key)
$plans = @(
  @{ env='STRIPE_PRICE_MONTHLY';   nick='Monthly';  amt=3500;  interval='month'; count=1; lookup='membership_monthly' },
  @{ env='STRIPE_PRICE_QUARTERLY'; nick='3 months'; amt=9000;  interval='month'; count=3; lookup='membership_quarterly' },
  @{ env='STRIPE_PRICE_BIANNUAL';  nick='6 months'; amt=15000; interval='month'; count=6; lookup='membership_biannual' },
  @{ env='STRIPE_PRICE_ANNUAL';    nick='1 year';   amt=25000; interval='year';  count=1; lookup='membership_annual' }
)

$lines = @()
foreach ($p in $plans) {
  $price = Stripe-Json @(
    'prices','create',
    '--currency','usd',
    '--unit-amount', "$($p.amt)",
    '--product', $prod.id,
    '--nickname', $p.nick,
    '-d', "recurring[interval]=$($p.interval)",
    '-d', "recurring[interval_count]=$($p.count)",
    '-d', "lookup_key=$($p.lookup)",
    '-d', 'transfer_lookup_key=true'
  )
  Write-Host ("  {0,-22} {1}  (`${2} / {3}x{4})" -f $p.env, $price.id, ($p.amt/100), $p.interval, $p.count)
  $lines += "$($p.env)=$($price.id)"
}

Write-Host ""
Write-Host "=== $modeName env lines (set these in Vercel for prod / .env.local for dev) ===" -ForegroundColor Green
$lines | ForEach-Object { Write-Host $_ }
