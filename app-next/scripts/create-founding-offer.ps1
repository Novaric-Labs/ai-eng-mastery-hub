<#
.SYNOPSIS
  Create the Founding Member promotion in Stripe: a 40%-off-forever coupon and a
  customer-facing promotion code (FOUNDING40) that expires on a set date.

.DESCRIPTION
  Uses the Stripe CLI so no secret key is ever passed on the command line.
  Authorize once with `stripe login`, then run with -Live to target live mode.

  The coupon's duration is `forever`, so the 40% applies to every renewal for the
  life of the subscription (the "for life" in the offer copy). The offer window is
  time-boxed: the promotion code's expires_at stops it working after -ExpiresOn.
  Keep -ExpiresOn in sync with FOUNDING.endsAtISO in app-next/lib/offer.ts.

  Idempotent: if a promotion code named FOUNDING40 already exists in the target
  mode, it is reused rather than duplicated.

.EXAMPLE
  stripe login                              # one-time browser auth
  ./scripts/create-founding-offer.ps1       # TEST mode (sanity check)
  ./scripts/create-founding-offer.ps1 -Live # LIVE (real, customer-facing)
#>
param(
  [switch]$Live,
  [int]$PercentOff = 40,
  [string]$Code = 'FOUNDING40',
  [string]$ExpiresOn = '2026-07-04'  # last day the code works (end of day UTC)
)

$ErrorActionPreference = 'Stop'

$stripe = (Get-Command stripe -ErrorAction SilentlyContinue).Source
if (-not $stripe) {
  $stripe = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet" -Recurse -Filter stripe.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
}
if (-not $stripe) { throw "Stripe CLI not found. Install: winget install Stripe.StripeCli" }

$modeFlag = if ($Live) { '--live' } else { '' }
$modeName = if ($Live) { 'LIVE' } else { 'TEST' }
Write-Host "Targeting $modeName mode." -ForegroundColor Cyan
if ($Live) {
  Write-Host "About to create a REAL, customer-facing discount code. Ctrl+C now to abort." -ForegroundColor Yellow
  Start-Sleep -Seconds 4
}

function Stripe-Json {
  param([string[]]$CliArgs)
  $allArgs = @($CliArgs)
  if ($modeFlag) { $allArgs += $modeFlag }
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  $raw = & $stripe @allArgs 2>$null
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) { throw "stripe $($CliArgs -join ' ') failed (exit $code)" }
  $clean = ($raw | Where-Object { $_ -notmatch 'claude-code-hint' }) -join "`n"
  $obj = $clean | ConvertFrom-Json
  if ($obj.error) { throw "Stripe API error: $($obj.error.message)" }
  return $obj
}

# Reuse an existing FOUNDING code if it's already there (idempotent re-runs).
$existing = (Stripe-Json @('promotion-codes', 'list', '--code', $Code, '--limit', '1')).data | Select-Object -First 1
if ($existing) {
  Write-Host "Promotion code '$Code' already exists ($($existing.id)) - nothing to do." -ForegroundColor Green
  return
}

# 1) Coupon: 40% off, applies forever (every renewal).
$coupon = Stripe-Json @(
  'coupons', 'create',
  '--percent-off', "$PercentOff",
  '--duration', 'forever',
  '--name', 'Founding Member'
)
Write-Host "Created coupon $($coupon.id)  ($PercentOff% off, forever)"

# 2) Public promotion code that stops working after the offer window.
# expires_at is a unix timestamp - use end-of-day UTC for the chosen date.
$endUtc = [DateTimeOffset]::new([DateTime]::Parse($ExpiresOn).Date.AddDays(1).AddSeconds(-1), [TimeSpan]::Zero)
$expiresAt = $endUtc.ToUnixTimeSeconds()
$promo = Stripe-Json @(
  'promotion-codes', 'create',
  '--coupon', $coupon.id,
  '--code', $Code,
  '-d', "expires_at=$expiresAt"
)

Write-Host ""
Write-Host "=== $modeName Founding Member offer created ===" -ForegroundColor Green
Write-Host ("  Code:            {0}" -f $promo.code)
Write-Host ("  Discount:        {0}% off for life" -f $PercentOff)
Write-Host ("  Ends:            {0} (end of day UTC)" -f $ExpiresOn)
Write-Host ("  Promotion id:    {0}" -f $promo.id)
Write-Host ""
Write-Host "Checkout already sends allow_promotion_codes, so members can enter '$Code' now." -ForegroundColor Cyan
Write-Host "Track redemptions: Stripe Dashboard -> Product catalog -> Coupons -> Founding Member." -ForegroundColor Cyan
