import RulesPanelBase from "../RulesPanelBase";

/**
 * Panel para gestión de reglas de montos bajos por franquicia
 */
const LowAmountRulesPanel = () => {
  const columns = [
    {
      header: "Nombre",
      field: "name",
    },
    {
      header: "Franquicia",
      render: (rule) => {
        const value =
          typeof rule.value === "string" ? JSON.parse(rule.value) : rule.value;
        return value.franchise?.toUpperCase() || "N/A";
      },
    },
    {
      header: "Monto Máximo",
      render: (rule) => {
        const value =
          typeof rule.value === "string" ? JSON.parse(rule.value) : rule.value;
        return `$${value.amount || 0}`;
      },
    },

    {
      header: "Impacto",
      render: (rule) => (
        <span className="text-green-600 font-semibold">{rule.scoreImpact}</span>
      ),
    },
    {
      header: "Estado",
      render: (rule) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            rule.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {rule.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      header: "Vigencia",
      render: (rule) => {
        if (!rule.validFrom && !rule.validUntil) return "Permanente";
        const from = rule.validFrom
          ? new Date(rule.validFrom).toLocaleDateString()
          : "Inicio";
        const until = rule.validUntil
          ? new Date(rule.validUntil).toLocaleDateString()
          : "Indefinido";
        return `${from} - ${until}`;
      },
    },
  ];

  const formFields = [
    {
      name: "franchise",
      label: "Franquicia",
      type: "select",
      required: true,
      options: [
        { value: "visa", label: "Visa" },
        { value: "mastercard", label: "Mastercard" },
      ],
    },

    {
      name: "amount",
      label: "Monto Máximo",
      type: "number",
      required: true,
      placeholder: "Ej: 50",
      step: 0.01,
    },
  ];

  return (
    <RulesPanelBase
      ruleType="low_amount"
      title="Montos Bajos por Franquicia"
      description="Transacciones de crédito por debajo de estos montos tendrán un score de fraude reducido (-0.2 puntos)"
      columns={columns}
      formFields={formFields}
      scoreImpact={-0.2}
    />
  );
};

export default LowAmountRulesPanel;
