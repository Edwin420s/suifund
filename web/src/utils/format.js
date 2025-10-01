/**
 * Format currency values for display
 * @param {number} value - The value to format
 * @param {string} currency - The currency symbol (default: 'SUI')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'SUI') => {
  if (value === null || value === undefined || isNaN(value)) {
    return `0 ${currency}`
  }

  const numValue = parseFloat(value)

  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(2)}B ${currency}`
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(2)}M ${currency}`
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(2)}K ${currency}`
  } else if (numValue >= 1) {
    return `${numValue.toFixed(2)} ${currency}`
  } else {
    return `${numValue.toFixed(4)} ${currency}`
  }
}

/**
 * Format large numbers with appropriate suffixes
 * @param {number} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  const numValue = parseFloat(value)

  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(1)}B`
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(1)}M`
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(1)}K`
  } else {
    return numValue.toLocaleString()
  }
}

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A'

  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return dateObj.toLocaleDateString('en-US', options)
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'

  const dateObj = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now - dateObj) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  } else {
    return formatDate(date)
  }
}

/**
 * Format percentage
 * @param {number} value - The value to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format address for display (truncate middle)
 * @param {string} address - The address to format
 * @param {number} startLength - Length of start part
 * @param {number} endLength - Length of end part
 * @returns {string} Formatted address string
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address || address.length <= startLength + endLength) {
    return address || 'N/A'
  }

  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format transaction hash for display
 * @param {string} hash - The transaction hash
 * @returns {string} Formatted hash string
 */
export const formatTransactionHash = (hash) => {
  return formatAddress(hash, 8, 6)
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
