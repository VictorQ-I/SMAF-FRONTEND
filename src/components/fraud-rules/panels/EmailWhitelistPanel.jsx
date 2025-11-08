import RulesPanelBase from '../RulesPanelBase'

/**
 * Panel para gestión de lista blanca de correos
 */
const EmailWhitelistPanel = () => {
  const columns = [
    {
      header: 'Nombre',
      field: 'name'
    },
    {
      header: 'Correo Electrónico',
      render: (rule) => {
        const value = typeof rule.value === 'string' ? JSON.parse(rule.value) : rule.value
        return (
          <span className="font-mono text-green-600 font-semibold">
            {value.email || 'N/A'}
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
          {rule.isActive ? 'Activo' : 'Inactivo'}
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
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      placeholder: 'Ej: usuario@ejemplo.com'
    }
  ]

  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Nota:</strong> Las listas negras tienen prioridad. Si un correo está en lista blanca pero también cumple criterios de lista negra, se aplicará el bloqueo.
        </p>
      </div>
      
      <RulesPanelBase
        ruleType="email_whitelist"
        title="Lista Blanca de Correos"
        description="Correos confiables que tendrán un score de fraude reducido (-0.3 puntos)"
        columns={columns}
        formFields={formFields}
        scoreImpact={-0.3}
      />
    </div>
  )
}

export default EmailWhitelistPanel
