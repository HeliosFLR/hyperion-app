<script lang="ts">
	import { walletConnected, walletAddress, balances, prices, connectWallet } from '$lib/stores/wallet';
	import { lock } from '$lib/services/hyperion';
	import { config, TOKENS } from '$lib/config/program';
	import { PublicKey } from '@solana/web3.js';

	// Fee configuration (0.10% = 10 basis points)
	const MINT_FEE_BPS = 10;

	let selectedToken = 'mSOL';
	let amount = '';
	let showSuccess = false;
	let isLocking = false;
	let errorMessage = '';
	let txSignature = '';

	const tokens = [
		{ symbol: 'mSOL', name: 'Marinade SOL', hyToken: 'hySOL' },
		{ symbol: 'JitoSOL', name: 'Jito SOL', hyToken: 'hyJitoSOL' }
	];

	$: selectedTokenData = tokens.find(t => t.symbol === selectedToken);
	$: tokenBalance = $balances[selectedToken as keyof typeof $balances] || 0;
	$: tokenPrice = $prices[selectedToken as keyof typeof $prices] || 0;
	$: hyTokenPrice = $prices[selectedTokenData?.hyToken as keyof typeof $prices] || 0;
	$: lockRatio = hyTokenPrice > 0 ? tokenPrice / hyTokenPrice : 1;

	// Fee calculations
	$: inputAmount = amount ? parseFloat(amount) : 0;
	$: mintFee = inputAmount * (MINT_FEE_BPS / 10000);
	$: amountAfterFee = Math.max(0, inputAmount - mintFee);
	$: estimatedHyTokens = amountAfterFee * lockRatio;
	$: usdValue = inputAmount * tokenPrice;
	$: feeUsd = mintFee * tokenPrice;

	function setMax() {
		amount = tokenBalance.toString();
	}

	async function handleLock() {
		if (!amount || parseFloat(amount) <= 0) return;
		if (isLocking) return;

		isLocking = true;
		errorMessage = '';
		txSignature = '';

		try {
			// Convert amount to lamports (9 decimals)
			const amountLamports = BigInt(Math.floor(parseFloat(amount) * 1e9));

			// Get token mints from config
			const tokens = TOKENS.mainnet;
			const underlyingMint = selectedToken === 'mSOL'
				? tokens.mSOL
				: tokens.jitoSOL;

			// hyToken mints from deployed vaults
			const hyTokenMint = selectedToken === 'mSOL'
				? tokens.hySOL
				: tokens.hyJitoSOL;

			const result = await lock({
				underlyingMint,
				hyTokenMint,
				amount: amountLamports
			});

			if (result.success) {
				showSuccess = true;
				txSignature = result.signature || '';
				setTimeout(() => {
					showSuccess = false;
					amount = '';
				}, 5000);
			} else {
				errorMessage = result.error || 'Transaction failed';
			}
		} catch (error: any) {
			console.error('Lock error:', error);
			errorMessage = error.message || 'Failed to lock tokens';
		} finally {
			isLocking = false;
		}
	}

	// Demo mode handler (for testing without real transactions)
	async function handleDemoLock() {
		if (!amount || parseFloat(amount) <= 0) return;
		if ($walletAddress?.startsWith('Demo')) {
			showSuccess = true;
			setTimeout(() => {
				showSuccess = false;
				amount = '';
			}, 3000);
		} else {
			await handleLock();
		}
	}
</script>

<div class="mx-auto max-w-2xl p-4 pt-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-white">Lock Tokens</h1>
		<p class="text-gray-400">Lock your staked SOL to mint hyTokens</p>
	</div>

	{#if showSuccess}
		<div class="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-center text-green-400">
			<div>Transaction submitted! You received {estimatedHyTokens.toFixed(4)} {selectedTokenData?.hyToken}</div>
			{#if txSignature}
				<a
					href="https://explorer.solana.com/tx/{txSignature}?cluster={config.cluster}"
					target="_blank"
					class="mt-2 block text-sm text-blue-400 hover:underline"
				>
					View on Explorer →
				</a>
			{/if}
		</div>
	{/if}

	{#if errorMessage}
		<div class="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-center text-red-400">
			{errorMessage}
		</div>
	{/if}

	<div class="rounded-xl border border-amber-400/30 bg-black/30 p-6 backdrop-blur-sm">
		<!-- Token Selection -->
		<div class="mb-6">
			<span class="mb-2 block text-sm text-gray-400">Select Token</span>
			<div class="flex gap-3">
				{#each tokens as token}
					<button
						on:click={() => selectedToken = token.symbol}
						class="flex-1 rounded-lg border-2 p-4 text-center transition-all {selectedToken === token.symbol
							? 'border-amber-400 bg-amber-500/10 text-amber-400'
							: 'border-gray-600 text-gray-400 hover:border-gray-500'}"
					>
						<div class="font-bold">{token.symbol}</div>
						<div class="text-xs opacity-70">{token.name}</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Amount Input -->
		<div class="mb-6">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm text-gray-400">Amount to Lock</span>
				{#if $walletConnected}
					<span class="text-sm text-gray-500">
						Balance: <span class="text-amber-400">{tokenBalance.toFixed(4)}</span> {selectedToken}
					</span>
				{/if}
			</div>
			<div class="flex rounded-lg border border-gray-600 bg-black/50 focus-within:border-amber-400">
				<input
					type="number"
					bind:value={amount}
					placeholder="0.00"
					class="flex-1 bg-transparent p-4 text-xl text-white outline-none placeholder:text-gray-600"
				/>
				<div class="flex items-center gap-2 pr-4">
					{#if $walletConnected}
						<button on:click={setMax} class="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/30">
							MAX
						</button>
					{/if}
					<span class="font-bold text-white">{selectedToken}</span>
				</div>
			</div>
			{#if inputAmount > 0}
				<div class="mt-2 text-right text-sm text-gray-500">
					~${usdValue.toFixed(2)} USD
				</div>
			{/if}
		</div>

		<!-- Lock Info with Fees -->
		<div class="mb-6 rounded-lg bg-black/30 p-4">
			<div class="mb-3 flex items-center justify-between text-sm">
				<span class="text-gray-400">Lock Rate</span>
				<span class="text-white">1 {selectedToken} = {lockRatio.toFixed(4)} {selectedTokenData?.hyToken}</span>
			</div>
			<div class="mb-3 flex items-center justify-between text-sm">
				<span class="text-gray-400">Protocol Fee (0.10%)</span>
				<span class="text-orange-400">
					{mintFee.toFixed(6)} {selectedToken}
					{#if feeUsd > 0}
						<span class="text-gray-500">(~${feeUsd.toFixed(2)})</span>
					{/if}
				</span>
			</div>
			<div class="mb-3 flex items-center justify-between text-sm border-t border-gray-700 pt-3">
				<span class="text-gray-400">You Will Receive</span>
				<span class="font-bold text-amber-400">{estimatedHyTokens.toFixed(4)} {selectedTokenData?.hyToken}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-gray-400">Price Source</span>
				<span class="text-purple-400">Pyth Oracle</span>
			</div>
		</div>

		<!-- Fee Distribution Info -->
		<div class="mb-6 rounded-lg border border-gray-700 bg-black/20 p-3">
			<div class="mb-2 text-xs font-medium text-gray-400">Fee Distribution</div>
			<div class="flex gap-2 text-xs">
				<span class="rounded bg-blue-500/20 px-2 py-1 text-blue-400">60% LPs</span>
				<span class="rounded bg-green-500/20 px-2 py-1 text-green-400">25% Stakers</span>
				<span class="rounded bg-purple-500/20 px-2 py-1 text-purple-400">10% Treasury</span>
				<span class="rounded bg-orange-500/20 px-2 py-1 text-orange-400">5% Insurance</span>
			</div>
		</div>

		<!-- Action Button -->
		{#if $walletConnected}
			<button
				on:click={handleDemoLock}
				disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > tokenBalance || isLocking}
				class="w-full rounded-lg bg-amber-500 py-4 text-lg font-bold text-black transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLocking}
					<span class="flex items-center justify-center gap-2">
						<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Locking...
					</span>
				{:else if parseFloat(amount || '0') > tokenBalance}
					Insufficient Balance
				{:else}
					Lock & Mint
				{/if}
			</button>
		{:else}
			<button
				on:click={connectWallet}
				class="w-full rounded-lg bg-amber-500 py-4 text-lg font-bold text-black transition-all hover:bg-amber-400"
			>
				Connect Wallet to Lock
			</button>
		{/if}
	</div>

	<!-- Info Cards -->
	<div class="mt-8 grid gap-4 md:grid-cols-2">
		<div class="rounded-lg border border-amber-400/20 bg-black/20 p-4">
			<h3 class="mb-2 font-bold text-amber-400">No Liquidations</h3>
			<p class="text-sm text-gray-400">Your locked tokens are always safe. No matter what happens to the market, you can always unlock your original collateral.</p>
		</div>
		<div class="rounded-lg border border-amber-400/20 bg-black/20 p-4">
			<h3 class="mb-2 font-bold text-amber-400">Keep Earning</h3>
			<p class="text-sm text-gray-400">Your mSOL and JitoSOL continue earning staking rewards even while locked in the protocol.</p>
		</div>
	</div>
</div>
