// Contract addresses (update after deployment)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0"
export const PACKAGE_ID = import.meta.env.VITE_PACKAGE_ID || "0x0"

// Network configuration
export const NETWORK = import.meta.env.VITE_SUI_NETWORK || "testnet"

export const RPC_URL = NETWORK === "testnet" 
  ? "https://fullnode.testnet.sui.io:443" 
  : "https://fullnode.mainnet.sui.io:443"

// Module names
export const CAMPAIGN_MODULE = "campaign"
export const PREDICTION_MODULE = "prediction_market"
export const NFT_MODULE = "nft"
export const TREASURY_MODULE = "treasury"

// Object types
export const CAMPAIGN_TYPE = `${CONTRACT_ADDRESS}::${CAMPAIGN_MODULE}::Campaign`
export const PREDICTION_MARKET_TYPE = `${CONTRACT_ADDRESS}::${PREDICTION_MODULE}::PredictionMarket`
export const NFT_TYPE = `${CONTRACT_ADDRESS}::${NFT_MODULE}::SupporterNFT`

// API endpoints (for optional indexer)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"