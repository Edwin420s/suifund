import { describe, it, expect } from 'vitest'
import { formatSUI, formatAddress, calculateProgress } from '../../utils/format'

describe('format utilities', () => {
  describe('formatSUI', () => {
    it('formats SUI amount correctly', () => {
      expect(formatSUI(1000000000)).toBe('1.00 SUI')
      expect(formatSUI(1500000000)).toBe('1.50 SUI')
      expect(formatSUI(0)).toBe('0 SUI')
    })

    it('handles undefined input', () => {
      expect(formatSUI()).toBe('0 SUI')
      expect(formatSUI(null)).toBe('0 SUI')
    })
  })

  describe('formatAddress', () => {
    it('formats address correctly', () => {
      const address = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      expect(formatAddress(address)).toBe('0x1234...cdef')
    })

    it('handles short addresses', () => {
      expect(formatAddress('0x123')).toBe('0x123')
    })
  })

  describe('calculateProgress', () => {
    it('calculates progress correctly', () => {
      expect(calculateProgress(50, 100)).toBe(50)
      expect(calculateProgress(0, 100)).toBe(0)
      expect(calculateProgress(100, 100)).toBe(100)
      expect(calculateProgress(150, 100)).toBe(100) // Should cap at 100%
    })

    it('handles zero goal', () => {
      expect(calculateProgress(50, 0)).toBe(0)
    })
  })
})