# Hyperion Build Script - Run as Administrator
# Right-click this file -> Run with PowerShell (as Admin)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HYPERION BUILD SCRIPT (v2.3.13)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click -> Run as Administrator" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`nRunning as Administrator - Good!" -ForegroundColor Green

# Set environment variables (required for admin shell)
$env:HOME = "C:\Users\cyber"
$env:USERPROFILE = "C:\Users\cyber"
$env:CARGO_HOME = "C:\Users\cyber\.cargo"
$env:RUSTUP_HOME = "C:\Users\cyber\.rustup"
$env:PATH = "C:\Users\cyber\.cargo\bin;C:\Users\cyber\Downloads\solana-release\bin;$env:PATH"

# Navigate to project
Set-Location "C:\Users\cyber\Hyperion"

Write-Host "`nSolana version:" -ForegroundColor Yellow
& "C:\Users\cyber\Downloads\solana-release\bin\solana.exe" --version

Write-Host "`nBuilding Solana program with cargo-build-sbf..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes on first run (downloading platform-tools)`n" -ForegroundColor Gray

# Use --force-tools-install to fix corrupted toolchain
& "C:\Users\cyber\Downloads\solana-release\bin\cargo-build-sbf.exe" --force-tools-install --manifest-path programs/hyperion/Cargo.toml

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Copy the .so file to target/deploy
    $soFile = Get-ChildItem -Path "target\sbf-solana-solana\release\*.so" -ErrorAction SilentlyContinue
    if ($soFile) {
        Copy-Item $soFile.FullName -Destination "target\deploy\hyperion.so" -Force
        Write-Host "`nProgram built at: target/deploy/hyperion.so" -ForegroundColor Cyan
    }

    Write-Host "`nDo you want to deploy to mainnet now? (y/n)" -ForegroundColor Yellow
    $deploy = Read-Host
    if ($deploy -eq "y") {
        Write-Host "`nDeploying to mainnet..." -ForegroundColor Yellow
        & "C:\Users\cyber\.cargo\bin\anchor.exe" deploy
    }
} else {
    Write-Host "`nBuild failed. Check errors above." -ForegroundColor Red
}

pause
