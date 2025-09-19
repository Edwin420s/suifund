# SuiFund - Decentralized Crowdfunding on Sui

SuiFund is a fully on-chain decentralized platform that combines crowdfunding with prediction markets on the Sui blockchain.

## Features

- 🚀 **Transparent Crowdfunding**: Create and fund projects with automatic refunds if goals aren't met
- 📊 **Prediction Markets**: Bet on project outcomes and earn rewards
- 💎 **NFT Rewards**: Receive unique NFTs as proof of support
- 🗳️ **DAO Governance**: Community-driven platform evolution
- 🔒 **Fully On-Chain**: All logic and funds secured by Sui blockchain

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Blockchain**: Sui Move smart contracts
- **Wallet Integration**: Sui Wallet Kit
- **Storage**: IPFS for media files
- **Indexing**: Node.js + MongoDB (optional)

## Quick Start

### Prerequisites
- Node.js 18+
- Sui CLI
- A Sui wallet (Suiet, Ethos, or Martian)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/suifund.git
cd suifund

```
### Install frontend dependencies:
```
cd web
npm install
```

### Install Sui CLI (if not already installed):

```
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```
### Configure environment variables:
```
cp .env.example .env
# Edit .env with your configuration
```
## Development
### Start the frontend development server:
```
cd web
npm run dev

```
### Deploy smart contracts:
```
cd contracts
./scripts/deploy-contracts.sh
```

## Building for Production
```
cd web
npm run build
```

## Smart Contracts
#### The SuiFund platform consists of four main Move modules:

Campaign: Manages fundraising campaigns
Prediction Market: Handles prediction markets
NFT: Mints supporter NFTs
Treasury: Manages platform governance

## Contract Deployment
```
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

## Contributing
We welcome contributions! 

