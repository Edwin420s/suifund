import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-500'
      case 'error': return 'bg-red-500/20 border-red-500'
      case 'warning': return 'bg-yellow-500/20 border-yellow-500'
      default: return 'bg-blue-500/20 border-blue-500'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      default: return 'text-blue-400'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${getBgColor()} ${getTextColor()} backdrop-blur-sm min-w-80 max-w-md`}
      >
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast