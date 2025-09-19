import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Progress from '../components/ui/Progress'
import BettingWidget from '../components/market/BettingWidget'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { formatSUI, calculateProgress, formatDate } from '../utils/format'

const CampaignDetails = () => {
  const { currentCampaign } = useAppStore()
  const { connected } = useWalletClient()
  const [contributionAmount, setContributionAmount] = useState('')

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

  const handleContribute = async () => {
    if (!connected || !contributionAmount) return
    // Here you would implement the contract interaction
    console.log('Contributing:', contributionAmount)
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
            <div className="w-full h-64 bg-gradient-to-br from-primary-900 to-primary-700 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{currentCampaign.title}</h1>
            <p className="text-gray-300 mb-6">{currentCampaign.description}</p>
            
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
                <div className="text-xl font-semibold">{formatDate(currentCampaign.deadline)}</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>
          
          <div className="w-full lg:w-96">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Support this project</h3>
              
              {connected ? (
                <>
                  <Input
                    type="number"
                    placeholder="Amount in SUI"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="mb-4"
                  />
                  
                  <Button 
                    className="w-full mb-4" 
                    onClick={handleContribute}
                    disabled={!contributionAmount}
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
              )}
            </div>
            
            <BettingWidget campaign={currentCampaign} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CampaignDetails