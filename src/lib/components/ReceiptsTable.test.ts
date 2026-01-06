import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ReceiptsTable from './ReceiptsTable.svelte';
import { describe, it, expect } from 'vitest';
import { mockReceipt } from '$lib/mocks/mockReceipt';
import type { CyToken, Receipt } from '$lib/types';
import { formatEther } from 'ethers';

const mockReceipts = [mockReceipt, mockReceipt];

describe('ReceiptsTable Component', () => {
	const selectedToken: CyToken = {
		name: 'hySOL',
		address: '0xcdef1234abcdef5678',
		underlyingAddress: '0xabcd1234',
		underlyingSymbol: 'mSOL',
		receiptAddress: '0xeeff5678',
		symbol: 'hySOL',
		decimals: 18
	};

	it('renders the receipts table with correct headers and data', async () => {
		render(ReceiptsTable, { receipts: mockReceipts as unknown as Receipt[], token: selectedToken });

		expect(screen.getByTestId('headers')).toBeInTheDocument();

		for (let i = 0; i < mockReceipts.length; i++) {
			expect(screen.getByTestId(`locked-price-${i}`)).toHaveTextContent(
				Number(formatEther(mockReceipts[i].tokenId)).toFixed(5)
			);
			expect(screen.getByTestId(`number-held-${i}`)).toHaveTextContent(
				Number(formatEther(mockReceipts[i].balance)).toFixed(5)
			);
			expect(screen.getByTestId(`total-locked-${i}`)).toHaveTextContent(
				Number(mockReceipts[i].readableTotalSOL).toFixed(5)
			);
		}
	});

	it('opens a receipt modal when redeem button is clicked', async () => {
		render(ReceiptsTable, { receipts: mockReceipts as unknown as Receipt[], token: selectedToken });

		const redeemButton = screen.getByTestId('redeem-button-0');
		await fireEvent.click(redeemButton);

		await waitFor(() => {
			expect(screen.getByTestId('receipt-modal')).toBeInTheDocument();
		});
	});
});
