import type { Token } from './types';

// Placeholder subgraph URL - update with actual Solana indexer
export const SUBGRAPH_URL = 'https://api.hyperion.finance/graphql';

export const ONE = 10n ** 9n; // Solana uses 9 decimals for SOL

// Solana token addresses (placeholder - update with actual addresses)
export const tokens: Token[] = [
	{
		name: 'USD Coin',
		symbol: 'USDC',
		address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
		decimals: 6
	},
	{
		name: 'Marinade Staked SOL',
		symbol: 'mSOL',
		address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
		decimals: 9
	},
	{
		name: 'Jito Staked SOL',
		symbol: 'JitoSOL',
		address: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
		decimals: 9
	},
	{
		name: 'Wrapped SOL',
		symbol: 'SOL',
		address: 'So11111111111111111111111111111111111111112',
		decimals: 9
	}
];

export const TOTAL_REWARD = 1_000_000n * ONE; // 1M HYPR rewards
