import { useCallback } from 'react'
import { useWalletClient } from './useWalletClient'
import { useAppStore } from '../stores/useAppStore'
import { useReadOnChain } from './useReadOnChain'
import { parseSUI } from '../utils/format'

export const useCampaigns = () => {
  const { executeTransaction } = useWalletClient()
  const { addCampaign, updateCampaign, addContribution, setLoading } = useAppStore()
  const { getCampaigns } = useReadOnChain()

  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true)
    try {
      // In a real implementation, you would create a transaction
      // to call the create_campaign function on the smart contract
      console.log('Creating campaign:', campaignData)
      
      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newCampaign = {
        id: Date.now().toString(),
        ...campaignData,
        raised: 0,
        backers: 0,
        status: 'active',
        creator: 'current-user-address',
        deadline: new Date(campaignData.deadline).getTime()
      }
      
      addCampaign(newCampaign)
      return newCampaign
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [addCampaign, setLoading])

  const contributeToCampaign = useCallback(async (campaignId, amount) => {
    setLoading(true)
    try {
      // In a real implementation, you would create a transaction
      // to call the contribute function on the smart contract
      console.log('Contributing to campaign:', campaignId, amount)
      
      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const suiAmount = parseSUI(amount)
      addContribution(campaignId, suiAmount)
      
      return { success: true, transactionId: 'mock-transaction-id' }
    } catch (error) {
      console.error('Failed to contribute to campaign:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [addContribution, setLoading])

  const refreshCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const campaigns = await getCampaigns()
      useAppStore.getState().setCampaigns(campaigns)
      return campaigns
    } catch (error) {
      console.error('Failed to refresh campaigns:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [getCampaigns, setLoading])

  return {
    createCampaign,
    contributeToCampaign,
    refreshCampaigns
  }
}