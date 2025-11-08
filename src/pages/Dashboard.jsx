import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTransactionStats } from '../hooks/useTransactions'
import { useFraudRulesStats } from '../hooks/useFraudRulesStats'
import { Button } from '../components/ui'
import { PendingTransactionsDashboard } from '../components/transactions'
import RejectionStatsPanel from '../components/fraud-rules/RejectionStatsPanel'

const Dashboard = () => {
  const { user } = useAuth()
  const { stats, loading, error } = useTransactionStats()
  const { stats: rulesStats, loading: rulesLoading } = useFraudRulesStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar estadísticas: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Dashboard Anti-Fraude
          </h2>
          <p className="text-gray-600 mb-4">
            Bienvenido {user?.name}, al sistema de monitoreo anti-fraude SMAF
          </p>
          <div className="flex space-x-3">
            <a href="/transfer">
              <Button variant="primary">
                Nueva Transacción
              </Button>
            </a>
            <a href="/transactions">
              <Button variant="secondary">
                Ver Transacciones
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transacciones
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✓</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transacciones Aprobadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.approved.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">!</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pendientes de Revisión
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.pending.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">×</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Fraudes Detectados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.rejected?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por Tipo de Operación */}
      {stats.operationTypes && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Distribución por Tipo de Operación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-6-6h12" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.operationTypes.credit?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Operaciones de Crédito</div>
                    <div className="text-xs text-gray-500">
                      {stats.total > 0 ? ((stats.operationTypes.credit || 0) / stats.total * 100).toFixed(1) : 0}% del total
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.operationTypes.debit?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Operaciones de Débito</div>
                    <div className="text-xs text-gray-500">
                      {stats.total > 0 ? ((stats.operationTypes.debit || 0) / stats.total * 100).toFixed(1) : 0}% del total
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions for Admins */}
      {user?.role === 'admin' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/create-client"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Crear Cliente</p>
                  <p className="text-sm text-gray-500">Registrar nuevo usuario</p>
                </div>
              </Link>
              
              <Link
                to="/fraud-rules"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Reglas Antifraude</p>
                  <p className="text-sm text-gray-500">Configurar reglas</p>
                </div>
              </Link>
              
              <Link
                to="/fraud-rules/rejections"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Rechazos por Regla</p>
                  <p className="text-sm text-gray-500">Ver estadísticas</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transactions Dashboard - Only for Analysts and Admins */}
      {(user?.role === 'admin' || user?.role === 'analyst') && (
        <PendingTransactionsDashboard />
      )}

      {/* Recent Transactions Widget */}
      {stats.recentTransactions && stats.recentTransactions.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Transacciones Recientes
              </h3>
              <a
                href="/transactions"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas →
              </a>
            </div>
            <div className="space-y-3">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      transaction.status === 'approved' ? 'bg-green-500' :
                      transaction.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.transactionId}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'approved' ? 'Aprobada' :
                           transaction.status === 'pending' ? 'Pendiente' :
                           'Rechazada'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                        <span className="font-semibold text-gray-900">${parseFloat(transaction.amount || 0).toFixed(2)}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.operationType === 'credit' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {transaction.operationType === 'credit' ? 'Crédito' : 
                           transaction.operationType === 'debit' ? 'Débito' : 'Crédito'}
                        </span>
                        <span>•</span>
                        <span className="truncate">{transaction.customerEmail}</span>
                        <span>•</span>
                        <span>{new Date(transaction.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      transaction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.riskLevel === 'high' ? 'Alto' :
                       transaction.riskLevel === 'medium' ? 'Medio' :
                       'Bajo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status Chart */}
      {stats.total > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Distribución de Transacciones por Estado
            </h3>
            <div className="space-y-4">
              {/* Approved */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Aprobadas</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.approved} ({stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Pendientes</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {stats.pending} ({stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Rejected */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Rechazadas</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.rejected || 0} ({stats.total > 0 ? (((stats.rejected || 0) / stats.total) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? ((stats.rejected || 0) / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Resumen del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Estado del Usuario</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nombre:</span>
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rol:</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user?.role === 'analyst' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role === 'admin' ? 'Administrador' :
                     user?.role === 'analyst' ? 'Analista' : 'Viewer'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Métricas de Rendimiento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de Aprobación:</span>
                  <span className="text-sm font-medium text-green-600">
                    {stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de Fraude:</span>
                  <span className="text-sm font-medium text-red-600">
                    {stats.total > 0 ? (((stats.rejected || 0) / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes:</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Reglas Antifraude */}
      {!rulesLoading && rulesStats.totalRules > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Reglas Antifraude Configuradas
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="text-lg font-semibold text-gray-900">{rulesStats.totalRules}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {Object.entries(rulesStats.statsByType).map(([type, data]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{data.count}</div>
                  <div className="text-xs text-gray-600 mt-1">{data.label}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Reglas Recientes</h4>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-gray-600">Activas: {rulesStats.totalActive}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                    <span className="text-gray-600">Inactivas: {rulesStats.totalInactive}</span>
                  </div>
                </div>
              </div>

              {rulesStats.recentRules.length > 0 ? (
                <div className="space-y-2">
                  {rulesStats.recentRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                          <div className="text-xs text-gray-500">
                            Creada por {rule.createdBy} • {new Date(rule.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {rulesStats.statsByType[rule.ruleType]?.label || rule.ruleType}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay reglas recientes</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel de Rechazos por Regla Antifraude */}
      <RejectionStatsPanel />
    </div>
  )
}

export default Dashboard