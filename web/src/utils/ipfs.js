/**
 * IPFS utilities for SuiFund
 * Handles file uploads and metadata storage
 */

const INFURA_PROJECT_ID = process.env.REACT_APP_INFURA_PROJECT_ID
const INFURA_PROJECT_SECRET = process.env.REACT_APP_INFURA_PROJECT_SECRET
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY

// IPFS gateway URLs
const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/'
]

/**
 * Upload file to IPFS
 * @param {File} file - File to upload
 * @returns {Promise<string>} IPFS hash
 */
export const uploadToIPFS = async (file) => {
  try {
    // Try Pinata first (if configured)
    if (PINATA_API_KEY && PINATA_SECRET_KEY) {
      return await uploadToPinata(file)
    }

    // Fallback to Infura (if configured)
    if (INFURA_PROJECT_ID && INFURA_PROJECT_SECRET) {
      return await uploadToInfura(file)
    }

    // Fallback to public gateway (limited functionality)
    return await uploadToPublicGateway(file)
  } catch (error) {
    console.error('IPFS upload failed:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

/**
 * Upload to Pinata
 */
const uploadToPinata = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.IpfsHash
}

/**
 * Upload to Infura
 */
const uploadToInfura = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const auth = btoa(`${INFURA_PROJECT_ID}:${INFURA_PROJECT_SECRET}`)

  const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`
    },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Infura upload failed: ${response.statusText}`)
  }

  const result = await response.json()
  return result.Hash
}

/**
 * Upload to public gateway (limited, for development)
 */
const uploadToPublicGateway = async (file) => {
  // This is a simplified implementation
  // In production, you should use a proper IPFS node or service
  console.warn('Using public IPFS gateway - not recommended for production')

  // Convert file to base64
  const base64 = await fileToBase64(file)

  // This won't actually work with public gateways for uploads
  // You need a proper IPFS node or pinning service
  throw new Error('Public IPFS upload not supported. Configure Pinata or Infura.')
}

/**
 * Upload JSON metadata to IPFS
 * @param {object} metadata - Metadata object
 * @returns {Promise<string>} IPFS hash
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    const jsonString = JSON.stringify(metadata, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const file = new File([blob], 'metadata.json', { type: 'application/json' })

    return await uploadToIPFS(file)
  } catch (error) {
    console.error('Metadata upload failed:', error)
    throw new Error('Failed to upload metadata to IPFS')
  }
}

/**
 * Get IPFS URL for hash
 * @param {string} hash - IPFS hash
 * @param {string} gateway - Preferred gateway (optional)
 * @returns {string} IPFS URL
 */
export const getIPFSUrl = (hash, gateway = null) => {
  if (!hash) return null

  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace('ipfs://', '')

  if (gateway) {
    return `${gateway}${cleanHash}`
  }

  // Use first available gateway
  return `${GATEWAYS[0]}${cleanHash}`
}

/**
 * Get multiple gateway URLs for redundancy
 * @param {string} hash - IPFS hash
 * @returns {string[]} Array of gateway URLs
 */
export const getIPFSUrls = (hash) => {
  if (!hash) return []

  const cleanHash = hash.replace('ipfs://', '')

  return GATEWAYS.map(gateway => `${gateway}${cleanHash}`)
}

/**
 * Check if IPFS hash is accessible
 * @param {string} hash - IPFS hash
 * @returns {Promise<boolean>} True if accessible
 */
export const checkIPFSAccessibility = async (hash) => {
  const urls = getIPFSUrls(hash)

  for (const url of urls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        return true
      }
    } catch (error) {
      continue
    }
  }

  return false
}

/**
 * Download file from IPFS
 * @param {string} hash - IPFS hash
 * @returns {Promise<Blob>} File blob
 */
export const downloadFromIPFS = async (hash) => {
  const urls = getIPFSUrls(hash)

  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.blob()
      }
    } catch (error) {
      continue
    }
  }

  throw new Error('Failed to download from IPFS')
}

/**
 * Create campaign metadata
 * @param {object} campaignData - Campaign data
 * @returns {object} Metadata object
 */
export const createCampaignMetadata = (campaignData) => {
  return {
    name: campaignData.title,
    description: campaignData.description,
    image: campaignData.image,
    external_url: `${window.location.origin}/campaigns/${campaignData.id}`,
    attributes: [
      {
        trait_type: 'Category',
        value: campaignData.category
      },
      {
        trait_type: 'Goal',
        value: campaignData.goal,
        display_type: 'number'
      },
      {
        trait_type: 'Duration',
        value: campaignData.duration,
        display_type: 'number'
      },
      {
        trait_type: 'Creator',
        value: campaignData.creator
      }
    ],
    suiFund: {
      version: '1.0.0',
      type: 'campaign',
      created_at: new Date().toISOString()
    }
  }
}

/**
 * Create NFT metadata for supporters
 * @param {object} nftData - NFT data
 * @returns {object} Metadata object
 */
export const createNFTMetadata = (nftData) => {
  return {
    name: nftData.name,
    description: nftData.description,
    image: nftData.image,
    external_url: `${window.location.origin}/nfts/${nftData.id}`,
    attributes: [
      {
        trait_type: 'Campaign',
        value: nftData.campaignTitle
      },
      {
        trait_type: 'Contribution',
        value: nftData.contributionAmount,
        display_type: 'number'
      },
      {
        trait_type: 'Tier',
        value: nftData.tier
      },
      {
        trait_type: 'Minted',
        value: new Date(nftData.mintDate).toISOString(),
        display_type: 'date'
      }
    ],
    suiFund: {
      version: '1.0.0',
      type: 'supporter_nft',
      campaign_id: nftData.campaignId,
      created_at: new Date().toISOString()
    }
  }
}

/**
 * Validate IPFS hash format
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid
 */
export const isValidIPFSHash = (hash) => {
  if (!hash) return false

  // Remove ipfs:// prefix
  const cleanHash = hash.replace('ipfs://', '')

  // Check for v0 (Qm...) or v1 hashes
  const v0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
  const v1Regex = /^bafy[0-9a-z]{55}$/

  return v0Regex.test(cleanHash) || v1Regex.test(cleanHash)
}

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

/**
 * Pin hash to Pinata for persistence
 * @param {string} hash - IPFS hash to pin
 * @returns {Promise<void>}
 */
export const pinToPinata = async (hash) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('Pinata not configured, skipping pin')
    return
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: JSON.stringify({
        hashToPin: hash
      })
    })

    if (!response.ok) {
      throw new Error(`Pinata pin failed: ${response.statusText}`)
    }

    console.log(`Successfully pinned ${hash} to Pinata`)
  } catch (error) {
    console.error('Failed to pin to Pinata:', error)
  }
}
