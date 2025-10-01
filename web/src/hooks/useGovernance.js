import { useCallback } from 'react'
import { useWalletClient } from './useWalletClient'
import { useAppStore } from '../stores/useAppStore'
import { TransactionBlock } from '@mysten/sui.js'
import { PACKAGE_ID, TREASURY_MODULE } from '../utils/constants'

/**
 * useGovernance Hook
 * 
 * Provides governance functionality including:
 * - Proposal creation and management
 * - Voting on proposals with voting power
 * - Proposal execution for approved proposals
 * - Treasury fee collection and management
 * 
 * @returns {Object} Governance functions and state
 */
export const useGovernance = () => {
  const { executeTransaction } = useWalletClient()
  const { setLoading, addToast } = useAppStore()

  /**
   * Creates a new governance proposal
   * @param {Object} proposalData - Proposal data
   * @param {string} proposalData.title - Proposal title
   * @param {string} proposalData.description - Proposal description
   * @param {number} proposalData.amount - Requested amount in SUI
   * @param {string} proposalData.recipient - Recipient address
   * @param {number} proposalData.duration - Voting duration in days
   * @returns {Promise<Object>} Transaction result
   */
  const createProposal = useCallback(async (proposalData) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      // Convert amount to MIST and duration to milliseconds
      const amountMist = Math.floor(proposalData.amount * 1000000000)
      const durationMs = proposalData.duration * 24 * 60 * 60 * 1000

      tx.moveCall({
        target: `${PACKAGE_ID}::${TREASURY_MODULE}::create_proposal`,
        arguments: [
          tx.object(proposalData.treasuryId), // Treasury object
          tx.pure(proposalData.title),
          tx.pure(proposalData.description),
          tx.pure(amountMist),
          tx.pure(proposalData.recipient),
          tx.pure(durationMs),
          tx.object('0x6') // Clock object
        ]
      })

      const result = await executeTransaction(tx)
      
      addToast({
        message: 'Proposal created successfully!',
        type: 'success'
      })

      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to create proposal:', error)
      addToast({
        message: 'Failed to create proposal. Please try again.',
        type: 'error'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading, addToast])

  /**
   * Votes on a governance proposal
   * @param {string} proposalId - Proposal ID to vote on
   * @param {boolean} support - Vote direction (true = for, false = against)
   * @param {number} votingPower - Voting power amount
   * @returns {Promise<Object>} Transaction result
   */
  const voteOnProposal = useCallback(async (proposalId, support, votingPower) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      // In a real implementation, you would get voting power from NFT holdings
      // This is a simplified version
      const votingPowerObj = tx.moveCall({
        target: `0x1::vote::create_voting_power`,
        arguments: [tx.pure(votingPower)]
      })

      tx.moveCall({
        target: `${PACKAGE_ID}::${TREASURY_MODULE}::vote_on_proposal`,
        arguments: [
          tx.object('0xYOUR_TREASURY_ID'), // Treasury object
          tx.pure(proposalId),
          tx.pure(support),
          votingPowerObj,
          tx.object('0x6') // Clock object
        ]
      })

      const result = await executeTransaction(tx)
      
      addToast({
        message: `Vote ${support ? 'for' : 'against'} proposal recorded!`,
        type: 'success'
      })

      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to vote on proposal:', error)
      addToast({
        message: 'Failed to vote on proposal. Please try again.',
        type: 'error'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading, addToast])

  /**
   * Executes an approved proposal
   * @param {string} proposalId - Proposal ID to execute
   * @returns {Promise<Object>} Transaction result
   */
  const executeProposal = useCallback(async (proposalId) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${TREASURY_MODULE}::execute_proposal`,
        arguments: [
          tx.object('0xYOUR_TREASURY_ID'), // Treasury object
          tx.pure(proposalId),
          tx.object('0x6') // Clock object
        ]
      })

      const result = await executeTransaction(tx)
      
      addToast({
        message: 'Proposal executed successfully!',
        type: 'success'
      })

      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to execute proposal:', error)
      addToast({
        message: 'Failed to execute proposal. Please try again.',
        type: 'error'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading, addToast])

  /**
   * Collects fees into treasury
   * @param {string} treasuryId - Treasury object ID
   * @param {number} amount - Amount to collect in SUI
   * @returns {Promise<Object>} Transaction result
   */
  const collectFees = useCallback(async (treasuryId, amount) => {
    setLoading(true)
    try {
      const tx = new TransactionBlock()
      const amountMist = Math.floor(amount * 1000000000)
      
      // Split coins for fee payment
      const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure(amountMist)])
      
      tx.moveCall({
        target: `${PACKAGE_ID}::${TREASURY_MODULE}::collect_fees`,
        arguments: [
          tx.object(treasuryId),
          feeCoin
        ]
      })

      const result = await executeTransaction(tx)
      
      addToast({
        message: 'Fees collected successfully!',
        type: 'success'
      })

      return { success: true, transactionId: result.digest }
    } catch (error) {
      console.error('Failed to collect fees:', error)
      addToast({
        message: 'Failed to collect fees. Please try again.',
        type: 'error'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [executeTransaction, setLoading, addToast])

  return {
    createProposal,
    voteOnProposal,
    executeProposal,
    collectFees
  }
}