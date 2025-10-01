/**
 * Monitoring and analytics utilities for SuiFund
 */

// Analytics events
export const ANALYTICS_EVENTS = {
  // User actions
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_DISCONNECTED: 'wallet_disconnected',

  // Campaign actions
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_CONTRIBUTED: 'campaign_contributed',
  CAMPAIGN_REFUNDED: 'campaign_refunded',

  // Market actions
  BET_PLACED: 'bet_placed',
  MARKET_RESOLVED: 'market_resolved',

  // Governance actions
  PROPOSAL_CREATED: 'proposal_created',
  PROPOSAL_VOTED: 'proposal_voted',
  PROPOSAL_EXECUTED: 'proposal_executed',

  // Navigation
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',

  // Errors
  TRANSACTION_FAILED: 'transaction_failed',
  API_ERROR: 'api_error'
}

/**
 * Track analytics event
 */
export const trackEvent = (eventName, parameters = {}) => {
  try {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.href
      })
    }

    // Custom analytics endpoint
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          parameters,
          timestamp: new Date().toISOString(),
          userId: getUserId(),
          sessionId: getSessionId()
        })
      }).catch(error => {
        console.warn('Failed to send analytics:', error)
      })
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics: ${eventName}`, parameters)
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error)
  }
}

/**
 * Track page view
 */
export const trackPageView = (pageName, pageData = {}) => {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    page_name: pageName,
    ...pageData
  })
}

/**
 * Track user interaction
 */
export const trackInteraction = (element, action, data = {}) => {
  trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
    element,
    action,
    ...data
  })
}

/**
 * Track transaction
 */
export const trackTransaction = (type, success, data = {}) => {
  trackEvent(success ? type : ANALYTICS_EVENTS.TRANSACTION_FAILED, {
    success,
    ...data
  })
}

/**
 * Track error
 */
export const trackError = (error, context = {}) => {
  trackEvent(ANALYTICS_EVENTS.API_ERROR, {
    error_message: error.message,
    error_stack: error.stack,
    ...context
  })

  // Also log to error reporting service
  if (process.env.REACT_APP_ERROR_REPORTING_ENDPOINT) {
    fetch(process.env.REACT_APP_ERROR_REPORTING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
          ...context
        },
        timestamp: new Date().toISOString(),
        userId: getUserId(),
        sessionId: getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(reportError => {
      console.warn('Failed to report error:', reportError)
    })
  }
}

/**
 * Performance monitoring
 */
export const measurePerformance = (name, fn) => {
  const start = performance.now()
  try {
    const result = fn()
    const end = performance.now()
    trackEvent('performance_measurement', {
      name,
      duration: end - start,
      success: true
    })
    return result
  } catch (error) {
    const end = performance.now()
    trackEvent('performance_measurement', {
      name,
      duration: end - start,
      success: false,
      error: error.message
    })
    throw error
  }
}

/**
 * Monitor Web Vitals
 */
export const monitorWebVitals = () => {
  // First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            trackEvent('web_vitals', {
              metric: 'FCP',
              value: entry.startTime
            })
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('FCP monitoring failed:', error)
    }
  }

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackEvent('web_vitals', {
            metric: 'LCP',
            value: entry.startTime
          })
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP monitoring failed:', error)
    }
  }

  // First Input Delay
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          trackEvent('web_vitals', {
            metric: 'FID',
            value: entry.processingStart - entry.startTime
          })
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID monitoring failed:', error)
    }
  }

  // Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })

      // Report CLS on page unload
      window.addEventListener('beforeunload', () => {
        trackEvent('web_vitals', {
          metric: 'CLS',
          value: clsValue
        })
      })
    } catch (error) {
      console.warn('CLS monitoring failed:', error)
    }
  }
}

/**
 * Get or create user ID
 */
const getUserId = () => {
  let userId = localStorage.getItem('suifund_user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('suifund_user_id', userId)
  }
  return userId
}

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('suifund_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('suifund_session_id', sessionId)
  }
  return sessionId
}

/**
 * Monitor network requests
 */
export const monitorNetworkRequests = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            trackEvent('network_request', {
              url: entry.name,
              duration: entry.responseEnd - entry.requestStart,
              status: entry.responseStatus || 0,
              size: entry.transferSize
            })
          }
        }
      })
      observer.observe({ entryTypes: ['resource'] })
    } catch (error) {
      console.warn('Network monitoring failed:', error)
    }
  }
}

/**
 * Monitor memory usage
 */
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    setInterval(() => {
      const memory = performance.memory
      trackEvent('memory_usage', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      })
    }, 30000) // Every 30 seconds
  }
}

/**
 * Initialize monitoring
 */
export const initializeMonitoring = () => {
  // Initialize web vitals monitoring
  monitorWebVitals()

  // Initialize network monitoring
  monitorNetworkRequests()

  // Initialize memory monitoring
  monitorMemoryUsage()

  // Track initial page load
  trackPageView('app_loaded', {
    user_agent: navigator.userAgent,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  // Global error handler
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    })
  })
}
