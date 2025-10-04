# SuiFund — Decentralized Crowdfunding on Sui

SuiFund is a fully on-chain platform that combines crowdfunding, prediction markets, NFT rewards, and DAO governance on the Sui blockchain.

## Problem

- **Config drift and env mismatches**: Frontend used Create React App-style envs while the app runs on Vite; network/package IDs were hard to manage across environments.
- **Contract ↔ Frontend integration gaps**: UI didn't pass the shared `Clock` to `campaign::contribute()`. Frontend constructed `Beneficiary` items not supported by the contract API. NFT module risked invalid borrows when converting benefits.
- **Inconsistent chain handling**: Wallet interactions hardcoded chain instead of using selected network.
- **Outdated/fragmented documentation**: Docs and README didn't reflect current env variables, functions, or deployment flow.

## Solution

- **Unified Vite configuration**: Switched to `VITE_*` variables in `web/src/utils/constants.js`, added `CURRENT_ADDRESSES`, `PACKAGE_ID`, `CHAIN`, and a comprehensive `web/.env.example`.
- **Stable contract API surface**: Added `create_beneficiary(address, percentage)` in `suifund::campaign` to match UI vector construction; fixed `clock::timestamp_ms(clock)` usage; improved NFT benefits conversion to safe `vector<String>`.
- **Dynamic chain selection**: Wallet hooks now use `CHAIN` derived from `VITE_SUI_NETWORK`.
- **Documentation refresh**: Updated `README.md`, `docs/SMART_CONTRACT_SPEC.md`, `docs/DEPLOYMENT.md`, and `docs/API_REFERENCE.md` to align with code and deployment practices.

## Features

- **Transparent Crowdfunding**: Create and fund projects with automatic refunds on failure
- **Prediction Markets**: Bet on outcomes and earn rewards
- **NFT Rewards**: Mint supporter NFTs with tiers/benefits
- **DAO Governance**: Treasury, proposals, and voting
- **Fully On-Chain**: Funds and logic secured by Sui

## How the smart contracts work

This project’s Move contracts live in `contracts/sources/`. Core modules and flows:

- **`suifund::campaign`** (`contracts/sources/campaign.move`)
  - **Data**: `Campaign`, `Beneficiary`, `Contribution` with a SUI `Balance` and a `Bag` of contributions.
  - **Create**: `create_campaign(title, description, goal, deadline, image_url, beneficiaries, ctx)` validates beneficiaries sum to 100%, future `deadline`, and positive `goal`.
  - **Contribute**: `contribute(&mut Campaign, Coin<SUI>, &Clock, &mut TxContext)` accepts SUI, increments totals, records a `Contribution`, emits `ContributionMade`. Requires shared `Clock` (`0x6`).
  - **Goal/Status**: When `raised >= goal`, status becomes `STATUS_COMPLETED`.
  - **Refunds**: `process_refunds(&mut Campaign, &Clock, &mut TxContext)` after deadline if goal not met; flips status to failed and emits `RefundProcessed`. `claim_refund(&mut Campaign, contributor, &mut TxContext)` transfers the contributor’s unclaimed total back.
  - **Distribution**: `distribute_funds(&mut Campaign, &mut TxContext)` splits the SUI `Balance` by `Beneficiary.percentage` and transfers using `transfer::public_transfer`, emits `FundsDistributed`.
  - **Helper**: `create_beneficiary(address, percentage)` validates and returns a `Beneficiary` (used by the frontend to build vectors safely).

- **`suifund::prediction_market`** (`contracts/sources/prediction_market.move`)
  - **Data**: `PredictionMarket` with YES/NO pools and `Bag` of `Bet`s.
  - **Create**: `create_market(campaign_id, question, resolution_time, ctx)` ensures future resolution time and emits `MarketCreated`.
  - **Place bet**: `place_bet(&mut PredictionMarket, outcome, Coin<SUI>, &Clock, &mut TxContext)` updates pools, records a `Bet`, and emits `BetPlaced`.
  - **Resolve**: `resolve_market(&mut PredictionMarket, outcome, &Clock, &mut TxContext)` only by creator after resolution time; emits `MarketResolved`.
  - **Claim**: `claim_winnings(&mut PredictionMarket, better, &mut TxContext)` pays winners by proportion: `bet_share = (losing_pool * user_winning_bet_sum) / winning_pool; winnings = bet_share + principal`; emits `WinningsClaimed`.

- **`suifund::nft`** (`contracts/sources/nft.move`)
  - **Data**: `SupporterNFT` with `campaign_id`, `contributor`, `amount`, `timestamp`, `image_url`, `tier`, `benefits: vector<String>`.
  - **Mint**: `mint_supporter_nft(...)` converts `benefits: vector<vector<u8>>` to `vector<String>`, emits `NFTMinted`.
  - **Transfer**: `transfer_nft(SupporterNFT, recipient, &mut TxContext)`.

- **`suifund::treasury`** (`contracts/sources/treasury.move`)
  - **Data**: `Treasury` with a SUI `Balance`, `Bag` of `Proposal`s, and counters; `Proposal` tracks votes and window.
  - **Fees**: `collect_fees(&mut Treasury, Coin<SUI>, &mut TxContext)` joins SUI into the treasury `Balance`, emits `FeesCollected`.
  - **Governance**: `create_proposal(...)` (bounded voting window), `vote_on_proposal(..., VotingPower, &Clock, &mut TxContext)`, and `execute_proposal(...)` after end time if `votes_for > votes_against`; transfers funds and emits `ProposalExecuted`.

- **`suifund::utils`** (`contracts/sources/utils.move`)
  - Math helpers (`calculate_percentage`, `calculate_share`) and safe arithmetic (`safe_add`, `safe_sub`, `safe_mul`).
  - Basic validation (`is_valid_address`, `is_valid_percentage`).

Security notes:
- Uses Sui object model; funds are held in `Balance<SUI>` inside objects, preventing reentrancy.
- Access control enforced (e.g., only campaign creator can distribute; only market creator can resolve).
- Arithmetic and input validations where relevant.

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
