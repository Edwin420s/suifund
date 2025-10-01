import { motion } from 'framer-motion'

const Progress = ({ value, max = 100, className = '', showLabel = true }) => {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}

export default Progress
