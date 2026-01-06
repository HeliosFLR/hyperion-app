import { render, screen, waitFor } from '@testing-library/svelte';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import StatsPanel from './StatsPanel.svelte';
import type { GlobalStats } from '$lib/types';
import { ONE } from '$lib/constants';

vi.mock('$lib/queries/fetchStats', () => ({
	fetchStats: vi.fn()
}));

const mockStats: GlobalStats = {
	eligibleHolders: 100,
	totalEligibleCymSOL: 1000000000000000000000n,
	totalEligibleCyJitoSOL: 2000000000000000000000n,
	totalEligibleSum: 3000000000000000000000n,
	hySOLApy: 500000000000000000n, // 50%
	hyJitoSOLApy: 750000000000000000n, // 75%
	rewardsPools: {
		cySOL: ONE * 1000n,
		cyWeth: ONE * 2000n
	}
};

describe('StatsPanel Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show loading state while fetching stats', async () => {
		const { fetchStats } = await import('$lib/queries/fetchStats');
		vi.mocked(fetchStats).mockImplementation(() => new Promise(() => {}));

		render(StatsPanel);

		await waitFor(() => {
			expect(screen.getByTestId('loader')).toBeInTheDocument();
		});
	});

	it('should display StatsPanel when data is available', async () => {
		const { fetchStats } = await import('$lib/queries/fetchStats');
		vi.mocked(fetchStats).mockResolvedValue(mockStats);

		render(StatsPanel);

		await waitFor(() => {
			expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
			expect(screen.getByText('~0.5000%')).toBeInTheDocument(); // hySOL APY
			expect(screen.getByText('~0.7500%')).toBeInTheDocument(); // hyJitoSOL APY
			expect(screen.getByText('100')).toBeInTheDocument(); // eligible holders
			expect(screen.getByText('3000.00')).toBeInTheDocument(); // total eligible
			expect(screen.getByText('hySOL: 1000.00')).toBeInTheDocument(); // hySOL total
			expect(screen.getByText('hyJitoSOL: 2000.00')).toBeInTheDocument(); // hyJitoSOL total
			expect(screen.getByText('Monthly HYPR Rewards')).toBeInTheDocument();
			expect(screen.getByText('Total: 1,000,000')).toBeInTheDocument(); // total rewards
			expect(screen.getByText(`hySOL: 1,000`)).toBeInTheDocument(); // hySOL rewards
			expect(screen.getByText(`hyJitoSOL: 2,000`)).toBeInTheDocument(); // hyJitoSOL rewards
		});
	});

	it('should display error message when fetch fails', async () => {
		const { fetchStats } = await import('$lib/queries/fetchStats');
		vi.mocked(fetchStats).mockRejectedValue(new Error('Failed to fetch stats'));

		render(StatsPanel);

		await waitFor(() => {
			expect(screen.getByTestId('error')).toBeInTheDocument();
			expect(screen.getByText('Failed to fetch stats')).toBeInTheDocument();
		});
	});
});
