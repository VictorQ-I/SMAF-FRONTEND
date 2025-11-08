import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiService } from './api'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.location
delete window.location
window.location = { href: '' }

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Management', () => {
    it('gets auth token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token')
      
      const token = apiService.getAuthToken()
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('smaf_token')
      expect(token).toBe('test-token')
    })

    it('sets auth token in localStorage', () => {
      apiService.setAuthToken('new-token')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smaf_token', 'new-token')
    })

    it('removes auth token from localStorage', () => {
      apiService.removeAuthToken()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('smaf_token')
    })
  })

  describe('HTTP Methods', () => {
    it('makes GET request correctly', async () => {
      const mockResponse = { success: true, data: { id: 1 } }
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('makes POST request with data', async () => {
      const mockResponse = { success: true }
      const postData = { name: 'test' }
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.post('/test', postData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('includes auth token in headers when available', async () => {
      localStorageMock.getItem.mockReturnValue('auth-token')
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      })

      await apiService.get('/test')

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer auth-token'
          })
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('handles 401 errors by removing token and redirecting', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })

      await apiService.get('/test')

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('smaf_token')
      expect(window.location.href).toBe('/login')
    })

    it('does not redirect on 401 if no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      })

      await expect(apiService.get('/test')).rejects.toThrow()
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
    })

    it('throws error for non-401 HTTP errors', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server Error' })
      })

      await expect(apiService.get('/test')).rejects.toThrow('Server Error')
    })

    it('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network Error'))

      await expect(apiService.get('/test')).rejects.toThrow('Network Error')
    })
  })

  describe('Auth Methods', () => {
    it('login sets token on success', async () => {
      const mockResponse = { success: true, token: 'new-token', data: { id: 1 } }
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.login('test@example.com', 'password')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        })
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smaf_token', 'new-token')
      expect(result).toEqual(mockResponse)
    })

    it('register sets token on success', async () => {
      const userData = { email: 'test@example.com', password: 'password', name: 'Test' }
      const mockResponse = { success: true, token: 'new-token', data: { id: 1 } }
      
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await apiService.register(userData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      )
      expect(localStorageMock.setItem).toHaveBeenCalledWith('smaf_token', 'new-token')
      expect(result).toEqual(mockResponse)
    })

    it('logout removes token and redirects', () => {
      apiService.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('smaf_token')
      expect(window.location.href).toBe('/login')
    })
  })

  describe('Transaction Methods', () => {
    it('getTransactions filters empty parameters', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })

      await apiService.getTransactions({
        status: 'approved',
        amount: '',
        date: null,
        type: undefined
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions?status=approved'),
        expect.any(Object)
      )
    })

    it('createTransaction makes POST request', async () => {
      const transactionData = { amount: 100, recipient: 'test' }
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await apiService.createTransaction(transactionData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(transactionData)
        })
      )
    })

    it('approveTransaction makes PATCH request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await apiService.approveTransaction(123, 'Approved by admin')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/transactions/123/approve'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ reason: 'Approved by admin' })
        })
      )
    })
  })

  describe('Health Check', () => {
    it('makes health check request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      })

      const result = await apiService.healthCheck()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual({ status: 'ok' })
    })
  })
})