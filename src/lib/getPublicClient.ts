import { createPublicClient, http } from 'viem';
import { solana } from 'viem/chains';

export const getPublicClient = () =>
	createPublicClient({
		chain: solana,
		transport: http('https://rpc.ankr.com/solana')
	});
