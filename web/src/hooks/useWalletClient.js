import { useWallet } from '@mysten/wallet-kit'
import { useAppStore } from '../stores/useAppStore'

export const useWalletClient = () => {
  const wallet = useWallet()
  const { setCurrentView, setLoading } = useAppStore()

  const connect = async () => {
    try {
      setLoading(true)
      if (!wallet.connected) {
        await wallet.connect()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      setLoading(true)
      await wallet.disconnect()
      setCurrentView('home')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signTransaction = async (transactionBlock) => {
    try {
      setLoading(true)
      return await wallet.signTransactionBlock({
        transactionBlock,
        chain: 'sui:testnet'
      })
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const executeTransaction = async (transactionBlock) => {
    try {
      setLoading(true)
      return await wallet.signAndExecuteTransactionBlock({
        transactionBlock,
        chain: 'sui:testnet',
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true
        }
      })
    } catch (error) {
      console.error('Failed to execute transaction:', error)
      throw error
    } finally {
      setLoading(false)
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