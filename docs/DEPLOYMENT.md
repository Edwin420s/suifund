# Deployment Guide

## Prerequisites
- Node.js 18+
- Sui CLI
- MongoDB (for optional indexer)
- IPFS account (Pinata/web3.storage)

## 1. Frontend Deployment

### Environment Variables
```bash
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_PACKAGE_ID=0xYourPackageId
VITE_SUI_NETWORK=testnet
VITE_API_BASE_URL=http://localhost:3001