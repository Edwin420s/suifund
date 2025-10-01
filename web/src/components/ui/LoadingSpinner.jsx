const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-2 border-primary-500 border-t-transparent ${sizes[size]}`}></div>
      {text && <p className="mt-2 text-sm text-gray-400">{text}</p>}
    </div>
  )
}

export default LoadingSpinner