import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ProposalCard from '../components/governance/ProposalCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { useGovernance } from '../hooks/useGovernance'
import { formatSUI } from '../utils/format'
import { validateCampaignForm } from '../utils/validation'

/**
 * GovernancePage Component
 * 
 * Provides platform governance interface including:
 * - Treasury overview and statistics
 * - Proposal creation and management
 * - Voting on active proposals
 * - Proposal execution for approved proposals
 * 
 * Features role-based access controls for different user types
 */
const GovernancePage = () => {
  const { connected, address } = useWalletClient()
  const { createProposal, voteOnProposal, executeProposal, collectFees } = useGovernance()
  const { addToast } = useAppStore()
  
  const [proposals, setProposals] = useState([])
  const [treasuryInfo, setTreasuryInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    recipient: '',
    duration: '7' // 7 days default
  })
  const [formErrors, setFormErrors] = useState({})

  // Mock data - replace with real blockchain queries
  useEffect(() => {
    if (connected) {
      loadGovernanceData()
    }
  }, [connected])

  const loadGovernanceData = async () => {
    setIsLoading(true)
    try {
      // Simulate loading treasury and proposals data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setTreasuryInfo({
        totalFees: 25000000000, // 25 SUI
        currentBalance: 15000000000, // 15 SUI
        totalProposals: 12,
        activeProposals: 3
      })

      setProposals([
        {
          id: 1,
          title: 'Platform Development Grant',
          description: 'Fund ongoing platform development and feature improvements for Q1 2024',
          amount: 5000000000, // 5 SUI
          recipient: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          creator: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          votesFor: 1500000000,
          votesAgainst: 500000000,
          createdTime: Date.now() - 86400000, // 1 day ago
          endTime: Date.now() + 6 * 86400000, // 6 days left
          executed: false
        },
        {
          id: 2,
          title: 'Community Marketing Initiative',
          description: 'Allocate funds for community growth and marketing campaigns',
          amount: 2000000000, // 2 SUI
          recipient: '0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1',
          creator: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a',
          votesFor: 800000000,
          votesAgainst: 1200000000,
          createdTime: Date.now() - 172800000, // 2 days ago
          endTime: Date.now() - 86400000, // Ended 1 day ago
          executed: false
        },
        {
          id: 3,
          title: 'Security Audit Funding',
          description: 'Fund comprehensive security audit of smart contracts',
          amount: 3000000000, // 3 SUI
          recipient: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
          creator: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
          votesFor: 2000000000,
          votesAgainst: 500000000,
          createdTime: Date.now() - 259200000, // 3 days ago
          endTime: Date.now() - 86400000, // Ended 1 day ago
          executed: true
        }
      ])
    } catch (error) {
      console.error('Failed to load governance data:', error)
      addToast({
        message: 'Failed to load governance data',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProposal = async (e) => {
    e.preventDefault()
    
    const errors = validateProposalForm(formData)
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) return

    try {
      await createProposal({
        ...formData,
        amount: parseFloat(formData.amount),
        duration: parseInt(formData.duration),
        treasuryId: '0xYOUR_TREASURY_ID' // Replace with actual treasury ID
      })
      
      setShowCreateForm(false)
      setFormData({
        title: '',
        description: '',
        amount: '',
        recipient: '',
        duration: '7'
      })
      
      // Reload data to show new proposal
      loadGovernanceData()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleVote = async (proposalId, support) => {
    try {
      // In a real implementation, voting power would come from NFT holdings
      const votingPower = 1000000000 // 1 SUI equivalent for demo
      
      await voteOnProposal(proposalId, support, votingPower)
      loadGovernanceData() // Refresh data
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleExecuteProposal = async (proposalId) => {
    try {
      await executeProposal(proposalId)
      loadGovernanceData() // Refresh data
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const validateProposalForm = (data) => {
    const errors = {}
    
    if (!data.title.trim()) {
      errors.title = 'Title is required'
    } else if (data.title.length < 10) {
      errors.title = 'Title must be at least 10 characters'
    }
    
    if (!data.description.trim()) {
      errors.description = 'Description is required'
    } else if (data.description.length < 50) {
      errors.description = 'Description must be at least 50 characters'
    }
    
    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.amount = 'Valid amount is required'
    } else if (parseFloat(data.amount) > 100000) {
      errors.amount = 'Amount cannot exceed 100,000 SUI'
    }
    
    if (!data.recipient.trim()) {
      errors.recipient = 'Recipient address is required'
    } else if (!/^0x[0-9a-fA-F]{64}$/.test(data.recipient)) {
      errors.recipient = 'Invalid Sui address format'
    }
    
    if (!data.duration || parseInt(data.duration) < 1 || parseInt(data.duration) > 30) {
      errors.duration = 'Duration must be between 1 and 30 days'
    }
    
    return errors
  }

  const canCreateProposal = connected // Add role-based logic here
  const canVote = connected // Add voting power logic here
  const canExecute = connected // Add execution permissions logic here

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to participate in platform governance
        </p>
        <Button>Connect Wallet</Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Platform Governance</h1>
          <p className="text-gray-400 mt-2">
            Participate in platform decisions through decentralized governance
          </p>
        </div>
        {canCreateProposal && (
          <Button onClick={() => setShowCreateForm(true)}>
            Create Proposal
          </Button>
        )}
      </div>

      {/* Treasury Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Fees Collected</div>
          <div className="text-2xl font-bold text-white">
            {treasuryInfo ? formatSUI(treasuryInfo.totalFees) : '--'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Current Balance</div>
          <div className="text-2xl font-bold text-white">
            {treasuryInfo ? formatSUI(treasuryInfo.currentBalance) : '--'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Total Proposals</div>
          <div className="text-2xl font-bold text-white">
            {treasuryInfo ? treasuryInfo.totalProposals : '--'}
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="text-sm text-gray-400 mb-2">Active Proposals</div>
          <div className="text-2xl font-bold text-white">
            {treasuryInfo ? treasuryInfo.activeProposals : '--'}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-slate-700">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'active'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Proposals
        </button>
        <button
          className={`pb-2 px-1 border-b-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {/* Create Proposal Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Create Governance Proposal</h2>
            
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <Input
                label="Proposal Title"
                placeholder="e.g., Platform Development Grant Q1 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={formErrors.title}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your proposal in detail, including objectives, budget breakdown, and expected outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[120px]"
                  required
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Amount (SUI)"
                  type="number"
                  placeholder="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  error={formErrors.amount}
                  min="0.1"
                  step="0.1"
                  required
                />
                
                <Input
                  label="Voting Duration (Days)"
                  type="number"
                  placeholder="7"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  error={formErrors.duration}
                  min="1"
                  max="30"
                  required
                />
              </div>
              
              <Input
                label="Recipient Address"
                placeholder="0x..."
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                error={formErrors.recipient}
                required
              />
              
              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1">
                  Create Proposal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? (
        <LoadingSpinner text="Loading governance data..." />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {proposals
            .filter(proposal => {
              switch (activeTab) {
                case 'active':
                  return !proposal.executed && Date.now() < proposal.endTime
                case 'completed':
                  return proposal.executed || Date.now() >= proposal.endTime
                default:
                  return true
              }
            })
            .map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProposalCard
                  proposal={proposal}
                  onVote={handleVote}
                  onExecute={handleExecuteProposal}
                  canVote={canVote}
                  canExecute={canExecute}
                />
              </motion.div>
            ))}
          
          {proposals.filter(proposal => {
            switch (activeTab) {
              case 'active':
                return !proposal.executed && Date.now() < proposal.endTime
              case 'completed':
                return proposal.executed || Date.now() >= proposal.endTime
              default:
                return true
            }
          }).length === 0 && (
            <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No proposals found</h3>
              <p className="text-gray-400">
                {activeTab === 'active' 
                  ? 'There are no active proposals at the moment.'
                  : 'No completed proposals found.'
                }
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default GovernancePage