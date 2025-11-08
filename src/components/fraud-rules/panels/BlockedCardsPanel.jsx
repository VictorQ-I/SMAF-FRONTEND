import RulesPanelBase from '../RulesPanelBase'

/**
 * Panel para gestión de tarjetas bloqueadas
 */
const BlockedCardsPanel = () => {
  const columns = [
    {
      header: 'Nombre',
      field: 'name'
    },
    {
      header: 'Últimos 4 Dígitos',
      render: (rule) => {
        const value = typeof rule.value === 'string' ? JSON.parse(rule.value) : rule.value
        return (
          <span className="font-mono text-red-600 font-semibold">
            **** **** **** {value.lastFourDigits || 'N/A'}
          </span>
        )
      }
    },

    {
      header: 'Razón',
      render: (rule) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {rule.reason}
        </span>
      )
    },
    {
      header: 'Impacto',
      render: (rule) => (
        <span className="text-red-600 font-semibold">
          +{rule.scoreImpact}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (rule) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          rule.isActive 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {rule.isActive ? 'Bloqueada' : 'Inactiva'}
        </span>
      )
    },
    {
      header: 'Vigencia',
      render: (rule) => {
        if (!rule.validFrom && !rule.validUntil) return 'Permanente'
        const from = rule.validFrom ? new Date(rule.validFrom).toLocaleDateString() : 'Inicio'
        const until = rule.validUntil ? new Date(rule.validUntil).toLocaleDateString() : 'Indefinido'
        return `${from} - ${until}`
      }
    }
  ]

  const formFields = [
    {
      name: 'cardNumber',
      label: 'Número de Tarjeta',
      type: 'text',
      required: true,
      placeholder: '16 dígitos (se almacenará hasheado)'
    },

  ]

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🔒 Seguridad:</strong> Los números de tarjeta se almacenan hasheados (SHA-256). Solo se muestran los últimos 4 dígitos. El número completo nunca se guarda en la base de datos.
        </p>
      </div>
      
      <RulesPanelBase
        ruleType="blocked_card"
        title="Tarjetas Bloqueadas"
        description="Tarjetas reportadas por fraude en operaciones de crédito que tendrán un score aumentado (+0.9 puntos)"
        columns={columns}
        formFields={formFields}
        scoreImpact={0.9}
      />
    </div>
  )
}

export default BlockedCardsPanel
