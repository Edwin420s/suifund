import { useState, useEffect, useCallback } from 'react'
import { useWalletKit } from '@mysten/wallet-kit'
import { useAppStore } from '../stores/useAppStore'
import { showToast } from '../utils/notifications'

export const useGovernance = () => {
  const walletKit = useWalletKit()
  const { signAndExecuteTransaction } = walletKit
  const { suiClient } = useAppStore()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [userVotes, setUserVotes] = useState(new Map())

  // Treasury contract address - should be from constants
  const TREASURY_PACKAGE_ID = process.env.REACT_APP_TREASURY_PACKAGE_ID
  const TREASURY_OBJECT_ID = process.env.REACT_APP_TREASURY_OBJECT_ID

  /**
   * Fetch all proposals
   */
  const fetchProposals = useCallback(async () => {
    if (!suiClient || !TREASURY_OBJECT_ID) return

    try {
      setLoading(true)

      // Get treasury object
      const treasuryObj = await suiClient.getObject({
        id: TREASURY_OBJECT_ID,
        options: { showContent: true }
      })

      if (!treasuryObj.data?.content?.fields?.proposals) {
        setProposals([])
        return
      }

      const proposalIds = treasuryObj.data.content.fields.proposals
      const proposalDetails = []

      // Fetch each proposal
      for (const proposalId of proposalIds) {
        try {
          const proposalObj = await suiClient.getObject({
            id: proposalId,
            options: { showContent: true }
          })

          if (proposalObj.data?.content?.fields) {
            const fields = proposalObj.data.content.fields
            proposalDetails.push({
              id: proposalId,
              title: fields.title,
              description: fields.description,
              proposer: fields.proposer,
              startTime: new Date(parseInt(fields.start_time)),
              endTime: new Date(parseInt(fields.end_time)),
              status: fields.status,
              votesFor: parseInt(fields.votes_for || 0),
              votesAgainst: parseInt(fields.votes_against || 0),
              totalVotes: parseInt(fields.votes_for || 0) + parseInt(fields.votes_against || 0),
              quorum: parseInt(fields.quorum || 0),
              executed: fields.executed || false,
              executionTime: fields.execution_time ? new Date(parseInt(fields.execution_time)) : null
            })
          }
        } catch (error) {
          console.error(`Failed to fetch proposal ${proposalId}:`, error)
        }
      }

      setProposals(proposalDetails)
    } catch (error) {
      console.error('Failed to fetch proposals:', error)
      showToast('Failed to load proposals', 'error')
    } finally {
      setLoading(false)
    }
  }, [suiClient, TREASURY_OBJECT_ID])

  /**
   * Create a new proposal
   */
  const createProposal = useCallback(async (title, description, executionDelay = 7 * 24 * 60 * 60 * 1000) => {
    if (!TREASURY_PACKAGE_ID) {
      throw new Error('Treasury package ID not configured')
    }

    try {
      setLoading(true)

      const tx = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data: {
            packageObjectId: TREASURY_PACKAGE_ID,
            module: 'treasury',
            function: 'create_proposal',
            typeArguments: [],
            arguments: [
              TREASURY_OBJECT_ID,
              title,
              description,
              executionDelay.toString()
            ],
            gasBudget: 10000
          }
        }
      })

      if (tx.effects?.status?.status === 'success') {
        showToast('Proposal created successfully!', 'success')
        await fetchProposals() // Refresh proposals
        return tx
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Failed to create proposal:', error)
      showToast('Failed to create proposal', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [signAndExecuteTransaction, TREASURY_PACKAGE_ID, TREASURY_OBJECT_ID, fetchProposals])

  /**
   * Vote on a proposal
   */
  const voteOnProposal = useCallback(async (proposalId, support) => {
    if (!TREASURY_PACKAGE_ID) {
      throw new Error('Treasury package ID not configured')
    }

    try {
      setLoading(true)

      const tx = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data: {
            packageObjectId: TREASURY_PACKAGE_ID,
            module: 'treasury',
            function: 'vote',
            typeArguments: [],
            arguments: [
              TREASURY_OBJECT_ID,
              proposalId,
              support
            ],
            gasBudget: 10000
          }
        }
      })

      if (tx.effects?.status?.status === 'success') {
        showToast(`Vote ${support ? 'for' : 'against'} recorded!`, 'success')

        // Update local user votes
        setUserVotes(prev => new Map(prev.set(proposalId, { support, timestamp: Date.now() })))

        await fetchProposals() // Refresh proposals
        return tx
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Failed to vote on proposal:', error)
      showToast('Failed to vote on proposal', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [signAndExecuteTransaction, TREASURY_PACKAGE_ID, TREASURY_OBJECT_ID, fetchProposals])

  /**
   * Execute a proposal
   */
  const executeProposal = useCallback(async (proposalId) => {
    if (!TREASURY_PACKAGE_ID) {
      throw new Error('Treasury package ID not configured')
    }

    try {
      setLoading(true)

      const tx = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data: {
            packageObjectId: TREASURY_PACKAGE_ID,
            module: 'treasury',
            function: 'execute_proposal',
            typeArguments: [],
            arguments: [
              TREASURY_OBJECT_ID,
              proposalId
            ],
            gasBudget: 20000
          }
        }
      })

      if (tx.effects?.status?.status === 'success') {
        showToast('Proposal executed successfully!', 'success')
        await fetchProposals() // Refresh proposals
        return tx
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Failed to execute proposal:', error)
      showToast('Failed to execute proposal', 'error')
      throw error
    } finally {
      setLoading(false)
    }
  }, [signAndExecuteTransaction, TREASURY_PACKAGE_ID, TREASURY_OBJECT_ID, fetchProposals])

  /**
   * Get user's voting power
   */
  const getVotingPower = useCallback(async (address) => {
    if (!suiClient || !TREASURY_OBJECT_ID || !address) return 0

    try {
      // This would depend on your governance token implementation
      // For now, return a mock value
      return 100 // Mock voting power
    } catch (error) {
      console.error('Failed to get voting power:', error)
      return 0
    }
  }, [suiClient, TREASURY_OBJECT_ID])

  // Load proposals on mount
  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return {
    proposals,
    loading,
    userVotes,
    createProposal,
    voteOnProposal,
    executeProposal,
    getVotingPower,
    refetch: fetchProposals
  }
}
