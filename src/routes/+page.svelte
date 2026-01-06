<script lang="ts">
	import { ArrowsRepeatCountOutline, LockOpenOutline, LockOutline } from 'flowbite-svelte-icons';
	import { base } from '$app/paths';
	let loadingDots = '.';
	function updateLoadingDots() {
		loadingDots = loadingDots.length >= 3 ? '.' : loadingDots + '.';
	}
	setInterval(updateLoadingDots, 500);
</script>

<main class="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 font-mono text-white">
	<div class="main-content flex flex-col gap-12">
		<div class="mx-auto max-w-4xl border-2 border-amber-400/50 bg-black/30 p-4 backdrop-blur-sm sm:p-12">
			<div class="mb-8 flex flex-col gap-6">
				<h1 class="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-5xl font-bold tracking-wider text-transparent sm:text-6xl">
					HYPERION
				</h1>
				<p class="text-2xl font-bold text-amber-300">
					Leverage that doesn't bite back.
				</p>
				<p class="text-lg text-gray-300">
					Lock your staked SOL. Get leveraged tokens. Sleep at night knowing you'll never get liquidated. It's that simple.
				</p>
			</div>
			<div class="flex flex-col items-start gap-4">
				<div class="inline-block border border-dashed border-amber-400/50 p-3 text-lg opacity-80">
					<span class="text-amber-400">&gt;</span> gm anon, ready to lock?
				</div>
				<a
					href={base + '/lock'}
					class="group w-fit border-2 border-amber-400 bg-amber-500 p-6 text-center text-xl font-bold tracking-wider text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25"
					data-testid="get-started-button"
				>
					LET'S GO
				</a>
			</div>
		</div>

		<div
			class="group mx-auto w-full max-w-4xl border-2 border-amber-400/30 bg-black/20 p-4 backdrop-blur-sm transition-colors hover:border-amber-400/50 sm:p-12"
		>
			<h2 class="mb-8 flex items-center gap-2 text-2xl text-amber-300">
				[ THE GOOD STUFF ] <span class="text-xs text-amber-400/70 group-hover:text-amber-400"
					>loading{loadingDots}</span
				>
			</h2>
			<div class="grid gap-6 md:grid-cols-3">
				<div class="space-y-3">
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>Zero liquidations. Ever.</span>
					</p>
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>Always solvent, always chill</span>
					</p>
				</div>
				<div class="space-y-3">
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>Your keys, your coins</span>
					</p>
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>No governance drama</span>
					</p>
				</div>
				<div class="space-y-3">
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>Zero protocol fees</span>
					</p>
					<p class="flex items-center gap-2">
						<span class="text-amber-400">[ok]</span>
						<span>Fully permissionless</span>
					</p>
				</div>
			</div>
		</div>

		<div class="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
			<div
				class="group col-span-2 border-2 border-amber-400/30 bg-black/20 p-4 backdrop-blur-sm transition-colors hover:border-amber-400/50 sm:p-12 md:col-span-1"
			>
				<h2 class="mb-8 flex items-center gap-2 text-2xl text-amber-300">
					[ WHY YOU'LL LOVE IT ]<span class="text-xs text-amber-400/70 group-hover:text-amber-400"
						>{loadingDots}</span
					>
				</h2>
				<ul class="space-y-4 text-gray-300">
					<li class="flex items-start gap-3">
						<span class="text-xl text-amber-400">></span>
						<span>Stack yield while you leverage - your mSOL keeps earning</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-xl text-amber-400">></span>
						<span>Trade bigger without the liquidation nightmares</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-xl text-amber-400">></span>
						<span>Exit whenever YOU want, not when the market says so</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-xl text-amber-400">></span>
						<span>No fees to lock or unlock. Seriously.</span>
					</li>
				</ul>
			</div>

			<div
				class="group col-span-2 w-full border-2 border-amber-400/30 bg-black/20 p-4 backdrop-blur-sm transition-colors hover:border-amber-400/50 sm:p-12 md:col-span-1"
			>
				<h2 class="mb-8 flex items-center gap-2 text-2xl text-amber-300">
					[ HOW IT WORKS ] <span class="text-xs text-amber-400/70 group-hover:text-amber-400"
						>{loadingDots}</span
					>
				</h2>
				<ul class="space-y-4 text-gray-300">
					<li class="flex items-start gap-3">
						<LockOutline size="lg" class="mt-1 text-amber-400" />
						<span>Lock your mSOL or JitoSOL to mint hyTokens</span>
					</li>
					<li class="flex items-start gap-3">
						<ArrowsRepeatCountOutline size="lg" class="mt-1 text-amber-400" />
						<span>Trade your hyTokens for whatever you want</span>
					</li>
					<li class="flex items-start gap-3">
						<LockOpenOutline size="lg" class="mt-1 text-amber-400" />
						<span>Buy back hyTokens anytime to unlock your SOL</span>
					</li>
				</ul>
			</div>
			<div class="col-span-2 flex flex-col gap-12">
				<div
					class="group mx-auto mb-8 w-full max-w-4xl border-2 border-amber-400/30 bg-black/20 p-4 backdrop-blur-sm transition-colors hover:border-amber-400/50 sm:p-12"
				>
					<h2 class="mb-8 flex items-center gap-2 text-2xl text-amber-300">
						[ MEET hyTOKENS ] <span class="text-xs text-amber-400/70 group-hover:text-amber-400"
							>initializing{loadingDots}</span
						>
					</h2>
					<div class="grid gap-6 text-gray-300 md:grid-cols-2">
						<div class="space-y-4">
							<p class="flex items-start gap-3">
								<span class="text-xl text-amber-400">></span>
								<span>Backed 1:1 by your locked collateral</span>
							</p>
							<p class="flex items-start gap-3">
								<span class="text-xl text-amber-400">></span>
								<span>Trade freely on any Solana DEX</span>
							</p>
							<p class="flex items-start gap-3">
								<span class="text-xl text-amber-400">></span>
								<span>Price moves with leverage demand</span>
							</p>
						</div>
						<div class="space-y-4">
							<p class="flex items-start gap-3">
								<span class="text-xl text-amber-400">></span>
								<span>Natural cycles = trading opportunities</span>
							</p>
							<p class="flex items-start gap-3">
								<span class="text-xl text-amber-400">></span>
								<span>Real collateral backing, not magic beans</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
