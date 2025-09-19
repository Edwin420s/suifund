# API Reference

## Frontend API (React Hooks)

### useWalletClient()
Manages wallet connection and transactions.

**Methods:**
- `connect()`: Connect wallet
- `disconnect()`: Disconnect wallet
- `signTransaction()`: Sign a transaction
- `executeTransaction()`: Execute a transaction

### useCampaigns()
Manages campaign operations.

**Methods:**
- `createCampaign()`: Create a new campaign
- `contributeToCampaign()`: Contribute to a campaign
- `refreshCampaigns()`: Refresh campaign list

### useReadOnChain()
Reads data from the blockchain.

**Methods:**
- `getCampaigns()`: Get all campaigns
- `getUserContributions()`: Get user's contributions
- `getCampaignDetail()`: Get campaign details

## Backend API (Optional Indexer)

### GET /api/campaigns
Get all campaigns.

### GET /api/campaigns/:id
Get campaign by ID.

### POST /api/campaigns/sync/:objectId
Sync campaign from blockchain.

### GET /api/markets
Get all prediction markets.

### GET /api/markets/:id
Get market by ID.