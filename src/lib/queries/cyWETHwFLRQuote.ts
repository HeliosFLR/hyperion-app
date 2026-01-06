import { cusdxAddress, quoterAddress, usdcAddress, SOLAddress, tokens } from '$lib/stores';
import { createConfig, http, simulateContract } from '@wagmi/core';
import { get } from 'svelte/store';
import { quoterAbi } from '../../generated';
import { solana } from '@wagmi/core/chains';
import { createClient } from 'viem';

export const gethyJitoSOLSOLPrice = async () => {
	const config = createConfig({
		chains: [solana],
		client({ chain }) {
			return createClient({ chain, transport: http() });
		}
	});

	// First get the USDC per hyJitoSOL price
	const hyJitoSOLUSDCPrice = (
		await simulateContract(config, {
			address: get(quoterAddress),
			abi: quoterAbi,
			functionName: 'quoteExactInputSingle',
			args: [
				{
					tokenIn: tokens[1].address,
					tokenOut: get(cusdxAddress),
					amountIn: BigInt(1e18),
					fee: 10000,
					sqrtPriceLimitX96: BigInt(0)
				}
			],
			account: '0x0000000000000000000000000000000000000000'
		})
	).result[0];

	// Then get the USDC per SOL price
	const SOLUSDCPrice = (
		await simulateContract(config, {
			address: get(quoterAddress),
			abi: quoterAbi,
			functionName: 'quoteExactInputSingle',
			args: [
				{
					tokenIn: get(SOLAddress),
					tokenOut: get(usdcAddress),
					amountIn: BigInt(1e18),
					fee: 3000,
					sqrtPriceLimitX96: BigInt(0)
				}
			],
			account: '0x0000000000000000000000000000000000000000'
		})
	).result[0];

	// Calculate SOL per hyJitoSOL price
	const SOLhyJitoSOLPrice = (hyJitoSOLUSDCPrice * 10n ** 18n) / SOLUSDCPrice;
	return SOLhyJitoSOLPrice;
};
