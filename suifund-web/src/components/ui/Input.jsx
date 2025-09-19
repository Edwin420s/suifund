const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      {...props}
    />
  )
}

export default Input