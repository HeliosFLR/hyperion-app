// Hyperion Protocol Fee Configuration
// These values will be used by smart contracts and frontend

export const FEES = {
  // Trading Fees (in basis points, 1 bp = 0.01%)
  trading: {
    maker: 2,        // 0.02% - makers provide liquidity
    taker: 5,        // 0.05% - takers remove liquidity
    makerRebate: -1, // -0.01% rebate for high volume (tier 2+)
    takerDiscount: 3 // 0.03% for high volume takers
  },

  // Lock/Unlock Fees (minting and burning hyTokens)
  lock: {
    mint: 10,    // 0.10% fee to mint hySOL/hyJitoSOL
    burn: 10,    // 0.10% fee to burn and redeem underlying
    minFee: 0.001 // Minimum fee in SOL (covers tx costs)
  },

  // Liquidation Fees (if ever needed for edge cases)
  liquidation: {
    penalty: 50, // 0.50% of position
    insurance: 50, // 50% of penalty goes to insurance fund
    liquidator: 30, // 30% to keeper/bot that executes
    treasury: 20   // 20% to protocol treasury
  },

  // Flash Loan Fees
  flashLoan: {
    fee: 8, // 0.08% of borrowed amount
    lpShare: 70, // 70% to LPs
    treasuryShare: 30 // 30% to treasury
  },

  // Withdrawal
  withdrawal: 0, // FREE - competitive advantage

  // Staker Discounts (% reduction for HYPRN stakers)
  stakerDiscounts: {
    tier1: { minStake: 1000, discount: 10 },    // 1K HYPRN = 10% off
    tier2: { minStake: 10000, discount: 25 },   // 10K HYPRN = 25% off
    tier3: { minStake: 100000, discount: 50 },  // 100K HYPRN = 50% off
    tier4: { minStake: 1000000, discount: 75 }  // 1M HYPRN = 75% off (whale tier)
  }
} as const;

// Revenue Distribution (percentages)
export const REVENUE_SPLIT = {
  lps: 60,        // 60% to liquidity providers
  stakers: 25,    // 25% to HYPRN stakers (paid in SOL/USDC)
  treasury: 10,   // 10% to protocol treasury
  insurance: 5    // 5% to insurance fund
} as const;

// Fee calculation helpers
export function calculateMintFee(amount: number): number {
  const fee = amount * (FEES.lock.mint / 10000);
  return Math.max(fee, FEES.lock.minFee);
}

export function calculateBurnFee(amount: number): number {
  const fee = amount * (FEES.lock.burn / 10000);
  return Math.max(fee, FEES.lock.minFee);
}

export function calculateTradingFee(amount: number, isMaker: boolean): number {
  const bps = isMaker ? FEES.trading.maker : FEES.trading.taker;
  return amount * (bps / 10000);
}

export function calculateFlashLoanFee(amount: number): number {
  return amount * (FEES.flashLoan.fee / 10000);
}

export function getStakerDiscount(hyprStaked: number): number {
  const { stakerDiscounts } = FEES;
  if (hyprStaked >= stakerDiscounts.tier4.minStake) return stakerDiscounts.tier4.discount;
  if (hyprStaked >= stakerDiscounts.tier3.minStake) return stakerDiscounts.tier3.discount;
  if (hyprStaked >= stakerDiscounts.tier2.minStake) return stakerDiscounts.tier2.discount;
  if (hyprStaked >= stakerDiscounts.tier1.minStake) return stakerDiscounts.tier1.discount;
  return 0;
}

export function applyStakerDiscount(fee: number, hyprStaked: number): number {
  const discount = getStakerDiscount(hyprStaked);
  return fee * (1 - discount / 100);
}
