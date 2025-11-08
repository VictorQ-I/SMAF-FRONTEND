import { apiService } from './api'

/**
 * Servicio API para gestión de transacciones
 */
class TransactionsAPI {
  /**
   * Crear nueva transacción (público - no requiere autenticación)
   */
  async createTransaction(transactionData) {
    // Hacer la petición sin token de autenticación
    const url = `${apiService.baseURL}/transactions`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transactionData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
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
  }

  /**
   * Obtener todas las transacciones con filtros
   */
  async getTransactions(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions'
    return apiService.get(endpoint)
  }

  /**
   * Obtener estadísticas de transacciones
   */
  async getTransactionStats() {
    return apiService.get('/transactions/stats')
  }

  /**
   * Obtener transacción por ID
   */
  async getTransactionById(id) {
    return apiService.get(`/transactions/${id}`)
  }

  /**
   * Aprobar transacción pendiente
   */
  async approveTransaction(id, reason) {
    return apiService.patch(`/transactions/${id}/approve`, { reason })
  }

  /**
   * Rechazar transacción pendiente
   */
  async rejectTransaction(id, reason) {
    return apiService.patch(`/transactions/${id}/reject`, { reason })
  }

  /**
   * Exportar transacciones a CSV
   */
  async exportTransactions(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/transactions/export?${queryString}` : '/transactions/export'
    return apiService.get(endpoint)
  }
}

export const transactionsAPI = new TransactionsAPI()
