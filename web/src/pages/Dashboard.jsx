import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import CampaignCard from '../components/campaign/CampaignCard'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { useReadOnChain } from '../hooks/useReadOnChain'

const Dashboard = () => {
  const { address, connected } = useWalletClient()
  const { campaigns, setCurrentCampaign, setCurrentView } = useAppStore()
  const { getCampaigns, getUserContributions } = useReadOnChain()
  const [userCampaigns, setUserCampaigns] = useState([])
  const [userContributions, setUserContributions] = useState([])
  const [activeTab, setActiveTab] = useState('created')

  useEffect(() => {
    if (connected) {
      loadUserData()
    }
  }, [connected, address])

  const loadUserData = async () => {
    try {
      const [allCampaigns, contributions] = await Promise.all([
        getCampaigns(),
        getUserContributions(address)
      ])
      
      // Filter campaigns created by user
      const createdCampaigns = allCampaigns.filter(campaign => 
        campaign.creator === address
      )
      
      setUserCampaigns(createdCampaigns)
      setUserContributions(contributions)
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const handleCampaignClick = (campaign) => {
    setCurrentCampaign(campaign)
    setCurrentView('campaign')
  }

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to view your dashboard
        </p>
        <Button>Connect Wallet</Button>
      </div>
    )
  }

  const displayedCampaigns = activeTab === 'created' ? userCampaigns : userContributions
  const totalContributed = userContributions.reduce((total, contrib) => total + contrib.amount, 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('explorer')}
        >
          ← Back to Explorer
        </Button>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {userCampaigns.length}
            </div>
            <div className="text-gray-400">Campaigns Created</div>
          </div>
          
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {userContributions.length}
            </div>
            <div className="text-gray-400">Projects Supported</div>
          </div>
          
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <div className="text-2xl font-bold text-primary-500 mb-2">
              {userContributions.reduce((total, contrib) => total + contrib.amount, 0)} SUI
            </div>
            <div className="text-gray-400">Total Contributed</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex space-x-4 mb-6 border-b border-slate-700">
          <button
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'created'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('created')}
          >
            My Campaigns
          </button>
          <button
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'supported'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('supported')}
          >
            Supported Projects
          </button>
        </div>

        {displayedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'created' ? '📋' : '🤝'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'created' ? 'No campaigns created' : 'No projects supported'}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeTab === 'created' 
                ? 'Create your first campaign to get started' 
                : 'Support some projects to see them here'
              }
            </p>
            <Button 
              onClick={() => setCurrentView(activeTab === 'created' ? 'create' : 'explorer')}
            >
              {activeTab === 'created' ? 'Create Campaign' : 'Explore Projects'}
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {displayedCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CampaignCard 
                  campaign={campaign} 
                  onClick={() => handleCampaignClick(campaign)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard