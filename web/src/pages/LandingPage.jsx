import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'

const LandingPage = () => {
  const { setCurrentView } = useAppStore()
  const { connected } = useWalletClient()

  const features = [
    {
      icon: '🚀',
      title: 'Transparent Funding',
      description: 'All campaigns and transactions are on-chain with automatic refunds if goals aren\'t met.'
    },
    {
      icon: '📊',
      title: 'Prediction Markets',
      description: 'Bet on project outcomes and earn rewards based on accurate predictions.'
    },
    {
      icon: '💎',
      title: 'NFT Rewards',
      description: 'Receive unique NFTs as proof of support and potential revenue sharing.'
    }
  ]

  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Fund. Predict. Earn.
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            The decentralized platform for transparent crowdfunding and prediction markets on Sui Blockchain. 
            Support innovative projects, predict outcomes, and earn rewards—all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setCurrentView('explorer')}
            >
              Explore Campaigns
            </Button>
            
            {connected && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setCurrentView('create')}
              >
                Create Campaign
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-primary-500 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 bg-slate-800 rounded-xl p-8 border border-slate-700"
        >
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold mb-2 text-primary-400">1. Create or Explore</h3>
              <p className="text-gray-400">Launch your project or discover innovative ideas from the community.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary-400">2. Fund or Predict</h3>
              <p className="text-gray-400">Support projects you believe in or predict their success in markets.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary-400">3. Earn Rewards</h3>
              <p className="text-gray-400">Get NFTs, share revenue, or win prediction market payouts.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LandingPage