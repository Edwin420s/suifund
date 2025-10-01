import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client'

/**
 * Blockchain utilities for SuiFund
 */

// Network configuration
export const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    url: getFullnodeUrl('mainnet'),
    faucetUrl: null
  },
  testnet: {
    name: 'Testnet',
    url: getFullnodeUrl('testnet'),
    faucetUrl: 'https://faucet.testnet.sui.io/gas'
  },
  devnet: {
    name: 'Devnet',
    url: getFullnodeUrl('devnet'),
    faucetUrl: 'https://faucet.devnet.sui.io/gas'
  },
  localnet: {
    name: 'Localnet',
    url: 'http://127.0.0.1:9000',
    faucetUrl: 'http://127.0.0.1:9123/gas'
  }
}

// Current network (from environment or default to devnet)
export const CURRENT_NETWORK = process.env.REACT_APP_SUI_NETWORK || 'devnet'

/**
 * Get SuiClient instance for current network
 */
export const getSuiClient = () => {
  const networkUrl = NETWORKS[CURRENT_NETWORK]?.url
  if (!networkUrl) {
    throw new Error(`Unknown network: ${CURRENT_NETWORK}`)
  }
  return new SuiClient({ url: networkUrl })
}

/**
 * Get faucet URL for current network
 */
export const getFaucetUrl = () => {
  return NETWORKS[CURRENT_NETWORK]?.faucetUrl
}

/**
 * Check if address is valid Sui address
 */
export const isValidSuiAddress = (address) => {
  return /^0x[0-9a-fA-F]{64}$/.test(address)
}

/**
 * Format address for display
 */
export const formatAddress = (address, start = 6, end = 4) => {
  if (!address) return ''
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

/**
 * Convert SUI amount to smallest unit (MIST)
 */
export const suiToMist = (sui) => {
  return BigInt(Math.floor(parseFloat(sui) * 1e9))
}

/**
 * Convert MIST to SUI
 */
export const mistToSui = (mist) => {
  return parseFloat(mist) / 1e9
}

/**
 * Get transaction link for explorer
 */
export const getTransactionLink = (digest) => {
  const baseUrls = {
    mainnet: 'https://suiexplorer.com/txblock',
    testnet: 'https://testnet.suiexplorer.com/txblock',
    devnet: 'https://devnet.suiexplorer.com/txblock',
    localnet: null
  }

  const baseUrl = baseUrls[CURRENT_NETWORK]
  return baseUrl ? `${baseUrl}/${digest}` : null
}

/**
 * Get address link for explorer
 */
export const getAddressLink = (address) => {
  const baseUrls = {
    mainnet: 'https://suiexplorer.com/address',
    testnet: 'https://testnet.suiexplorer.com/address',
    devnet: 'https://devnet.suiexplorer.com/address',
    localnet: null
  }

  const baseUrl = baseUrls[CURRENT_NETWORK]
  return baseUrl ? `${baseUrl}/${address}` : null
}

/**
 * Get object link for explorer
 */
export const getObjectLink = (objectId) => {
  const baseUrls = {
    mainnet: 'https://suiexplorer.com/object',
    testnet: 'https://testnet.suiexplorer.com/object',
    devnet: 'https://devnet.suiexplorer.com/object',
    localnet: null
  }

  const baseUrl = baseUrls[CURRENT_NETWORK]
  return baseUrl ? `${baseUrl}/${objectId}` : null
}

/**
 * Wait for transaction confirmation
 */
export const waitForTransaction = async (suiClient, digest, timeout = 30000) => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const txResponse = await suiClient.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showEvents: true
        }
      })

      if (txResponse) {
        return txResponse
      }
    } catch (error) {
      // Transaction not found yet, continue waiting
    }

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  throw new Error('Transaction confirmation timeout')
}

/**
 * Estimate gas for transaction
 */
export const estimateGas = async (suiClient, transaction) => {
  try {
    const dryRun = await suiClient.dryRunTransactionBlock({
      transactionBlock: transaction
    })

    return {
      gasUsed: dryRun.effects.gasUsed,
      gasBudget: dryRun.effects.gasBudget,
      estimatedFee: mistToSui(dryRun.effects.gasFee)
    }
  } catch (error) {
    console.error('Failed to estimate gas:', error)
    return null
  }
}

/**
 * Get balance for address
 */
export const getBalance = async (suiClient, address) => {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
      coinType: '0x2::sui::SUI'
    })

    return mistToSui(balance.totalBalance)
  } catch (error) {
    console.error('Failed to get balance:', error)
    return 0
  }
}

/**
 * Get all coins for address
 */
export const getCoins = async (suiClient, address, coinType = '0x2::sui::SUI') => {
  try {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType
    })

    return coins.data
  } catch (error) {
    console.error('Failed to get coins:', error)
    return []
  }
}

/**
 * Merge coins to reduce number of coin objects
 */
export const mergeCoins = async (suiClient, signer, coinType, coinsToMerge) => {
  if (coinsToMerge.length < 2) return

  const primaryCoin = coinsToMerge[0]
  const coinsToMergeIds = coinsToMerge.slice(1).map(coin => coin.coinObjectId)

  const tx = await signer.signAndExecuteTransaction({
    transaction: {
      kind: 'moveCall',
      data: {
        packageObjectId: '0x2',
        module: 'pay',
        function: 'join_vec',
        typeArguments: [coinType],
        arguments: [
          primaryCoin.coinObjectId,
          coinsToMergeIds
        ],
        gasBudget: 10000
      }
    }
  })

  return tx
}

/**
 * Split coin into smaller amounts
 */
export const splitCoin = async (signer, coinId, amounts) => {
  const tx = await signer.signAndExecuteTransaction({
    transaction: {
      kind: 'moveCall',
      data: {
        packageObjectId: '0x2',
        module: 'coin',
        function: 'split_vec',
        typeArguments: ['0x2::sui::SUI'],
        arguments: [
          coinId,
          amounts.map(amount => suiToMist(amount).toString())
        ],
        gasBudget: 15000
      }
    }
  })

  return tx
}

/**
 * Get events for a package or object
 */
export const getEvents = async (suiClient, query) => {
  try {
    const events = await suiClient.queryEvents({
      query,
      limit: 50,
      order: 'descending'
    })

    return events.data
  } catch (error) {
    console.error('Failed to get events:', error)
    return []
  }
}

/**
 * Subscribe to events (for real-time updates)
 */
export const subscribeToEvents = (suiClient, query, callback) => {
  const subscriptionId = suiClient.subscribeEvent({
    filter: query,
    onMessage: callback
  })

  return subscriptionId
}

/**
 * Unsubscribe from events
 */
export const unsubscribeFromEvents = (suiClient, subscriptionId) => {
  suiClient.unsubscribeEvent({ id: subscriptionId })
}
