import { useState, useEffect } from 'react'
import { fraudRulesAPI } from '../services/fraudRulesAPI'

/**
 * Hook personalizado para obtener estadísticas de reglas antifraude
 * @returns {Object} { stats, loading, error, refetch }
 */
export const useFraudRulesStats = () => {
  const [stats, setStats] = useState({
    totalRules: 0,
    totalActive: 0,
    totalInactive: 0,
    statsByType: {},
    recentRules: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fraudRulesAPI.getRulesStats()
      
      if (response.success) {
        setStats(response.data)
      } else {
        setError(response.error?.message || 'Error al cargar estadísticas')
      }
    } catch (err) {
      console.error('Error fetching fraud rules stats:', err)
      setError(err.response?.data?.error?.message || 'Error al cargar estadísticas de reglas')
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
