import { ONE } from '$lib/constants';
import type { Shares } from '$lib/types';
import type { AccountStatusQuery } from '../../generated-graphql';
import { calculateRewardsPools } from './calculateRewardsPools';

export const calculateShares = (
	account: Omit<
		NonNullable<AccountStatusQuery['account']>,
		'transfersIn' | 'transfersOut' | 'liquidityChanges'
	>,
	eligibleTotals: NonNullable<AccountStatusQuery['eligibleTotals']>
): Shares => {
	// Calculate share for each token
	const shares: Shares = {
		hySOL: { percentageShare: BigInt(0), rewardsAmount: BigInt(0) },
		hyJitoSOL: { percentageShare: BigInt(0), rewardsAmount: BigInt(0) },
		totalRewards: BigInt(0)
	};

	// Skip if no eligible totals
	if (!eligibleTotals || Object.keys(eligibleTotals).length === 0) {
		return shares;
	}

	const rewardsPools = calculateRewardsPools(eligibleTotals);

	// Balances
	const hySOLBalance = BigInt(account.hySOLBalance);
	const hyJitoSOLBalance = BigInt(account.hyJitoSOLBalance);

	// hySOL shares
	shares.hySOL.percentageShare =
		hySOLBalance > 0 ? (hySOLBalance * ONE) / BigInt(eligibleTotals.totalEligibleCymSOL) : 0n;

	// hyJitoSOL shares
	shares.hyJitoSOL.percentageShare =
		hyJitoSOLBalance > 0 ? (hyJitoSOLBalance * ONE) / BigInt(eligibleTotals.totalEligibleCyJitoSOL) : 0n;

	// hySOL rewards
	shares.hySOL.rewardsAmount = (shares.hySOL.percentageShare * rewardsPools.cySOL) / ONE;

	// hyJitoSOL rewards
	shares.hyJitoSOL.rewardsAmount = (shares.hyJitoSOL.percentageShare * rewardsPools.cyWeth) / ONE;

	shares.totalRewards = shares.hySOL.rewardsAmount + shares.hyJitoSOL.rewardsAmount;

	return shares;
};
