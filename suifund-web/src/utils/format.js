export const formatSUI = (amount) => {
  if (!amount && amount !== 0) return "0 SUI"
  return `${(amount / 1000000000).toFixed(2)} SUI`
}

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatAddress = (address) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 0
  return Math.min(100, (raised / goal) * 100)
}

export const timeRemaining = (deadline) => {
  const now = Date.now()
  const diff = deadline - now
  
  if (diff <= 0) return "Ended"
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h left`
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${minutes}m left`
}

export const parseSUI = (suiString) => {
  if (!suiString) return 0
  const amount = parseFloat(suiString)
  return Math.floor(amount * 1000000000)
}