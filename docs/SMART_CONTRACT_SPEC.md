# Smart Contract Specification

## Campaign Module

### Functions
- `create_campaign()`: Creates a new fundraising campaign
- `contribute()`: Allows users to contribute to a campaign
- `process_refunds()`: Marks campaign failed and prepares refunds after deadline when goal not reached
- `claim_refund()`: Claims refund for a specific contributor
- `distribute_funds()`: Distributes funds to beneficiaries
- `create_beneficiary(address, percentage)`: Helper to construct a validated `Beneficiary`

Note: `contribute()` and `process_refunds()` require the shared `Clock` object.

### Data Structures
- `Campaign`: Stores campaign details and state
- `Beneficiary`: Defines fund distribution rules
- `Contribution`: Records individual contributions

## Prediction Market Module

### Functions
- `create_market()`: Creates a prediction market for a campaign
- `place_bet()`: Allows users to bet on campaign outcomes
- `resolve_market()`: Sets the market outcome
- `claim_winnings()`: Allows users to claim their winnings

### Data Structures
- `PredictionMarket`: Stores market state and bets
- `Bet`: Records individual bets

## NFT Module

### Functions
- `mint_supporter_nft()`: Mints NFTs for campaign contributors
- `transfer_nft()`: Allows NFT transfers between users

### Data Structures
- `SupporterNFT`: NFT with campaign contribution details, tier, and benefits

## Treasury Module

### Functions
- `collect_fees()`: Collects platform fees into the treasury
- `create_proposal()`: Creates funding proposals
- `vote_on_proposal()`: Allows governance voting with voting power
- `execute_proposal()`: Executes successful proposals and transfers funds

### Data Structures
- `Treasury`: Manages platform funds and proposals
- `Proposal`: Stores proposal details and voting results