<script lang="ts">
	import WalletConnect from './WalletConnect.svelte';
	import { base } from '$app/paths';
	import SocialLinks from './SocialLinks.svelte';
	import NavButtons from './NavButtons.svelte';

	export let launched: boolean;
</script>

<div class="flex h-16 w-screen items-center justify-between bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-4 shadow-lg">
	<div class="mr-4 flex items-center justify-center gap-4">
		<a href={base + '/'} class="flex items-center gap-3">
			<img src="{base}/logo.png" alt="Hyperion" class="h-9 w-9" />
			<span class="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-2xl font-bold tracking-wider text-transparent">
				HYPERION
			</span>
		</a>
		<NavButtons {launched} />
	</div>
	<div class="flex items-center justify-center gap-4">
		<SocialLinks />
		<img src="{base}/logo.png" alt="Hyperion" class="h-8 w-8 opacity-80" />
		<WalletConnect />
	</div>
</div>
