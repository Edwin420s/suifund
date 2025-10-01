import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Progress from '../ui/Progress'
import { formatDate } from '../../utils/format'

const ProposalCard = ({ proposal, onVote, userVote }) => {
  const {
    id,
    title,
    description,
    proposer,
    startTime,
    endTime,
    status,
    votesFor,
    votesAgainst,
    totalVotes,
    quorum,
    executed
  } = proposal

  const isActive = status === 'active' && new Date(endTime) > new Date()
  const timeLeft = Math.max(0, Math.ceil((new Date(endTime) - new Date()) / (1000 * 60 * 60 * 24)))
  const forPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0
  const quorumReached = totalVotes >= quorum

  const getStatusColor = () => {
    if (executed) return 'text-green-400'
    if (status === 'defeated') return 'text-red-400'
    if (isActive) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getStatusText = () => {
    if (executed) return 'Executed'
    if (status === 'defeated') return 'Defeated'
    if (isActive) return `${timeLeft} days left`
    return 'Ended'
  }

  const handleVote = async (support) => {
    try {
      await onVote(id, support)
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm line-clamp-3">{description}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-800 ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Proposer */}
          <div className="text-xs text-gray-500">
            Proposed by {proposer.slice(0, 6)}...{proposer.slice(-4)} on {formatDate(startTime)}
          </div>

          {/* Voting Results */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-green-400">For: {votesFor.toLocaleString()}</span>
              <span className="text-red-400">Against: {votesAgainst.toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>For ({forPercentage.toFixed(1)}%)</span>
                <span>{votesFor.toLocaleString()}</span>
              </div>
              <Progress value={votesFor} max={totalVotes} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Against ({againstPercentage.toFixed(1)}%)</span>
                <span>{votesAgainst.toLocaleString()}</span>
              </div>
              <Progress value={votesAgainst} max={totalVotes} className="h-2" />
            </div>
          </div>

          {/* Quorum */}
          <div className="text-xs text-gray-500">
            Quorum: {totalVotes.toLocaleString()} / {quorum.toLocaleString()} votes
            {quorumReached && <span className="text-green-400 ml-1">✓ Reached</span>}
          </div>

          {/* Voting Actions */}
          {isActive && !userVote && (
            <div className="flex space-x-3 pt-4 border-t border-gray-700">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleVote(true)}
                className="flex-1"
              >
                Vote For
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleVote(false)}
                className="flex-1"
              >
                Vote Against
              </Button>
            </div>
          )}

          {/* User Vote Display */}
          {userVote && (
            <div className="text-center py-2">
              <span className={`text-sm font-medium ${
                userVote.support ? 'text-green-400' : 'text-red-400'
              }`}>
                You voted {userVote.support ? 'FOR' : 'AGAINST'}
              </span>
            </div>
          )}

          {/* Execution Status */}
          {executed && (
            <div className="text-center py-2">
              <span className="text-green-400 text-sm font-medium">
                ✅ Proposal Executed
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default ProposalCard
