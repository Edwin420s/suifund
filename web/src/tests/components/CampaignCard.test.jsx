import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CampaignCard from '../../components/campaign/CampaignCard'

const mockCampaign = {
  id: '1',
  title: 'Test Campaign',
  description: 'Test description for the campaign',
  goal: 1000000000,
  raised: 500000000,
  deadline: Date.now() + 86400000,
  creator: '0x123',
  backers: 10,
  status: 'active'
}

describe('CampaignCard', () => {
  it('renders campaign information correctly', () => {
    const mockOnClick = vi.fn()
    
    render(<CampaignCard campaign={mockCampaign} onClick={mockOnClick} />)
    
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('Test description for the campaign')).toBeInTheDocument()
    expect(screen.getByText('0.50 SUI')).toBeInTheDocument() // raised
    expect(screen.getByText('1.00 SUI')).toBeInTheDocument() // goal
  })

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn()
    
    render(<CampaignCard campaign={mockCampaign} onClick={mockOnClick} />)
    
    fireEvent.click(screen.getByText('View Details'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})