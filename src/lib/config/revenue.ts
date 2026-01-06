// Hyperion Protocol Revenue Streams Configuration
// All potential revenue sources for the protocol

export interface RevenueStream {
  name: string;
  description: string;
  feeRate: string;
  estimatedAnnual: string;
  status: 'active' | 'planned' | 'future';
  priority: 'high' | 'medium' | 'low';
}

export const REVENUE_STREAMS: RevenueStream[] = [
  // =============================================================================
  // PHASE 1 - LAUNCH (Active from Day 1)
  // =============================================================================
  {
    name: 'Lock/Mint Fees',
    description: 'Fee charged when users lock mSOL/JitoSOL to mint hyTokens',
    feeRate: '0.10%',
    estimatedAnnual: '$500K-1M',
    status: 'active',
    priority: 'high'
  },
  {
    name: 'Unlock/Burn Fees',
    description: 'Fee charged when users burn hyTokens to redeem underlying LSTs',
    feeRate: '0.10%',
    estimatedAnnual: '$500K-1M',
    status: 'active',
    priority: 'high'
  },

  // =============================================================================
  // PHASE 2 - EXPANSION (Month 3-6)
  // =============================================================================
  {
    name: 'Flash Loans',
    description: 'Uncollateralized loans repaid in same transaction (arbitrage, liquidations)',
    feeRate: '0.08%',
    estimatedAnnual: '$200K-500K',
    status: 'planned',
    priority: 'high'
  },
  {
    name: 'Lending Interest Spread',
    description: 'Spread between borrowing rates and lending yields',
    feeRate: '1-3% spread',
    estimatedAnnual: '$300K-600K',
    status: 'planned',
    priority: 'medium'
  },
  {
    name: 'Leveraged Position Fees',
    description: 'Fees on leveraged LST positions (2x-5x exposure)',
    feeRate: '0.05% taker / 0.02% maker',
    estimatedAnnual: '$1M-2M',
    status: 'planned',
    priority: 'high'
  },

  // =============================================================================
  // PHASE 3 - ADVANCED (Month 6-12)
  // =============================================================================
  {
    name: 'Premium Subscriptions',
    description: 'Hyperion Pro tier with advanced analytics, higher leverage, priority support',
    feeRate: '$49-99/month',
    estimatedAnnual: '$100K-300K',
    status: 'future',
    priority: 'medium'
  },
  {
    name: 'API Access Licensing',
    description: 'Premium API for trading bots and institutional users',
    feeRate: '$500-2K/month',
    estimatedAnnual: '$50K-200K',
    status: 'future',
    priority: 'low'
  },
  {
    name: 'Aggregator Integration Fees',
    description: 'Fee sharing with Jupiter, 1inch, and other aggregators routing through Hyperion',
    feeRate: '15% fee rebate to partners',
    estimatedAnnual: '$100K-500K',
    status: 'future',
    priority: 'medium'
  },
  {
    name: 'NFT VIP Passes',
    description: 'Mint exclusive NFTs for lifetime fee discounts and revenue sharing',
    feeRate: '5 SOL per mint (500 supply)',
    estimatedAnnual: '$150K one-time + ongoing perks',
    status: 'future',
    priority: 'low'
  },
  {
    name: 'White-Label Licensing',
    description: 'License Hyperion\'s leverage engine to other protocols',
    feeRate: '$5K-25K/month',
    estimatedAnnual: '$60K-300K',
    status: 'future',
    priority: 'low'
  },

  // =============================================================================
  // PHASE 4 - SCALE (Year 2+)
  // =============================================================================
  {
    name: 'Cross-Chain Expansion',
    description: 'Deploy Hyperion on other chains (Ethereum L2s, Base, etc.)',
    feeRate: 'Same fee structure',
    estimatedAnnual: '+$1M-5M per chain',
    status: 'future',
    priority: 'medium'
  },
  {
    name: 'Structured Products',
    description: 'Automated yield strategies, vaults, and structured DeFi products',
    feeRate: '1-2% management fee',
    estimatedAnnual: '$200K-1M',
    status: 'future',
    priority: 'medium'
  },
  {
    name: 'Options & Derivatives',
    description: 'Options on LSTs and hyTokens',
    feeRate: '0.05-0.10%',
    estimatedAnnual: '$500K-2M',
    status: 'future',
    priority: 'low'
  }
];

// Revenue projections based on TVL
export const REVENUE_PROJECTIONS = {
  conservative: {
    tvl: 10_000_000, // $10M TVL
    dailyVolume: 1_000_000, // $1M daily
    annualRevenue: 500_000 // $500K
  },
  moderate: {
    tvl: 50_000_000, // $50M TVL
    dailyVolume: 5_000_000, // $5M daily
    annualRevenue: 2_000_000 // $2M
  },
  optimistic: {
    tvl: 200_000_000, // $200M TVL
    dailyVolume: 20_000_000, // $20M daily
    annualRevenue: 8_000_000 // $8M
  }
};

// Calculate expected annual revenue
export function calculateAnnualRevenue(
  dailyMintVolume: number,
  dailyBurnVolume: number,
  dailyTradingVolume: number,
  flashLoanVolume: number = 0
): number {
  const mintFees = dailyMintVolume * 0.001 * 365; // 0.10%
  const burnFees = dailyBurnVolume * 0.001 * 365; // 0.10%
  const tradingFees = dailyTradingVolume * 0.0005 * 365; // avg 0.05%
  const flashLoanFees = flashLoanVolume * 0.0008 * 365; // 0.08%

  return mintFees + burnFees + tradingFees + flashLoanFees;
}

// Revenue distribution calculator
export function distributeRevenue(totalRevenue: number): {
  lps: number;
  stakers: number;
  treasury: number;
  insurance: number;
} {
  return {
    lps: totalRevenue * 0.60,      // 60%
    stakers: totalRevenue * 0.25,  // 25%
    treasury: totalRevenue * 0.10, // 10%
    insurance: totalRevenue * 0.05 // 5%
  };
}
