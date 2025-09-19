import { useWalletClient } from '../../hooks/useWalletClient'
import ConnectButton from '../wallet/ConnectButton'
import Button from '../ui/Button'
import { useAppStore } from '../../stores/useAppStore'

const Navbar = () => {
  const { connected, address } = useWalletClient()
  const { setCurrentView } = useAppStore()

  return (
    <nav className="bg-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="text-xl font-bold text-primary-500 cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              SuiFund
            </div>
            
            <div className="hidden md:flex space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentView('explorer')}
              >
                Explore
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentView('create')}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {connected && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </Button>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar