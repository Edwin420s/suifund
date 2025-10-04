# API Reference

## Frontend API (React Hooks)

### useWalletClient()
Manages wallet connection and transactions.

**Methods:**
- `connect()`: Connect wallet
- `disconnect()`: Disconnect wallet
- `signTransaction(transactionBlock)`: Sign a transaction
- `executeTransaction(transactionBlock)`: Sign and execute a transaction
  - Uses dynamic `CHAIN` from `web/src/utils/constants.js`

### useCampaigns()
Manages campaign operations.

**Methods:**
- `createCampaign(campaignData)`: Create a new campaign
- `contributeToCampaign(campaignId, amount)`: Contribute to a campaign (passes shared Clock)
- `refreshCampaigns()`: Refresh campaign list
- `distributeFunds(campaignId)`: Distribute funds for a successful campaign
- `claimRefund(campaignId)`: Claim refund after failed campaign

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