import { useCallback } from 'react'
import { useWalletClient } from './useWalletClient'
import { useAppStore } from '../stores/useAppStore'
import { useReadOnChain } from './useReadOnChain'
import { parseSUI } from '../utils/format'
import { TransactionBlock } from '@mysten/sui.js'
import { PACKAGE_ID, CAMPAIGN_MODULE } from '../utils/constants'

export const useCampaigns = () => {
  const { executeTransaction } = useWalletClient()
  const { addCampaign, updateCampaign, addContribution, setLoading } = useAppStore()
  const { getCampaigns } = useReadOnChain()

  const createCampaign = useCallback(async (campaignData) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      // Prepare beneficiaries vector
      const beneficiaries = tx.makeMoveVec({
        type: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::Beneficiary`,
        elements: campaignData.beneficiaries.map(b => 
          tx.moveCall({
            target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::create_beneficiary`,
            arguments: [tx.pure(b.address), tx.pure(b.percentage)]
          })
        )
      })

      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::create_campaign`,
        arguments: [
          tx.pure(campaignData.title),
          tx.pure(campaignData.description),
          tx.pure(parseSUI(campaignData.goal)),
          tx.pure(new Date(campaignData.deadline).getTime()),
          tx.pure(campaignData.imageUrl || ''),
          beneficiaries
        ]
      })

      const result = await executeTransaction(tx)
      
      // Parse the created campaign from events
      const campaignEvent = result.events?.find(e => e.type.includes('CampaignCreated'))
      if (campaignEvent) {
        const newCampaign = {
          id: campaignEvent.parsedJson.campaign_id,
          ...campaignData,
          raised: 0,
          backers: 0,
          status: 'active',
          creator: campaignEvent.parsedJson.creator,
          deadline: new Date(campaignData.deadline).getTime()
        }
        
        addCampaign(newCampaign)
        return newCampaign
      }

      throw new Error('Failed to create campaign: No event found')
    } catch (error) {
      console.error('Failed to create campaign:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, addCampaign, setLoading])

  const contributeToCampaign = useCallback(async (campaignId, amount) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(parseSUI(amount))])
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::contribute`,
        arguments: [
          tx.object(campaignId),
          coin
        ]
      })

      const result = await executeTransaction(tx)
      
      // Find contribution event
      const contributionEvent = result.events?.find(e => e.type.includes('ContributionMade'))
      if (contributionEvent) {
        addContribution(campaignId, parseSUI(amount))
        return { 
          success: true, 
          transactionId: result.digest,
          amount: parseSUI(amount)
        }
      }

      throw new Error('Failed to contribute: No event found')
    } catch (error) {
      console.error('Failed to contribute to campaign:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, addContribution, setLoading])

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

  const distributeFunds = useCallback(async (campaignId) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::distribute_funds`,
        arguments: [tx.object(campaignId)]
      })

      const result = await executeTransaction(tx)
      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to distribute funds:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading])

  const claimRefund = useCallback(async (campaignId) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::claim_refund`,
        arguments: [
          tx.object(campaignId),
          tx.pure(useAppStore.getState().address)
        ]
      })

      const result = await executeTransaction(tx)
      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to claim refund:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading])

  return {
    createCampaign,
    contributeToCampaign,
    refreshCampaigns,
    distributeFunds,
    claimRefund
  }
}