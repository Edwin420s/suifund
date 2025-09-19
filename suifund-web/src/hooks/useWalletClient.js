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
      throw error
    }
  }

  const disconnect = async () => {
    try {
      await wallet.disconnect()
      setCurrentView('home')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  const signTransaction = async (transactionBlock) => {
    try {
      return await wallet.signTransactionBlock({
        transactionBlock,
        chain: 'sui:testnet'
      })
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  const executeTransaction = async (transactionBlock) => {
    try {
      return await wallet.signAndExecuteTransactionBlock({
        transactionBlock,
        chain: 'sui:testnet',
        options: {
          showEffects: true,
          showEvents: true
        }
      })
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      throw error
    }
  }

  return {
    connect,
    disconnect,
    signTransaction,
    executeTransaction,
    address: wallet.account?.address,
    connected: wallet.connected,
    wallet
  }
}