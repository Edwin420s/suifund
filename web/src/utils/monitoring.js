/**
 * Monitoring and Analytics Utilities
 * 
 * Provides monitoring, analytics, and error tracking functionality:
 * - Error tracking and reporting
 * - User analytics and behavior tracking
 * - Performance monitoring
 * - Transaction analytics
 */

// Mock analytics service - replace with real service in production
class AnalyticsService {
  constructor() {
    this.initialized = false
    this.queue = []
  }

  /**
   * Initializes analytics service
   * @param {string} apiKey - Analytics service API key
   */
  init(apiKey) {
    if (this.initialized) return
    
    // Initialize your analytics service here
    // Example: Sentry.init({ dsn: apiKey })
    
    this.initialized = true
    this.flushQueue()
  }

  /**
   * Tracks page view
   * @param {string} page - Page name or URL
   * @param {Object} properties - Additional properties
   */
  trackPageView(page, properties = {}) {
    const event = {
      type: 'pageview',
      page,
      timestamp: Date.now(),
      properties
    }
    
    this.sendEvent(event)
  }

  /**
   * Tracks user action
   * @param {string} action - Action name
   * @param {Object} properties - Action properties
   */
  trackAction(action, properties = {}) {
    const event = {
      type: 'action',
      action,
      timestamp: Date.now(),
      properties
    }
    
    this.sendEvent(event)
  }

  /**
   * Tracks transaction
   * @param {string} type - Transaction type
   * @param {Object} data - Transaction data
   */
  trackTransaction(type, data) {
    const event = {
      type: 'transaction',
      transactionType: type,
      timestamp: Date.now(),
      ...data
    }
    
    this.sendEvent(event)
  }

  /**
   * Captures error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  captureError(error, context = {}) {
    const event = {
      type: 'error',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      timestamp: Date.now(),
      context
    }
    
    this.sendEvent(event)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Captured error:', error, context)
    }
  }

  /**
   * Tracks performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {Object} tags - Metric tags
   */
  trackPerformance(metric, value, tags = {}) {
    const event = {
      type: 'performance',
      metric,
      value,
      timestamp: Date.now(),
      tags
    }
    
    this.sendEvent(event)
  }

  /**
   * Sends event to analytics service
   * @param {Object} event - Event data
   */
  sendEvent(event) {
    if (!this.initialized) {
      this.queue.push(event)
      return
    }

    // Send to your analytics service
    // Example: Sentry.captureEvent(event)
    
    console.log('Analytics event:', event)
  }

  /**
   * Flushes queued events
   */
  flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift()
      this.sendEvent(event)
    }
  }
}

// Create global analytics instance
export const analytics = new AnalyticsService()

/**
 * Error boundary utility for React components
 * @param {Error} error - Caught error
 * @param {Object} errorInfo - Error info from React
 */
export const captureReactError = (error, errorInfo) => {
  analytics.captureError(error, {
    componentStack: errorInfo.componentStack,
    type: 'react_error_boundary'
  })
}

/**
 * Transaction monitoring utility
 */
export const transactionMonitor = {
  /**
   * Starts transaction timing
   * @param {string} transactionId - Transaction identifier
   * @returns {Function} Function to end timing and record metric
   */
  startTiming(transactionId) {
    const startTime = performance.now()
    
    return (status = 'completed') => {
      const duration = performance.now() - startTime
      
      analytics.trackPerformance('transaction_duration', duration, {
        transactionId,
        status
      })
      
      return duration
    }
  },

  /**
   * Records transaction success
   * @param {string} type - Transaction type
   * @param {Object} data - Transaction data
   */
  recordSuccess(type, data) {
    analytics.trackTransaction(type, {
      status: 'success',
      ...data
    })
  },

  /**
   * Records transaction failure
   * @param {string} type - Transaction type
   * @param {Error} error - Error object
   * @param {Object} data - Transaction data
   */
  recordFailure(type, error, data) {
    analytics.trackTransaction(type, {
      status: 'failed',
      error: error.message,
      ...data
    })
    
    analytics.captureError(error, {
      transactionType: type,
      ...data
    })
  }
}

/**
 * User analytics utility
 */
export const userAnalytics = {
  /**
   * Tracks wallet connection
   * @param {string} walletType - Wallet type (Suiet, Ethos, etc.)
   * @param {string} address - User address
   */
  trackWalletConnect(walletType, address) {
    analytics.trackAction('wallet_connect', {
      walletType,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
    })
  },

  /**
   * Tracks campaign creation
   * @param {Object} campaignData - Campaign data
   */
  trackCampaignCreate(campaignData) {
    analytics.trackAction('campaign_create', {
      goal: campaignData.goal,
      deadline: campaignData.deadline,
      beneficiaryCount: campaignData.beneficiaries?.length || 0
    })
  },

  /**
   * Tracks campaign contribution
   * @param {string} campaignId - Campaign ID
   * @param {number} amount - Contribution amount
   */
  trackCampaignContribute(campaignId, amount) {
    analytics.trackAction('campaign_contribute', {
      campaignId,
      amount
    })
  },

  /**
   * Tracks prediction market bet
   * @param {string} marketId - Market ID
   * @param {string} outcome - Bet outcome
   * @param {number} amount - Bet amount
   */
  trackMarketBet(marketId, outcome, amount) {
    analytics.trackAction('market_bet', {
      marketId,
      outcome,
      amount
    })
  }
}

// Initialize analytics in production
if (import.meta.env.PROD) {
  const analyticsKey = import.meta.env.VITE_ANALYTICS_API_KEY
  if (analyticsKey) {
    analytics.init(analyticsKey)
  }
}

export default analytics