# Deployment Guide

## Prerequisites
- Node.js 18+
- Sui CLI
- MongoDB (for optional indexer)
- IPFS account (Pinata/web3.storage)

## 1. Frontend Deployment

### Environment Variables (Vite)

Create `web/.env.local` from `web/.env.example` and fill values:

```bash
VITE_SUI_NETWORK=testnet # devnet|testnet|mainnet

# Package IDs per network (populate after publishing contracts)
VITE_CAMPAIGN_PACKAGE_TESTNET=0x...
VITE_PREDICTION_MARKET_PACKAGE_TESTNET=0x...
VITE_NFT_PACKAGE_TESTNET=0x...
VITE_TREASURY_PACKAGE_TESTNET=0x...
VITE_UTILS_PACKAGE_TESTNET=0x...

# Optional endpoints
VITE_GRAPHQL_ENDPOINT=
VITE_REST_API_ENDPOINT=
VITE_WS_ENDPOINT=

# Feature flags
VITE_ENABLE_PREDICTION_MARKETS=true
VITE_ENABLE_GOVERNANCE=true
VITE_ENABLE_NFT_REWARDS=true
```

### Build

```bash
cd web
npm install
npm run build
```

### Hosting

- Netlify/Vercel: point to `web/` directory
- Build command: `npm run build`
- Publish directory: `web/dist`
- Set the same `VITE_*` env variables in hosting provider settings

## 2. Contracts Deployment

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

Note the published package ids and update `web/.env.local` accordingly.