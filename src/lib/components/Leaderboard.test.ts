import { render, screen, waitFor } from '@testing-library/svelte';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import Leaderboard from './Leaderboard.svelte';
import type { LeaderboardEntry } from '$lib/types';
import { ONE } from '$lib/constants';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('svelte-wagmi', () => ({
	signerAddress: {
		subscribe: vi.fn((fn) => {
			fn('0x1234567890123456789012345678901234567890');
			return () => {};
		})
	}
}));

vi.mock('$lib/queries/fetchTopRewards', () => ({
	fetchTopRewards: vi.fn()
}));

const mockLeaderboard: LeaderboardEntry[] = [
	{
		account: '0x1234567890123456789012345678901234567890',
		eligibleBalances: {
			hySOL: BigInt(100) * ONE,
			hyJitoSOL: BigInt(200) * ONE
		},
		shares: {
			hySOL: {
				percentageShare: ONE / 10n,
				rewardsAmount: ONE / 10n
			},
			hyJitoSOL: {
				percentageShare: ONE / 10n,
				rewardsAmount: ONE / 10n
			},
			totalRewards: 20n * ONE
		}
	}
];

describe('Leaderboard Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show loading state while fetching leaderboard', async () => {
		const { fetchTopRewards } = await import('$lib/queries/fetchTopRewards');
		vi.mocked(fetchTopRewards).mockImplementation(() => new Promise(() => {}));

		render(Leaderboard);

		await waitFor(() => {
			expect(screen.getByTestId('loader')).toBeInTheDocument();
		});
	});

	it('should display leaderBoard table when data is available', async () => {
		const { fetchTopRewards } = await import('$lib/queries/fetchTopRewards');
		vi.mocked(fetchTopRewards).mockResolvedValue(mockLeaderboard);

		render(Leaderboard);

		await waitFor(() => {
			expect(screen.getByText('100.0000')).toBeInTheDocument(); // hySOL value
			expect(screen.getByText('200.0000')).toBeInTheDocument(); // hyJitoSOL value
			expect(screen.getAllByText('(10.0000%)')).toHaveLength(2); // percentage
			expect(screen.getByTestId('total-rewards')).toHaveTextContent('20.0000'); // proRataReward
		});
	});

	it('should navigate to account page when clicking on a row', async () => {
		const { fetchTopRewards } = await import('$lib/queries/fetchTopRewards');
		vi.mocked(fetchTopRewards).mockResolvedValue(mockLeaderboard);

		render(Leaderboard);

		// Wait for component to load and get link
		const accountLink = await screen.findByText('#1 0x1234...7890');

		// Check the href attribute
		expect(accountLink.closest('a')).toHaveAttribute(
			'href',
			'/rewards/0x1234567890123456789012345678901234567890'
		);
	});
});
