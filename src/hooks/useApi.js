import { useState, useEffect } from 'react'
import { apiService } from '../services'

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiService.get(endpoint)
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Error al cargar datos')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (endpoint) {
      fetchData()
    }
  }, [endpoint])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiService.get(endpoint)
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Error al cargar datos')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}