/**
 * Hyperion Protocol Configuration V2
 * 
 * Updated for receipt-based system with Pyth oracle integration
 */

import { PublicKey } from '@solana/web3.js';

// Environment detection
const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
const cluster = isDev ? 'devnet' : 'mainnet-beta';

// Program ID (MAINNET DEPLOYED V2)
export const PROGRAM_ID = new PublicKey(
  'BeitYPurfqE4eYS2wYcHts78Vzc2gMQVXhadQQ7DxJ5r'
);

// Pyth Price Feed Account (SOL/USD) - needed for lock transactions
export const PYTH_SOL_USD_FEED = new PublicKey(
  '7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE'
);

// Treasury and Fee Collector (protocol earnings)
export const TREASURY = new PublicKey('FXQeb5og3DHwhM8fFewoPNuAZi5UCknRZ5L7nuAGcr3U');
export const FEE_COLLECTOR = new PublicKey('DLcEhjdJSVa5gwSS2HBToSWi5YByxorNMNrpTprRxSvu');

// Protocol PDA - derived from seeds ["protocol"]
export const PROTOCOL_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from('protocol')],
  PROGRAM_ID
)[0];

// Known token addresses
export const TOKENS = {
  mainnet: {
    mSOL: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
    jitoSOL: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
    hySOL: new PublicKey('5YN2tzn1GKWZqq9mjYQspnrXqKFXe1LDG5uQ5mft5CV9'),
    hyJitoSOL: new PublicKey('GQQqLKZsG7DwNkssUKwAoQiW8xXrrVt8R8cxZj7GGrmU'),
    HYPRN: new PublicKey('F9Y9wQ4x4Zj1vFDH9dJozBW3FyCKXNKJhdsa7vfqpwF2'),
  },
  devnet: {
    mSOL: null as PublicKey | null,
    jitoSOL: null as PublicKey | null,
    hySOL: null as PublicKey | null,
    hyJitoSOL: null as PublicKey | null,
    HYPRN: null as PublicKey | null,
  },
};

// Vault PDAs (mainnet)
export const VAULTS = {
  mSOL: new PublicKey('4p4QSNafGd9NgPKPpwYkTefqbTkfa7ag1JmZ8PKapQTW'),
  jitoSOL: new PublicKey('Fok56J1xpW2NPpR8ncAQcYBK1UWboH3zJmkFgmtNfecw'),
};

export const getCurrentTokens = () => TOKENS[cluster as keyof typeof TOKENS];

export const PROTOCOL_FEE_BPS = 10;

export const LST_RATIOS = {
  mSOL: 1_050_000_000,
  jitoSOL: 1_060_000_000
};

export function getVaultPDA(underlyingMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), underlyingMint.toBuffer()],
    PROGRAM_ID
  );
}

export function getReceiptPDA(user: PublicKey, receiptId: bigint): [PublicKey, number] {
  const receiptIdBuffer = Buffer.alloc(8);
  receiptIdBuffer.writeBigUInt64LE(receiptId);
  return PublicKey.findProgramAddressSync(
    [Buffer.from('receipt'), user.toBuffer(), receiptIdBuffer],
    PROGRAM_ID
  );
}

export const RPC_ENDPOINTS = {
  devnet: 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://mainnet.helius-rpc.com/?api-key=150398be-7c6b-489b-98a0-7903153f554d',
};

export const getCurrentRPC = () => RPC_ENDPOINTS[cluster as keyof typeof RPC_ENDPOINTS];

export const CLUSTER = cluster;
export const IS_DEVNET = cluster === 'devnet';
export const IS_MAINNET = cluster === 'mainnet-beta';

export const getExplorerUrl = (address: string, type: 'address' | 'tx' = 'address') => {
  const base = 'https://explorer.solana.com';
  const clusterParam = cluster === 'mainnet-beta' ? '' : '?cluster=' + cluster;
  return base + '/' + type + '/' + address + clusterParam;
};

export const config = {
  programId: PROGRAM_ID,
  protocolPda: PROTOCOL_PDA,
  pythFeed: PYTH_SOL_USD_FEED,
  treasury: TREASURY,
  feeCollector: FEE_COLLECTOR,
  tokens: getCurrentTokens(),
  rpc: getCurrentRPC(),
  cluster: CLUSTER,
  isDevnet: IS_DEVNET,
  isMainnet: IS_MAINNET,
  feeBps: PROTOCOL_FEE_BPS,
  lstRatios: LST_RATIOS,
  getVaultPDA,
  getReceiptPDA,
  getExplorerUrl,
};

export default config;
