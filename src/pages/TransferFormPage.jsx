import { useState } from 'react'
import { transactionsAPI } from '../services/transactionsAPI'
import { useAuth } from '../contexts/AuthContext'

const TransferFormPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    amount: '',
    cardType: 'visa',
    cardNumber: '',
    customerEmail: '',
    description: '',
    operationType: 'credit' // Nuevo campo para tipo de operación
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  // Validar campo individual
  const validateField = (field, value) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          newErrors.amount = 'El monto debe ser mayor a 0'
        } else {
          delete newErrors.amount
        }
        break
      
      case 'cardNumber':
        const cleaned = value.replace(/\s/g, '')
        if (cleaned.length < 13 || cleaned.length > 19) {
          newErrors.cardNumber = 'Número de tarjeta inválido (13-19 dígitos)'
        } else if (!/^\d+$/.test(cleaned)) {
          newErrors.cardNumber = 'Solo se permiten números'
        } else {
          delete newErrors.cardNumber
        }
        break
      
      case 'customerEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors.customerEmail = 'Email inválido'
        } else {
          delete newErrors.customerEmail
        }
        break
      
      case 'description':
        if (value && value.length > 500) {
          newErrors.description = 'Máximo 500 caracteres'
        } else {
          delete newErrors.description
        }
        break
    }

    setErrors(newErrors)
  }

  // Manejar cambio de campo
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  // Formatear número de tarjeta con espacios
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ')
  }

  // Manejar cambio de número de tarjeta
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '')
    if (value.length <= 19 && /^\d*$/.test(value)) {
      handleChange('cardNumber', value)
    }
  }

  // Validar formulario completo
  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto es requerido y debe ser mayor a 0'
    }

    const cleaned = formData.cardNumber.replace(/\s/g, '')
    if (cleaned.length < 13 || cleaned.length > 19 || !/^\d+$/.test(cleaned)) {
      newErrors.cardNumber = 'Número de tarjeta inválido'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await transactionsAPI.createTransaction({
        amount: parseFloat(formData.amount),
        cardType: formData.cardType,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        customerEmail: formData.customerEmail,
        description: formData.description || undefined,
        operationType: formData.operationType
      })

      if (response.success) {
        setResult({
          success: true,
          transaction: response.data.transaction,
          message: response.message
        })

        // Limpiar formulario
        setFormData({
          amount: '',
          cardType: 'visa',
          cardNumber: '',
          customerEmail: '',
          description: '',
          operationType: 'credit'
        })
      }
    } catch (err) {
      console.error('Error creating transaction:', err)
      
      // Extraer mensaje de error de diferentes formatos posibles
      let errorMessage = 'Error al crear la transacción'
      
      if (err.response?.data) {
        const data = err.response.data
        errorMessage = data.error?.message || data.message || data.error || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setResult({
        success: false,
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obtener texto de estado
  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Aprobada'
      case 'pending':
        return 'Pendiente de Revisión'
      case 'rejected':
        return 'Rechazada'
      default:
        return status
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nueva Transacción
        </h1>
        <p className="text-gray-600">
          Completa el formulario para realizar una transacción. El sistema evaluará automáticamente el riesgo de fraude.
        </p>
      </div>

      {/* Resultado */}
      {result && (
        <div className={`border rounded-lg p-6 ${
          result.success 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {result.success ? (
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                result.success ? 'text-blue-800' : 'text-red-800'
              }`}>
                {result.success ? result.message : 'Error al crear la transacción'}
              </h3>
              {!result.success && (
                <p className="mt-1 text-sm text-red-700">
                  {result.message}
                </p>
              )}
              
              {result.success && result.transaction && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ID de Transacción:</span>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {result.transaction.transactionId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      getStatusColor(result.transaction.status)
                    }`}>
                      {getStatusText(result.transaction.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score de Fraude:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(result.transaction.fraudScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  {result.transaction.fraudReasons && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <span className="text-xs text-gray-600">Razones:</span>
                      <p className="text-xs text-gray-700 mt-1">
                        {result.transaction.fraudReasons}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Monto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Tipo de Tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Tarjeta *
          </label>
          <select
            value={formData.cardType}
            onChange={(e) => handleChange('cardType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="visa">Visa</option>
            <option value="mastercard">Mastercard</option>
            {/* <option value="amex">American Express</option>
            <option value="discover">Discover</option>
            <option value="other">Otra</option> */}
          </select>
        </div>

        {/* Tipo de Operación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Operación *
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="credit"
                name="operationType"
                type="radio"
                value="credit"
                checked={formData.operationType === 'credit'}
                onChange={(e) => handleChange('operationType', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                disabled={isSubmitting}
              />
              <label htmlFor="credit" className="ml-3 block text-sm font-medium text-gray-700">
                <span className="flex items-center">
                  <span>Crédito</span>
                  <svg className="ml-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="debit"
                name="operationType"
                type="radio"
                value="debit"
                checked={formData.operationType === 'debit'}
                onChange={(e) => handleChange('operationType', e.target.value)}
                className="h-4 w-4 text-gray-400 focus:ring-gray-300 border-gray-300 cursor-not-allowed"
                disabled={true} // Siempre deshabilitado por ahora
              />
              <label htmlFor="debit" className="ml-3 block text-sm text-gray-400 cursor-not-allowed">
                <span className="flex items-center">
                  <span>Débito</span>
                  <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                  <span className="ml-1 text-xs">(No disponible)</span>
                </span>
              </label>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            💳 Por el momento, solo están disponibles las operaciones de crédito
          </p>
        </div>

        {/* Número de Tarjeta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta *
          </label>
          <input
            type="text"
            value={formatCardNumber(formData.cardNumber)}
            onChange={handleCardNumberChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="1234 5678 9012 3456"
            disabled={isSubmitting}
          />
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            🔒 El número será hasheado y almacenado de forma segura
          </p>
        </div>

        {/* Email del Destinatario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Pagador *
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="destinatario@ejemplo.com"
            disabled={isSubmitting}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (Opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Concepto o descripción de la transferencia"
            rows="3"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setFormData({
                amount: '',
                cardType: 'visa',
                cardNumber: '',
                customerEmail: '',
                description: '',
                operationType: 'credit'
              })
              setErrors({})
              setResult(null)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'Procesando...' : 'Realizar Transacción'}
          </button>
        </div>
      </form>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistema de Detección de Fraude
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Cada transacción es evaluada automáticamente por nuestro sistema antifraude:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Score &lt; 30%: Aprobada automáticamente</li>
                <li>Score 30-70%: Requiere revisión manual</li>
                <li>Score &gt; 70%: Rechazada automáticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferFormPage
