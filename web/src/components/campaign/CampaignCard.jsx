import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Progress from '../ui/Progress'
import { formatSUI, calculateProgress, formatDate, timeRemaining } from '../../utils/format'

const CampaignCard = ({ campaign, onClick }) => {
  const progress = calculateProgress(campaign.raised, campaign.goal)
  const remainingTime = timeRemaining(campaign.deadline)

  return (
    <motion.div 
      className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-primary-500 transition-colors duration-200 cursor-pointer"
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center relative">
        <div className="text-4xl">🚀</div>
        {campaign.imageUrl && (
          <img 
            src={campaign.imageUrl} 
            alt={campaign.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold mb-2 truncate">{campaign.title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium min-w-[70px] text-center ${
            campaign.status === 'active' ? 'bg-green-500/20 text-green-400' :
            campaign.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {campaign.status}
          </span>
        </div>
        
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
            <span className="text-gray-400">Backers</span>
            <span className="font-medium">{campaign.backers}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{remainingTime.includes('Ended') ? 'Ended' : 'Ends'}</span>
            <span className="font-medium">{remainingTime.includes('Ended') ? formatDate(campaign.deadline) : remainingTime}</span>
          </div>
        </div>
        
        <Progress value={progress} className="mb-4" showLabel />
        
        <Button className="w-full">
          View Details
        </Button>
      </div>
    </motion.div>
  )
}

export default CampaignCard