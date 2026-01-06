<script lang="ts">
	import '../app.css';
	import { walletAddress, walletConnected, isConnecting, connectWallet, disconnectWallet, truncateAddress } from '$lib/stores/wallet';
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
	<header class="flex h-16 w-full items-center justify-between border-b border-amber-400/20 px-4 backdrop-blur-sm">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-3">
				<img src="/logo.png" alt="Hyperion" class="h-9 w-9" />
				<span class="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-2xl font-bold tracking-wider text-transparent">
					HYPERION
				</span>
			</a>
			<nav class="hidden items-center gap-4 md:flex">
				<a href="/lock" class="text-sm font-medium transition-colors {$page.url.pathname === '/lock' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}">
					Lock
				</a>
				<a href="/unlock" class="text-sm font-medium transition-colors {$page.url.pathname === '/unlock' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}">
					Unlock
				</a>
				<a href="/stats" class="text-sm font-medium transition-colors {$page.url.pathname === '/stats' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}">
					Stats
				</a>
			</nav>
		</div>
		<div class="flex items-center gap-4">
			<div class="hidden items-center gap-3 sm:flex">
				<a href="https://x.com/hyperionsol_" target="_blank" class="text-gray-400 hover:text-amber-400">
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
				</a>
				<a href="https://t.me/hyperionfi" target="_blank" class="text-gray-400 hover:text-amber-400">
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
				</a>
				<a href="https://github.com/HeliosFLR/hyperion-app" target="_blank" class="text-gray-400 hover:text-amber-400">
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
				</a>
			</div>
			{#if $walletConnected}
				<button
					on:click={disconnectWallet}
					class="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-2 font-mono text-sm text-amber-400 transition-all hover:bg-amber-500/20"
				>
					{truncateAddress($walletAddress || '')}
				</button>
			{:else}
				<button
					on:click={connectWallet}
					disabled={$isConnecting}
					class="rounded-lg border border-amber-400 bg-amber-500 px-4 py-2 font-semibold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
				>
					{$isConnecting ? 'Connecting...' : 'Connect Wallet'}
				</button>
			{/if}
		</div>
	</header>
	
	<main class="flex-grow">
		<slot />
	</main>
	
	<footer class="border-t border-amber-400/20 p-4 text-center text-sm text-gray-500">
		<p>Hyperion - Liquidation-free leverage on Solana</p>
	</footer>
</div>
