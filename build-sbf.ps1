# Build Script for Hyperion (SBF)
$env:HOME = "C:\Users\cyber"
$env:USERPROFILE = "C:\Users\cyber"
$env:CARGO_HOME = "C:\Users\cyber\.cargo"
$env:RUSTUP_HOME = "C:\Users\cyber\.rustup"
$env:PATH = "C:\Users\cyber\.cargo\bin;C:\Users\cyber\Downloads\solana-release\bin;$env:PATH"

Set-Location "C:\Users\cyber\Hyperion"

Write-Host "Building Hyperion with cargo-build-sbf..." -ForegroundColor Yellow
& "C:\Users\cyber\Downloads\solana-release\bin\cargo-build-sbf.exe" --manifest-path programs/hyperion/Cargo.toml

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed" -ForegroundColor Red
}
