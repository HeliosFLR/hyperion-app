import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import ReceiptModal from './ReceiptModal.svelte';
import transactionStore from '$lib/transactionStore';
import { readContract } from '@wagmi/core';
import { formatEther, parseEther } from 'ethers';
import { mockReceipt } from '$lib/mocks/mockReceipt';
import userEvent from '@testing-library/user-event';
import type { CyToken } from '$lib/types';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

vi.mock('@wagmi/core', () => {
	return {
		readContract: vi.fn()
	};
});

describe('ReceiptModal Component', () => {
	const initiateUnlockTransactionSpy = vi.spyOn(transactionStore, 'handleUnlockTransaction');

	const selectedToken: CyToken = {
		name: 'hySOL',
		address: '0xcdef1234abcdef5678',
		underlyingAddress: '0xabcd1234',
		underlyingSymbol: 'mSOL',
		receiptAddress: '0xeeff5678',
		symbol: 'hySOL',
		decimals: 18
	};

	beforeEach(() => {
		initiateUnlockTransactionSpy.mockClear();
		vi.resetAllMocks();
	});

	it('should render the modal with the correct receipt balance and lock-up price', async () => {
		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const receiptBalance = Number(formatEther(mockReceipt.balance));
		const lockUpPrice = Number(formatEther(mockReceipt.tokenId));

		await waitFor(() => {
			expect(screen.getByTestId('balance')).toHaveTextContent(receiptBalance.toString());
			expect(screen.getByTestId('lock-up-price')).toHaveTextContent(lockUpPrice.toString());
		});
	});

	it('should calculate and display correct solToReceive when redeem amount is entered', async () => {
		vi.mocked(readContract).mockImplementation(() =>
			Promise.resolve(BigInt('21663778162911611785'))
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.5');

		await waitFor(() => {
			expect(screen.getByTestId('sol-to-receive')).toHaveTextContent('21.663778162911611785 mSOL');
		});
	});

	it('should disable the unlock button when the redeem amount is greater than balance', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				},
				hySOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '2000');

		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton).toBeDisabled();
		});
	});

	it('should display "INSUFFICIENT hySOL" if hySOL balance is insufficient', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				},
				hySOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.00002');
		await userEvent.tab();

		await waitFor(() => {
			const button = screen.getByTestId('unlock-button');
			expect(button).toHaveTextContent('INSUFFICIENT cyTOKEN');
			expect(button).toBeDisabled();
		});
	});

	it('should enable the unlock button when a valid amount is entered', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(1000000000000000000),
					signerUnderlyingBalance: BigInt(1000000000000000000)
				},
				hySOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.5');
		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
		});
		screen.debug();
	});

	it('should call handleUnlockTransaction when unlock button is clicked', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(0),
					signerUnderlyingBalance: BigInt(0)
				},
				hySOL: {
					signerBalance: BigInt(1000000000000000000),
					signerUnderlyingBalance: BigInt(1000000000000000000)
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.0001');

		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
		});
		const unlockButton = screen.getByTestId('unlock-button');
		await userEvent.click(unlockButton);

		await waitFor(() => {
			expect(initiateUnlockTransactionSpy).toHaveBeenCalledOnce();
		});
	});

	it('should set exact receipt balance when max button is clicked and receipt balance is less than cySOLBalance', async () => {
		const mockHySOLBalance = BigInt('1000000000000000000');
		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(1000000000000000000),
					signerUnderlyingBalance: BigInt(1000000000000000000)
				},
				hySOL: {
					signerBalance: mockHySOLBalance,
					signerUnderlyingBalance: mockHySOLBalance
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);
		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		// Find the max button within the input component and click it
		const maxButton = screen.getByTestId('set-val-to-max');
		await fireEvent.click(maxButton);

		// Check that the display value is correct
		await waitFor(() => {
			const input = screen.getByTestId('redeem-input');
			expect(input).toHaveValue(formatEther(mockReceipt.balance));
		});

		// Click unlock button
		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
			userEvent.click(unlockButton);
		});

		// Verify initiateUnlockTransaction was called with exact cySOLBalance
		await waitFor(() => {
			expect(initiateUnlockTransactionSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					assets: mockReceipt.balance
				})
			);
		});
	});

	it('should set cySOLBalance when max button is clicked and receipt balance is greater than cySOLBalance', async () => {
		const mockHySOLBalance = parseEther('0.0001'); // 1 hySOL

		mockBalancesStore.mockSetSubscribeValue(
			'Ready',
			false,
			{
				hyJitoSOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				},
				hySOL: {
					lockPrice: BigInt(0),
					price: BigInt(0),
					supply: BigInt(0),
					underlyingTvl: BigInt(0),
					usdTvl: BigInt(0)
				}
			},
			{
				hyJitoSOL: {
					signerBalance: BigInt(1000000000000000000),
					signerUnderlyingBalance: BigInt(1000000000000000000)
				},
				hySOL: {
					signerBalance: mockHySOLBalance,
					signerUnderlyingBalance: mockHySOLBalance
				}
			},
			{
				cusdxOutput: BigInt(0),
				cyTokenOutput: BigInt(0)
			}
		);

		render(ReceiptModal, { receipt: mockReceipt, token: selectedToken });

		// Find the max button within the input component and click it
		const maxButton = screen.getByTestId('set-val-to-max');
		await fireEvent.click(maxButton);

		// Check that the display value is correct
		await waitFor(() => {
			const input = screen.getByTestId('redeem-input');
			expect(input).toHaveValue(formatEther(mockHySOLBalance));
		});

		// Click unlock button

		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
			userEvent.click(unlockButton);
		});

		// Verify initiateUnlockTransaction was called with exact cySOLBalance
		await waitFor(() => {
			expect(initiateUnlockTransactionSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					assets: mockHySOLBalance
				})
			);
		});
	});
});
