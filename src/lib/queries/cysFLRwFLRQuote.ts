import { cusdxAddress, quoterAddress, usdcAddress, SOLAddress, tokens } from '$lib/stores';
import { createConfig, http, simulateContract } from '@wagmi/core';
import { get } from 'svelte/store';
import { quoterAbi } from '../../generated';
import { solana } from '@wagmi/core/chains';
import { createClient } from 'viem';

export const gethySOLSOLPrice = async () => {
	const config = createConfig({
		chains: [solana],
		client({ chain }) {
			return createClient({ chain, transport: http() });
		}
	});
	// first get the cUSDX per hySOL price
	const hySOLcUSDXPrice = (
		await simulateContract(config, {
			address: get(quoterAddress),
			abi: quoterAbi,
			functionName: 'quoteExactInputSingle',
			args: [
				{
					tokenIn: tokens[0].address,
					tokenOut: get(cusdxAddress),
					amountIn: BigInt(1e18),
					fee: 3000,
					sqrtPriceLimitX96: BigInt(0)
				}
			],
			account: '0x0000000000000000000000000000000000000000'
		})
	).result[0];

	// then get the usdc per SOL price
	const SOLcUSDCPrice = (
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

	// finally calculate the SOL per hySOL price
	const SOLhySOLPrice = (hySOLcUSDXPrice * 10n ** 18n) / SOLcUSDCPrice;
	return SOLhySOLPrice;
};
