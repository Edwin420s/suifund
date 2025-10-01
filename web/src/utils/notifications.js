/**
 * Notification utilities for SuiFund
 */

/**
 * Show toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export const showToast = (message, type = 'info', duration = 5000) => {
  // Dispatch custom event for toast system
  const event = new CustomEvent('showToast', {
    detail: { message, type, duration }
  })
  window.dispatchEvent(event)

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`)
  }
}

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export const showSuccess = (message, duration = 5000) => {
  showToast(message, 'success', duration)
}

/**
 * Show error notification
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export const showError = (message, duration = 5000) => {
  showToast(message, 'error', duration)
}

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export const showWarning = (message, duration = 5000) => {
  showToast(message, 'warning', duration)
}

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export const showInfo = (message, duration = 5000) => {
  showToast(message, 'info', duration)
}

/**
 * Show loading notification
 * @param {string} message - Loading message
 * @returns {function} Function to dismiss the notification
 */
export const showLoading = (message = 'Loading...') => {
  const id = `loading_${Date.now()}`
  showToast(message, 'info', 0) // 0 duration means persistent

  return () => {
    // In a real implementation, you'd have a way to dismiss specific toasts
    // For now, this is a placeholder
    console.log(`Dismissing loading toast: ${id}`)
  }
}

/**
 * Request notification permission
 * @returns {Promise<boolean>} True if granted
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showBrowserNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  })

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close()
  }, 5000)

  return notification
}

/**
 * Show transaction notification
 * @param {string} type - Transaction type
 * @param {boolean} success - Whether transaction succeeded
 * @param {string} txDigest - Transaction digest
 */
export const showTransactionNotification = (type, success, txDigest = null) => {
  const messages = {
    campaign_created: success ? 'Campaign created successfully!' : 'Failed to create campaign',
    contribution_made: success ? 'Contribution made successfully!' : 'Failed to make contribution',
    bet_placed: success ? 'Bet placed successfully!' : 'Failed to place bet',
    proposal_created: success ? 'Proposal created successfully!' : 'Failed to create proposal',
    vote_cast: success ? 'Vote cast successfully!' : 'Failed to cast vote',
    withdrawal_made: success ? 'Withdrawal successful!' : 'Failed to withdraw funds'
  }

  const message = messages[type] || (success ? 'Transaction successful!' : 'Transaction failed!')

  if (success) {
    showSuccess(message)
    if (txDigest) {
      showBrowserNotification('Transaction Confirmed', {
        body: `${message} Click to view on explorer.`,
        tag: txDigest
      })
    }
  } else {
    showError(message)
  }
}

/**
 * Show wallet connection notification
 * @param {boolean} connected - Whether wallet is connected
 * @param {string} walletName - Name of the wallet
 */
export const showWalletNotification = (connected, walletName = '') => {
  if (connected) {
    showSuccess(`Connected to ${walletName}`)
    showBrowserNotification('Wallet Connected', {
      body: `Successfully connected to ${walletName}`,
      icon: '/wallet-icon.png'
    })
  } else {
    showInfo('Wallet disconnected')
  }
}

/**
 * Show campaign status notification
 * @param {string} campaignTitle - Campaign title
 * @param {string} status - New status
 */
export const showCampaignStatusNotification = (campaignTitle, status) => {
  const messages = {
    successful: `${campaignTitle} has been successfully funded! 🎉`,
    failed: `${campaignTitle} did not reach its funding goal.`,
    ended: `${campaignTitle} campaign has ended.`
  }

  const message = messages[status] || `${campaignTitle} status updated to ${status}`

  showBrowserNotification('Campaign Update', {
    body: message,
    tag: `campaign_${campaignTitle}_${status}`
  })
}

/**
 * Show market resolution notification
 * @param {string} marketQuestion - Market question
 * @param {string} outcome - Winning outcome
 */
export const showMarketResolutionNotification = (marketQuestion, outcome) => {
  const message = `Market resolved: ${marketQuestion} - Winner: ${outcome}`

  showBrowserNotification('Market Resolved', {
    body: message,
    tag: `market_${marketQuestion}`
  })
}

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  // In a real implementation, this would clear all active toasts
  // For now, this is a placeholder
  console.log('Clearing all notifications')
}

/**
 * Notification queue for managing multiple notifications
 */
class NotificationQueue {
  constructor(maxConcurrent = 3) {
    this.queue = []
    this.active = 0
    this.maxConcurrent = maxConcurrent
  }

  add(notification) {
    this.queue.push(notification)
    this.process()
  }

  process() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.active++
    const notification = this.queue.shift()

    showToast(notification.message, notification.type, notification.duration)

    setTimeout(() => {
      this.active--
      this.process()
    }, notification.duration + 100)
  }
}

export const notificationQueue = new NotificationQueue()

/**
 * Add notification to queue
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @param {number} duration - Duration in milliseconds
 */
export const queueNotification = (message, type = 'info', duration = 3000) => {
  notificationQueue.add({ message, type, duration })
}
