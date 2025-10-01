import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Progress from '../ui/Progress'
import Button from '../ui/Button'
import { formatCurrency, formatDate } from '../../utils/format'

const CampaignCard = ({ campaign, showActions = true }) => {
  const {
    id,
    title,
    description,
    creator,
    goal,
    raised,
    deadline,
    category,
    image,
    status,
    backersCount
  } = campaign

  const progress = (raised / goal) * 100
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  const isActive = status === 'active' && daysLeft > 0
  const isSuccessful = status === 'successful'
  const isFailed = status === 'failed'

  const getStatusColor = () => {
    if (isSuccessful) return 'text-green-400'
    if (isFailed) return 'text-red-400'
    if (isActive) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getStatusText = () => {
    if (isSuccessful) return 'Successful'
    if (isFailed) return 'Failed'
    if (isActive) return `${daysLeft} days left`
    return 'Ended'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full">
        {/* Campaign Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-black/50 backdrop-blur-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-black/50 backdrop-blur-sm text-white">
              {category}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Title and Description */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {description}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">
                {formatCurrency(raised)} raised
              </span>
              <span className="text-gray-400">
                {formatCurrency(goal)} goal
              </span>
            </div>
            <Progress value={raised} max={goal} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{progress.toFixed(1)}% funded</span>
              <span>{backersCount} backers</span>
            </div>
          </div>

          {/* Creator */}
          <div className="mb-4">
            <p className="text-xs text-gray-500">
              by {creator.slice(0, 6)}...{creator.slice(-4)}
            </p>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              <Link to={`/campaigns/${id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
              {isActive && (
                <Button size="sm" className="px-4">
                  Back This
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default CampaignCard
