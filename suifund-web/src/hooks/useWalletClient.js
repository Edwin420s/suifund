import { useWallet } from '@mysten/wallet-kit'
import { useAppStore } from '../stores/useAppStore'

export const useWalletClient = () => {
  const wallet = useWallet()
  const { setCurrentView } = useAppStore()

  const connect = async () => {
    try {
      if (!wallet.connected) {
        await wallet.connect()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnect = async () => {
    try {
      await wallet.disconnect()
      setCurrentView('home')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return {
    connect,
    disconnect,
    address: wallet.account?.address,
    connected: wallet.connected,
    wallet
  }
}