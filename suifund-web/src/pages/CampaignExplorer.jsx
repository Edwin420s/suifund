import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CampaignCard from '../components/campaign/CampaignCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAppStore } from '../stores/useAppStore'
import { useReadOnChain } from '../hooks/useReadOnChain'
import { useCampaigns } from '../hooks/useCampaigns'

const CampaignExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { campaigns, setCampaigns, setCurrentCampaign, setCurrentView, isLoading } = useAppStore()
  const { getCampaigns } = useReadOnChain()
  const { refreshCampaigns } = useCampaigns()

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const campaignData = await getCampaigns()
      setCampaigns(campaignData)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && campaign.status === 'active') ||
                         (filterStatus === 'completed' && campaign.status === 'completed') ||
                         (filterStatus === 'failed' && campaign.status === 'failed')
    
    return matchesSearch && matchesStatus
  })

  const handleCampaignClick = (campaign) => {
    setCurrentCampaign(campaign)
    setCurrentView('campaign')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Explore Campaigns</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <Button 
            onClick={refreshCampaigns}
            loading={isLoading}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
          <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
          <Button onClick={loadCampaigns}>Refresh Campaigns</Button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CampaignCard 
                campaign={campaign} 
                onClick={() => handleCampaignClick(campaign)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default CampaignExplorer