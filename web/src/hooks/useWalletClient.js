import { CHAIN } from '../utils/constants'
import { useAppStore } from '../stores/useAppStore'

// Lightweight wallet client using window.sui (wallet standard)
export const useWalletClient = () => {
  const { setCurrentView, setLoading } = useAppStore()

  const getWallet = () => (typeof window !== 'undefined' ? window.sui : null)

  const connect = async () => {
    const w = getWallet()
    if (!w?.connect) throw new Error('No Sui wallet found. Please install a Sui-compatible wallet.')
    try {
      setLoading(true)
      await w.connect()
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    const w = getWallet()
    if (!w?.disconnect) return
    try {
      setLoading(true)
      await w.disconnect()
      setCurrentView('home')
    } finally {
      setLoading(false)
    }
  }

  const signTransaction = async (transactionBlock) => {
    const w = getWallet()
    if (!w?.signTransactionBlock) throw new Error('Wallet does not support signTransactionBlock')
    try {
      setLoading(true)
      return await w.signTransactionBlock({ transactionBlock, chain: CHAIN })
    } finally {
      setLoading(false)
    }
  }

  const executeTransaction = async (transactionBlock) => {
    const w = getWallet()
    if (!w?.signAndExecuteTransactionBlock) throw new Error('Wallet does not support signAndExecuteTransactionBlock')
    try {
      setLoading(true)
      return await w.signAndExecuteTransactionBlock({
        transactionBlock,
        chain: CHAIN,
        options: { showEffects: true, showEvents: true, showObjectChanges: true }
      })
    } finally {
      setLoading(false)
    }
  }

  const getAddress = () => {
    const w = getWallet()
    try {
      const accounts = w?.getAccounts ? w.getAccounts() : []
      // Some wallets return a promise
      if (accounts?.then) {
        // Not awaiting here to keep hook synchronous; callers use connected flag
        return undefined
      }
      return Array.isArray(accounts) && accounts[0]?.address ? accounts[0].address : undefined
    } catch {
      return undefined
    }
  }

  return {
    connect,
    disconnect,
    signTransaction,
    executeTransaction,
    address: getAddress(),
    connected: !!getAddress()
  }
}