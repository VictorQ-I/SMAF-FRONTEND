import { useState, useEffect } from 'react'
import { fraudRulesAPI } from '../../services/fraudRulesAPI'

/**
 * Modal reutilizable para crear/editar reglas
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función callback después de guardar
 * @param {Object} props.initialData - Datos iniciales para edición
 * @param {Array} props.fields - Definición de campos del formulario
 * @param {string} props.ruleType - Tipo de regla
 * @param {number} props.scoreImpact - Impacto fijo en el score
 * @param {string} props.title - Título del modal
 */
const RuleFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  fields = [],
  ruleType,
  scoreImpact,
  title
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: {},
    isActive: true,
    validFrom: '',
    validUntil: '',
    reason: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        value: typeof initialData.value === 'string' ? JSON.parse(initialData.value) : initialData.value || {},
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        validFrom: initialData.validFrom || '',
        validUntil: initialData.validUntil || '',
        reason: ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        value: {},
        isActive: true,
        validFrom: '',
        validUntil: '',
        reason: ''
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  // Handle value field change
  const handleValueChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      value: {
        ...prev.value,
        [key]: value
      }
    }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (!formData.reason || formData.reason.length < 10) {
      newErrors.reason = 'La razón debe tener al menos 10 caracteres'
    }

    // Validate value fields based on field definitions
    fields.forEach(field => {
      if (field.required && !formData.value[field.name]) {
        newErrors[`value.${field.name}`] = `${field.label} es requerido`
      }
    })

    // Validate date range
    if (formData.validFrom && formData.validUntil) {
      if (new Date(formData.validUntil) <= new Date(formData.validFrom)) {
        newErrors.validUntil = 'La fecha de fin debe ser posterior a la fecha de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ruleType,
        name: formData.name,
        description: formData.description,
        value: formData.value,
        scoreImpact,
        isActive: formData.isActive,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        reason: formData.reason
      }

      let response
      if (initialData) {
        response = await fraudRulesAPI.updateRule(initialData.id, payload)
      } else {
        response = await fraudRulesAPI.createRule(payload)
      }

      if (response.success) {
        alert(initialData ? 'Regla actualizada exitosamente' : 'Regla creada exitosamente')
        onSuccess()
        onClose()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message || 'Error al guardar la regla'
      alert(errorMessage)
      console.error('Error saving rule:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {title || (initialData ? 'Editar Regla' : 'Nueva Regla')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre descriptivo de la regla"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción detallada (opcional)"
                rows="3"
                disabled={isSubmitting}
              />
            </div>

            {/* Dynamic value fields */}
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label} {field.required && '*'}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData.value[field.name] || ''}
                    onChange={(e) => handleValueChange(field.name, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`value.${field.name}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formData.value[field.name] || ''}
                    onChange={(e) => handleValueChange(field.name, parseFloat(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`value.${field.name}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    disabled={isSubmitting}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData.value[field.name] || ''}
                    onChange={(e) => handleValueChange(field.name, e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`value.${field.name}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={field.placeholder}
                    disabled={isSubmitting}
                  />
                )}
                {errors[`value.${field.name}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`value.${field.name}`]}</p>
                )}
              </div>
            ))}

            {/* Active status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Regla activa
              </label>
            </div>

            {/* Validity dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válida desde
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válida hasta
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.validUntil ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.validUntil && (
                  <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Explica por qué estás creando/modificando esta regla (mínimo 10 caracteres)"
                rows="3"
                disabled={isSubmitting}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RuleFormModal
