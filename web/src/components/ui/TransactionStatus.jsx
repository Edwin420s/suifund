import { motion } from 'framer-motion'

const TransactionStatus = ({ status, message, onClose }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      case 'success':
        return 'bg-green-500/20 border-green-500 text-green-400'
      case 'error':
        return 'bg-red-500/20 border-red-500 text-red-400'
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getStatusColor()} max-w-sm`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">{getStatusIcon()}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default TransactionStatus
