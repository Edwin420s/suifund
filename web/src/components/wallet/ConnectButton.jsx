import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@mysten/wallet-kit'
import { useAppStore } from '../../stores/useAppStore'
import Button from '../ui/Button'
import Card from '../ui/Card'

const ConnectButton = () => {
  const { connect, disconnect, currentWallet, wallets } = useWallet()
  const { isConnected, address, balance } = useAppStore()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async (wallet) => {
    try {
      setConnecting(true)
      await connect(wallet.name)
      setShowWalletModal(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (bal) => {
    if (!bal) return '0'
    return parseFloat(bal).toFixed(4)
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowWalletModal(true)}
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>{formatAddress(address)}</span>
          <span className="text-xs text-gray-400">
            {formatBalance(balance)} SUI
          </span>
        </Button>

        <AnimatePresence>
          {showWalletModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowWalletModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Wallet Connected
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {currentWallet?.name || 'Unknown Wallet'}
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Address:</span>
                        <span className="text-white font-mono">{formatAddress(address)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Balance:</span>
                        <span className="text-white">{formatBalance(balance)} SUI</span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowWalletModal(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDisconnect}
                        className="flex-1"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowWalletModal(true)}
        disabled={connecting}
        loading={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Connect Wallet
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Choose your preferred wallet to connect to SuiFund
                    </p>
                  </div>

                  <div className="space-y-2">
                    {wallets.map((wallet) => (
                      <motion.button
                        key={wallet.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConnect(wallet)}
                        className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-3"
                      >
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-8 h-8 rounded-lg"
                        />
                        <span className="text-white font-medium">
                          {wallet.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setShowWalletModal(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConnectButton
