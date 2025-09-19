import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useWalletClient } from '../../hooks/useWalletClient'

const BettingWidget = ({ campaign }) => {
  const { connected } = useWalletClient()
  const [betAmount, setBetAmount] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState('yes')
  const [isLoading, setIsLoading] = useState(false)

  const handlePlaceBet = async () => {
    if (!connected || !betAmount) return
    
    setIsLoading(true)
    try {
      // Here you would implement the contract interaction
      console.log('Placing bet:', { amount: betAmount, outcome: selectedOutcome })
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form
      setBetAmount('')
    } catch (error) {
      console.error('Failed to place bet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!campaign.predictionMarket) {
    return null
  }

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 mt-6">
      <h3 className="text-lg font-semibold mb-4">Predict Outcome</h3>
      <p className="text-sm text-gray-400 mb-4">
        Will this campaign reach its funding goal?
      </p>

      <div className="flex space-x-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
            selectedOutcome === 'yes'
              ? 'border-green-500 bg-green-500/20 text-green-400'
              : 'border-slate-700 text-gray-400 hover:border-slate-600'
          }`}
          onClick={() => setSelectedOutcome('yes')}
        >
          Yes
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
            selectedOutcome === 'no'
              ? 'border-red-500 bg-red-500/20 text-red-400'
              : 'border-slate-700 text-gray-400 hover:border-slate-600'
          }`}
          onClick={() => setSelectedOutcome('no')}
        >
          No
        </button>
      </div>

      {connected ? (
        <>
          <Input
            type="number"
            placeholder="Bet amount (SUI)"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="mb-4"
            min="0.1"
            step="0.1"
          />
          
          <Button 
            className="w-full" 
            onClick={handlePlaceBet}
            disabled={!betAmount}
            loading={isLoading}
          >
            Place Bet
          </Button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">Connect your wallet to place bets</p>
          <Button>Connect Wallet</Button>
        </div>
      )}
    </div>
  )
}

export default BettingWidget