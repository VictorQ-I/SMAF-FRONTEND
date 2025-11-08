import RulesPanelBase from '../RulesPanelBase'

/**
 * Panel para gestión de lista blanca de tarjetas
 */
const CardWhitelistPanel = () => {
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
          <span className="font-mono text-green-600 font-semibold">
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
        <span className="text-green-600 font-semibold">
          {rule.scoreImpact}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (rule) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          rule.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {rule.isActive ? 'Activa' : 'Inactiva'}
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
    }
  ]

  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Nota:</strong> Las listas negras tienen prioridad. Si una tarjeta está en lista blanca pero también en lista negra, se aplicará el bloqueo.
        </p>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>🔒 Seguridad:</strong> Los números de tarjeta se almacenan hasheados (SHA-256). Solo se muestran los últimos 4 dígitos.
        </p>
      </div>
      
      <RulesPanelBase
        ruleType="card_whitelist"
        title="Lista Blanca de Tarjetas"
        description="Tarjetas confiables que tendrán un score de fraude reducido (-0.4 puntos)"
        columns={columns}
        formFields={formFields}
        scoreImpact={-0.4}
      />
    </div>
  )
}

export default CardWhitelistPanel
