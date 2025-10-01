import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Progress from '../components/ui/Progress'
import BettingWidget from '../components/market/BettingWidget'
import TransactionStatus from '../components/ui/TransactionStatus'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAppStore } from '../stores/useAppStore'
import { useWalletClient } from '../hooks/useWalletClient'
import { useCampaigns } from '../hooks/useCampaigns'
import { useReadOnChain } from '../hooks/useReadOnChain'
import { formatSUI, calculateProgress, formatDate, timeRemaining, parseSUI } from '../utils/format'
import { validateContribution } from '../utils/validation'

const CampaignDetails = () => {
  const { currentCampaign } = useAppStore()
  const { connected, address } = useWalletClient()
  const { contributeToCampaign, distributeFunds, claimRefund } = useCampaigns()
  const { getCampaignDetail } = useReadOnChain()
  const [contributionAmount, setContributionAmount] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [transactionStatus, setTransactionStatus] = useState(null)
  const [campaignData, setCampaignData] = useState(currentCampaign)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentCampaign?.id) {
      loadCampaignData()
    }
  }, [currentCampaign?.id])

  const loadCampaignData = async () => {
    try {
      setIsLoading(true)
      const data = await getCampaignDetail(currentCampaign.id)
      if (data) {
        setCampaignData(data)
      }
    } catch (error) {
      console.error('Failed to load campaign data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!campaignData) {
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

  if (isLoading) {
    return <LoadingSpinner text="Loading campaign details..." />
  }

  const progress = calculateProgress(campaignData.raised, campaignData.goal)
  const remainingTime = timeRemaining(campaignData.deadline)
  const isActive = campaignData.status === 'active' && remainingTime !== 'Ended'
  const isCreator = connected && address === campaignData.creator

  const handleContribute = async () => {
    const errors = validateContribution(contributionAmount)
    setValidationErrors(errors)
    
    if (Object.keys(errors).length > 0) return
    
    try {
      setTransactionStatus({ status: 'pending', message: 'Processing contribution...' })
      
      const result = await contributeToCampaign(campaignData.id, contributionAmount)
      
      setTransactionStatus({ 
        status: 'completed', 
        message: 'Contribution successful!',
        transactionId: result.transactionId
      })
      
      setContributionAmount('')
      await loadCampaignData() // Refresh data
    } catch (error) {
      setTransactionStatus({ 
        status: 'failed', 
        message: 'Contribution failed. Please try again.'
      })
    }
  }

  const handleDistributeFunds = async () => {
    try {
      setTransactionStatus({ status: 'pending', message: 'Distributing funds...' })
      
      const result = await distributeFunds(campaignData.id)
      
      setTransactionStatus({ 
        status: 'completed', 
        message: 'Funds distributed successfully!',
        transactionId: result.transactionId
      })
      
      await loadCampaignData()
    } catch (error) {
      setTransactionStatus({ 
        status: 'failed', 
        message: 'Fund distribution failed.'
      })
    }
  }

  const handleClaimRefund = async () => {
    try {
      setTransactionStatus({ status: 'pending', message: 'Processing refund...' })
      
      const result = await claimRefund(campaignData.id)
      
      setTransactionStatus({ 
        status: 'completed', 
        message: 'Refund claimed successfully!',
        transactionId: result.transactionId
      })
      
      await loadCampaignData()
    } catch (error) {
      setTransactionStatus({ 
        status: 'failed', 
        message: 'Refund claim failed.'
      })
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

      {transactionStatus && (
        <div className="mb-6">
          <TransactionStatus {...transactionStatus} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 rounded-xl p-8 border border-slate-700"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="w-full h-64 bg-gradient-to-br from-primary-900 to-primary-700 rounded-lg mb-6 flex items-center justify-center relative">
              <div className="text-6xl">🚀</div>
              {campaignData.imageUrl && (
                <img 
                  src={campaignData.imageUrl} 
                  alt={campaignData.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-lg"
                />
              )}
            </div>
            
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold">{campaignData.title}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                campaignData.status === 'active' && isActive 
                  ? 'bg-green-500/20 text-green-400' 
                  : campaignData.status === 'completed' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {campaignData.status === 'active' && isActive ? 'Active' : 
                 campaignData.status === 'completed' ? 'Completed' : 'Failed'}
              </span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">{campaignData.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Raised</div>
                <div className="text-xl font-semibold">{formatSUI(campaignData.raised)}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Goal</div>
                <div className="text-xl font-semibold">{formatSUI(campaignData.goal)}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Backers</div>
                <div className="text-xl font-semibold">{campaignData.backers}</div>
              </div>
              
              <div className="bg-slate-900 p-4 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Deadline</div>
                <div className="text-xl font-semibold">
                  {remainingTime === 'Ended' ? formatDate(campaignData.deadline) : remainingTime}
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

            {/* Creator actions */}
            {isCreator && campaignData.status === 'completed' && (
              <div className="mb-6">
                <Button 
                  onClick={handleDistributeFunds}
                  className="w-full"
                >
                  Distribute Funds to Beneficiaries
                </Button>
              </div>
            )}

            {/* Refund claim for failed campaigns */}
            {campaignData.status === 'failed' && connected && (
              <div className="mb-6">
                <Button 
                  onClick={handleClaimRefund}
                  variant="outline"
                  className="w-full"
                >
                  Claim Refund
                </Button>
              </div>
            )}
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
                      onChange={(e) => {
                        setContributionAmount(e.target.value)
                        setValidationErrors({})
                      }}
                      className="mb-2"
                      min="0.1"
                      step="0.1"
                      error={validationErrors.amount}
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
                )
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">
                    {campaignData.status === 'completed' 
                      ? 'This campaign has been successfully funded!'
                      : 'This campaign has ended and did not reach its funding goal.'
                    }
                  </p>
                </div>
              )}
            </div>
            
            {campaignData.predictionMarket && (
              <BettingWidget campaign={campaignData} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CampaignDetails