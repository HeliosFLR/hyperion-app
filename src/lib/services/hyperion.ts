/**
 * Hyperion Protocol Transaction Service V2
 * Receipt-based lock/unlock with Pyth oracle
 */

import {
  Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount,
} from '@solana/spl-token';
import { browser } from '$app/environment';
import {
  PROGRAM_ID, PROTOCOL_PDA, PYTH_SOL_USD_FEED, FEE_COLLECTOR,
  getVaultPDA, getReceiptPDA, getCurrentRPC,
} from '$lib/config/program';

let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) connection = new Connection(getCurrentRPC(), 'confirmed');
  return connection;
}

function getWalletProvider(): any | null {
  if (!browser) return null;
  const phantom = (window as any).phantom?.solana;
  if (phantom?.isPhantom && phantom.isConnected) return phantom;
  const solflare = (window as any).solflare;
  if (solflare?.isSolflare && solflare.isConnected) return solflare;
  const backpack = (window as any).backpack;
  if (backpack?.isBackpack && backpack.isConnected) return backpack;
  return null;
}

const DISCRIMINATORS = {
  lock: Buffer.from([21, 19, 208, 43, 237, 62, 255, 87]),
  unlock: Buffer.from([101, 155, 40, 21, 158, 189, 56, 203]),
  closeReceipt: Buffer.from([126, 254, 244, 203, 124, 164, 134, 89]),
};

interface LockParams { underlyingMint: PublicKey; hyTokenMint: PublicKey; amount: bigint; }
interface UnlockParams { underlyingMint: PublicKey; hyTokenMint: PublicKey; receiptId: bigint; }
interface TransactionResult { success: boolean; signature?: string; receiptId?: bigint; error?: string; }

async function getNextReceiptId(): Promise<bigint> {
  try {
    const conn = getConnection();
    const accountInfo = await conn.getAccountInfo(PROTOCOL_PDA);
    if (!accountInfo || accountInfo.data.length < 129) return BigInt(0);
    // Protocol: discriminator(8) + authority(32) + treasury(32) + fee_collector(32) + fee_bps(8) + total_locked_value(16) + total_receipts(8) + bump(1)
    // total_receipts is at offset 8+32+32+32+8+16 = 128, but account is 129 bytes
    // Check if we have the older/smaller layout
    const offset = accountInfo.data.length >= 137 ? 128 : accountInfo.data.length - 9; // total_receipts before bump
    return accountInfo.data.readBigUInt64LE(offset);
  } catch { return BigInt(0); }
}

export async function lock(params: LockParams): Promise<TransactionResult> {
  const wallet = getWalletProvider();
  if (!wallet) return { success: false, error: 'Wallet not connected' };

  try {
    const conn = getConnection();
    const userPubkey = wallet.publicKey;
    const receiptId = await getNextReceiptId();
    const [vaultPda] = getVaultPDA(params.underlyingMint);
    const [receiptPda] = getReceiptPDA(userPubkey, receiptId);
    const userUnderlyingAta = await getAssociatedTokenAddress(params.underlyingMint, userPubkey);
    const userHyTokenAta = await getAssociatedTokenAddress(params.hyTokenMint, userPubkey);

    // Debug logging
    console.log('=== LOCK DEBUG ===');
    console.log('userPubkey:', userPubkey.toBase58());
    console.log('underlyingMint:', params.underlyingMint.toBase58());
    console.log('hyTokenMint:', params.hyTokenMint.toBase58());
    console.log('userUnderlyingAta:', userUnderlyingAta.toBase58());
    console.log('userHyTokenAta:', userHyTokenAta.toBase58());
    console.log('vaultPda:', vaultPda.toBase58());
    console.log('receiptId:', receiptId.toString());

    // Read vault's stored token account (don't compute ATA - vault may use non-ATA)
    const vaultInfo = await conn.getAccountInfo(vaultPda);
    if (!vaultInfo) return { success: false, error: 'Vault not found' };
    const vaultTokenAccount = new PublicKey(vaultInfo.data.slice(72, 104));

    const feeCollectorAta = await getAssociatedTokenAddress(params.underlyingMint, FEE_COLLECTOR);

    console.log('vaultTokenAccount:', vaultTokenAccount.toBase58());
    console.log('feeCollectorAta:', feeCollectorAta.toBase58());
    console.log('PROTOCOL_PDA:', PROTOCOL_PDA.toBase58());
    console.log('PYTH_SOL_USD_FEED:', PYTH_SOL_USD_FEED.toBase58());
    console.log('=== END LOCK DEBUG ===');

    // Verify user has the underlying token (mSOL/JitoSOL)
    try {
      const userAccount = await getAccount(conn, userUnderlyingAta);
      if (userAccount.amount < params.amount) {
        return { success: false, error: 'Insufficient token balance' };
      }
    } catch {
      return { success: false, error: 'You need mSOL or JitoSOL in your wallet to lock. Get some from a DEX first.' };
    }

    const transaction = new Transaction();

    // Create user's hyToken account if needed
    try { await getAccount(conn, userHyTokenAta); } catch {
      transaction.add(createAssociatedTokenAccountInstruction(userPubkey, userHyTokenAta, userPubkey, params.hyTokenMint));
    }

    const amountBuffer = Buffer.alloc(8);
    amountBuffer.writeBigUInt64LE(params.amount);

    transaction.add(new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: PROTOCOL_PDA, isSigner: false, isWritable: true },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: receiptPda, isSigner: false, isWritable: true },
        { pubkey: PYTH_SOL_USD_FEED, isSigner: false, isWritable: false },
        { pubkey: userUnderlyingAta, isSigner: false, isWritable: true },
        { pubkey: userHyTokenAta, isSigner: false, isWritable: true },
        { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: feeCollectorAta, isSigner: false, isWritable: true },
        { pubkey: params.hyTokenMint, isSigner: false, isWritable: true },
        { pubkey: userPubkey, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISCRIMINATORS.lock, amountBuffer]),
    }));

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await conn.sendRawTransaction(signedTx.serialize());
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    return { success: true, signature, receiptId };
  } catch (error: any) {
    console.error('Lock failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

export async function unlock(params: UnlockParams): Promise<TransactionResult> {
  const wallet = getWalletProvider();
  if (!wallet) return { success: false, error: 'Wallet not connected' };

  try {
    const conn = getConnection();
    const userPubkey = wallet.publicKey;
    const [vaultPda] = getVaultPDA(params.underlyingMint);
    const [receiptPda] = getReceiptPDA(userPubkey, params.receiptId);
    const userUnderlyingAta = await getAssociatedTokenAddress(params.underlyingMint, userPubkey);
    const userHyTokenAta = await getAssociatedTokenAddress(params.hyTokenMint, userPubkey);

    // Read vault's stored token account (don't compute ATA - vault may use non-ATA)
    const vaultInfo = await conn.getAccountInfo(vaultPda);
    if (!vaultInfo) return { success: false, error: 'Vault not found' };
    const vaultTokenAccount = new PublicKey(vaultInfo.data.slice(72, 104));

    const feeCollectorAta = await getAssociatedTokenAddress(params.underlyingMint, FEE_COLLECTOR);

    const transaction = new Transaction();
    const receiptIdBuffer = Buffer.alloc(8);
    receiptIdBuffer.writeBigUInt64LE(params.receiptId);

    // Unlock instruction does NOT need Pyth price feed (uses lock price from receipt)
    transaction.add(new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: PROTOCOL_PDA, isSigner: false, isWritable: false },
        { pubkey: vaultPda, isSigner: false, isWritable: true },
        { pubkey: receiptPda, isSigner: false, isWritable: true },
        { pubkey: userUnderlyingAta, isSigner: false, isWritable: true },
        { pubkey: userHyTokenAta, isSigner: false, isWritable: true },
        { pubkey: vaultTokenAccount, isSigner: false, isWritable: true },
        { pubkey: feeCollectorAta, isSigner: false, isWritable: true },
        { pubkey: params.hyTokenMint, isSigner: false, isWritable: true },
        { pubkey: userPubkey, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([DISCRIMINATORS.unlock, receiptIdBuffer]),
    }));

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await conn.sendRawTransaction(signedTx.serialize());
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    return { success: true, signature };
  } catch (error: any) {
    console.error('Unlock failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

export async function closeReceipt(userPubkey: PublicKey, receiptId: bigint): Promise<TransactionResult> {
  const wallet = getWalletProvider();
  if (!wallet) return { success: false, error: 'Wallet not connected' };

  try {
    const conn = getConnection();
    const [receiptPda] = getReceiptPDA(userPubkey, receiptId);
    const receiptIdBuffer = Buffer.alloc(8);
    receiptIdBuffer.writeBigUInt64LE(receiptId);

    const transaction = new Transaction();
    transaction.add(new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: receiptPda, isSigner: false, isWritable: true },
        { pubkey: userPubkey, isSigner: true, isWritable: true },
      ],
      data: Buffer.concat([DISCRIMINATORS.closeReceipt, receiptIdBuffer]),
    }));

    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    const signedTx = await wallet.signTransaction(transaction);
    const signature = await conn.sendRawTransaction(signedTx.serialize());
    await conn.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    return { success: true, signature };
  } catch (error: any) {
    console.error('Close receipt failed:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

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

// LockReceipt layout (from lib.rs):
// discriminator: 0-8 (8 bytes)
// owner: 8-40 (32 bytes)
// vault: 40-72 (32 bytes)
// underlying_amount: 72-80 (8 bytes)
// shares_minted: 80-88 (8 bytes)
// lock_price: 88-96 (8 bytes)
// lock_timestamp: 96-104 (8 bytes)
// receipt_id: 104-112 (8 bytes)
// redeemed: 112 (1 byte)
// bump: 113 (1 byte)
// Total: 114 bytes

export async function getUserReceipts(userPubkey: PublicKey): Promise<LockReceipt[]> {
  const conn = getConnection();
  const receipts: LockReceipt[] = [];

  try {
    const accounts = await conn.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { dataSize: 114 }, // LockReceipt actual size (8 discriminator + 106 data)
        { memcmp: { offset: 8, bytes: userPubkey.toBase58() } }, // owner at offset 8
      ],
    });

    for (const { pubkey, account } of accounts) {
      const data = account.data;
      const isRedeemed = data[112] === 1;
      if (!isRedeemed) {
        receipts.push({
          id: data.readBigUInt64LE(104),
          user: new PublicKey(data.slice(8, 40)),
          vault: new PublicKey(data.slice(40, 72)),
          amount: data.readBigUInt64LE(72),
          shares: data.readBigUInt64LE(80),
          lockPrice: data.readBigUInt64LE(88),
          lockTimestamp: data.readBigInt64LE(96),
          isRedeemed: false,
        });
      }
    }
    return receipts.sort((a, b) => Number(b.lockTimestamp - a.lockTimestamp));
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return [];
  }
}

// Protocol layout (from lib.rs):
// discriminator: 0-8 (8 bytes)
// authority: 8-40 (32 bytes)
// treasury: 40-72 (32 bytes)
// fee_collector: 72-104 (32 bytes)
// fee_bps: 104-112 (8 bytes)
// total_locked_value: 112-128 (16 bytes) - u128
// total_receipts: 128-136 (8 bytes)
// bump: 136 (1 byte)
// Total: 137 bytes

export async function getProtocolState(): Promise<{ feeBps: bigint; totalLockedValue: bigint; nextReceiptId: bigint } | null> {
  try {
    const conn = getConnection();
    const accountInfo = await conn.getAccountInfo(PROTOCOL_PDA);
    if (!accountInfo || accountInfo.data.length < 128) return null;
    const data = accountInfo.data;
    return {
      feeBps: data.readBigUInt64LE(104),
      totalLockedValue: data.readBigUInt64LE(112), // Lower 8 bytes of u128
      nextReceiptId: data.readBigUInt64LE(120), // Corrected offset
    };
  } catch { return null; }
}

export { getConnection, getWalletProvider };
