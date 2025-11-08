import RulesPanelBase from '../RulesPanelBase'

/**
 * Panel para gestión de franquicias bloqueadas
 */
const BlockedFranchisesPanel = () => {
  const columns = [
    {
      header: 'Nombre',
      field: 'name'
    },
    {
      header: 'Franquicia',
      render: (rule) => {
        const value = typeof rule.value === 'string' ? JSON.parse(rule.value) : rule.value
        return (
          <span className="font-semibold text-red-600">
            {value.franchise?.toUpperCase() || 'N/A'}
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
      name: 'franchise',
      label: 'Franquicia a Bloquear',
      type: 'select',
      required: true,
      options: [
        { value: 'visa', label: 'Visa' },
        { value: 'mastercard', label: 'Mastercard' },
        // { value: 'amex', label: 'American Express' },
        // { value: 'discover', label: 'Discover' },
        // { value: 'other', label: 'Otra' }
      ]
    }
  ]

  return (
    <RulesPanelBase
      ruleType="blocked_franchise"
      title="Franquicias Bloqueadas"
      description="Transacciones de estas franquicias tendrán un score de fraude aumentado (+0.8 puntos)"
      columns={columns}
      formFields={formFields}
      scoreImpact={0.8}
    />
  )
}

export default BlockedFranchisesPanel
