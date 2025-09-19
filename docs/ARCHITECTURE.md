# SuiFund Architecture

## Overview
SuiFund is a decentralized crowdfunding platform built on the Sui blockchain that combines fundraising with prediction markets.

## Technical Stack
- **Frontend**: React.js with Tailwind CSS and Framer Motion
- **Blockchain**: Sui Move smart contracts
- **Wallet Integration**: Sui Wallet Kit
- **Storage**: IPFS for media files
- **Indexing**: Custom indexer (optional)

## Smart Contract Architecture

### Core Modules
1. **Campaign Module**: Handles campaign creation, contributions, and refunds
2. **Prediction Market Module**: Manages betting on campaign outcomes
3. **NFT Module**: Mints supporter NFTs for contributors
4. **Treasury Module**: Manages platform fees and governance

### Key Data Structures
- `Campaign`: Main campaign object with funding details
- `PredictionMarket`: Market for betting on campaign outcomes
- `SupporterNFT`: NFT awarded to campaign contributors
- `Treasury`: Platform treasury for fee management

## Frontend Architecture

### Component Structure
- **Pages**: Main views (Landing, Explorer, Dashboard, etc.)
- **Components**: Reusable UI elements
- **Hooks**: Custom React hooks for blockchain interaction
- **Stores**: Zustand state management

### Key Features
- Wallet connection and management
- Campaign exploration and creation
- Real-time contribution tracking
- Prediction market interaction
- NFT gallery and management