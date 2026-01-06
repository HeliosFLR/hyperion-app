import { ONE, TOTAL_REWARD } from '$lib/constants';
import type { RewardsPools } from '$lib/types';
import type { AccountStatusQuery } from '../../generated-graphql';

export const calculateRewardsPools = (
	eligibleTotals: NonNullable<AccountStatusQuery['eligibleTotals']>
): RewardsPools => {
	const hySOLInverseFraction =
		(BigInt(eligibleTotals.totalEligibleSum) * ONE) / BigInt(eligibleTotals.totalEligibleCymSOL);
	const hyJitoSOLInverseFraction =
		(BigInt(eligibleTotals.totalEligibleSum) * ONE) / BigInt(eligibleTotals.totalEligibleCyJitoSOL);

	const sum = hySOLInverseFraction + hyJitoSOLInverseFraction;

	const cySOL = (hySOLInverseFraction * TOTAL_REWARD) / sum;
	const cyWeth = (hyJitoSOLInverseFraction * TOTAL_REWARD) / sum;

	return {
		cySOL,
		cyWeth
	};
};
