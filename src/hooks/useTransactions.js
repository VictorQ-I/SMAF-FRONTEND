import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

export const useTransactions = (params = {}) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 25
  })

  const fetchTransactions = async (newParams = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getTransactions({ ...params, ...newParams })
      
      if (response.success) {
        // El backend devuelve { data: { transactions: [], pagination: {} } }
        setTransactions(response.data?.transactions || [])
        setPagination(response.data?.pagination || pagination)
      } else {
        setError(response.error || 'Error al cargar transacciones')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const refetch = (newParams = {}) => {
    fetchTransactions(newParams)
  }

  const createTransaction = async (transactionData) => {
    try {
      const response = await apiService.createTransaction(transactionData)
      if (response.success) {
        // Refresh the list
        await fetchTransactions()
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateTransaction = async (id, data) => {
    try {
      const response = await apiService.updateTransaction(id, data)
      if (response.success) {
        // Update the transaction in the list
        setTransactions(prev => 
          prev.map(tx => tx.id === id ? response.data : tx)
        )
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return {
    transactions,
    loading,
    error,
    pagination,
    refetch,
    createTransaction,
    updateTransaction
  }
}

export const useTransactionStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    lowRisk: 0,
    mediumRisk: 0,
    highRisk: 0,
    pendingHighRisk: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getTransactionStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.error || 'Error al cargar estadísticas')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}