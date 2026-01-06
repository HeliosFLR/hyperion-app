# Hyperion

**Liquidation-free leverage on Solana.**

Lock your staked SOL (mSOL, JitoSOL), get hyTokens, and access leverage without ever worrying about getting liquidated. It's DeFi the way it should be.

## What is this?

Hyperion lets you:
- Lock your liquid staking tokens (mSOL, JitoSOL)
- Mint hyTokens at the current oracle price
- Trade hyTokens for anything you want
- Unlock your collateral whenever YOU want

No liquidations. No margin calls. No stress.

## Stack

- **Frontend**: SvelteKit + TypeScript
- **Styling**: Tailwind CSS
- **Chain**: Solana
- **Oracle**: Pyth Network

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## hyTokens

| Token | Collateral | Description |
|-------|------------|-------------|
| hySOL | mSOL | Leveraged Marinade staked SOL |
| hyJitoSOL | JitoSOL | Leveraged Jito staked SOL |

## How it works

1. **Lock**: Deposit your mSOL or JitoSOL
2. **Mint**: Receive hyTokens at current Pyth oracle price
3. **Trade**: Swap hyTokens for any asset on Solana DEXs
4. **Unlock**: Buy back hyTokens anytime to reclaim your collateral

The key insight: your collateral is always there, safe and sound. No matter what happens to hyToken prices, you can always unlock your original SOL.

## License

MIT
