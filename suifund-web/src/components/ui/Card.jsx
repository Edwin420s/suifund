import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-slate-800 rounded-xl border border-slate-700 overflow-hidden'
  const hoverClasses = hover ? 'hover:border-slate-600 transition-colors duration-200' : ''
  
  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card