import { describe, it, expect } from 'vitest';
import { calculateShares } from './calculateShares';
import type { AccountStatusQuery } from '../../generated-graphql';
import { ONE, TOTAL_REWARD } from '$lib/constants';

const account = {
	hySOLBalance: ONE.toString(),
	hyJitoSOLBalance: (ONE / 2n).toString(),
	totalCyBalance: (ONE + ONE / 2n).toString()
};

const eligibleTotals: NonNullable<AccountStatusQuery['eligibleTotals']> = {
	__typename: 'EligibleTotals',
	id: 'SINGLETON',
	totalEligibleCyJitoSOL: ONE.toString(),
	totalEligibleCymSOL: (ONE * 2n).toString(),
	totalEligibleSum: (ONE + ONE * 2n).toString()
};

describe('calculateShares', () => {
	it('calculates the right shares', () => {
		const shares = calculateShares(account, eligibleTotals);

		// this account has 50% of the hySOL and 50% of the hyJitoSOL
		expect(shares.hySOL.percentageShare).toBe(ONE / 2n);
		expect(shares.hyJitoSOL.percentageShare).toBe(ONE / 2n);

		// the pools are 1/3 hySOL and 2/3 hyJitoSOL
		const hySOLPool = TOTAL_REWARD / 3n;
		const hyJitoSOLPool = (TOTAL_REWARD * 2n) / 3n;

		expect(shares.hySOL.rewardsAmount).toBe(hySOLPool / 2n);
		expect(shares.hyJitoSOL.rewardsAmount).toBe(hyJitoSOLPool / 2n);

		// total rewards should be the total reward
		expect(shares.totalRewards).toBe(hySOLPool / 2n + hyJitoSOLPool / 2n);
	});
});
