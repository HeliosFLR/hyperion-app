import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Stores
export const walletAddress = writable<string | null>(null);
export const walletConnected = derived(walletAddress, $addr => $addr !== null);
export const isConnecting = writable(false);
export const walletError = writable<string | null>(null);
export const pricesLoading = writable(true);

export const balances = writable({
  SOL: 0,
  mSOL: 0,
  JitoSOL: 0,
  hySOL: 0,
  hyJitoSOL: 0
});

export const prices = writable({
  SOL: 0,
  mSOL: 0,
  JitoSOL: 0,
  hySOL: 0,
  hyJitoSOL: 0
});

export const protocolStats = writable({
  tvl: 0,
  totalHySOL: 0,
  totalHyJitoSOL: 0,
  lockPrice: 1.12,
  users: 0
});

// Pyth Price Feeds (Hermes API format)
const PYTH_FEEDS: Record<string, string> = {
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  mSOL: 'c2289a6a43d2ce91c6f55caec370f4acc38a2ed477f58813334c6d03749ff2a4',
  JitoSOL: '67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb'
};

const TOKEN_MINTS: Record<string, string> = {
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  JitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  hySOL: '5YN2tzn1GKWZqq9mjYQspnrXqKFXe1LDG5uQ5mft5CV9',
  hyJitoSOL: 'GQQqLKZsG7DwNkssUKwAoQiW8xXrrVt8R8cxZj7GGrmU'
};

let priceInterval: ReturnType<typeof setInterval> | null = null;
let balanceInterval: ReturnType<typeof setInterval> | null = null;

// Fetch live prices from Pyth Hermes API
async function fetchPythPrices(): Promise<Record<string, number>> {
  try {
    const ids = Object.values(PYTH_FEEDS).map(id => `ids[]=${id}`).join('&');
    const res = await fetch(`https://hermes.pyth.network/api/latest_price_feeds?${ids}`);
    if (!res.ok) throw new Error('Pyth API error');

    const data = await res.json();
    const result: Record<string, number> = {};

    for (const [symbol, feedId] of Object.entries(PYTH_FEEDS)) {
      const feed = data.find((d: any) => d.id === feedId);
      if (feed?.price) {
        const price = parseInt(feed.price.price);
        const expo = feed.price.expo;
        result[symbol] = price * Math.pow(10, expo);
      }
    }
    return result;
  } catch (e) {
    console.error('Pyth fetch failed:', e);
    return { SOL: 95, mSOL: 98, JitoSOL: 99 };
  }
}

// Update all prices
async function updatePrices() {
  const pythPrices = await fetchPythPrices();
  const stats = get(protocolStats);
  const lockRatio = stats.lockPrice || 1.12;

  const msolPrice = pythPrices.mSOL || 98;
  const jitosolPrice = pythPrices.JitoSOL || 99;

  prices.set({
    SOL: pythPrices.SOL || 95,
    mSOL: msolPrice,
    JitoSOL: jitosolPrice,
    hySOL: msolPrice / lockRatio,
    hyJitoSOL: jitosolPrice / lockRatio
  });

  pricesLoading.set(false);
}

// Start price updates (every 10 seconds)
export function startPriceUpdates() {
  if (!browser) return;
  updatePrices();
  if (priceInterval) clearInterval(priceInterval);
  priceInterval = setInterval(updatePrices, 10000);
}

// Fetch balances from Solana RPC (using Helius for better reliability)
async function fetchBalancesFromRPC(address: string) {
  const RPC = 'https://mainnet.helius-rpc.com/?api-key=150398be-7c6b-489b-98a0-7903153f554d';

  try {
    // Fetch SOL balance
    const solRes = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    });
    const solData = await solRes.json();
    const solBalance = (solData.result?.value || 0) / 1e9;

    // Fetch SPL token balances
    const tokRes = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      })
    });
    const tokData = await tokRes.json();

    let mSOL = 0;
    let JitoSOL = 0;
    let hySOL = 0;
    let hyJitoSOL = 0;

    for (const acc of tokData.result?.value || []) {
      const info = acc.account?.data?.parsed?.info;
      if (!info) continue;
      const mint = info.mint;
      const amount = info.tokenAmount?.uiAmount || 0;

      if (mint === TOKEN_MINTS.mSOL) mSOL = amount;
      else if (mint === TOKEN_MINTS.JitoSOL) JitoSOL = amount;
      else if (mint === TOKEN_MINTS.hySOL) hySOL = amount;
      else if (mint === TOKEN_MINTS.hyJitoSOL) hyJitoSOL = amount;
    }

    return { SOL: solBalance, mSOL, JitoSOL, hySOL, hyJitoSOL };
  } catch (e) {
    console.error('Balance fetch failed:', e);
    return { SOL: 0, mSOL: 0, JitoSOL: 0, hySOL: 0, hyJitoSOL: 0 };
  }
}

// Start balance updates for connected wallet
function startBalanceUpdates(address: string) {
  if (!browser || address.startsWith('Demo')) return;

  const update = async () => {
    const newBalances = await fetchBalancesFromRPC(address);
    balances.set(newBalances);
  };

  update();
  if (balanceInterval) clearInterval(balanceInterval);
  balanceInterval = setInterval(update, 15000);
}

function stopBalanceUpdates() {
  if (balanceInterval) {
    clearInterval(balanceInterval);
    balanceInterval = null;
  }
}

// Connect wallet (Phantom, Solflare, Backpack, or demo)
export async function connectWallet(): Promise<string | null> {
  if (!browser) return null;

  isConnecting.set(true);
  walletError.set(null);

  try {
    // Try Phantom
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isPhantom) {
      try {
        const response = await phantom.connect();
        const address = response.publicKey.toString();
        walletAddress.set(address);
        startBalanceUpdates(address);
        return address;
      } catch (e: any) {
        if (e.code === 4001) {
          walletError.set('Connection rejected');
          return null;
        }
        throw e;
      }
    }

    // Try Solflare
    const solflare = (window as any).solflare;
    if (solflare?.isSolflare) {
      try {
        await solflare.connect();
        const address = solflare.publicKey.toString();
        walletAddress.set(address);
        startBalanceUpdates(address);
        return address;
      } catch (e: any) {
        if (e.code === 4001) {
          walletError.set('Connection rejected');
          return null;
        }
        throw e;
      }
    }

    // Try Backpack
    const backpack = (window as any).backpack;
    if (backpack?.isBackpack) {
      try {
        await backpack.connect();
        const address = backpack.publicKey.toString();
        walletAddress.set(address);
        startBalanceUpdates(address);
        return address;
      } catch (e: any) {
        if (e.code === 4001) {
          walletError.set('Connection rejected');
          return null;
        }
        throw e;
      }
    }

    // Demo mode fallback
    console.log('No Solana wallet found, using demo mode');
    const demoAddr = 'Demo' + Math.random().toString(36).substring(2, 8) + '...Mode';
    walletAddress.set(demoAddr);
    balances.set({
      SOL: 10.0,
      mSOL: 50.0,
      JitoSOL: 25.0,
      hySOL: 100.0,
      hyJitoSOL: 50.0
    });
    return demoAddr;

  } catch (error: any) {
    console.error('Wallet connection failed:', error);
    walletError.set(error.message || 'Connection failed');
    return null;
  } finally {
    isConnecting.set(false);
  }
}

// Disconnect wallet
export function disconnectWallet() {
  if (browser) {
    try {
      (window as any).phantom?.solana?.disconnect?.();
      (window as any).solflare?.disconnect?.();
      (window as any).backpack?.disconnect?.();
    } catch (e) {
      // Ignore disconnect errors
    }
  }

  walletAddress.set(null);
  walletError.set(null);
  stopBalanceUpdates();
  balances.set({ SOL: 0, mSOL: 0, JitoSOL: 0, hySOL: 0, hyJitoSOL: 0 });
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return address.slice(0, 4) + '...' + address.slice(-4);
}

// Protocol and Vault PDAs
const PROTOCOL_PDA = 'FfJEoEzbfCQvC7RZcoK2JPTcxpMVj59XLUnyN79YGtw6';
const MSOL_VAULT = '4p4QSNafGd9NgPKPpwYkTefqbTkfa7ag1JmZ8PKapQTW';
const JITOSOL_VAULT = 'Fok56J1xpW2NPpR8ncAQcYBK1UWboH3zJmkFgmtNfecw';

// Fetch real protocol stats from on-chain
export async function fetchProtocolStats() {
  const RPC = 'https://mainnet.helius-rpc.com/?api-key=150398be-7c6b-489b-98a0-7903153f554d';

  try {
    // Fetch protocol state account
    const protocolRes = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [PROTOCOL_PDA, { encoding: 'base64' }]
      })
    });
    const protocolData = await protocolRes.json();

    // Protocol layout (129 bytes actual):
    // discriminator: 0-8, authority: 8-40, treasury: 40-72, fee_collector: 72-104
    // fee_bps: 104-112, total_locked_value: 112-128 (u128), total_receipts: 120-128, bump: 128
    let nextReceiptId = BigInt(0);

    if (protocolData.result?.value?.data) {
      const data = Buffer.from(protocolData.result.value.data[0], 'base64');
      // Safely read total_receipts - account is 129 bytes, so total_receipts at 120
      if (data.length >= 128) {
        nextReceiptId = data.readBigUInt64LE(120);
      }
    }

    // Fetch vault token balances for TVL calculation
    const vaultBalances = await Promise.all([
      fetchVaultBalance(RPC, MSOL_VAULT, TOKEN_MINTS.mSOL),
      fetchVaultBalance(RPC, JITOSOL_VAULT, TOKEN_MINTS.JitoSOL)
    ]);

    const msolVaultBalance = vaultBalances[0];
    const jitosolVaultBalance = vaultBalances[1];

    // Get current prices for TVL calculation
    const currentPrices = get(prices);
    const msolPrice = currentPrices.mSOL || 98;
    const jitosolPrice = currentPrices.JitoSOL || 99;

    const tvl = (msolVaultBalance * msolPrice) + (jitosolVaultBalance * jitosolPrice);

    protocolStats.set({
      tvl: Math.round(tvl),
      totalHySOL: msolVaultBalance,
      totalHyJitoSOL: jitosolVaultBalance,
      lockPrice: 1.0, // Will be calculated from vault data if needed
      users: Number(nextReceiptId)
    });
  } catch (e) {
    console.error('Failed to fetch protocol stats:', e);
    // Set zeros on error
    protocolStats.set({
      tvl: 0,
      totalHySOL: 0,
      totalHyJitoSOL: 0,
      lockPrice: 1.0,
      users: 0
    });
  }
}

// Helper to fetch vault token balance
async function fetchVaultBalance(rpc: string, vaultPda: string, tokenMint: string): Promise<number> {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          vaultPda,
          { mint: tokenMint },
          { encoding: 'jsonParsed' }
        ]
      })
    });
    const data = await res.json();
    const accounts = data.result?.value || [];
    if (accounts.length > 0) {
      return accounts[0].account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// Start protocol stats updates (every 30 seconds)
let statsInterval: ReturnType<typeof setInterval> | null = null;

export function startStatsUpdates() {
  if (!browser) return;
  fetchProtocolStats();
  if (statsInterval) clearInterval(statsInterval);
  statsInterval = setInterval(fetchProtocolStats, 30000);
}

// Initialize on app load
if (browser) {
  startPriceUpdates();
  startStatsUpdates();
}
