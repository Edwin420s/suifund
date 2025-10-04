# SuiFund — Decentralized Crowdfunding on Sui

SuiFund is a fully on-chain platform that combines crowdfunding, prediction markets, NFT rewards, and DAO governance on the Sui blockchain.

## Features

- **Transparent Crowdfunding**: Create and fund projects with automatic refunds on failure
- **Prediction Markets**: Bet on outcomes and earn rewards
- **NFT Rewards**: Mint supporter NFTs with tiers/benefits
- **DAO Governance**: Treasury, proposals, and voting
- **Fully On-Chain**: Funds and logic secured by Sui

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Contracts**: Sui Move (modules: `campaign`, `prediction_market`, `nft`, `treasury`)
- **Wallet**: `@mysten/wallet-kit`
- **Storage**: IPFS (optional)
- **Indexing**: Node.js + MongoDB (optional)

## Prerequisites

- Node.js 18+
- Sui CLI
- Sui wallet (Suiet, Ethos, Martian, etc.)

## Setup

1) Clone and install

```bash
git clone https://github.com/Edwin420s/suifund.git
cd suifund
cd web && npm install
```

2) Configure environment (Vite)

Copy and edit the example file:

```bash
cd web
cp .env.example .env.local
# Fill values as needed
```

Environment variables used in `web/src/utils/constants.js`:

- `VITE_SUI_NETWORK` = devnet | testnet | mainnet
- `VITE_CAMPAIGN_PACKAGE_<NETWORK>`
- `VITE_PREDICTION_MARKET_PACKAGE_<NETWORK>`
- `VITE_NFT_PACKAGE_<NETWORK>`
- `VITE_TREASURY_PACKAGE_<NETWORK>`
- `VITE_UTILS_PACKAGE_<NETWORK>`
- Optional: `VITE_GRAPHQL_ENDPOINT`, `VITE_REST_API_ENDPOINT`, `VITE_WS_ENDPOINT`
- Feature flags: `VITE_ENABLE_PREDICTION_MARKETS`, `VITE_ENABLE_GOVERNANCE`, `VITE_ENABLE_NFT_REWARDS`, `VITE_ENABLE_SOCIAL_FEATURES`, `VITE_ENABLE_ANALYTICS`

3) Install Sui CLI (if needed)

```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

## Development

Start frontend dev server:

```bash
cd web
npm run dev
```

Run contract tests:

```bash
cd contracts
sui move test
```

## Build & Test

Frontend build:

```bash
cd web
npm run build
```

Frontend tests:

```bash
cd web
npm test
```

## Contracts

Modules and highlights:

- `suifund::campaign`
  - Create campaigns, contribute (requires shared `Clock`), distribute funds, refunds
  - Helper `create_beneficiary(address, percentage)` for frontend vector construction
- `suifund::prediction_market`
  - Create market, place bets (SUI), resolve outcome, claim winnings
  - Winnings formula: proportional share of losing pool + principal
- `suifund::nft`
  - Mint supporter NFTs with tier and benefits, transfer
- `suifund::treasury`
  - Collect fees, proposals, voting (with voting power), execute approved proposals

## Contract Deployment (example)

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

After publishing, update the `VITE_*_PACKAGE_<NETWORK>` values in `web/.env.local`.

## Deployment

See `docs/DEPLOYMENT.md` for environment and hosting notes (Netlify/Vercel, etc.).

## Contributing

PRs and issues are welcome. Please add tests and update docs for any changes to contracts or envs.
