import type { Config } from '@wagmi/core';
import type { Receipt } from '$lib/types';
import { myReceipts, tokens } from '$lib/stores';
import { getSingleTokenReceipts } from '$lib/queries/getReceipts';

export const refreshAllReceipts = async (
	signerAddress: string,
	config: Config,
	setLoading: (loading: boolean) => void = () => {}
): Promise<Receipt[]> => {
	if (!signerAddress) return [];

	// Get receipts for both tokens
	const [hySOLReceipts, hyJitoSOLReceipts] = await Promise.all([
		getSingleTokenReceipts(signerAddress, tokens[0].receiptAddress, config),
		getSingleTokenReceipts(signerAddress, tokens[1].receiptAddress, config)
	]);

	if (!hySOLReceipts && !hyJitoSOLReceipts) {
		setLoading(false);
		myReceipts.set([]);
		return [];
	}

	// Add token identifier to each receipt
	const allReceipts = [
		...(hySOLReceipts?.map((r) => ({ ...r, token: 'hySOL' })) || []),
		...(hyJitoSOLReceipts?.map((r) => ({ ...r, token: 'hyJitoSOL' })) || [])
	];

	setLoading(false);
	myReceipts.set(allReceipts);
	return allReceipts;
};
