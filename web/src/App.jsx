import { useWallet } from '@mysten/wallet-kit'
import Navbar from './components/navigation/Navbar'
import Footer from './components/navigation/Footer'
import LandingPage from './pages/LandingPage'
import CampaignExplorer from './pages/CampaignExplorer'
import CampaignDetails from './pages/CampaignDetails'
import CreateCampaign from './pages/CreateCampaign'
import Dashboard from './pages/Dashboard'
import ErrorBoundary from './components/ui/ErrorBoundary'
import ToastContainer from './components/ui/ToastContainer'
import { useAppStore } from './stores/useAppStore'

function AppContent() {
  const { currentView } = useAppStore()
  const { connected } = useWallet()

  const renderCurrentView = () => {
    switch (currentView) {
      case 'explorer':
        return <CampaignExplorer />
      case 'create':
        return connected ? <CreateCampaign /> : <LandingPage />
      case 'dashboard':
        return connected ? <Dashboard /> : <LandingPage />
      case 'campaign':
        return <CampaignDetails />
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App