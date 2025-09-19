import { useWalletKit } from '@mysten/wallet-kit'
import { useWalletClient } from '../../hooks/useWalletClient'
import Button from '../ui/Button'
import { formatAddress } from '../../utils/format'

const ConnectButton = () => {
  const { connect, disconnect, connected, address } = useWalletClient()
  const { currentWallet } = useWalletKit()

  if (connected) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-300 hidden md:block">
          {formatAddress(address)}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button 
      variant="primary" 
      size="sm" 
      onClick={connect}
    >
      Connect Wallet
    </Button>
  )
}

export default ConnectButton