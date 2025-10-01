import React from 'react'
import Button from './Button'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <details className="text-left mb-6">
              <summary className="cursor-pointer text-gray-400 mb-2">Error Details</summary>
              <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm text-gray-300">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary