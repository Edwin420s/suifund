export const formatSUI = (amount) => {
  if (!amount) return "0 SUI"
  return `${(amount / 1000000000).toFixed(2)} SUI`
}

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

export const formatAddress = (address) => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const calculateProgress = (raised, goal) => {
  if (!goal) return 0
  return Math.min(100, (raised / goal) * 100)
}