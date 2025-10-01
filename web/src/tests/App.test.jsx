import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WalletKitProvider } from '@mysten/wallet-kit'
import App from '../App'

// Mock wallet context
const MockWalletProvider = ({ children }) => (
  <WalletKitProvider features={[]} enableUnsafeBurner>
    {children}
  </WalletKitProvider>
)

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MockWalletProvider>
        <App />
      </MockWalletProvider>
    )
    
    expect(screen.getByText(/fund.*predict.*earn/i)).toBeInTheDocument()
  })

  it('displays landing page by default', () => {
    render(
      <MockWalletProvider>
        <App />
      </MockWalletProvider>
    )
    
    expect(screen.getByRole('heading', { name: /fund.*predict.*earn/i })).toBeInTheDocument()
    expect(screen.getByText(/explore campaigns/i)).toBeInTheDocument()
  })
})