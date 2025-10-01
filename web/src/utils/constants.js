/**
 * Constants for SuiFund application
 */

// Network and contract addresses
export const NETWORK = process.env.REACT_APP_SUI_NETWORK || 'devnet'

export const CONTRACT_ADDRESSES = {
  devnet: {
    CAMPAIGN_PACKAGE: process.env.REACT_APP_CAMPAIGN_PACKAGE_DEVNET || '',
    PREDICTION_MARKET_PACKAGE: process.env.REACT_APP_PREDICTION_MARKET_PACKAGE_DEVNET || '',
    NFT_PACKAGE: process.env.REACT_APP_NFT_PACKAGE_DEVNET || '',
    TREASURY_PACKAGE: process.env.REACT_APP_TREASURY_PACKAGE_DEVNET || '',
    UTILS_PACKAGE: process.env.REACT_APP_UTILS_PACKAGE_DEVNET || ''
  },
  testnet: {
    CAMPAIGN_PACKAGE: process.env.REACT_APP_CAMPAIGN_PACKAGE_TESTNET || '',
    PREDICTION_MARKET_PACKAGE: process.env.REACT_APP_PREDICTION_MARKET_PACKAGE_TESTNET || '',
    NFT_PACKAGE: process.env.REACT_APP_NFT_PACKAGE_TESTNET || '',
    TREASURY_PACKAGE: process.env.REACT_APP_TREASURY_PACKAGE_TESTNET || '',
    UTILS_PACKAGE: process.env.REACT_APP_UTILS_PACKAGE_TESTNET || ''
  },
  mainnet: {
    CAMPAIGN_PACKAGE: process.env.REACT_APP_CAMPAIGN_PACKAGE_MAINNET || '',
    PREDICTION_MARKET_PACKAGE: process.env.REACT_APP_PREDICTION_MARKET_PACKAGE_MAINNET || '',
    NFT_PACKAGE: process.env.REACT_APP_NFT_PACKAGE_MAINNET || '',
    TREASURY_PACKAGE: process.env.REACT_APP_NFT_PACKAGE_MAINNET || '',
    UTILS_PACKAGE: process.env.REACT_APP_UTILS_PACKAGE_MAINNET || ''
  }
}

// Campaign categories
export const CAMPAIGN_CATEGORIES = [
  'Technology',
  'Art & Design',
  'Film & Video',
  'Games',
  'Music',
  'Publishing',
  'Food',
  'Fashion',
  'Education',
  'Environment',
  'Health',
  'Community',
  'Other'
]

// Campaign statuses
export const CAMPAIGN_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// Prediction market statuses
export const MARKET_STATUSES = {
  CREATED: 'created',
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
}

// Governance proposal statuses
export const PROPOSAL_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUCCEEDED: 'succeeded',
  DEFEATED: 'defeated',
  QUEUED: 'queued',
  EXECUTED: 'executed',
  CANCELLED: 'cancelled'
}

// NFT tiers for supporters
export const NFT_TIERS = {
  BRONZE: {
    name: 'Bronze Supporter',
    minContribution: 1,
    benefits: ['Basic supporter badge', 'Campaign updates']
  },
  SILVER: {
    name: 'Silver Supporter',
    minContribution: 10,
    benefits: ['Silver supporter badge', 'Campaign updates', 'Early access to updates']
  },
  GOLD: {
    name: 'Gold Supporter',
    minContribution: 50,
    benefits: ['Gold supporter badge', 'Campaign updates', 'Early access', 'Exclusive content']
  },
  PLATINUM: {
    name: 'Platinum Supporter',
    minContribution: 100,
    benefits: ['Platinum supporter badge', 'All Gold benefits', 'Direct communication with creator']
  }
}

// Time constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
}

// Default values
export const DEFAULTS = {
  CAMPAIGN_DURATION_DAYS: 30,
  MIN_CAMPAIGN_GOAL: 1, // SUI
  MAX_CAMPAIGN_GOAL: 1000000, // SUI
  MIN_CONTRIBUTION: 0.1, // SUI
  PLATFORM_FEE: 0.025, // 2.5%
  GOVERNANCE_QUORUM: 100, // Minimum votes for quorum
  GOVERNANCE_VOTING_PERIOD: 7 * TIME.DAY, // 7 days
  GOVERNANCE_EXECUTION_DELAY: 2 * TIME.DAY, // 2 days
  PREDICTION_MARKET_FEE: 0.01, // 1%
  MAX_MARKET_DURATION: 365 * TIME.DAY, // 1 year
  MIN_MARKET_DURATION: 1 * TIME.DAY // 1 day
}

// API endpoints
export const API_ENDPOINTS = {
  GRAPHQL: process.env.REACT_APP_GRAPHQL_ENDPOINT || '',
  REST: process.env.REACT_APP_REST_API_ENDPOINT || '',
  WS: process.env.REACT_APP_WS_ENDPOINT || ''
}

// External links
export const EXTERNAL_LINKS = {
  SUI_EXPLORER: {
    devnet: 'https://devnet.suiexplorer.com',
    testnet: 'https://testnet.suiexplorer.com',
    mainnet: 'https://suiexplorer.com'
  },
  SUI_FAUCET: {
    devnet: 'https://faucet.devnet.sui.io',
    testnet: 'https://faucet.testnet.sui.io',
    mainnet: null
  },
  SUI_DOCS: 'https://docs.sui.io',
  SUIFUND_DOCS: 'https://docs.suifund.com',
  SUIFUND_GITHUB: 'https://github.com/suifund',
  SUIFUND_DISCORD: 'https://discord.gg/suifund',
  SUIFUND_TWITTER: 'https://twitter.com/suifund'
}

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  INVALID_INPUT: 'Please check your input and try again',
  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  MARKET_NOT_FOUND: 'Market not found',
  PROPOSAL_NOT_FOUND: 'Proposal not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  CAMPAIGN_ENDED: 'This campaign has ended',
  MARKET_RESOLVED: 'This market has been resolved',
  ALREADY_VOTED: 'You have already voted on this proposal'
}

// Success messages
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  CAMPAIGN_CREATED: 'Campaign created successfully',
  CONTRIBUTION_MADE: 'Contribution made successfully',
  BET_PLACED: 'Bet placed successfully',
  PROPOSAL_CREATED: 'Proposal created successfully',
  VOTE_CAST: 'Vote cast successfully',
  TRANSACTION_CONFIRMED: 'Transaction confirmed'
}

// Pagination
export const PAGINATION = {
  CAMPAIGNS_PER_PAGE: 12,
  MARKETS_PER_PAGE: 10,
  PROPOSALS_PER_PAGE: 10,
  TRANSACTIONS_PER_PAGE: 20
}

// File upload limits
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOCUMENT_ALLOWED_TYPES: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 0.15,
  NORMAL: 0.3,
  SLOW: 0.5
}

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080
}

// Theme colors (for consistency)
export const COLORS = {
  PRIMARY: '#3B82F6', // blue-500
  SECONDARY: '#6B7280', // gray-500
  SUCCESS: '#10B981', // emerald-500
  WARNING: '#F59E0B', // amber-500
  ERROR: '#EF4444', // red-500
  BACKGROUND: '#0F172A', // slate-900
  SURFACE: '#1E293B', // slate-800
  TEXT: '#F8FAFC', // slate-50
  TEXT_SECONDARY: '#94A3B8' // slate-400
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'suifund_user_preferences',
  RECENT_CAMPAIGNS: 'suifund_recent_campaigns',
  WATCHLIST: 'suifund_watchlist',
  NOTIFICATIONS: 'suifund_notifications',
  THEME: 'suifund_theme'
}

// Feature flags
export const FEATURES = {
  PREDICTION_MARKETS: process.env.REACT_APP_ENABLE_PREDICTION_MARKETS === 'true',
  GOVERNANCE: process.env.REACT_APP_ENABLE_GOVERNANCE === 'true',
  NFT_REWARDS: process.env.REACT_APP_ENABLE_NFT_REWARDS === 'true',
  SOCIAL_FEATURES: process.env.REACT_APP_ENABLE_SOCIAL_FEATURES === 'true',
  ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
}
