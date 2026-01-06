import { type StatsQuery } from '../../generated-graphql';
import Stats from '$lib/queries/stats.graphql?raw';
import { gethySOLSOLPrice } from './hySOLSOLQuote';
import { gethyJitoSOLSOLPrice } from './hyJitoSOLSOLQuote';
import { ONE, SUBGRAPH_URL } from '$lib/constants';
import { calculateRewardsPools } from './calculateRewardsPools';
import type { GlobalStats } from '$lib/types';

export const calculateApy = (rewardPool: bigint, totalEligible: bigint, price: bigint) => {
	const numerator =
		rewardPool *
		12n * // 12 months
		100n * // will be a percentage
		ONE *
		ONE; // 18 decimals twice, once for the total eligible and once for the price
	const denominator = totalEligible * price;
	return denominator > 0n ? numerator / denominator : 0n;
};

export async function fetchStats(): Promise<GlobalStats> {
	const response = await fetch(SUBGRAPH_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: Stats
		})
	});
	const data: StatsQuery = (await response.json()).data;

	const totalEligibleCymSOL = BigInt(data.eligibleTotals?.totalEligibleCymSOL ?? 0);
	const totalEligibleCyJitoSOL = BigInt(data.eligibleTotals?.totalEligibleCyJitoSOL ?? 0);
	const totalEligibleSum = BigInt(data.eligibleTotals?.totalEligibleSum ?? 0);
	const eligibleHolders = (data.accounts ?? []).length;

	// Get prices in SOL terms
	const hySOLSOLPrice = await gethySOLSOLPrice();
	const hyJitoSOLSOLPrice = await gethyJitoSOLSOLPrice();

	if (!data.eligibleTotals) throw 'No eligible totals';

	const rewardsPools = calculateRewardsPools(data.eligibleTotals);

	// Calculate APY for hySOL
	const hySOLApy = calculateApy(rewardsPools.cySOL, totalEligibleCymSOL, hySOLSOLPrice);

	// Calculate APY for hyJitoSOL
	const hyJitoSOLApy = calculateApy(rewardsPools.cyWeth, totalEligibleCyJitoSOL, hyJitoSOLSOLPrice);

	return {
		eligibleHolders,
		totalEligibleCymSOL,
		totalEligibleCyJitoSOL,
		totalEligibleSum,
		rewardsPools,
		hySOLApy,
		hyJitoSOLApy
	};
}
