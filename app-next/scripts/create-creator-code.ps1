<#
.SYNOPSIS
  Mint a per-creator/affiliate promotion code in Stripe. Each creator gets a
  unique code that is BOTH their audience's discount AND your attribution: Stripe
  reports redemptions per code, so you see exactly who drove which subscriptions.

.DESCRIPTION
  Uses the Stripe CLI (`stripe login` once, then -Live for live mode). One coupon
  + one promotion code per creator. Default is 15% off the first payment, which is
  plenty to drive a click while keeping attribution clean; tune with -PercentOff
  and -Months. Idempotent on the code value.

  Checkout already sends allow_promotion_codes, so the code works the moment it
  exists - no code change or redeploy needed.

.PARAMETER Code
  The creator's code, e.g. FIRESHIP. Keep it recognizable so reporting is legible.

.PARAMETER Months
  Discount duration: 0 = first payment only (default), N = first N months,
  -1 = forever. (Forever is expensive on a recurring product - use sparingly.)

.EXAMPLE
  ./scripts/create-creator-code.ps1 -Code FIRESHIP                       # 15% off first payment (TEST)
  ./scripts/create-creator-code.ps1 -Code FIRESHIP -PercentOff 20 -Live  # 20% off, LIVE
  ./scripts/create-creator-code.ps1 -Code NEWSLETTER -Months 3 -Live     # 20% off first 3 months
#>
param(
  [Parameter(Mandatory = $true)][string]$Code,
  [switch]$Live,
  [int]$PercentOff = 15,
  [int]$Months = 0,
  [int]$MaxRedemptions = 0
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
  Write-Host "About to create a REAL, customer-facing creator code. Ctrl+C now to abort." -ForegroundColor Yellow
  Start-Sleep -Seconds 3
}

function Stripe-Json {
  param([string[]]$CliArgs)
  $allArgs = @($CliArgs)
  if ($modeFlag) { $allArgs += $modeFlag }
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  # Capture stderr to a temp file so a real failure surfaces the CLI's message
  # (auth/permission/unknown-command) instead of a bare exit code.
  $errFile = [System.IO.Path]::GetTempFileName()
  $raw = & $stripe @allArgs 2>$errFile
  $exit = $LASTEXITCODE
  $stderr = (Get-Content $errFile -Raw -ErrorAction SilentlyContinue)
  Remove-Item $errFile -ErrorAction SilentlyContinue
  $ErrorActionPreference = $prev
  if ($exit -ne 0) { throw "stripe $($CliArgs -join ' ') failed (exit $exit): $stderr" }
  $clean = ($raw | Where-Object { $_ -notmatch 'claude-code-hint' }) -join "`n"
  $obj = $clean | ConvertFrom-Json
  if ($obj.error) { throw "Stripe API error: $($obj.error.message)" }
  return $obj
}

$upper = $Code.ToUpper()
$existing = (Stripe-Json @('promotion_codes', 'list', '--code', $upper, '--limit', '1')).data | Select-Object -First 1
if ($existing) {
  Write-Host "Promotion code '$upper' already exists ($($existing.id)) - nothing to do." -ForegroundColor Green
  return
}

# Coupon duration from -Months.
$durationArgs =
  if ($Months -eq 0) { @('--duration', 'once') }
  elseif ($Months -eq -1) { @('--duration', 'forever') }
  else { @('--duration', 'repeating', '-d', "duration_in_months=$Months") }

$couponArgs = @('coupons', 'create', '--percent-off', "$PercentOff", '--name', "Creator: $upper") + $durationArgs
$coupon = Stripe-Json $couponArgs
Write-Host "Created coupon $($coupon.id)"

$promoArgs = @('promotion_codes', 'create', '-d', "coupon=$($coupon.id)", '-d', "code=$upper")
if ($MaxRedemptions -gt 0) { $promoArgs += @('-d', "max_redemptions=$MaxRedemptions") }
$promo = Stripe-Json $promoArgs

$durText = if ($Months -eq 0) { 'first payment' } elseif ($Months -eq -1) { 'forever' } else { "first $Months months" }
Write-Host ""
Write-Host "=== $modeName creator code created ===" -ForegroundColor Green
Write-Host ("  Code:         {0}" -f $promo.code)
Write-Host ("  Discount:     {0}% off ({1})" -f $PercentOff, $durText)
Write-Host ("  Promotion id: {0}" -f $promo.id)
Write-Host ""
Write-Host "Track redemptions/revenue for this creator in the Stripe Dashboard:" -ForegroundColor Cyan
Write-Host "  Product catalog -> Coupons -> 'Creator: $upper' -> redemptions." -ForegroundColor Cyan
Write-Host "Log it in docs/creator-affiliate-playbook.md so you can reconcile commission owed." -ForegroundColor Cyan
