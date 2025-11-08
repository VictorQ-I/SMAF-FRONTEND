import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { useFraudRuleRejections, useRecentRejections } from '../hooks/useFraudRuleRejections'

/**
 * Página de estadísticas detalladas de rechazos por regla antifraude
 * Solo accesible para administradores y analistas
 */
const RejectionStatsPage = () => {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ruleType: ''
  })

  const { stats, loading, error, refetch } = useFraudRuleRejections(filters)
  const { rejections, loading: rejectionsLoading } = useRecentRejections(20)

  // Verificar permisos
  if (!user || !['admin', 'analyst'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      ruleType: ''
    })
  }

  const ruleTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'low_amount', label: 'Montos Bajos' },
    { value: 'blocked_franchise', label: 'Franquicias Bloqueadas' },
    { value: 'suspicious_domain', label: 'Dominios Sospechosos' },
    { value: 'email_whitelist', label: 'Lista Blanca de Correos' },
    { value: 'blocked_card', label: 'Tarjetas Bloqueadas' },
    { value: 'card_whitelist', label: 'Lista Blanca de Tarjetas' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Estadísticas de Rechazos por Regla Antifraude
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis detallado de transacciones rechazadas por reglas antifraude
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de regla
              </label>
              <select
                value={filters.ruleType}
                onChange={(e) => handleFilterChange('ruleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ruleTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estadísticas principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.totalRejections}
                  </div>
                  <div className="text-sm text-gray-500">Total Rechazos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.rejectionsByType.length}
                  </div>
                  <div className="text-sm text-gray-500">Tipos de Regla Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.rejectionsByRule.length}
                  </div>
                  <div className="text-sm text-gray-500">Reglas con Rechazos</div>
                </div>
              </div>
            </div>

            {/* Rechazos por tipo */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rechazos por Tipo de Regla</h3>
              {stats.rejectionsByType.length > 0 ? (
                <div className="space-y-3">
                  {stats.rejectionsByType.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">
                          {ruleTypeOptions.find(opt => opt.value === item.ruleType)?.label || item.ruleType}
                        </div>
                        <div className="text-sm text-gray-500">
                          Score promedio: {item.avgFraudScore}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {item.rejectionCount}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.totalAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay rechazos en el período seleccionado
                </div>
              )}
            </div>

            {/* Rechazos por regla específica */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Reglas con Más Rechazos</h3>
              {stats.rejectionsByRule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Regla
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rechazos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.rejectionsByRule.map((rule, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {rule.ruleName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {rule.ruleDescription}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ruleTypeOptions.find(opt => opt.value === rule.ruleType)?.label || rule.ruleType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-red-600">
                              {rule.rejectionCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(rule.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay reglas con rechazos en el período seleccionado
                </div>
              )}
            </div>
          </div>

          {/* Rechazos recientes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rechazos Recientes</h3>
            {rejectionsLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : rejections.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rejections.map((rejection, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {rejection.ruleName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(rejection.rejectedAt)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {rejection.rejectionReason}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatCurrency(rejection.transactionAmount)}</span>
                      <span>Score: {rejection.fraudScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay rechazos recientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RejectionStatsPage