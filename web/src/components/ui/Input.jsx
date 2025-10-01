const Input = ({ 
  label, 
  error,
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default Input