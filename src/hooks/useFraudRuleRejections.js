import { useState, useEffect } from 'react'
import { fraudRulesAPI } from '../services/fraudRulesAPI'

/**
 * Hook personalizado para obtener estadísticas de rechazos por regla antifraude
 * @param {Object} filters - Filtros opcionales
 * @returns {Object} { stats, loading, error, refetch }
 */
export const useFraudRuleRejections = (filters = {}) => {
  const [stats, setStats] = useState({
    totalRejections: 0,
    rejectionsByType: [],
    rejectionsByRule: [],
    rejectionsByDay: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fraudRulesAPI.getRejectionStats(filters)
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.error?.message || 'Error al cargar estadísticas de rechazos')
      }
    } catch (err) {
      console.error('Error fetching fraud rule rejections:', err)
      setError(err.response?.data?.error?.message || 'Error al cargar estadísticas de rechazos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [JSON.stringify(filters)])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

/**
 * Hook para estadísticas de rechazos del dashboard
 * @returns {Object} { stats, loading, error, refetch }
 */
export const useDashboardRejectionStats = () => {
  const [stats, setStats] = useState({
    totalRejections: 0,
    lowAmountRejections: 0,
    blockedFranchiseRejections: 0,
    suspiciousDomainRejections: 0,
    emailWhitelistRejections: 0,
    blockedCardRejections: 0,
    cardWhitelistRejections: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fraudRulesAPI.getDashboardRejectionStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.error?.message || 'Error al cargar estadísticas de rechazos')
      }
    } catch (err) {
      console.error('Error fetching dashboard rejection stats:', err)
      setError(err.response?.data?.error?.message || 'Error al cargar estadísticas de rechazos')
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

/**
 * Hook para rechazos recientes
 * @param {number} limit - Límite de rechazos a obtener
 * @returns {Object} { rejections, loading, error, refetch }
 */
export const useRecentRejections = (limit = 10) => {
  const [rejections, setRejections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRejections = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fraudRulesAPI.getRecentRejections(limit)
      
      if (response.success) {
        setRejections(response.data.rejections)
      } else {
        setError(response.error?.message || 'Error al cargar rechazos recientes')
      }
    } catch (err) {
      console.error('Error fetching recent rejections:', err)
      setError(err.response?.data?.error?.message || 'Error al cargar rechazos recientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRejections()
  }, [limit])

  return {
    rejections,
    loading,
    error,
    refetch: fetchRejections
  }
}