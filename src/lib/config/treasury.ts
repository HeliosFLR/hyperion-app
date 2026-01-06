// Hyperion Protocol Treasury & Wallet Configuration
// IMPORTANT: Replace placeholder addresses with actual deployed wallets

// =============================================================================
// PROJECT WALLETS - GENERATE THESE BEFORE MAINNET
// =============================================================================

export const TREASURY_WALLETS = {
  // Main protocol treasury - receives 10% of all fees
  // Used for: development, marketing, grants, operations
  treasury: {
    address: 'HYPRN_TREASURY_WALLET_ADDRESS', // TODO: Replace with actual address
    name: 'Hyperion Treasury',
    description: 'Main protocol treasury for development and operations'
  },

  // Insurance fund - receives 5% of fees + 50% of liquidation penalties
  // Used for: bad debt coverage, oracle failures, exploit backstop
  insurance: {
    address: 'HYPRN_INSURANCE_WALLET_ADDRESS', // TODO: Replace with actual address
    name: 'Insurance Fund',
    description: 'Protocol insurance for edge cases and exploits'
  },

  // Fee collector - temporarily holds fees before distribution
  feeCollector: {
    address: 'HYPRN_FEE_COLLECTOR_ADDRESS', // TODO: Replace with actual address
    name: 'Fee Collector',
    description: 'Collects fees before weekly distribution'
  },

  // LP rewards - receives 60% of fees for LP distribution
  lpRewards: {
    address: 'HYPRN_LP_REWARDS_ADDRESS', // TODO: Replace with actual address
    name: 'LP Rewards Pool',
    description: 'Holds fees designated for liquidity providers'
  },

  // Staking rewards - receives 25% of fees for HYPRN stakers
  stakingRewards: {
    address: 'HYPRN_STAKING_REWARDS_ADDRESS', // TODO: Replace with actual address
    name: 'Staking Rewards Pool',
    description: 'Holds fees for distribution to HYPRN stakers'
  },

  // Team multisig - for protocol upgrades and emergency actions
  // Recommended: 4-of-7 multisig using Squads Protocol
  teamMultisig: {
    address: 'HYPRN_TEAM_MULTISIG_ADDRESS', // TODO: Replace with actual address
    name: 'Team Multisig',
    description: '4-of-7 multisig for protocol governance',
    signers: 7,
    threshold: 4
  }
} as const;

// =============================================================================
// TOKEN ADDRESSES
// =============================================================================

export const TOKEN_ADDRESSES = {
  // Hyperion Protocol Tokens (to be deployed)
  HYPRN: {
    mint: 'HYPRN_TOKEN_MINT_ADDRESS', // TODO: Deploy and add address
    decimals: 9,
    name: 'Hyperion',
    symbol: 'HYPRN'
  },
  hySOL: {
    mint: 'HYSOL_TOKEN_MINT_ADDRESS', // TODO: Deploy and add address
    decimals: 9,
    name: 'Hyperion SOL',
    symbol: 'hySOL'
  },
  hyJitoSOL: {
    mint: 'HYJITOSOLTOKEN_MINT_ADDRESS', // TODO: Deploy and add address
    decimals: 9,
    name: 'Hyperion JitoSOL',
    symbol: 'hyJitoSOL'
  },

  // Underlying LST tokens (already deployed on Solana mainnet)
  mSOL: {
    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    decimals: 9,
    name: 'Marinade Staked SOL',
    symbol: 'mSOL'
  },
  JitoSOL: {
    mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
    decimals: 9,
    name: 'Jito Staked SOL',
    symbol: 'JitoSOL'
  },

  // Stablecoins for fee payments
  USDC: {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC'
  }
} as const;

// =============================================================================
// PROGRAM IDS (Smart Contracts)
// =============================================================================

export const PROGRAM_IDS = {
  // Main Hyperion program - handles lock/unlock logic
  hyperionCore: 'HYPERION_CORE_PROGRAM_ID', // TODO: Deploy and add

  // Staking program - handles HYPRN staking and rewards
  staking: 'HYPERION_STAKING_PROGRAM_ID', // TODO: Deploy and add

  // Fee distributor - handles weekly fee distribution
  feeDistributor: 'HYPERION_FEE_DISTRIBUTOR_ID', // TODO: Deploy and add

  // Governance program (can use Realms or custom)
  governance: 'HYPERION_GOVERNANCE_PROGRAM_ID', // TODO: Deploy and add

  // Flash loan program
  flashLoan: 'HYPERION_FLASH_LOAN_PROGRAM_ID' // TODO: Deploy and add
} as const;

// =============================================================================
// EXTERNAL INTEGRATIONS
// =============================================================================

export const EXTERNAL_PROGRAMS = {
  // Pyth Oracle
  pythOracle: 'pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT',

  // Squads multisig (for team wallet)
  squads: 'SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu',

  // Token program
  tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',

  // Associated token program
  associatedTokenProgram: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
} as const;

// =============================================================================
// DEPLOYMENT CHECKLIST
// =============================================================================

export const DEPLOYMENT_CHECKLIST = [
  '[ ] Generate treasury wallet keypair (cold storage recommended)',
  '[ ] Generate insurance fund wallet keypair',
  '[ ] Set up 4-of-7 multisig via Squads Protocol',
  '[ ] Deploy HYPRN token mint',
  '[ ] Deploy hySOL token mint (mint authority = hyperionCore program)',
  '[ ] Deploy hyJitoSOL token mint (mint authority = hyperionCore program)',
  '[ ] Deploy hyperionCore program to devnet',
  '[ ] Deploy staking program to devnet',
  '[ ] Deploy fee distributor program to devnet',
  '[ ] Audit all programs (recommended: 2-3 auditors)',
  '[ ] Deploy to mainnet-beta',
  '[ ] Update all addresses in this file',
  '[ ] Verify programs on Solana Explorer',
  '[ ] Transfer mint authorities to program PDAs'
];
