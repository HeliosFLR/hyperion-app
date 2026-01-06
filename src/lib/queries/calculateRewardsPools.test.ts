import { describe, it, expect } from 'vitest';
import { calculateRewardsPools } from './calculateRewardsPools';
import type { AccountStatusQuery } from '../../generated-graphql';
import { TOTAL_REWARD } from '$lib/constants';

const eligibleTotals: NonNullable<AccountStatusQuery['eligibleTotals']> = {
	__typename: 'EligibleTotals',
	id: 'SINGLETON',
	totalEligibleCyJitoSOL: '1000000000000000000000',
	totalEligibleCymSOL: '2000000000000000000000',
	totalEligibleSum: '3000000000000000000000'
};

describe('calculateRewardsPools', () => {
	it('calculates the right pool amounts according to the rewards rules', () => {
		const rewardsPools = calculateRewardsPools(eligibleTotals);

		//  hyJitoSOL is 1/3 of the eligible tokens so should have 2/3 of the rewards
		//  hySOL is 2/3 of the eligible tokens so should have 1/3 of the rewards
		const cySOL = TOTAL_REWARD / 3n;
		const cyWeth = (TOTAL_REWARD * 2n) / 3n;

		expect(rewardsPools).toEqual({
			cySOL,
			cyWeth
		});
	});
});
