<script lang="ts">
	import { walletConnected, walletAddress, connectWallet } from '$lib/stores/wallet';
	import { unlock, getUserReceipts } from '$lib/services/hyperion';
	import { config, TOKENS, VAULTS } from '$lib/config/program';
	import { PublicKey } from '@solana/web3.js';
	import { onMount } from 'svelte';

	interface LockReceipt {
		id: bigint;
		user: PublicKey;
		vault: PublicKey;
		amount: bigint;
		shares: bigint;
		lockPrice: bigint;
		lockTimestamp: bigint;
		isRedeemed: boolean;
	}

	let receipts: LockReceipt[] = [];
	let selectedReceipt: LockReceipt | null = null;
	let showSuccess = false;
	let isUnlocking = false;
	let isLoading = false;
	let errorMessage = '';
	let txSignature = '';

	// Load user receipts when wallet connects
	$: if ($walletAddress && !$walletAddress.startsWith('Demo')) {
		loadReceipts();
	}

	async function loadReceipts() {
		if (!$walletAddress) return;
		isLoading = true;
		try {
			const userPubkey = new PublicKey($walletAddress);
			receipts = await getUserReceipts(userPubkey);
		} catch (error) {
			console.error('Failed to load receipts:', error);
		} finally {
			isLoading = false;
		}
	}

	function formatAmount(lamports: bigint): string {
		return (Number(lamports) / 1e9).toFixed(4);
	}

	function formatPrice(price: bigint): string {
		return (Number(price) / 1e8).toFixed(2);
	}

	function formatDate(timestamp: bigint): string {
		return new Date(Number(timestamp) * 1000).toLocaleDateString();
	}

	async function handleUnlock(receipt: LockReceipt) {
		if (isUnlocking) return;

		isUnlocking = true;
		errorMessage = '';
		txSignature = '';
		selectedReceipt = receipt;

		try {
			const tokens = TOKENS.mainnet;
			const vaultKey = receipt.vault.toBase58();

			// Determine which token based on the vault stored in receipt
			let underlyingMint: PublicKey;
			let hyTokenMint: PublicKey;

			if (vaultKey === VAULTS.mSOL.toBase58()) {
				underlyingMint = tokens.mSOL;
				hyTokenMint = tokens.hySOL!;
			} else if (vaultKey === VAULTS.jitoSOL.toBase58()) {
				underlyingMint = tokens.jitoSOL;
				hyTokenMint = tokens.hyJitoSOL!;
			} else {
				throw new Error('Unknown vault');
			}

			const result = await unlock({
				underlyingMint,
				hyTokenMint,
				receiptId: receipt.id
			});

			if (result.success) {
				showSuccess = true;
				txSignature = result.signature || '';
				// Refresh receipts
				await loadReceipts();
				setTimeout(() => {
					showSuccess = false;
					selectedReceipt = null;
				}, 5000);
			} else {
				errorMessage = result.error || 'Transaction failed';
			}
		} catch (error: any) {
			console.error('Unlock error:', error);
			errorMessage = error.message || 'Failed to unlock tokens';
		} finally {
			isUnlocking = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl p-4 pt-8">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-white">Unlock Tokens</h1>
		<p class="text-gray-400">Redeem your lock receipts at the original lock price</p>
	</div>

	{#if showSuccess}
		<div class="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-center text-green-400">
			<div>Unlock successful! Your tokens have been returned.</div>
			{#if txSignature}
				<a
					href="https://explorer.solana.com/tx/{txSignature}?cluster={config.cluster}"
					target="_blank"
					class="mt-2 block text-sm text-blue-400 hover:underline"
				>
					View on Explorer
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
		{#if !$walletConnected}
			<div class="text-center py-8">
				<p class="text-gray-400 mb-4">Connect your wallet to view your lock receipts</p>
				<button
					on:click={connectWallet}
					class="rounded-lg bg-amber-500 px-6 py-3 font-bold text-black hover:bg-amber-400"
				>
					Connect Wallet
				</button>
			</div>
		{:else if isLoading}
			<div class="text-center py-8">
				<svg class="h-8 w-8 animate-spin mx-auto text-amber-400" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<p class="text-gray-400 mt-2">Loading receipts...</p>
			</div>
		{:else if receipts.length === 0}
			<div class="text-center py-8">
				<p class="text-gray-400">No active lock receipts found</p>
				<a href="/lock" class="mt-4 inline-block text-amber-400 hover:underline">Lock tokens to get started</a>
			</div>
		{:else}
			<div class="space-y-4">
				<h2 class="text-lg font-bold text-white mb-4">Your Lock Receipts</h2>
				{#each receipts as receipt}
					<div class="rounded-lg border border-gray-700 bg-black/40 p-4">
						<div class="flex justify-between items-start mb-3">
							<div>
								<span class="text-xs text-gray-500">Receipt #{receipt.id.toString()}</span>
								<div class="text-lg font-bold text-white">{formatAmount(receipt.amount)} LST</div>
							</div>
							<span class="text-xs text-gray-500">{formatDate(receipt.lockTimestamp)}</span>
						</div>
						<div class="grid grid-cols-2 gap-2 text-sm mb-4">
							<div>
								<span class="text-gray-500">Lock Price:</span>
								<span class="text-white ml-1">${formatPrice(receipt.lockPrice)}</span>
							</div>
							<div>
								<span class="text-gray-500">Shares:</span>
								<span class="text-amber-400 ml-1">{formatAmount(receipt.shares)}</span>
							</div>
						</div>
						<button
							on:click={() => handleUnlock(receipt)}
							disabled={isUnlocking}
							class="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2 font-bold text-black hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
						>
							{#if isUnlocking && selectedReceipt?.id === receipt.id}
								Unlocking...
							{:else}
								Unlock
							{/if}
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Info Cards -->
	<div class="mt-8 rounded-lg border border-amber-400/20 bg-black/20 p-4">
		<h3 class="mb-2 font-bold text-amber-400">Receipt-Based Redemption</h3>
		<p class="text-sm text-gray-400">Each lock creates a receipt with your lock price. When you unlock, you receive your original collateral amount regardless of current market price - this is what makes Hyperion liquidation-free.</p>
	</div>
</div>
