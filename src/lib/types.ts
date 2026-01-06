import type { Config } from '@wagmi/core';
import { type Hex } from 'viem';
import type { AccountStatusQuery } from '../generated-graphql';

export type Receipt = {
	chainId: string;
	tokenAddress: Hex;
	tokenId: string;
	balance: bigint;
	readableTokenId?: string;
	readableTotalsSOL?: string;
	readableSOLPerReceipt?: string;
	totalsSOL?: bigint;
	token?: string;
};

export type BlockScoutData = {
	token: {
		address_hash: string;
	};
	value: string;
	id: string;
};

export interface Token {
	name: string;
	symbol: string;
	decimals: number;
	address: Hex;
}

export interface CyToken extends Token {
	name: string;
	address: Hex;
	underlyingAddress: Hex;
	underlyingSymbol: string;
	receiptAddress: Hex;
}

export type InitiateLockTransactionArgs = {
	signerAddress: string;
	config: Config;
	selectedToken: CyToken;
	assets: bigint;
};

export type RewardsPools = {
	hySOL: bigint;
	hyJitoSOL: bigint;
};

export type Share = {
	percentageShare: bigint;
	rewardsAmount: bigint;
};

export type Shares = {
	hySOL: Share;
	hyJitoSOL: Share;
	totalRewards: bigint;
};

export type AccountStats = {
	account: Hex;
	eligibleBalances: {
		hySOL: bigint;
		hyJitoSOL: bigint;
	};
	shares: Shares;
	transfers: {
		in: NonNullable<AccountStatusQuery['account']>['transfersIn'];
		out: NonNullable<AccountStatusQuery['account']>['transfersOut'];
	};
	liquidityChanges: NonNullable<AccountStatusQuery['account']>['liquidityChanges'];
};

export type LeaderboardEntry = Omit<AccountStats, 'transfers' | 'liquidityChanges'>;

export type GlobalStats = {
	eligibleHolders: number;
	totalEligibleHySOL: bigint;
	totalEligibleHyJitoSOL: bigint;
	totalEligibleSum: bigint;
	rewardsPools: RewardsPools;
	hySOLApy: bigint;
	hyJitoSOLApy: bigint;
};
