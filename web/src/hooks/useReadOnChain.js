import { useCallback } from 'react'
import { useWallet } from '@mysten/wallet-kit'
import { 
  CONTRACT_ADDRESS, 
  CAMPAIGN_MODULE, 
  RPC_URL,
  PACKAGE_ID
} from '../utils/constants'
import { TransactionBlock } from '@mysten/sui.js'

export const useReadOnChain = () => {
  const wallet = useWallet()

  const getCampaigns = useCallback(async () => {
    try {
      if (!wallet.connected) {
        throw new Error('Wallet not connected')
      }

      const tx = new TransactionBlock()
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::get_all_campaigns`,
        arguments: []
      })

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
          showEffects: true,
          showEvents: true
        }
      })

      // Parse the result and return campaign data
      // This is a simplified example - actual implementation would parse the events
      return parseCampaignsFromEvents(result.events)
    } catch (error) {
      console.error('Failed to get campaigns:', error)
      throw error
    }
  }, [wallet])

  const getUserContributions = useCallback(async (address) => {
    try {
      if (!wallet.connected) {
        throw new Error('Wallet not connected')
      }

      const tx = new TransactionBlock()
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::get_user_contributions`,
        arguments: [tx.pure(address)]
      })

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx
      })

      return parseContributionsFromEvents(result.events)
    } catch (error) {
      console.error('Failed to get user contributions:', error)
      throw error
    }
  }, [wallet])

  const getCampaignDetail = useCallback(async (campaignId) => {
    try {
      if (!wallet.connected) {
        throw new Error('Wallet not connected')
      }

      const tx = new TransactionBlock()
      tx.moveCall({
        target: `${PACKAGE_ID}::${CAMPAIGN_MODULE}::get_campaign_detail`,
        arguments: [tx.pure(campaignId)]
      })

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx
      })

      return parseCampaignDetailFromEvents(result.events)
    } catch (error) {
      console.error('Failed to get campaign details:', error)
      throw error
    }
  }, [wallet])

  // Helper functions to parse blockchain events
  const parseCampaignsFromEvents = (events) => {
    if (!events) return []
    
    return events
      .filter(event => event.type.includes('CampaignCreated'))
      .map(event => ({
        id: event.parsedJson.campaign_id,
        title: event.parsedJson.title,
        description: event.parsedJson.description,
        goal: event.parsedJson.goal,
        raised: event.parsedJson.raised,
        deadline: event.parsedJson.deadline,
        creator: event.parsedJson.creator,
        backers: event.parsedJson.backers,
        status: event.parsedJson.status,
        imageUrl: event.parsedJson.image_url
      }))
  }

  const parseContributionsFromEvents = (events) => {
    if (!events) return []
    
    return events
      .filter(event => event.type.includes('ContributionMade'))
      .map(event => ({
        campaignId: event.parsedJson.campaign_id,
        contributor: event.parsedJson.contributor,
        amount: event.parsedJson.amount,
        timestamp: event.parsedJson.timestamp
      }))
  }

  const parseCampaignDetailFromEvents = (events) => {
    if (!events) return null
    
    const campaignEvent = events.find(event => event.type.includes('CampaignCreated'))
    if (!campaignEvent) return null

    return {
      id: campaignEvent.parsedJson.campaign_id,
      title: campaignEvent.parsedJson.title,
      description: campaignEvent.parsedJson.description,
      goal: campaignEvent.parsedJson.goal,
      raised: campaignEvent.parsedJson.raised,
      deadline: campaignEvent.parsedJson.deadline,
      creator: campaignEvent.parsedJson.creator,
      backers: campaignEvent.parsedJson.backers,
      status: campaignEvent.parsedJson.status,
      imageUrl: campaignEvent.parsedJson.image_url
    }
  }

  return {
    getCampaigns,
    getUserContributions,
    getCampaignDetail
  }
}