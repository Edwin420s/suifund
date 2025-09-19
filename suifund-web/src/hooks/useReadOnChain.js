import { useCallback } from 'react'
import { useWallet } from '@mysten/wallet-kit'
import { 
  CONTRACT_ADDRESS, 
  CAMPAIGN_MODULE, 
  RPC_URL 
} from '../utils/constants'

export const useReadOnChain = () => {
  const wallet = useWallet()

  const getCampaigns = useCallback(async () => {
    try {
      // This is a mock implementation - in a real app, you would query the blockchain
      // using the Sui Client API to get actual campaign objects
      
      return [
        {
          id: '1',
          title: 'Community Garden Project',
          description: 'Building a sustainable community garden in downtown area with organic vegetables and educational programs.',
          goal: 5000000000, // 5 SUI in MIST
          raised: 2500000000, // 2.5 SUI
          deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
          creator: '0x1234567890abcdef',
          backers: 45,
          status: 'active',
          predictionMarket: true,
          imageUrl: '/api/placeholder/400/200'
        },
        {
          id: '2',
          title: 'Open Source Development Tool',
          description: 'Creating an open-source tool that helps developers build better applications on Sui blockchain.',
          goal: 10000000000, // 10 SUI
          raised: 8500000000, // 8.5 SUI
          deadline: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
          creator: '0xabcdef1234567890',
          backers: 120,
          status: 'active',
          predictionMarket: true,
          imageUrl: '/api/placeholder/400/200'
        },
        {
          id: '3',
          title: 'NFT Art Collection',
          description: 'Funding a unique NFT art collection that showcases digital artists from around the world.',
          goal: 8000000000, // 8 SUI
          raised: 8000000000, // 8 SUI
          deadline: Date.now() - 5 * 24 * 60 * 60 * 1000, // Ended 5 days ago
          creator: '0x7890abcdef123456',
          backers: 200,
          status: 'completed',
          predictionMarket: false,
          imageUrl: '/api/placeholder/400/200'
        },
        {
          id: '4',
          title: 'Failed Web3 Game',
          description: 'Ambitious Web3 game that unfortunately didn\'t reach its funding goals.',
          goal: 20000000000, // 20 SUI
          raised: 5000000000, // 5 SUI
          deadline: Date.now() - 10 * 24 * 60 * 60 * 1000, // Ended 10 days ago
          creator: '0x4567890abcdef123',
          backers: 35,
          status: 'failed',
          predictionMarket: true,
          imageUrl: '/api/placeholder/400/200'
        }
      ]
    } catch (error) {
      console.error('Failed to get campaigns:', error)
      throw error
    }
  }, [])

  const getUserContributions = useCallback(async (address) => {
    try {
      // Mock implementation - would query blockchain for user's contributions
      return [
        {
          id: '2',
          title: 'Open Source Development Tool',
          description: 'Creating an open-source tool that helps developers build better applications on Sui blockchain.',
          goal: 10000000000,
          raised: 8500000000,
          deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
          creator: '0xabcdef1234567890',
          backers: 120,
          status: 'active',
          amount: 2000000000, // 2 SUI contributed
          predictionMarket: true,
          imageUrl: '/api/placeholder/400/200'
        }
      ]
    } catch (error) {
      console.error('Failed to get user contributions:', error)
      throw error
    }
  }, [])

  const getCampaignDetail = useCallback(async (campaignId) => {
    try {
      const campaigns = await getCampaigns()
      return campaigns.find(campaign => campaign.id === campaignId) || null
    } catch (error) {
      console.error('Failed to get campaign details:', error)
      throw error
    }
  }, [getCampaigns])

  return {
    getCampaigns,
    getUserContributions,
    getCampaignDetail
  }
}