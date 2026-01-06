# Solana CLI Installation Summary

## Installation Details

**Version:** solana-cli 3.0.13 (Agave client)
**Installation Date:** January 5, 2026
**Installation Path:** `C:\Users\cyber\.local\share\solana\install\releases\stable-90098d261e2be2f898769d9ee35141597f1a2234\solana-release\bin`

## Configuration

**Network:** Devnet
**RPC URL:** https://api.devnet.solana.com
**WebSocket URL:** wss://api.devnet.solana.com/
**Config File:** `C:\Users\cyber\.config\solana\cli\config.yml`

## Wallets

### Deploy Authority (Active)
- **Public Key:** Hn3jdTUb3EdzuPmQaQ33p2uKTyHNFrvJMfpGDya4uTJV
- **Keypair File:** `C:\Users\cyber\.config\solana\deploy-authority.json`
- **Current Balance:** 0 SOL (devnet)

### Treasury
- **Public Key:** FXQeb5og3DHwhM8fFewoPNuAZi5UCknRZ5L7nuAGcr3U

### Fee Collector
- **Public Key:** DLcEhjdJSVa5gwSS2HBToSWi5YByxorNMNrpTprRxSvu

All wallets are stored in: `C:\Users\cyber\Hyperion\.wallets.json`

## PATH Configuration

The Solana CLI has been added to your Windows User PATH environment variable.

**Note:** You may need to restart your terminal/PowerShell for the PATH changes to take effect.

## Common Commands

### Verify Installation
```bash
solana --version
```

### Check Configuration
```bash
solana config get
```

### Check Balance
```bash
solana balance
```

### Request Devnet Airdrop
```bash
solana airdrop 2
```

### Switch Networks
```bash
# Mainnet
solana config set --url mainnet-beta

# Devnet
solana config set --url devnet

# Testnet
solana config set --url testnet

# Local
solana config set --url localhost
```

### Change Keypair
```bash
solana config set --keypair <path-to-keypair.json>
```

## Available Tools

- `solana` - Main CLI tool
- `solana-keygen` - Keypair generation and management
- `cargo-build-sbf` - Build Solana programs (BPF/SBF)
- `cargo-test-sbf` - Test Solana programs
- `agave-install` - Agave client installer

## Build Tools

**Platform Tools:** v1.51
**Solana Cargo Build SBF:** 3.0.13

You can build Solana programs using:
```bash
cargo-build-sbf
```

## Troubleshooting

If `solana` command is not found after installation:
1. Restart your terminal
2. Or manually add to PATH for current session:
   ```bash
   export PATH="/c/Users/cyber/.local/share/solana/install/releases/stable-90098d261e2be2f898769d9ee35141597f1a2234/solana-release/bin:$PATH"
   ```
3. Or run the PATH setup script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File C:\Users\cyber\add-solana-to-path.ps1
   ```

## Next Steps

1. Request devnet SOL: `solana airdrop 2`
2. Verify balance: `solana balance`
3. Start building Solana programs!

## Additional Resources

- Solana Documentation: https://docs.solana.com
- Solana Cookbook: https://solanacookbook.com
- Anchor Framework: https://www.anchor-lang.com
