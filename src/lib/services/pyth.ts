// Pyth Oracle Price Feed Service for Solana
// Uses Pyth's HTTP API with security best practices
// Reference: https://docs.pyth.network/documentation/solana-price-feeds/best-practices

// ============= SECURITY CONFIGURATION =============
const MAX_STALENESS_SECONDS = 60; // Reject prices older than 60 seconds
const MAX_CONFIDENCE_PERCENT = 2; // Reject if confidence > 2% of price

// Price bounds to prevent manipulation (in USD)
const PRICE_BOUNDS = {
  SOL: { min: 20, max: 500 },
  mSOL: { min: 20, max: 550 },
  JitoSOL: { min: 20, max: 550 }
};

// LST price ratio bounds (relative to SOL)
const LST_RATIO_BOUNDS = { min: 0.95, max: 1.15 };

// ============= PYTH FEED IDS =============
export const PYTH_PRICE_FEEDS = {
  SOL: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  mSOL: '0xc2289a6a43d2ce91c6f55caec370f4acc38a2ed477f58813334c6d03749ff2a4',
  JitoSOL: '0x67be9f519b95cf24338801051f9a808eff0a578ccb388db73b7f6fe1de019ffb'
} as const;

// Hermes API endpoints (primary + backups)
const HERMES_ENDPOINTS = [
  'https://hermes.pyth.network',
  'https://hermes-beta.pyth.network'
];

export interface PythPrice {
  id: string;
  price: { price: string; conf: string; expo: number; publish_time: number; };
  ema_price: { price: string; conf: string; expo: number; publish_time: number; };
}

export interface ValidatedPrices {
  SOL: number;
  mSOL: number;
  JitoSOL: number;
  lastUpdate: number;
  isValid: boolean;
  errors: string[];
}

// Price cache
let priceCache: ValidatedPrices | null = null;
let lastSuccessfulFetch = 0;

// ============= VALIDATION FUNCTIONS =============
function validateStaleness(publishTime: number): { isStale: boolean; ageSeconds: number } {
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - publishTime;
  return { isStale: ageSeconds > MAX_STALENESS_SECONDS, ageSeconds };
}

function validateConfidence(price: number, confidence: number): boolean {
  if (price <= 0) return false;
  return (confidence / price) * 100 <= MAX_CONFIDENCE_PERCENT;
}

function validatePriceBounds(symbol: string, price: number): boolean {
  const bounds = PRICE_BOUNDS[symbol as keyof typeof PRICE_BOUNDS];
  if (!bounds) return true;
  return price >= bounds.min && price <= bounds.max;
}

function validateLstRatio(solPrice: number, lstPrice: number): boolean {
  if (solPrice <= 0) return false;
  const ratio = lstPrice / solPrice;
  return ratio >= LST_RATIO_BOUNDS.min && ratio <= LST_RATIO_BOUNDS.max;
}

// Fetch from multiple endpoints with fallback
async function fetchWithFallback(path: string): Promise<Response> {
  let lastError: Error | null = null;
  for (const endpoint of HERMES_ENDPOINTS) {
    try {
      const response = await fetch(\`\${endpoint}\${path}\`, { headers: { 'Accept': 'application/json' } });
      if (response.ok) return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(\`Pyth endpoint \${endpoint} failed, trying next...\`);
    }
  }
  throw lastError || new Error('All Pyth endpoints failed');
}

// Fetch all prices with full validation
export async function fetchAllPrices(): Promise<ValidatedPrices> {
  const errors: string[] = [];
  try {
    const feedIds = Object.values(PYTH_PRICE_FEEDS);
    const idsParam = feedIds.map(id => \`ids[]=\${id}\`).join('&');
    const response = await fetchWithFallback(\`/api/latest_price_feeds?\${idsParam}\`);
    const data: PythPrice[] = await response.json();

    const prices: Record<string, number> = {};
    let allValid = true;

    for (const [symbol, feedId] of Object.entries(PYTH_PRICE_FEEDS)) {
      const feed = data.find(d => d.id === feedId || \`0x\${d.id}\` === feedId);
      if (!feed) { errors.push(\`\${symbol}: Feed not found\`); allValid = false; continue; }

      const rawPrice = parseInt(feed.price.price);
      const rawConf = parseInt(feed.price.conf);
      const expo = feed.price.expo;
      const price = rawPrice * Math.pow(10, expo);
      const confidence = rawConf * Math.pow(10, expo);

      const { isStale, ageSeconds } = validateStaleness(feed.price.publish_time);
      if (isStale) { errors.push(\`\${symbol}: Price \${ageSeconds}s old (max \${MAX_STALENESS_SECONDS}s)\`); allValid = false; continue; }
      if (!validateConfidence(price, confidence)) { errors.push(\`\${symbol}: Confidence too wide\`); allValid = false; continue; }
      if (!validatePriceBounds(symbol, price)) { errors.push(\`\${symbol}: Price outside bounds\`); allValid = false; continue; }

      prices[symbol] = price;
    }

    // Validate LST ratios
    if (prices.SOL && prices.mSOL && !validateLstRatio(prices.SOL, prices.mSOL)) {
      errors.push('mSOL: Suspicious ratio to SOL'); allValid = false;
    }
    if (prices.SOL && prices.JitoSOL && !validateLstRatio(prices.SOL, prices.JitoSOL)) {
      errors.push('JitoSOL: Suspicious ratio to SOL'); allValid = false;
    }

    const result: ValidatedPrices = {
      SOL: prices.SOL || 0, mSOL: prices.mSOL || 0, JitoSOL: prices.JitoSOL || 0,
      lastUpdate: Date.now(),
      isValid: allValid && !!prices.SOL && !!prices.mSOL && !!prices.JitoSOL,
      errors
    };

    if (result.isValid) { priceCache = result; lastSuccessfulFetch = Date.now(); }
    return result;

  } catch (error) {
    console.error('Pyth fetch error:', error);
    // Use cache if recent (within 2 minutes)
    if (priceCache && (Date.now() - lastSuccessfulFetch) < 120000) {
      return { ...priceCache, isValid: false, errors: [\`API error. Using cached prices.\`] };
    }
    // NO FALLBACK TO HARDCODED PRICES - security feature!
    return { SOL: 0, mSOL: 0, JitoSOL: 0, lastUpdate: 0, isValid: false, errors: [\`CRITICAL: All price feeds unavailable\`] };
  }
}

// Calculate hyToken prices
export function calculateHyTokenPrices(solPrice: number, msolPrice: number, jitosolPrice: number, lockPriceRatio = 1.12) {
  return { hySOL: msolPrice / lockPriceRatio, hyJitoSOL: jitosolPrice / lockPriceRatio };
}

// Start real-time price updates with validation
export function startPriceUpdates(
  callback: (prices: Record<string, number>, isValid: boolean, errors: string[]) => void,
  intervalMs = 10000
): () => void {
  let isRunning = true;
  const update = async () => {
    if (!isRunning) return;
    const result = await fetchAllPrices();
    if (result.isValid) {
      const hyPrices = calculateHyTokenPrices(result.SOL, result.mSOL, result.JitoSOL);
      callback({ SOL: result.SOL, mSOL: result.mSOL, JitoSOL: result.JitoSOL, ...hyPrices }, true, []);
    } else {
      callback({ SOL: 0, mSOL: 0, JitoSOL: 0, hySOL: 0, hyJitoSOL: 0 }, false, result.errors);
    }
  };
  update();
  const interval = setInterval(update, intervalMs);
  return () => { isRunning = false; clearInterval(interval); };
}

// Check if prices are safe for transactions
export function arePricesSafeForTransaction(): { safe: boolean; reason: string } {
  if (!priceCache) return { safe: false, reason: 'No price data available' };
  if (!priceCache.isValid) return { safe: false, reason: priceCache.errors.join(', ') };
  const ageMs = Date.now() - priceCache.lastUpdate;
  if (ageMs > MAX_STALENESS_SECONDS * 1000) return { safe: false, reason: \`Prices are \${Math.floor(ageMs/1000)}s old\` };
  return { safe: true, reason: 'OK' };
}

export function getCachedPrices(): ValidatedPrices | null { return priceCache; }
