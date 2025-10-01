/**
 * Validation utilities for SuiFund forms and data
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Sui address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export const isValidSuiAddress = (address) => {
  // Sui addresses are 32 bytes, hex encoded (64 characters + 0x prefix)
  const suiAddressRegex = /^0x[0-9a-fA-F]{64}$/
  return suiAddressRegex.test(address)
}

/**
 * Validate campaign title
 * @param {string} title - Title to validate
 * @returns {object} Validation result with isValid and error
 */
export const validateCampaignTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' }
  }

  if (title.length < 5) {
    return { isValid: false, error: 'Title must be at least 5 characters long' }
  }

  if (title.length > 100) {
    return { isValid: false, error: 'Title must be less than 100 characters' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate campaign description
 * @param {string} description - Description to validate
 * @returns {object} Validation result
 */
export const validateCampaignDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' }
  }

  if (description.length < 20) {
    return { isValid: false, error: 'Description must be at least 20 characters long' }
  }

  if (description.length > 5000) {
    return { isValid: false, error: 'Description must be less than 5000 characters' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate funding goal
 * @param {number|string} goal - Goal amount to validate
 * @returns {object} Validation result
 */
export const validateFundingGoal = (goal) => {
  const numGoal = parseFloat(goal)

  if (!goal || isNaN(numGoal)) {
    return { isValid: false, error: 'Funding goal is required' }
  }

  if (numGoal <= 0) {
    return { isValid: false, error: 'Funding goal must be greater than 0' }
  }

  if (numGoal < 1) {
    return { isValid: false, error: 'Minimum funding goal is 1 SUI' }
  }

  if (numGoal > 1000000) {
    return { isValid: false, error: 'Maximum funding goal is 1,000,000 SUI' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate campaign duration
 * @param {number|string} duration - Duration in days
 * @returns {object} Validation result
 */
export const validateCampaignDuration = (duration) => {
  const numDuration = parseInt(duration)

  if (!duration || isNaN(numDuration)) {
    return { isValid: false, error: 'Duration is required' }
  }

  if (numDuration < 1) {
    return { isValid: false, error: 'Duration must be at least 1 day' }
  }

  if (numDuration > 365) {
    return { isValid: false, error: 'Duration cannot exceed 365 days' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate contribution amount
 * @param {number|string} amount - Amount to validate
 * @param {number} minContribution - Minimum contribution (default: 0.1)
 * @returns {object} Validation result
 */
export const validateContributionAmount = (amount, minContribution = 0.1) => {
  const numAmount = parseFloat(amount)

  if (!amount || isNaN(numAmount)) {
    return { isValid: false, error: 'Amount is required' }
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' }
  }

  if (numAmount < minContribution) {
    return { isValid: false, error: `Minimum contribution is ${minContribution} SUI` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate bet amount
 * @param {number|string} amount - Bet amount to validate
 * @param {number} maxBet - Maximum bet amount
 * @returns {object} Validation result
 */
export const validateBetAmount = (amount, maxBet = null) => {
  const numAmount = parseFloat(amount)

  if (!amount || isNaN(numAmount)) {
    return { isValid: false, error: 'Bet amount is required' }
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Bet amount must be greater than 0' }
  }

  if (numAmount < 0.1) {
    return { isValid: false, error: 'Minimum bet is 0.1 SUI' }
  }

  if (maxBet && numAmount > maxBet) {
    return { isValid: false, error: `Maximum bet is ${maxBet} SUI` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate IPFS hash
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} True if valid
 */
export const isValidIpfsHash = (hash) => {
  // IPFS v0 (Qm...) or v1 hashes
  const ipfsRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[0-9a-z]{55}$|^bafk[0-9a-z]{51}$/
  return ipfsRegex.test(hash)
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB (default: 5)
 * @returns {object} Validation result
 */
export const validateImageFile = (file, maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'File is required' }
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' }
  }

  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate proposal title
 * @param {string} title - Title to validate
 * @returns {object} Validation result
 */
export const validateProposalTitle = (title) => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Proposal title is required' }
  }

  if (title.length < 10) {
    return { isValid: false, error: 'Title must be at least 10 characters long' }
  }

  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate proposal description
 * @param {string} description - Description to validate
 * @returns {object} Validation result
 */
export const validateProposalDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Proposal description is required' }
  }

  if (description.length < 50) {
    return { isValid: false, error: 'Description must be at least 50 characters long' }
  }

  if (description.length > 10000) {
    return { isValid: false, error: 'Description must be less than 10,000 characters' }
  }

  return { isValid: true, error: null }
}

/**
 * General form validation helper
 * @param {object} values - Form values
 * @param {object} rules - Validation rules
 * @returns {object} Validation results
 */
export const validateForm = (values, rules) => {
  const errors = {}
  let isValid = true

  Object.keys(rules).forEach(field => {
    const rule = rules[field]
    const value = values[field]

    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`
      isValid = false
    } else if (value && rule.validator) {
      const result = rule.validator(value)
      if (!result.isValid) {
        errors[field] = result.error
        isValid = false
      }
    }
  })

  return { isValid, errors }
}
