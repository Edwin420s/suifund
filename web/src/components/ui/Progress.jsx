const Progress = ({ 
  value, 
  className = '',
  showLabel = false 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="font-medium">{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default Progress