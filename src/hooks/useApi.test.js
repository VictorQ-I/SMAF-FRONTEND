import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from './useApi'
import { apiService } from '../services'

// Mock del apiService
vi.mock('../services', () => ({
  apiService: {
    get: vi.fn()
  }
}))

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useApi('/test-endpoint'))

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()
    expect(typeof result.current.refetch).toBe('function')
  })

  it('does not fetch when endpoint is not provided', () => {
    renderHook(() => useApi())

    expect(apiService.get).not.toHaveBeenCalled()
  })

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test Data' }
    apiService.get.mockResolvedValue({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(apiService.get).toHaveBeenCalledWith('/test-endpoint')
  })

  it('handles API error response', async () => {
    apiService.get.mockResolvedValue({
      success: false,
      error: 'API Error'
    })

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('API Error')
  })

  it('handles API error response without error message', async () => {
    apiService.get.mockResolvedValue({
      success: false
    })

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Error al cargar datos')
  })

  it('handles network/exception errors', async () => {
    apiService.get.mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network Error')
  })

  it('refetch function works correctly', async () => {
    const mockData = { id: 1, name: 'Test Data' }
    apiService.get.mockResolvedValue({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock to test refetch
    vi.clearAllMocks()
    apiService.get.mockResolvedValue({
      success: true,
      data: { id: 2, name: 'Updated Data' }
    })

    // Call refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual({ id: 2, name: 'Updated Data' })
    })

    expect(apiService.get).toHaveBeenCalledWith('/test-endpoint')
  })

  it('refetch handles errors correctly', async () => {
    const mockData = { id: 1, name: 'Test Data' }
    apiService.get.mockResolvedValue({
      success: true,
      data: mockData
    })

    const { result } = renderHook(() => useApi('/test-endpoint'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock error for refetch
    apiService.get.mockRejectedValue(new Error('Refetch Error'))

    // Call refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.error).toBe('Refetch Error')
    })

    expect(result.current.loading).toBe(false)
  })
})