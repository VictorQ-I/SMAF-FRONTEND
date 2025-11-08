import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui'
import TransactionDetailsModal from './TransactionDetailsModal'
import { apiService } from '../../services/api'

const PendingTransactionsDashboard = () => {
  const { user } = useAuth()
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    oldest: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Only show for analysts and admins
  const canView = user?.role === 'admin' || user?.role === 'analyst'

  const fetchPendingTransactions = async () => {
    if (!canView) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await apiService.getTransactions({
        status: 'pending',
        limit: 5,
        page: 1
      })

      if (response.success) {
        const transactions = response.data.transactions || []
        setPendingTransactions(transactions)

        // Calculate stats
        const highRiskCount = transactions.filter(t => t.riskLevel === 'high').length
        const oldest = transactions.length > 0 
          ? transactions.reduce((oldest, current) => 
              new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest
            )
          : null

        setStats({
          total: response.data.pagination?.total || 0,
          highRisk: highRiskCount,
          oldest
        })
      } else {
        setError(response.error || 'Error al cargar transacciones pendientes')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingTransactions()
  }, [canView])

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleTransactionUpdated = () => {
    fetchPendingTransactions()
  }

  if (!canView) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Alert for High Risk Transactions */}
        {stats.highRisk > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ Alerta de Alto Riesgo
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    Hay {stats.highRisk} transacción{stats.highRisk !== 1 ? 'es' : ''} pendiente{stats.highRisk !== 1 ? 's' : ''} de alto riesgo que requiere{stats.highRisk !== 1 ? 'n' : ''} revisión inmediata.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Pending */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Transacciones Pendientes
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* High Risk */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Alto Riesgo
                  </dt>
                  <dd className="text-2xl font-bold text-red-600">
                    {stats.highRisk}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Oldest Pending */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Más Antigua
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {stats.oldest 
                      ? `${Math.floor((Date.now() - new Date(stats.oldest.createdAt)) / (1000 * 60 * 60 * 24))} días`
                      : 'N/A'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Transactions List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Transacciones Pendientes Recientes
              </h3>
              <a
                href="/transactions?status=pending"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas →
              </a>
            </div>
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                No hay transacciones pendientes de revisión
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                          transaction.riskLevel === 'high' ? 'bg-red-500' :
                          transaction.riskLevel === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {transaction.transactionId}
                            </p>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              transaction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                              transaction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.riskLevel === 'high' ? 'Alto Riesgo' :
                               transaction.riskLevel === 'medium' ? 'Riesgo Medio' :
                               'Bajo Riesgo'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="font-semibold text-gray-900">
                              ${parseFloat(transaction.amount || 0).toFixed(2)}
                            </span>
                            <span>•</span>
                            <span>{transaction.customerEmail}</span>
                            <span>•</span>
                            <span>
                              {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {transaction.fraudReasons && (
                            <p className="mt-1 text-xs text-gray-500 truncate">
                              {transaction.fraudReasons}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        Revisar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedTransaction(null)
          }}
          onTransactionUpdated={handleTransactionUpdated}
        />
      )}
    </>
  )
}

export default PendingTransactionsDashboard
