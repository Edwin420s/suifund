export const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS"
export const NETWORK = "testnet" // or "mainnet"

export const RPC_URL = NETWORK === "testnet" 
  ? "https://fullnode.testnet.sui.io:443" 
  : "https://fullnode.mainnet.sui.io:443"

export const CAMPAIGN_MODULE = "campaign"
export const PREDICTION_MODULE = "prediction_market"
export const NFT_MODULE = "nft"