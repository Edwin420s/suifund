import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Progress from '../ui/Progress'
import { formatSUI, formatDate, calculateProgress, timeRemaining } from '../../utils/format'

/**
 * ProposalCard Component
 * 
 * Displays governance proposal information with voting interface
 * Shows proposal details, voting status, and execution controls
 * 
 * @param {Object} proposal - Proposal data object
 * @param {Function} onVote - Vote handler function
 * @param {Function} onExecute - Execute handler function
 * @param {boolean} canVote - Whether user can vote
 * @param {boolean} canExecute - Whether user can execute
 */
const ProposalCard = ({ proposal, onVote, onExecute, canVote = false, canExecute = false }) => {
  const totalVotes = proposal.votesFor + proposal.votesAgainst
  const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0
  const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0
  const timeLeft = timeRemaining(proposal.endTime)
  const isActive = timeLeft !== 'Ended' && !proposal.executed
  const isApproved = proposal.votesFor > proposal.votesAgainst && timeLeft === 'Ended'

  const handleVote = (support) => {
    if (onVote && canVote) {
      onVote(proposal.id, support)
    }
  }

  const handleExecute = () => {
    if (onExecute && canExecute) {
      onExecute(proposal.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 text-white">{proposal.title}</h3>
          <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            proposal.executed ? 'bg-green-500/20 text-green-400' :
            isActive ? 'bg-blue-500/20 text-blue-400' :
            isApproved ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {proposal.executed ? 'Executed' : 
             isActive ? 'Active' : 
             isApproved ? 'Approved' : 'Rejected'}
          </span>
          <span className="text-sm text-gray-400">
            {timeLeft === 'Ended' ? 'Voting ended' : timeLeft}
          </span>
        </div>
      </div>

      {/* Proposal Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Amount</div>
          <div className="text-lg font-semibold text-white">{formatSUI(proposal.amount)}</div>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Recipient</div>
          <div className="text-sm font-mono text-gray-300 truncate">
            {proposal.recipient.slice(0, 8)}...{proposal.recipient.slice(-6)}
          </div>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Votes For</span>
          <span className="text-green-400 font-medium">{forPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={forPercentage} className="mb-4" />
        
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Votes Against</span>
          <span className="text-red-400 font-medium">{againstPercentage.toFixed(1)}%</span>
        </div>
        <Progress value={againstPercentage} />
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Total Votes: {totalVotes}</span>
          <span>For: {proposal.votesFor} • Against: {proposal.votesAgainst}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {isActive && canVote && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20"
              onClick={() => handleVote(true)}
            >
              Vote For
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20"
              onClick={() => handleVote(false)}
            >
              Vote Against
            </Button>
          </>
        )}
        
        {isApproved && canExecute && (
          <Button
            className="flex-1"
            onClick={handleExecute}
          >
            Execute Proposal
          </Button>
        )}
        
        {proposal.executed && (
          <Button
            variant="outline"
            className="flex-1"
            disabled
          >
            Executed
          </Button>
        )}
      </div>

      {/* Proposal Metadata */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-gray-500">
          Created by: {proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}
        </div>
        <div className="text-xs text-gray-500">
          Ends: {formatDate(proposal.endTime)}
        </div>
      </div>
    </motion.div>
  )
}

export default ProposalCard