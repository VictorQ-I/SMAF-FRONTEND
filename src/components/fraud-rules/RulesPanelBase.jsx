import { useState, useEffect, useCallback } from 'react'
import { fraudRulesAPI } from '../../services/fraudRulesAPI'
import RuleFormModal from './RuleFormModal'

/**
 * Componente base reutilizable para gestión de reglas antifraude
 * @param {Object} props
 * @param {string} props.ruleType - Tipo de regla
 * @param {string} props.title - Título del panel
 * @param {string} props.description - Descripción del panel
 * @param {Array} props.columns - Definición de columnas de la tabla
 * @param {Array} props.formFields - Definición de campos del formulario
 * @param {number} props.scoreImpact - Impacto fijo en el score (opcional)
 */
const RulesPanelBase = ({
  ruleType,
  title,
  description,
  columns,
  formFields,
  scoreImpact
}) => {
  const [rules, setRules] = useState([])
  const [selectedRule, setSelectedRule] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    isActive: undefined,
    page: 1,
    limit: 20,
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })

  // Fetch rules
  const fetchRules = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fraudRulesAPI.getRules({
        ruleType,
        ...filters
      })
      
      if (response.success) {
        setRules(response.data.rules)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las reglas')
      console.error('Error fetching rules:', err)
    } finally {
      setIsLoading(false)
    }
  }, [ruleType, filters])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  // Handle create
  const handleCreate = () => {
    setSelectedRule(null)
    setIsModalOpen(true)
  }

  // Handle edit
  const handleEdit = (rule) => {
    setSelectedRule(rule)
    setIsModalOpen(true)
  }

  // Handle delete
  const handleDelete = async (ruleId) => {
    const reason = prompt('Por favor, ingresa la razón para eliminar esta regla (mínimo 10 caracteres):')
    
    if (!reason || reason.length < 10) {
      alert('La razón debe tener al menos 10 caracteres')
      return
    }

    if (!confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      return
    }

    try {
      const response = await fraudRulesAPI.deleteRule(ruleId, reason)
      
      if (response.success) {
        alert('Regla eliminada exitosamente')
        fetchRules()
      }
    } catch (err) {
      alert(err.message || 'Error al eliminar la regla')
      console.error('Error deleting rule:', err)
    }
  }

  // Handle toggle status
  const handleToggleStatus = async (ruleId, currentStatus) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'activar' : 'desactivar'
    const reason = prompt(`Por favor, ingresa la razón para ${action} esta regla (mínimo 10 caracteres):`)
    
    if (!reason || reason.length < 10) {
      alert('La razón debe tener al menos 10 caracteres')
      return
    }

    if (!confirm(`¿Estás seguro de que deseas ${action} esta regla?`)) {
      return
    }

    try {
      const response = await fraudRulesAPI.toggleRuleStatus(ruleId, newStatus, reason)
      
      if (response.success) {
        alert(`Regla ${action === 'activar' ? 'activada' : 'desactivada'} exitosamente`)
        fetchRules()
      }
    } catch (err) {
      alert(err.message || 'Error al cambiar el estado de la regla')
      console.error('Error toggling rule status:', err)
    }
  }

  // Handle import
  const handleImport = async (file) => {
    // TODO: Implement CSV parsing and import
    alert('Funcionalidad de importación en desarrollo')
  }

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fraudRulesAPI.exportRules({ ruleType })
      
      if (response.success) {
        // Convert to CSV and download
        const csvContent = convertToCSV(response.data)
        downloadCSV(csvContent, `${ruleType}_rules.csv`)
      }
    } catch (err) {
      alert(err.message || 'Error al exportar las reglas')
      console.error('Error exporting rules:', err)
    }
  }

  // Helper: Convert to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const rows = data.map(row => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    )
    
    return [headers.join(','), ...rows].join('\n')
  }

  // Helper: Download CSV
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }))
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Status filter */}
          <select
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Exportar CSV
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nueva Regla
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando reglas...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && rules.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  {columns.map((column, index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(rule) : rule[column.field]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(rule.id, rule.isActive)}
                        className={`${rule.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        title={rule.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {rule.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No se encontraron reglas</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear primera regla
          </button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && rules.length > 0 && pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} reglas
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {pagination.page} de {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Rule Form Modal */}
      <RuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRules}
        initialData={selectedRule}
        fields={formFields}
        ruleType={ruleType}
        scoreImpact={scoreImpact}
        title={selectedRule ? `Editar ${title}` : `Nueva ${title}`}
      />
    </div>
  )
}

export default RulesPanelBase
