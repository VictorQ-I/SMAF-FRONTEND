import { API_BASE_URL } from '../utils/constants'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getAuthToken() {
    return localStorage.getItem('smaf_token')
  }

  setAuthToken(token) {
    localStorage.setItem('smaf_token', token)
  }

  removeAuthToken() {
    localStorage.removeItem('smaf_token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Solo cerrar sesión si realmente hay un token (no en rutas públicas)
          if (this.getAuthToken()) {
            this.removeAuthToken()
            window.location.href = '/login'
            return
          }
        }
        
        const errorData = await response.json().catch(() => ({}))
        
        // Crear error con más información
        const error = new Error(
          errorData.error?.message || 
          errorData.message || 
          errorData.error || 
          `HTTP error! status: ${response.status}`
        )
        error.response = {
          status: response.status,
          data: errorData
        }
        throw error
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Auth methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password })
    if (response.success && response.token) {
      this.setAuthToken(response.token)
    }
    return response
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData)
    if (response.success && response.token) {
      this.setAuthToken(response.token)
    }
    return response
  }

  async getCurrentUser() {
    return this.get('/auth/me')
  }

  logout() {
    this.removeAuthToken()
    window.location.href = '/login'
  }

  // Transaction methods
  async getTransactions(params = {}) {
    // Filtrar parámetros vacíos
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    
    const queryString = new URLSearchParams(filteredParams).toString()
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions'
    return this.get(endpoint)
  }

  async getTransaction(id) {
    return this.get(`/transactions/${id}`)
  }

  async createTransaction(transactionData) {
    return this.post('/transactions', transactionData)
  }

  async updateTransaction(id, data) {
    return this.put(`/transactions/${id}`, data)
  }

  async getTransactionStats() {
    return this.get('/transactions/stats')
  }

  async approveTransaction(id, reason) {
    return this.patch(`/transactions/${id}/approve`, { reason })
  }

  async rejectTransaction(id, reason) {
    return this.patch(`/transactions/${id}/reject`, { reason })
  }

  async exportTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/transactions/export?${queryString}` : '/transactions/export'
    return this.get(endpoint)
  }

  // Health check
  async healthCheck() {
    return this.get('/health')
  }
}

export const apiService = new ApiService()