import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const TransactionStatus = ({ transactionId, status = 'pending', message }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!show) return null

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      case 'completed': return 'bg-green-500/20 border-green-500 text-green-400'
      case 'failed': return 'bg-red-500/20 border-red-500 text-red-400'
      default: return 'bg-blue-500/20 border-blue-500 text-blue-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return '⏳'
      case 'completed': return '✅'
      case 'failed': return '❌'
      default: return 'ℹ️'
    }
  }

  const getShortTransactionId = () => {
    if (!transactionId) return ''
    return `${transactionId.slice(0, 8)}...${transactionId.slice(-8)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`p-4 rounded-lg border ${getStatusColor()} backdrop-blur-sm max-w-md`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{getStatusIcon()}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {transactionId && (
            <p className="text-xs opacity-75 mt-1">
              TX: {getShortTransactionId()}
            </p>
          )}
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

export default TransactionStatus