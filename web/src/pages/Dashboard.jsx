import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import CampaignCard from '../components/campaign/CampaignCard'
import ProposalCard from '../components/governance/ProposalCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { useReadOnChain } from '../hooks/useReadOnChain'
import { useGovernance } from '../hooks/useGovernance'
import { formatSUI } from '../utils/format'
import { analytics } from '../utils/monitoring'

/**
 * User Dashboard Component
 * 
 * Comprehensive dashboard showing:
 * - User statistics and portfolio overview
 * - Created campaigns and their status
 * - Campaign contributions and investments
 * - Governance participation
 * - Recent activity and notifications
 */
const Dashboard = () => {
  const { address, connected } = useWalletClient()
  const { setCurrentView, setCurrentCampaign } = useAppStore()
  const { getUserContributions } = useReadOnChain()
  const { executeProposal, voteOnProposal } = useGovernance()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (connected) {
      loadUserData()
    }
  }, [connected, address])

  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Track dashboard access
      analytics.trackAction('dashboard_view', { timestamp: Date.now() })
      
      // Simulate loading user data from blockchain
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const contributions = await getUserContributions(address)
      
      setUserData({
        // User Statistics
        statistics: {
          totalContributed: 3500000000, // 3.5 SUI
          activeInvestments: 3,
          campaignsCreated: 2,
          totalEarnings: 500000000, // 0.5 SUI from prediction markets
          governancePower: 1500000000 // 1.5 SUI voting power
        },
        
        // Created Campaigns
        createdCampaigns: [
          {
            id: '1',
            title: 'Community Garden Project',
            description: 'Building a sustainable community garden in downtown area',
            goal: 5000000000,
            raised: 2500000000,
            deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
            creator: address,
            backers: 45,
            status: 'active',
            imageUrl: '/api/placeholder/400/200'
          },
          {
            id: '2',
            title: 'Open Source Developer Tools',
            description: 'Creating developer tools for the Sui ecosystem',
            goal: 10000000000,
            raised: 10000000000,
            deadline: Date.now() - 5 * 24 * 60 * 60 * 1000,
            creator: address,
            backers: 120,
            status: 'completed',
            imageUrl: '/api/placeholder/400/200'
          }
        ],
        
        // Supported Campaigns
        supportedCampaigns: contributions,
        
        // Governance Participation
        governanceActivity: [
          {
            id: 1,
            title: 'Platform Development Grant',
            type: 'vote',
            outcome: 'for',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            votingPower: 1000000000
          },
          {
            id: 2,
            title: 'Community Marketing Initiative',
            type: 'proposal',
            status: 'active',
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000
          }
        ],
        
        // Recent Activity
        recentActivity: [
          {
            type: 'contribution',
            campaignId: '3',
            campaignTitle: 'NFT Art Collection',
            amount: 1000000000,
            timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
            status: 'confirmed'
          },
          {
            type: 'bet',
            marketId: '1',
            outcome: 'yes',
            amount: 500000000,
            timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
            status: 'pending'
          },
          {
            type: 'nft_mint',
            campaignId: '2',
            tier: 'Gold',
            timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
            status: 'minted'
          }
        ]
      })
    } catch (error) {
      console.error('Failed to load user data:', error)
      analytics.captureError(error, { context: 'dashboard_data_loading' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCampaignClick = (campaign) => {
    setCurrentCampaign(campaign)
    setCurrentView('campaign')
    
    analytics.trackAction('dashboard_campaign_click', {
      campaignId: campaign.id,
      campaignTitle: campaign.title
    })
  }

  const handleVote = async (proposalId, support) => {
    try {
      await voteOnProposal(proposalId, support, 1000000000) // 1 SUI voting power for demo
      loadUserData() // Refresh data
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleExecuteProposal = async (proposalId) => {
    try {
      await executeProposal(proposalId)
      loadUserData() // Refresh data
    } catch (error) {
      // Error handled in hook
    }
  }

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to view your personalized dashboard
        </p>
        <Button>Connect Wallet</Button>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading your dashboard..." />
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back! Here's your SuiFund activity overview.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('explorer')}
        >
          Explore Campaigns
        </Button>
      </div>

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Total Contributed</div>
          <div className="text-lg font-semibold text-white">
            {formatSUI(userData.statistics.totalContributed)}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Active Investments</div>
          <div className="text-lg font-semibold text-white">
            {userData.statistics.activeInvestments}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Campaigns Created</div>
          <div className="text-lg font-semibold text-white">
            {userData.statistics.campaignsCreated}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
          <div className="text-lg font-semibold text-green-400">
            +{formatSUI(userData.statistics.totalEarnings)}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-gray-400 mb-1">Voting Power</div>
          <div className="text-lg font-semibold text-blue-400">
            {formatSUI(userData.statistics.governancePower)}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-s