import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTopRewards } from './fetchTopRewards';
import { ONE, SUBGRAPH_URL } from '$lib/constants';
import TopAccounts from '$lib/queries/top-rewards.graphql?raw';
import { calculateShares } from './calculateShares';

vi.mock('$lib/constants', () => ({
	SUBGRAPH_URL: 'http://mocked-subgraph-url',
	ONE: 1000000000000000000000n,
	TOTAL_REWARD: 1000000000000000000000n
}));

global.fetch = vi.fn();

describe('fetchTopRewards', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches and computes leaderboard entries correctly', async () => {
		const mockResponse = {
			data: {
				accountsByCyBalance: [
					{
						id: '0x123',
						hySOLBalance: '1000000000000000000000',
						hyJitoSOLBalance: '2000000000000000000000',
						totalCyBalance: '100000000000000000000'
					},
					{
						id: '0x456',
						hySOLBalance: '500000000000000000000',
						hyJitoSOLBalance: '1000000000000000000000',
						totalCyBalance: '50000000000000000000'
					}
				],
				eligibleTotals: {
					id: 'SINGLETON',
					totalEligibleCyJitoSOL: '1000000000000000000000',
					totalEligibleCymSOL: '2000000000000000000000',
					totalEligibleSum: '3000000000000000000000'
				}
			}
		};

		vi.mocked(global.fetch).mockResolvedValueOnce({
			json: async () => mockResponse
		} as Response);

		const result = await fetchTopRewards();

		expect(result).toEqual([
			{
				account: '0x123',
				eligibleBalances: {
					hySOL: ONE,
					hyJitoSOL: 2n * ONE
				},
				shares: calculateShares(
					mockResponse.data.accountsByCyBalance[0],
					mockResponse.data.eligibleTotals
				)
			},
			{
				account: '0x456',
				eligibleBalances: {
					hySOL: ONE / 2n,
					hyJitoSOL: ONE
				},
				shares: calculateShares(
					mockResponse.data.accountsByCyBalance[1],
					mockResponse.data.eligibleTotals
				)
			}
		]);

		expect(fetch).toHaveBeenCalledWith(SUBGRAPH_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: TopAccounts })
		});
	});
});
