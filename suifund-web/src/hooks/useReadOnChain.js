import { useWallet } from '@mysten/wallet-kit'
import { CONTRACT_ADDRESS, CAMPAIGN_MODULE, PREDICTION_MODULE, NFT_MODULE } from '../utils/constants'

export const useReadOnChain = () => {
  const wallet = useWallet()

  const getCampaigns = async () => {
    // This is a mock implementation - in a real app, you would query the blockchain
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
        predictionMarket: true
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
        predictionMarket: true
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
        predictionMarket: false
      }
    ]
  }

  const getUserContributions = async (address) => {
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
        predictionMarket: true
      }
    ]
  }

  return {
    getCampaigns,
    getUserContributions
  }
}