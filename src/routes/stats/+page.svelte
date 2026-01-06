<script lang="ts">
	import { protocolStats, prices, pricesLoading } from '$lib/stores/wallet';

	function formatNumber(num: number): string {
		if (num >= 1_000_000) return '$' + (num / 1_000_000).toFixed(2) + 'M';
		if (num >= 1_000) return '$' + (num / 1_000).toFixed(2) + 'K';
		return '$' + num.toFixed(2);
	}

	function formatSupply(num: number): string {
		if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
		if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
		return num.toFixed(2);
	}

	$: tvl = $protocolStats.tvl;
	$: users = $protocolStats.users;
	$: lockPrice = $protocolStats.lockPrice;
	$: totalHySOL = $protocolStats.totalHySOL;
	$: totalHyJitoSOL = $protocolStats.totalHyJitoSOL;

	$: solPrice = $prices.SOL;
	$: msolPrice = $prices.mSOL;
	$: jitosolPrice = $prices.JitoSOL;
	$: hysolPrice = $prices.hySOL;
	$: hyjitosolPrice = $prices.hyJitoSOL;
</script>

<div class="mx-auto max-w-4xl p-4 pt-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-white">Protocol Stats</h1>
		<p class="text-gray-400">Real-time metrics from the Hyperion protocol</p>
	</div>

	<div class="mb-8 grid gap-4 md:grid-cols-3">
		<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 text-center backdrop-blur-sm">
			<div class="mb-2 text-4xl font-bold text-amber-400">{formatNumber(tvl)}</div>
			<div class="text-gray-400">Total Value Locked</div>
		</div>
		<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 text-center backdrop-blur-sm">
			<div class="mb-2 text-4xl font-bold text-green-400">{users.toLocaleString()}</div>
			<div class="text-gray-400">Active Users</div>
		</div>
		<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 text-center backdrop-blur-sm">
			<div class="mb-2 text-4xl font-bold text-purple-400">{lockPrice.toFixed(4)}</div>
			<div class="text-gray-400">Current Lock Price</div>
		</div>
	</div>

	<div class="mb-8 grid gap-6 md:grid-cols-2">
		<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 backdrop-blur-sm">
			<h3 class="mb-4 text-xl font-bold text-amber-400">hySOL Stats</h3>
			<div class="space-y-3">
				<div class="flex justify-between">
					<span class="text-gray-400">Total Supply</span>
					<span class="font-mono text-white">{formatSupply(totalHySOL)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-400">Current Price</span>
					<span class="font-mono text-green-400">
						{#if $pricesLoading}
							<span class="animate-pulse">Loading...</span>
						{:else}
							${hysolPrice.toFixed(2)}
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-400">Backing Ratio</span>
					<span class="font-mono text-white">1:1 mSOL</span>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 backdrop-blur-sm">
			<h3 class="mb-4 text-xl font-bold text-amber-400">hyJitoSOL Stats</h3>
			<div class="space-y-3">
				<div class="flex justify-between">
					<span class="text-gray-400">Total Supply</span>
					<span class="font-mono text-white">{formatSupply(totalHyJitoSOL)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-400">Current Price</span>
					<span class="font-mono text-green-400">
						{#if $pricesLoading}
							<span class="animate-pulse">Loading...</span>
						{:else}
							${hyjitosolPrice.toFixed(2)}
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-400">Backing Ratio</span>
					<span class="font-mono text-white">1:1 JitoSOL</span>
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 backdrop-blur-sm">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-xl font-bold text-amber-400">Live Prices</h3>
			<div class="flex items-center gap-2">
				<span class="relative flex h-2 w-2">
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
				</span>
				<span class="text-xs text-green-400">Pyth Oracle</span>
			</div>
		</div>
		<div class="grid gap-4 md:grid-cols-5">
			<div class="rounded-lg bg-black/30 p-4 text-center">
				<div class="text-2xl font-bold text-white">
					{#if $pricesLoading}
						<span class="animate-pulse">...</span>
					{:else}
						${solPrice.toFixed(2)}
					{/if}
				</div>
				<div class="text-sm text-gray-400">SOL</div>
			</div>
			<div class="rounded-lg bg-black/30 p-4 text-center">
				<div class="text-2xl font-bold text-white">
					{#if $pricesLoading}
						<span class="animate-pulse">...</span>
					{:else}
						${msolPrice.toFixed(2)}
					{/if}
				</div>
				<div class="text-sm text-gray-400">mSOL</div>
			</div>
			<div class="rounded-lg bg-black/30 p-4 text-center">
				<div class="text-2xl font-bold text-white">
					{#if $pricesLoading}
						<span class="animate-pulse">...</span>
					{:else}
						${jitosolPrice.toFixed(2)}
					{/if}
				</div>
				<div class="text-sm text-gray-400">JitoSOL</div>
			</div>
			<div class="rounded-lg bg-black/30 p-4 text-center">
				<div class="text-2xl font-bold text-amber-400">
					{#if $pricesLoading}
						<span class="animate-pulse">...</span>
					{:else}
						${hysolPrice.toFixed(2)}
					{/if}
				</div>
				<div class="text-sm text-gray-400">hySOL</div>
			</div>
			<div class="rounded-lg bg-black/30 p-4 text-center">
				<div class="text-2xl font-bold text-amber-400">
					{#if $pricesLoading}
						<span class="animate-pulse">...</span>
					{:else}
						${hyjitosolPrice.toFixed(2)}
					{/if}
				</div>
				<div class="text-sm text-gray-400">hyJitoSOL</div>
			</div>
		</div>
		<p class="mt-4 text-center text-xs text-gray-500">Prices update every 10 seconds</p>
	</div>
</div>
