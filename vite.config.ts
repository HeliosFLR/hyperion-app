import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({
			include: ['buffer', 'process'],
			globals: {
				Buffer: true,
				process: true
			}
		})
	],
	define: {
		'process.env': {},
		global: 'globalThis'
	},
	optimizeDeps: {
		include: ['buffer', '@solana/web3.js', '@solana/spl-token']
	}
});
