import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import LowAmountRulesPanel from '../components/fraud-rules/panels/LowAmountRulesPanel'
import BlockedFranchisesPanel from '../components/fraud-rules/panels/BlockedFranchisesPanel'
import SuspiciousDomainsPanel from '../components/fraud-rules/panels/SuspiciousDomainsPanel'
import EmailWhitelistPanel from '../components/fraud-rules/panels/EmailWhitelistPanel'
import BlockedCardsPanel from '../components/fraud-rules/panels/BlockedCardsPanel'
import CardWhitelistPanel from '../components/fraud-rules/panels/CardWhitelistPanel'
import AuditLogViewer from '../components/fraud-rules/AuditLogViewer'

/**
 * Página principal de gestión de reglas antifraude
 * Solo accesible para administradores
 */
const RulesManagementPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('low_amount')

  // Verificar que el usuario sea administrador
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const tabs = [
    {
      id: 'low_amount',
      label: 'Montos Bajos',
      icon: '💰',
      component: LowAmountRulesPanel
    },
    {
      id: 'blocked_franchise',
      label: 'Franquicias Bloqueadas',
      icon: '🚫',
      component: BlockedFranchisesPanel
    },
    {
      id: 'suspicious_domain',
      label: 'Dominios Sospechosos',
      icon: '⚠️',
      component: SuspiciousDomainsPanel
    },
    {
      id: 'email_whitelist',
      label: 'Lista Blanca Correos',
      icon: '✅',
      component: EmailWhitelistPanel
    },
    {
      id: 'blocked_card',
      label: 'Tarjetas Bloqueadas',
      icon: '💳',
      component: BlockedCardsPanel
    },
    {
      id: 'card_whitelist',
      label: 'Lista Blanca Tarjetas',
      icon: '💚',
      component: CardWhitelistPanel
    },
    {
      id: 'audit_logs',
      label: 'Logs de Auditoría',
      icon: '📋',
      component: AuditLogViewer
    }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuración de Reglas Antifraude
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona las reglas de detección de fraude y listas blancas/negras
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                Administrador
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  )
}

export default RulesManagementPage
