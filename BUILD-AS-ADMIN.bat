@echo off
echo ========================================
echo   HYPERION BUILD SCRIPT (Administrator)
echo ========================================
echo.

:: Set environment variables
set HOME=C:\Users\cyber
set USERPROFILE=C:\Users\cyber
set CARGO_HOME=C:\Users\cyber\.cargo
set RUSTUP_HOME=C:\Users\cyber\.rustup
set PATH=C:\Users\cyber\.cargo\bin;C:\Users\cyber\Downloads\solana-release\bin;%PATH%

:: Navigate to project
cd /d C:\Users\cyber\Hyperion

echo Solana version:
C:\Users\cyber\Downloads\solana-release\bin\solana.exe --version
echo.

echo Building Solana program with cargo-build-sbf...
echo This may take 5-10 minutes on first run...
echo.

C:\Users\cyber\Downloads\solana-release\bin\cargo-build-sbf.exe --force-tools-install --manifest-path programs/hyperion/Cargo.toml

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.

    :: Copy .so file to deploy folder
    if exist "target\sbf-solana-solana\release\hyperion.so" (
        copy /Y "target\sbf-solana-solana\release\hyperion.so" "target\deploy\hyperion.so"
        echo Program built at: target\deploy\hyperion.so
    )

    echo.
    echo Next steps:
    echo 1. Run: anchor deploy
    echo 2. Or manually: solana program deploy target/deploy/hyperion.so
) else (
    echo.
    echo Build failed. Check errors above.
)

echo.
pause
