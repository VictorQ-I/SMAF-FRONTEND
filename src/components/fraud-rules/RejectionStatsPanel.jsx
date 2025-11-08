import React from 'react'
import { useDashboardRejectionStats } from '../../hooks/useFraudRuleRejections'

/**
 * Panel de estadísticas de rechazos por regla antifraude
 * Muestra el conteo de rechazos por tipo de regla
 */
const RejectionStatsPanel = () => {
  const { stats, loading, error } = useDashboardRejectionStats()

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>Error al cargar estadísticas de rechazos</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const ruleTypeLabels = {
    lowAmountRejections: 'Montos Bajos',
    blockedFranchiseRejections: 'Franquicias Bloqueadas',
    suspiciousDomainRejections: 'Dominios Sospechosos',
    emailWhitelistRejections: 'Lista Blanca de Correos',
    blockedCardRejections: 'Tarjetas Bloqueadas',
    cardWhitelistRejections: 'Lista Blanca de Tarjetas'
  }

  const ruleTypeColors = {
    lowAmountRejections: 'text-green-600',
    blockedFranchiseRejections: 'text-red-600',
    suspiciousDomainRejections: 'text-orange-600',
    emailWhitelistRejections: 'text-blue-600',
    blockedCardRejections: 'text-purple-600',
    cardWhitelistRejections: 'text-indigo-600'
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Rechazos por Regla Antifraude
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {stats.totalRejections}
            </span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Conteo de transacciones rechazadas por cada tipo de regla (últimos 30 días)
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(ruleTypeLabels).map(([key, label]) => (
            <div key={key} className="text-center">
              <div className={`text-2xl font-bold ${ruleTypeColors[key]}`}>
                {stats[key] || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>

        {stats.totalRejections === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">
              🎉 ¡Excelente!
            </div>
            <p className="text-gray-500">
              No hay rechazos por reglas antifraude en los últimos 30 días
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RejectionStatsPanel