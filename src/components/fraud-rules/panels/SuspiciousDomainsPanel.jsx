import RulesPanelBase from '../RulesPanelBase'

/**
 * Panel para gestión de dominios de correo sospechosos
 */
const SuspiciousDomainsPanel = () => {
  const columns = [
    {
      header: 'Nombre',
      field: 'name'
    },
    {
      header: 'Dominio',
      render: (rule) => {
        const value = typeof rule.value === 'string' ? JSON.parse(rule.value) : rule.value
        return (
          <span className="font-mono text-red-600 font-semibold">
            {value.domain || 'N/A'}
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
          {rule.isActive ? 'Bloqueado' : 'Inactivo'}
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
      name: 'domain',
      label: 'Dominio',
      type: 'text',
      required: true,
      placeholder: 'Ej: yahoo.es, yimail.com'
    }
  ]

  return (
    <RulesPanelBase
      ruleType="suspicious_domain"
      title="Dominios de Correo Sospechosos"
      description="Correos con estos dominios tendrán un score de fraude aumentado (+0.7 puntos). Útil para bloquear dominios inexistentes o fraudulentos."
      columns={columns}
      formFields={formFields}
      scoreImpact={0.7}
    />
  )
}

export default SuspiciousDomainsPanel
