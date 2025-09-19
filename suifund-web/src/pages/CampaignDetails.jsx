import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Progress from '../components/ui/Progress'
import BettingWidget from '../components/market/BettingWidget'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { useCampaigns } from '../hooks/useCampaigns'
import { formatSUI, calculateProgress, formatDate, timeRemaining, parseSUI } from '../utils/format'

const CampaignDetails = () => {
  const { currentCampaign } = useAppStore()
  const { connected } = useWalletClient()
  const { contributeToCampaign } = useCampaigns()
  const [contributionAmount, setContributionAmount] = useState('')
  const [isContributing, setIsContributing] = useState(false)

  if (!currentCampaign) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold mb-2">Campaign not found</h3>
        <Button onClick={() => useAppStore.getState().setCurrentView('explorer')}>
          Back to Explorer
        </Button>
      </div>
    )
  }

  const progress = calculateProgress(currentCampaign.raised, currentCampaign.goal)
  const remainingTime = timeRemaining(currentCampaign.deadline)
  const isActive = currentCampaign.status === 'active' && remainingTime !== 'Ended'

  const handleContribute = async () => {
    if (!connected || !contributionAmount) return
    
    setIsContributing(true)
    try {
      await contributeToCampaign(currentCampaign.id, contributionAmount)
      setContributionAmount('')
    } catch (error) {
      console.error('Failed to contribute:', error)
    } finally {
      setIsContributing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => useAppStore.getState().setCurrentView('explorer')}
        className="mb-6"
      >
        ← Back to Campaigns
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-8 border border-slate-700"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="w-full h-64 bg-gradient-to-br from-primary-900 to-primary-700 rounded-lg mb-6 flex items-center justify-center relative">
              <div className="text-6xl">🚀</div>
              {currentCampaign.imageUrl && (
                <img 
                  src={currentCampaign.imageUrl} 
                  alt={currentCampaign.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-lg"
                />
              )}
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold">{currentCampaign.title}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                currentCampaign.status === 'active' && isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : currentCampaign.status === 'completed' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {currentCampaign.status === 'active' && isActive ? 'Active' : 
                 currentCampaign.status === 'completed' ? 'Completed' : 'Failed'}
              </span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">{currentCampaign.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Raised</div>
                <div className="text-xl font-semibold">{formatSUI(currentCampaign.raised)}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Goal</div>
                <div className="text-xl font-semibold">{formatSUI(currentCampaign.goal)}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Backers</div>
                <div className="text-xl font-semibold">{currentCampaign.backers}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Deadline</div>
                <div className="text-xl font-semibold">
                  {remainingTime === 'Ended' ? formatDate(currentCampaign.deadline) : remainingTime}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
          
          <div className="w-full lg:w-96">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Support this project</h3>
              
              {isActive ? (
                connected ? (
                  <>
                    <Input
                      type="number"
                      placeholder="Amount in SUI"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="mb-4"
                      min="0.1"
                      step="0.1"
                    />
                    
                    <Button 
                      className="w-full mb-4" 
                      onClick={handleContribute}
                      disabled={!contributionAmount}
                      loading={isContributing}
                    >
                      Contribute
                    </Button>
                    
                    <p className="text-sm text-gray-400 text-center">
                      You'll receive a Supporter NFT for your contribution
                    </p>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-4">Connect your wallet to contribute</p>
                    <Button>Connect Wallet</Button>
                  </div>
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {currentCampaign.status === 'completed' 
                      ? 'This campaign has been successfully funded!'
                      : 'This campaign has ended and did not reach its funding goal.'
                    }
                  </p>
                </div>
              )}
            </div>
            
            {currentCampaign.predictionMarket && (
              <BettingWidget campaign={currentCampaign} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CampaignDetails