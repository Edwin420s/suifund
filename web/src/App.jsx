import { useWallet } from '@mysten/wallet-kit'
import Navbar from './components/navigation/Navbar'
import Footer from './components/navigation/Footer'
import LandingPage from './pages/LandingPage'
import CampaignExplorer from './pages/CampaignExplorer'
import CampaignDetails from './pages/CampaignDetails'
import CreateCampaign from './pages/CreateCampaign'
import Dashboard from './pages/Dashboard'
import GovernancePage from './pages/GovernancePage'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastContainer from './components/ui/ToastContainer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import { useAppStore } from './stores/useAppStore'
import { analytics } from './utils/monitoring'
import { useEffect } from 'react'

/**
 * Main App Content Component
 * 
 * Handles routing and page rendering based on current view
 * Integrates analytics and error tracking
 */
function AppContent() {
  const { currentView, setCurrentView, isLoading } = useAppStore()
  const { connected } = useWallet()

  // Track page views for analytics
  useEffect(() => {
    analytics.trackPageView(currentView, {
      connected: !!connected,
      timestamp: Date.now()
    })
  }, [currentView, connected])

  /**
   * Renders the current view based on app state
   */
  const renderCurrentView = () => {
    // Show loading spinner during async operations
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      )
    }

    switch (currentView) {
      case 'home':
        return <LandingPage />
      
      case 'explorer':
        return <CampaignExplorer />
      
      case 'create':
        return connected ? <CreateCampaign /> : <LandingPage />
      
      case 'dashboard':
        return connected ? <Dashboard /> : <LandingPage />
      
      case 'campaign':
        return <CampaignDetails />
      
      case 'governance':
        return <GovernancePage />
      
      case 'profile':
        // Future feature - User Profile page
        return (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-4">User Profile</h2>
            <p className="text-gray-400 mb-6">User profiles coming soon!</p>
            <button 
              onClick={() => setCurrentView('explorer')}
              className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg transition-colors"
            >
              Explore Campaigns
            </button>
          </div>
        )
      
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8 min-h-[80vh]">
        {renderCurrentView()}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

/**
 * Main App Component with Error Boundary
 * 
 * Wraps the entire application in error boundaries
 * and provides global error handling
 */
function App() {
  // Initialize analytics
  useEffect(() => {
    const analyticsKey = import.meta.env.VITE_ANALYTICS_API_KEY
    if (analyticsKey) {
      analytics.init(analyticsKey)
    }

    // Track app initialization
    analytics.trackAction('app_initialized', {
      version: import.meta.env.VITE_APP_VERSION,
      environment: import.meta.env.MODE,
      timestamp: Date.now()
    })
  }, [])

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App