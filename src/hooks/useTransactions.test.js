import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTransactions, useTransactionStats } from './useTransactions'
import { apiService } from '../services/api'

// Mock del apiService
vi.mock('../services/api', () => ({
  apiService: {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    getTransactionStats: vi.fn()
  }
}))

describe('useTransactions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useTransactions())

    expect(result.current.transactions).toEqual([])
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(result.current.pagination).toEqual({
      page: 1,
      pages: 1,
      total: 0,
      limit: 25
    })
    expect(typeof result.current.refetch).toBe('function')
    expect(typeof result.current.createTransaction).toBe('function')
    expect(typeof result.current.updateTransaction).toBe('function')
  })

  it('fetches transactions successfully', async () => {
    const mockTransactions = [
      { id: 1, amount: 100, status: 'approved' },
      { id: 2, amount: 200, status: 'pending' }
    ]
    const mockPagination = { page: 1, pages: 2, total: 10, limit: 25 }

    apiService.getTransactions.mockResolvedValue({
      success: true,
      data: {
        transactions: mockTransactions,
        pagination: mockPagination
      }
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toEqual(mockTransactions)
    expect(result.current.pagination).toEqual(mockPagination)
    expect(result.current.error).toBeNull()
  })

  it('handles API error response', async () => {
    apiService.getTransactions.mockResolvedValue({
      success: false,
      error: 'Failed to fetch transactions'
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.error).toBe('Failed to fetch transactions')
  })

  it('handles network errors', async () => {
    apiService.getTransactions.mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.transactions).toEqual([])
    expect(result.current.error).toBe('Network Error')
  })

  it('refetch works with new parameters', async () => {
    const mockTransactions = [{ id: 1, amount: 100 }]
    apiService.getTransactions.mockResolvedValue({
      success: true,
      data: { transactions: mockTransactions, pagination: {} }
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear mock and set new response
    vi.clearAllMocks()
    const newTransactions = [{ id: 2, amount: 200 }]
    apiService.getTransactions.mockResolvedValue({
      success: true,
      data: { transactions: newTransactions, pagination: {} }
    })

    await act(async () => {
      result.current.refetch({ status: 'approved' })
    })

    await waitFor(() => {
      expect(result.current.transactions).toEqual(newTransactions)
    })

    expect(apiService.getTransactions).toHaveBeenCalledWith({ status: 'approved' })
  })

  it('createTransaction works correctly', async () => {
    const mockTransaction = { id: 1, amount: 100 }
    apiService.getTransactions.mockResolvedValue({
      success: true,
      data: { transactions: [], pagination: {} }
    })
    apiService.createTransaction.mockResolvedValue({
      success: true,
      data: mockTransaction
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let createResult
    await act(async () => {
      createResult = await result.current.createTransaction({ amount: 100 })
    })

    expect(createResult).toEqual({ success: true, data: mockTransaction })
    expect(apiService.createTransaction).toHaveBeenCalledWith({ amount: 100 })
    // Should refetch transactions after creation
    expect(apiService.getTransactions).toHaveBeenCalledTimes(2)
  })

  it('updateTransaction works correctly', async () => {
    const initialTransactions = [
      { id: 1, amount: 100, status: 'pending' },
      { id: 2, amount: 200, status: 'approved' }
    ]
    const updatedTransaction = { id: 1, amount: 100, status: 'approved' }

    apiService.getTransactions.mockResolvedValue({
      success: true,
      data: { transactions: initialTransactions, pagination: {} }
    })
    apiService.updateTransaction.mockResolvedValue({
      success: true,
      data: updatedTransaction
    })

    const { result } = renderHook(() => useTransactions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let updateResult
    await act(async () => {
      updateResult = await result.current.updateTransaction(1, { status: 'approved' })
    })

    expect(updateResult).toEqual({ success: true, data: updatedTransaction })
    expect(apiService.updateTransaction).toHaveBeenCalledWith(1, { status: 'approved' })
    
    // Check that the transaction was updated in the list
    expect(result.current.transactions).toEqual([
      updatedTransaction,
      { id: 2, amount: 200, status: 'approved' }
    ])
  })
})

describe('useTransactionStats Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useTransactionStats())

    expect(result.current.stats).toEqual({
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      lowRisk: 0,
      mediumRisk: 0,
      highRisk: 0,
      pendingHighRisk: 0
    })
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.refetch).toBe('function')
  })

  it('fetches stats successfully', async () => {
    const mockStats = {
      total: 100,
      approved: 80,
      rejected: 15,
      pending: 5,
      lowRisk: 70,
      mediumRisk: 25,
      highRisk: 5,
      pendingHighRisk: 2
    }

    apiService.getTransactionStats.mockResolvedValue({
      success: true,
      data: mockStats
    })

    const { result } = renderHook(() => useTransactionStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.error).toBeNull()
  })

  it('handles API error response', async () => {
    apiService.getTransactionStats.mockResolvedValue({
      success: false,
      error: 'Failed to fetch stats'
    })

    const { result } = renderHook(() => useTransactionStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch stats')
  })

  it('refetch works correctly', async () => {
    const initialStats = { total: 50, approved: 40 }
    const updatedStats = { total: 100, approved: 80 }

    apiService.getTransactionStats.mockResolvedValueOnce({
      success: true,
      data: initialStats
    })

    const { result } = renderHook(() => useTransactionStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stats).toEqual(initialStats)

    // Mock new response for refetch
    apiService.getTransactionStats.mockResolvedValueOnce({
      success: true,
      data: updatedStats
    })

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.stats).toEqual(updatedStats)
    })
  })
})