import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Progress from '../ui/Progress'
import { formatSUI, calculateProgress, formatDate } from '../../utils/format'

const CampaignCard = ({ campaign, onClick }) => {
  const progress = calculateProgress(campaign.raised, campaign.goal)

  return (
    <motion.div 
      className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-primary-500 transition-colors duration-200"
      whileHover={{ y: -5 }}
    >
      <div className="h-48 bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center">
        <div className="text-4xl">🚀</div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 truncate">{campaign.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
          {campaign.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Raised</span>
            <span className="font-medium">{formatSUI(campaign.raised)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Goal</span>
            <span className="font-medium">{formatSUI(campaign.goal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Deadline</span>
            <span className="font-medium">{formatDate(campaign.deadline)}</span>
          </div>
        </div>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
            campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {campaign.status}
          </span>
          
          <Button size="sm" onClick={onClick}>
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default CampaignCard