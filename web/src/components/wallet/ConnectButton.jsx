import { useState } from 'react'
import Button from '../ui/Button'
import { useWalletClient } from '../../hooks/useWalletClient'

const ConnectButton = () => {
  const { connect, disconnect, address, connected } = useWalletClient()
  const [busy, setBusy] = useState(false)

  const handleConnect = async () => {
    try {
      setBusy(true)
      await connect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setBusy(true)
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    } finally { setBusy(false) }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  const formatBalance = (bal) => {
    if (!bal) return '0'
    return parseFloat(bal).toFixed(4)
  }

  if (connected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={handleDisconnect}
          disabled={busy}
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>{formatAddress(address)}</span>
          <span className="text-xs text-gray-400">Disconnect</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={handleConnect}
        disabled={busy}
        loading={busy}
      >
        {busy ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  )
}

export default ConnectButton
