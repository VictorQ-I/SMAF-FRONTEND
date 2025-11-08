import { apiService } from './api'

/**
 * Servicio API para gestión de reglas antifraude
 */
class FraudRulesAPI {
  /**
   * Obtener todas las reglas con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.ruleType - Tipo de regla
   * @param {boolean} filters.isActive - Estado activo/inactivo
   * @param {number} filters.page - Página actual
   * @param {number} filters.limit - Límite de resultados
   * @param {string} filters.search - Término de búsqueda
   * @returns {Promise} Respuesta con reglas y paginación
   */
  async getRules(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/fraud-rules?${queryString}` : '/fraud-rules'
    return apiService.get(endpoint)
  }

  /**
   * Obtener regla por ID
   * @param {number} id - ID de la regla
   * @returns {Promise} Respuesta con la regla
   */
  async getRuleById(id) {
    return apiService.get(`/fraud-rules/${id}`)
  }

  /**
   * Crear nueva regla
   * @param {Object} ruleData - Datos de la regla
   * @returns {Promise} Respuesta con la regla creada
   */
  async createRule(ruleData) {
    return apiService.post('/fraud-rules', ruleData)
  }

  /**
   * Actualizar regla existente
   * @param {number} id - ID de la regla
   * @param {Object} ruleData - Datos actualizados
   * @returns {Promise} Respuesta con la regla actualizada
   */
  async updateRule(id, ruleData) {
    return apiService.put(`/fraud-rules/${id}`, ruleData)
  }

  /**
   * Eliminar regla
   * @param {number} id - ID de la regla
   * @param {string} reason - Razón de eliminación
   * @returns {Promise} Respuesta de confirmación
   */
  async deleteRule(id, reason) {
    return apiService.request(`/fraud-rules/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    })
  }

  /**
   * Activar/Desactivar regla
   * @param {number} id - ID de la regla
   * @param {boolean} isActive - Nuevo estado
   * @param {string} reason - Razón del cambio
   * @returns {Promise} Respuesta con la regla actualizada
   */
  async toggleRuleStatus(id, isActive, reason) {
    return apiService.request(`/fraud-rules/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, reason })
    })
  }

  /**
   * Importar reglas desde CSV
   * @param {Array} csvData - Datos del CSV parseados
   * @param {string} ruleType - Tipo de regla
   * @param {string} reason - Razón de la importación
   * @returns {Promise} Respuesta con resultado de la importación
   */
  async importRules(csvData, ruleType, reason) {
    return apiService.post('/fraud-rules/import', {
      csvData,
      ruleType,
      reason
    })
  }

  /**
   * Exportar reglas a CSV
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} Respuesta con datos CSV
   */
  async exportRules(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/fraud-rules/export?${queryString}` : '/fraud-rules/export'
    return apiService.get(endpoint)
  }

  /**
   * Obtener logs de auditoría
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} Respuesta con logs y paginación
   */
  async getAuditLogs(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/fraud-rules/audit-logs?${queryString}` : '/fraud-rules/audit-logs'
    return apiService.get(endpoint)
  }

  /**
   * Obtener estadísticas de logs
   * @param {Object} filters - Filtros de fecha
   * @returns {Promise} Respuesta con estadísticas
   */
  async getAuditLogStats(filters = {}) {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryString ? `/fraud-rules/audit-logs/stats?${queryString}` : '/fraud-rules/audit-logs/stats'
    return apiService.get(endpoint)
  }

  /**
   * Obtener estadísticas de reglas
   * @returns {Promise} Respuesta con estadísticas
   */
  async getRulesStats() {
    return apiService.get('/fraud-rules/stats')
  }

  /**
   * Obtener estadísticas de rechazos por regla
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise} Respuesta con estadísticas de rechazos
   */
  async getRejectionStats(filters = {}) {
    const queryParams = new URLSearchParams(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ).toString()
    
    const endpoint = queryParams ? `/fraud-rules/rejections/stats?${queryParams}` : '/fraud-rules/rejections/stats'
    return apiService.get(endpoint)
  }

  /**
   * Obtener estadísticas de rechazos para el dashboard
   * @returns {Promise} Respuesta con estadísticas de rechazos del dashboard
   */
  async getDashboardRejectionStats() {
    return apiService.get('/fraud-rules/rejections/dashboard')
  }

  /**
   * Obtener rechazos recientes
   * @param {number} limit - Límite de rechazos a obtener
   * @returns {Promise} Respuesta con rechazos recientes
   */
  async getRecentRejections(limit = 10) {
    return apiService.get(`/fraud-rules/rejections/recent?limit=${limit}`)
  }
}

export const fraudRulesAPI = new FraudRulesAPI()
