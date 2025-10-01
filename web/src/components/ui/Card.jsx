import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  ...props
}) => {
  const baseClasses = 'bg-gray-800 border border-gray-700 rounded-lg shadow-lg'

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }

  const hoverClasses = hover
    ? 'hover:border-gray-600 hover:shadow-xl transition-all duration-200'
    : ''

  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClasses} ${className}`

  return (
    <motion.div
      className={classes}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-700 pb-4 mb-4 ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-700 pt-4 mt-4 ${className}`}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
