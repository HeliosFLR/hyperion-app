<script lang="ts">
	import type { AccountStats } from '$lib/types';
	import { formatEther, formatUnits } from 'viem';

	export let stats: AccountStats;

	$: isEligible =
		stats?.eligibleBalances &&
		(stats.eligibleBalances.hyJitoSOL > 0 || stats.eligibleBalances.hySOL > 0);
</script>

{#if !isEligible}
	<div class="bg-error/10 rounded py-4 text-gray-200">
		This account is not eligible for rewards. Only accounts with positive net transfers from
		approved sources are eligible.
	</div>
{/if}

<div class="grid grid-cols-1 gap-8 sm:grid-cols-5 sm:gap-8">
	<div class="space-y-1">
		<div class="text-sm text-gray-300">Net hySOL</div>
		<div class="break-words font-mono text-white" data-testid="net-hysol-value">
			{formatEther(stats.eligibleBalances.hySOL)}
		</div>
	</div>
	<div class="space-y-1">
		<div class="text-sm text-gray-300" data-testid="hysol-rewards">hySOL rewards</div>
		<div class="flex flex-col gap-y-2 break-words font-mono text-white">
			<span data-testid="hysol-rewards-value"
				>{formatEther(stats.shares.hySOL.rewardsAmount)}</span
			>
			<span data-testid="hysol-rewards-percentage"
				>({formatUnits(stats.shares.hySOL.percentageShare, 16)}%)</span
			>
		</div>
	</div>
	<div class="space-y-1">
		<div class="text-sm text-gray-300">Net hyJitoSOL</div>
		<div class="break-words font-mono text-white" data-testid="net-cyweth-value">
			{formatEther(stats.eligibleBalances.hyJitoSOL)}
		</div>
	</div>
	<div class="space-y-1">
		<div class="text-sm text-gray-300">hyJitoSOL rewards</div>
		<div class="flex flex-col gap-y-2 break-words font-mono text-white">
			<span data-testid="cyweth-rewards-value"
				>{formatEther(stats.shares.hyJitoSOL.rewardsAmount)}</span
			>
			<span data-testid="cyweth-rewards-percentage"
				>({formatUnits(stats.shares.hyJitoSOL.percentageShare, 16)}%)</span
			>
		</div>
	</div>
	<div class="space-y-1">
		<div class="text-sm text-gray-300">Total Estimated HYPR</div>
		<div class="break-words font-mono text-white" data-testid="total-rewards-value">
			{formatEther(stats.shares.totalRewards)}
		</div>
	</div>
</div>
