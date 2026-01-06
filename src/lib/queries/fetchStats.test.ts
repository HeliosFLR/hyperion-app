import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateApy, fetchStats } from './fetchStats';
import { ONE, SUBGRAPH_URL } from '$lib/constants';
import Stats from '$lib/queries/stats.graphql?raw';
import { gethySOLSOLPrice } from './hySOLSOLQuote';
import { gethyJitoSOLSOLPrice } from './hyJitoSOLSOLQuote';
import { calculateRewardsPools } from './calculateRewardsPools';

vi.mock('$lib/constants', () => ({
	SUBGRAPH_URL: 'http://mocked-subgraph-url',
	TOTAL_REWARD: 1000000000000000000000n,
	ONE: 1000000000000000000000n
}));

vi.mock('./hySOLSOLQuote', () => ({
	gethySOLSOLPrice: vi.fn()
}));

vi.mock('./hyJitoSOLSOLQuote', () => ({
	gethyJitoSOLSOLPrice: vi.fn()
}));

global.fetch = vi.fn();

describe('calculateApy', () => {
	it('calculates apy correctly', () => {
		// if we have 500,000 HYPR in the pool, 5000 eligible hySOL, and the price of 1 hySOL is 50 SOL
		// every hySOL purchased will net you 500,000/5000 = 100 HYPR
		// that hySOL will cost you 50 SOL
		// so your return is 1000/50 = 2x your investment
		// over 12 months is 24x your investment
		const poolAmount = ONE * 500_000n;
		const totalEligible = ONE * 5000n;
		const price = ONE * 50n;
		const apy = calculateApy(poolAmount, totalEligible, price);
		expect(apy).toBe(2400n * ONE); // 2400%
	});

	it('returns 0 if either the price or the total eligible is 0', () => {
		const apy = calculateApy(ONE * 1000n, 0n, ONE * 50n);
		expect(apy).toBe(0n);
		const apy2 = calculateApy(ONE * 1000n, ONE * 5000n, 0n);
		expect(apy2).toBe(0n);
	});
});

describe('fetchStats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches and calculates stats correctly', async () => {
		const mockResponse = {
			data: {
				eligibleTotals: {
					id: 'SINGLETON',
					totalEligibleCyJitoSOL: '1000000000000000000000',
					totalEligibleCymSOL: '2000000000000000000000',
					totalEligibleSum: '3000000000000000000000'
				},
				accounts: Array(96).fill({}) // Mock 96 accounts
			}
		};

		vi.mocked(global.fetch).mockResolvedValueOnce({
			json: async () => mockResponse
		} as Response);

		// Mock price quotes
		vi.mocked(gethySOLSOLPrice).mockResolvedValueOnce(BigInt('500000000000000000')); // 0.5 SOL
		vi.mocked(gethyJitoSOLSOLPrice).mockResolvedValueOnce(BigInt('1000000000000000000')); // 1 SOL

		const result = await fetchStats();

		const rewardsPools = calculateRewardsPools(mockResponse.data.eligibleTotals);

		expect(result).toEqual({
			eligibleHolders: 96,
			totalEligibleCymSOL: BigInt('2000000000000000000000'),
			totalEligibleCyJitoSOL: BigInt('1000000000000000000000'),
			totalEligibleSum: BigInt('3000000000000000000000'),
			rewardsPools,
			hySOLApy: calculateApy(
				rewardsPools.cySOL,
				BigInt('2000000000000000000000'),
				BigInt('500000000000000000')
			),
			hyJitoSOLApy: calculateApy(
				rewardsPools.cyWeth,
				BigInt('1000000000000000000000'),
				BigInt('1000000000000000000')
			)
		});

		expect(fetch).toHaveBeenCalledWith(SUBGRAPH_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: Stats })
		});
	});
});
