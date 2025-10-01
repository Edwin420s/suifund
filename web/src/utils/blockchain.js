import { TransactionBlock } from '@mysten/sui.js'
import { PACKAGE_ID } from './constants'

/**
 * Blockchain Utility Functions
 * 
 * Provides helper functions for blockchain interactions including:
 * - Transaction building and validation
 * - Object querying and parsing
 * - Event processing and filtering
 * - Error handling and retry logic
 */

/**
 * Builds a transaction for campaign creation
 * @param {Object} campaignData - Campaign data
 * @param {string} campaignData.title - Campaign title
 * @param {string} campaignData.description - Campaign description
 * @param {number} campaignData.goal - Funding goal in SUI
 * @param {number} campaignData.deadline - Deadline timestamp
 * @param {string} campaignData.imageUrl - Campaign image URL
 * @param {Array} campaignData.beneficiaries - Array of beneficiary objects
 * @returns {TransactionBlock} Prepared transaction block
 */
export const buildCreateCampaignTransaction = (campaignData) => {
  const tx = new TransactionBlock()
  
  // Convert goal to MIST
  const goalMist = Math.floor(campaignData.goal * 1000000000)
  
  // Prepare beneficiaries vector
  const beneficiaries = tx.makeMoveVec({
    type: `${PACKAGE_ID}::campaign::Beneficiary`,
    elements: campaignData.beneficiaries.map(beneficiary => 
      tx.moveCall({
        target: `${PACKAGE_ID}::campaign::create_beneficiary`,
        arguments: [
          tx.pure(beneficiary.address),
          tx.pure(beneficiary.percentage)
        ]
      })
    )
  })

  // Main campaign creation call
  tx.moveCall({
    target: `${PACKAGE_ID}::campaign::create_campaign`,
    arguments: [
      tx.pure(campaignData.title),
      tx.pure(campaignData.description),
      tx.pure(goalMist),
      tx.pure(campaignData.deadline),
      tx.pure(campaignData.imageUrl || ''),
      beneficiaries
    ]
  })

  return tx
}

/**
 * Builds a transaction for campaign contribution
 * @param {string} campaignId - Campaign object ID
 * @param {number} amount - Contribution amount in SUI
 * @returns {TransactionBlock} Prepared transaction block
 */
export const buildContributeTransaction = (campaignId, amount) => {
  const tx = new TransactionBlock()
  const amountMist = Math.floor(amount * 1000000000)
  
  // Split coins for contribution
  const [contributionCoin] = tx.splitCoins(tx.gas, [tx.pure(amountMist)])
  
  tx.moveCall({
    target: `${PACKAGE_ID}::campaign::contribute`,
    arguments: [
      tx.object(campaignId),
      contributionCoin,
      tx.object('0x6') // Clock object
    ]
  })

  return tx
}

/**
 * Parses campaign events from transaction result
 * @param {Array} events - Array of transaction events
 * @returns {Array} Parsed campaign events
 */
export const parseCampaignEvents = (events) => {
  if (!events) return []
  
  return events
    .filter(event => event.type.includes('::campaign::'))
    .map(event => {
      const eventType = event.type.split('::').pop()
      
      switch (eventType) {
        case 'CampaignCreated':
          return {
            type: 'CampaignCreated',
            campaignId: event.parsedJson.campaign_id,
            creator: event.parsedJson.creator,
            goal: event.parsedJson.goal,
            deadline: event.parsedJson.deadline,
            timestamp: Date.now()
          }
        
        case 'ContributionMade':
          return {
            type: 'ContributionMade',
            campaignId: event.parsedJson.campaign_id,
            contributor: event.parsedJson.contributor,
            amount: event.parsedJson.amount,
            timestamp: Date.now()
          }
        
        case 'FundsDistributed':
          return {
            type: 'FundsDistributed',
            campaignId: event.parsedJson.campaign_id,
            amount: event.parsedJson.amount,
            timestamp: Date.now()
          }
        
        case 'RefundProcessed':
          return {
            type: 'RefundProcessed',
            campaignId: event.parsedJson.campaign_id,
            totalRefunded: event.parsedJson.total_refunded,
            timestamp: Date.now()
          }
        
        default:
          return null
      }
    })
    .filter(event => event !== null)
}

/**
 * Parses prediction market events from transaction result
 * @param {Array} events - Array of transaction events
 * @returns {Array} Parsed market events
 */
export const parseMarketEvents = (events) => {
  if (!events) return []
  
  return events
    .filter(event => event.type.includes('::prediction_market::'))
    .map(event => {
      const eventType = event.type.split('::').pop()
      
      switch (eventType) {
        case 'MarketCreated':
          return {
            type: 'MarketCreated',
            marketId: event.parsedJson.market_id,
            campaignId: event.parsedJson.campaign_id,
            creator: event.parsedJson.creator,
            resolutionTime: event.parsedJson.resolution_time,
            timestamp: Date.now()
          }
        
        case 'BetPlaced':
          return {
            type: 'BetPlaced',
            marketId: event.parsedJson.market_id,
            better: event.parsedJson.better,
            amount: event.parsedJson.amount,
            outcome: event.parsedJson.outcome,
            timestamp: Date.now()
          }
        
        case 'MarketResolved':
          return {
            type: 'MarketResolved',
            marketId: event.parsedJson.market_id,
            outcome: event.parsedJson.outcome,
            timestamp: Date.now()
          }
        
        case 'WinningsClaimed':
          return {
            type: 'WinningsClaimed',
            marketId: event.parsedJson.market_id,
            better: event.parsedJson.better,
            amount: event.parsedJson.amount,
            timestamp: Date.now()
          }
        
        default:
          return null
      }
    })
    .filter(event => event !== null)
}

/**
 * Validates Sui address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if address is valid
 */
export const isValidSuiAddress = (address) => {
  if (typeof address !== 'string') return false
  
  // Sui addresses are 32 bytes, represented as 64 hex characters starting with 0x
  return /^0x[0-9a-fA-F]{64}$/.test(address)
}

/**
 * Formats error message from transaction failure
 * @param {Error} error - Transaction error
 * @returns {string} User-friendly error message
 */
export const formatTransactionError = (error) => {
  if (!error.message) return 'Transaction failed. Please try again.'
  
  // Parse common error patterns
  if (error.message.includes('user rejected')) {
    return 'Transaction was rejected by your wallet.'
  }
  
  if (error.message.includes('insufficient gas')) {
    return 'Insufficient gas. Please add more SUI to your wallet.'
  }
  
  if (error.message.includes('object not found')) {
    return 'Object not found. The item may have been moved or deleted.'
  }
  
  if (error.message.includes('invalid type')) {
    return 'Invalid transaction parameters. Please check your input.'
  }
  
  // Default error message
  return `Transaction failed: ${error.message}`
}

/**
 * Retries a transaction with exponential backoff
 * @param {Function} transactionFn - Transaction function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise} Transaction result
 */
export const retryTransaction = async (transactionFn, maxRetries = 3) => {
  let lastError
  let delay = 1000 // Start with 1 second delay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await transactionFn()
    } catch (error) {
      lastError = error
      console.warn(`Transaction attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) break
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Double the delay for next retry
    }
  }
  
  throw lastError
}