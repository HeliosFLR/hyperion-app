// Solana Connection and Wallet Service
// Handles wallet connection, balance fetching, and RPC calls

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// RPC Endpoints
const RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  helius: 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY', // Replace with actual key
  quicknode: 'https://solana-mainnet.core.chainstack.com/YOUR_KEY' // Replace with actual key
};

// Token mint addresses on Solana mainnet
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112', // Native SOL wrapped
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  JitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  // These would be Hyperion's own tokens (to be deployed)
  hySOL: 'PLACEHOLDER_HYSOL_MINT',
  hyJitoSOL: 'PLACEHOLDER_HYJITOSOLMINT'
} as const;

// Token decimals
export const TOKEN_DECIMALS: Record<string, number> = {
  SOL: 9,
  mSOL: 9,
  JitoSOL: 9,
  hySOL: 9,
  hyJitoSOL: 9
};

let connection: Connection | null = null;

// Get or create connection
export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_ENDPOINTS.mainnet, 'confirmed');
  }
  return connection;
}

// Wallet types
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?: (tx: any) => Promise<any>;
  signAllTransactions?: (txs: any[]) => Promise<any[]>;
}

// Get Phantom wallet if available
export function getPhantomWallet(): WalletAdapter | null {
  if (typeof window === 'undefined') return null;

  const phantom = (window as any).phantom?.solana;
  if (phantom?.isPhantom) {
    return {
      publicKey: phantom.publicKey,
      connected: phantom.isConnected,
      connect: async () => {
        await phantom.connect();
      },
      disconnect: async () => {
        await phantom.disconnect();
      },
      signTransaction: phantom.signTransaction?.bind(phantom),
      signAllTransactions: phantom.signAllTransactions?.bind(phantom)
    };
  }
  return null;
}

// Get Solflare wallet if available
export function getSolflareWallet(): WalletAdapter | null {
  if (typeof window === 'undefined') return null;

  const solflare = (window as any).solflare;
  if (solflare?.isSolflare) {
    return {
      publicKey: solflare.publicKey,
      connected: solflare.isConnected,
      connect: async () => {
        await solflare.connect();
      },
      disconnect: async () => {
        await solflare.disconnect();
      },
      signTransaction: solflare.signTransaction?.bind(solflare),
      signAllTransactions: solflare.signAllTransactions?.bind(solflare)
    };
  }
  return null;
}

// Fetch SOL balance
export async function fetchSOLBalance(address: string): Promise<number> {
  try {
    const conn = getConnection();
    const publicKey = new PublicKey(address);
    const balance = await conn.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to fetch SOL balance:', error);
    return 0;
  }
}

// Fetch SPL token balance
export async function fetchTokenBalance(
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  try {
    const conn = getConnection();
    const wallet = new PublicKey(walletAddress);
    const mint = new PublicKey(tokenMint);

    // Get token accounts for this mint
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(wallet, {
      mint: mint
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    // Sum up all token account balances (usually just one)
    let total = 0;
    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      const amount = parsed.info.tokenAmount.uiAmount || 0;
      total += amount;
    }

    return total;
  } catch (error) {
    console.error(`Failed to fetch ${tokenMint} balance:`, error);
    return 0;
  }
}

// Fetch all balances for a wallet
export async function fetchAllBalances(walletAddress: string): Promise<Record<string, number>> {
  try {
    const [solBalance, msolBalance, jitosolBalance] = await Promise.all([
      fetchSOLBalance(walletAddress),
      fetchTokenBalance(walletAddress, TOKEN_MINTS.mSOL),
      fetchTokenBalance(walletAddress, TOKEN_MINTS.JitoSOL)
    ]);

    // hySOL and hyJitoSOL would need actual deployed mints
    // For now, return 0 or fetch from actual mints when deployed
    return {
      SOL: solBalance,
      mSOL: msolBalance,
      JitoSOL: jitosolBalance,
      hySOL: 0, // Will be real when tokens deployed
      hyJitoSOL: 0
    };
  } catch (error) {
    console.error('Failed to fetch balances:', error);
    return {
      SOL: 0,
      mSOL: 0,
      JitoSOL: 0,
      hySOL: 0,
      hyJitoSOL: 0
    };
  }
}

// Start real-time balance updates
export function startBalanceUpdates(
  walletAddress: string,
  callback: (balances: Record<string, number>) => void,
  intervalMs: number = 15000
): () => void {
  let isRunning = true;

  const update = async () => {
    if (!isRunning) return;
    const balances = await fetchAllBalances(walletAddress);
    callback(balances);
  };

  // Initial fetch
  update();

  // Set up interval
  const interval = setInterval(update, intervalMs);

  // Return cleanup function
  return () => {
    isRunning = false;
    clearInterval(interval);
  };
}
