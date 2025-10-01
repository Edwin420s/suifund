import { motion } from 'framer-motion'
import { useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500 text-green-400'
      case 'error':
        return 'bg-red-500/20 border-red-500 text-red-400'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      default:
        return 'bg-blue-500/20 border-blue-500 text-blue-400'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`p-4 rounded-lg border ${getToastStyles()} shadow-lg max-w-sm`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default Toast
