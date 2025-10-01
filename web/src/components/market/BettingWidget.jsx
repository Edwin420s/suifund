import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Progress from '../ui/Progress'
import { formatCurrency } from '../../utils/format'

const BettingWidget = ({ market, onPlaceBet }) => {
  const [betAmount, setBetAmount] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState('')
  const [isPlacingBet, setIsPlacingBet] = useState(false)

  const {
    id,
    question,
    outcomes,
    totalPool,
    endTime,
    status,
    userBets = {}
  } = market

  const isActive = status === 'active' && new Date(endTime) > new Date()
  const timeLeft = Math.max(0, Math.ceil((new Date(endTime) - new Date()) / (1000 * 60 * 60 * 24)))

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount || isNaN(betAmount) || parseFloat(betAmount) <= 0) {
      return
    }

    setIsPlacingBet(true)
    try {
      await onPlaceBet(id, selectedOutcome, parseFloat(betAmount))
      setBetAmount('')
      setSelectedOutcome('')
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsPlacingBet(false)
    }
  }

  const getOutcomePercentage = (outcomeId) => {
    const outcome = outcomes.find(o => o.id === outcomeId)
    if (!outcome || totalPool === 0) return 0
    return (outcome.totalBets / totalPool) * 100
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Market Question */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">{question}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Total Pool: {formatCurrency(totalPool)} SUI</span>
            <span>{timeLeft} days left</span>
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-3">
          {outcomes.map((outcome) => {
            const percentage = getOutcomePercentage(outcome.id)
            const userBet = userBets[outcome.id] || 0
            const isSelected = selectedOutcome === outcome.id

            return (
              <motion.div
                key={outcome.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
                onClick={() => isActive && setSelectedOutcome(outcome.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{outcome.name}</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {formatCurrency(outcome.totalBets)} SUI
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <Progress value={outcome.totalBets} max={totalPool} className="mb-2" />

                {userBet > 0 && (
                  <div className="text-xs text-blue-400">
                    Your bet: {formatCurrency(userBet)} SUI
                  </div>
                )}

                {/* Odds Display */}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Odds: {outcome.currentOdds?.toFixed(2) || '1.00'}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 bg-blue-500 rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Betting Interface */}
        {isActive && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Bet amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="0"
                step="0.1"
              />
              <Button
                onClick={handlePlaceBet}
                disabled={!selectedOutcome || !betAmount || isPlacingBet}
                loading={isPlacingBet}
                className="w-full"
              >
                {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
              </Button>
            </div>

            {selectedOutcome && betAmount && (
              <div className="text-sm text-gray-400 text-center">
                Betting {betAmount} SUI on "{outcomes.find(o => o.id === selectedOutcome)?.name}"
              </div>
            )}
          </div>
        )}

        {/* Market Status */}
        {!isActive && (
          <div className="text-center py-4">
            <div className={`text-lg font-medium ${
              status === 'resolved' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {status === 'resolved' ? 'Market Resolved' : 'Market Ended'}
            </div>
            {status === 'resolved' && market.winningOutcome && (
              <div className="text-sm text-gray-400 mt-1">
                Winning outcome: {outcomes.find(o => o.id === market.winningOutcome)?.name}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default BettingWidget
