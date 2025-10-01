import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useAppStore } from '../../stores/useAppStore'

// Mock dependencies
vi.mock('../../stores/useAppStore')
vi.mock('../../hooks/useWalletClient')
vi.mock('../../hooks/useReadOnChain')

describe('useCampaigns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates campaign successfully', async () => {
    const mockExecuteTransaction = vi.fn().mockResolvedValue({
      events: [{
        type: 'CampaignCreated',
        parsedJson: {
          campaign_id: '123',
          creator: '0x123'
        }
      }]
    })

    const mockAddCampaign = vi.fn()
    
    useAppStore.mockReturnValue({
      addCampaign: mockAddCampaign,
      setLoading: vi.fn()
    })

    const { result } = renderHook(() => useCampaigns())
    
    const campaignData = {
      title: 'Test Campaign',
      description: 'Test Description',
      goal: '10',
      deadline: '2024-12-31',
      beneficiaries: [{ address: '0x123', percentage: '100' }]
    }

    await act(async () => {
      await result.current.createCampaign(campaignData)
    })

    expect(mockAddCampaign).toHaveBeenCalled()
  })
})