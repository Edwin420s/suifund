#!/bin/bash

# =============================================
# SuiFund Production Deployment Script
# =============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_NAME="suifund"
NETWORK="mainnet"
GAS_BUDGET=1000000000
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Sui CLI is installed
    if ! command -v sui &> /dev/null; then
        log_error "Sui CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if we're on the correct network
    CURRENT_NETWORK=$(sui client active-address | head -n1 | awk '{print $2}')
    if [[ "$CURRENT_NETWORK" != "$NETWORK" ]]; then
        log_warning "Active network is $CURRENT_NETWORK, but deployment target is $NETWORK"
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check if environment file exists
    if [[ ! -f ".env.production" ]]; then
        log_error "Production environment file (.env.production) not found"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log_info "Backing up current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current contract addresses if they exist
    if [[ -f "web/src/utils/constants.js" ]]; then
        cp "web/src/utils/constants.js" "$BACKUP_DIR/constants.js.backup"
    fi
    
    # Backup environment files
    cp ".env.production" "$BACKUP_DIR/env.production.backup"
    
    log_success "Backup created in $BACKUP_DIR"
}

# Build smart contracts
build_contracts() {
    log_info "Building smart contracts..."
    
    cd contracts
    
    if ! sui move build; then
        log_error "Contract build failed"
        exit 1
    fi
    
    cd ..
    
    log_success "Smart contracts built successfully"
}

# Deploy smart contracts
deploy_contracts() {
    log_info "Deploying smart contracts to $NETWORK..."
    
    cd contracts
    
    # Publish contracts
    DEPLOY_RESULT=$(sui client publish --gas-budget $GAS_BUDGET --json)
    
    if [[ $? -ne 0 ]]; then
        log_error "Contract deployment failed"
        echo "$DEPLOY_RESULT"
        exit 1
    fi
    
    # Extract package ID and object IDs
    PACKAGE_ID=$(echo "$DEPLOY_RESULT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
    TREASURY_ID=$(echo "$DEPLOY_RESULT" | jq -r '.objectChanges[] | select(.type == "created") | select(.objectType | contains("treasury::Treasury")) | .objectId')
    
    log_success "Contracts deployed successfully"
    log_info "Package ID: $PACKAGE_ID"
    log_info "Treasury ID: $TREASURY_ID"
    
    cd ..
    
    # Update environment files
    update_environment "$PACKAGE_ID" "$TREASURY_ID"
}

# Update environment files
update_environment() {
    local package_id=$1
    local treasury_id=$2
    
    log_info "Updating environment configuration..."
    
    # Update production environment
    sed -i.bak "s/VITE_CONTRACT_ADDRESS=.*/VITE_CONTRACT_ADDRESS=$package_id/" .env.production
    sed -i.bak "s/VITE_PACKAGE_ID=.*/VITE_PACKAGE_ID=$package_id/" .env.production
    
    # Update constants file
    cat > web/src/utils/constants.js << EOF
// Auto-generated during deployment - $(date)

// Contract addresses
export const CONTRACT_ADDRESS = "$package_id"
export const PACKAGE_ID = "$package_id"
export const TREASURY_ID = "$treasury_id"

// Network configuration
export const NETWORK = "$NETWORK"
export const RPC_URL = "https://fullnode.$NETWORK.sui.io:443"

// Module names
export const CAMPAIGN_MODULE = "campaign"
export const PREDICTION_MODULE = "prediction_market"
export const NFT_MODULE = "nft"
export const TREASURY_MODULE = "treasury"

// Object types
export const CAMPAIGN_TYPE = "\${CONTRACT_ADDRESS}::\${CAMPAIGN_MODULE}::Campaign"
export const PREDICTION_MARKET_TYPE = "\${CONTRACT_ADDRESS}::\${PREDICTION_MODULE}::PredictionMarket"
export const NFT_TYPE = "\${CONTRACT_ADDRESS}::\${NFT_MODULE}::SupporterNFT"

// API endpoints
export const API_BASE_URL = "$(grep VITE_API_BASE_URL .env.production | cut -d '=' -f2)"

// Application constants
export const MIN_CONTRIBUTION = 0.1
export const MAX_CONTRIBUTION = 100000
export const MIN_CAMPAIGN_DURATION = 24 * 60 * 60 * 1000
export const MAX_CAMPAIGN_DURATION = 365 * 24 * 60 * 60 * 1000
export const TRANSACTION_TIMEOUT = 30000

// Error messages
export const ERROR_MESSAGES = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    TRANSACTION_FAILED: 'Transaction failed',
    NETWORK_ERROR: 'Network error. Please try again.',
    INVALID_ADDRESS: 'Invalid Sui address',
    CAMPAIGN_NOT_FOUND: 'Campaign not found'
}
EOF
    
    log_success "Environment configuration updated"
}

# Build frontend
build_frontend() {
    log_info "Building frontend application..."
    
    cd web
    
    if ! npm run build; then
        log_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
    
    log_success "Frontend built successfully"
}

# Run tests
run_tests() {
    log_info "Running test suite..."
    
    # Test smart contracts
    cd contracts
    if ! sui move test; then
        log_error "Contract tests failed"
        exit 1
    fi
    cd ..
    
    # Test frontend
    cd web
    if ! npm run test:coverage; then
        log_error "Frontend tests failed"
        exit 1
    fi
    cd ..
    
    log_success "All tests passed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Verify contract publication
    cd contracts
    if ! sui client verify-source $PACKAGE_ID; then
        log_warning "Source verification failed - this is normal for first deployment"
    fi
    cd ..
    
    # Verify frontend build
    if [[ ! -d "web/dist" ]]; then
        log_error "Frontend build directory not found"
        exit 1
    fi
    
    log_success "Deployment verification completed"
}

# Main deployment function
main() {
    log_info "Starting SuiFund production deployment to $NETWORK"
    
    check_prerequisites
    backup_current
    run_tests
    build_contracts
    deploy_contracts
    build_frontend
    verify_deployment
    
    log_success "🎉 SuiFund production deployment completed successfully!"
    log_info "📦 Package ID: $PACKAGE_ID"
    log_info "🏦 Treasury ID: $TREASURY_ID"
    log_info "🔗 Network: $NETWORK"
    log_info "💡 Next steps: Deploy frontend to your hosting provider"
}

# Run main function
main "$@"