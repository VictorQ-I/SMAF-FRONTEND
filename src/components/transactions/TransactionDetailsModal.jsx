import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";

const TransactionDetailsModal = ({
  transaction,
  isOpen,
  onClose,
  onTransactionUpdated,
}) => {
  const { user } = useAuth();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !transaction) return null;

  const canReview =
    (user?.role === "admin" || user?.role === "analyst") &&
    transaction.status === "pending";

  const handleApprove = async () => {
    if (reason.length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { apiService } = await import("../../services/api");
      const response = await apiService.approveTransaction(
        transaction.id,
        reason
      );

      if (response.success) {
        setShowApproveModal(false);
        setReason("");
        onTransactionUpdated();
        onClose();
      } else {
        setError(response.error || "Error al aprobar la transacción");
      }
    } catch (err) {
      setError(err.message || "Error al aprobar la transacción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (reason.length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { apiService } = await import("../../services/api");
      const response = await apiService.rejectTransaction(
        transaction.id,
        reason
      );

      if (response.success) {
        setShowRejectModal(false);
        setReason("");
        onTransactionUpdated();
        onClose();
      } else {
        setError(response.error || "Error al rechazar la transacción");
      }
    } catch (err) {
      setError(err.message || "Error al rechazar la transacción");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "text-green-600",
      pending: "text-yellow-600",
      rejected: "text-red-600",
    };
    return colors[status] || "text-gray-600";
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      low: "text-blue-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    };
    return colors[riskLevel] || "text-gray-600";
  };

  const getScoreColor = (score) => {
    if (score < 0.3) return "text-green-600";
    if (score < 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      {/* Main Modal */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay with blur effect */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all"
            onClick={onClose}
            aria-hidden="true"
          ></div>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          {/* Modal panel */}
          <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detalles de Transacción
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      ID Transacción
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {transaction.transactionId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Monto
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      ${parseFloat(transaction.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Estado
                    </label>
                    <p
                      className={`mt-1 text-sm font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status === "approved"
                        ? "Aprobada"
                        : transaction.status === "pending"
                        ? "Pendiente"
                        : transaction.status === "rejected"
                        ? "Rechazada"
                        : transaction.status}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Tipo de Operación
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {transaction.operationType === 'credit' ? 'Crédito' : 
                       transaction.operationType === 'debit' ? 'Débito' : 
                       'Crédito'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Fecha
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Información del Cliente
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {transaction.customerEmail}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Tarjeta
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {transaction.cardType?.toUpperCase()} ****{" "}
                        {transaction.lastFourDigits}
                      </p>
                    </div>
                  </div>
                  {transaction.description && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-500">
                        Descripción
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {transaction.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Fraud Analysis */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Análisis de Fraude
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Score de Fraude
                      </label>
                      <p
                        className={`mt-1 text-lg font-bold ${getScoreColor(
                          transaction.fraudScore
                        )}`}
                      >
                        {(transaction.fraudScore * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Nivel de Riesgo
                      </label>
                      <p
                        className={`mt-1 text-sm font-medium ${getRiskColor(
                          transaction.riskLevel
                        )}`}
                      >
                        {transaction.riskLevel === "low"
                          ? "Bajo"
                          : transaction.riskLevel === "medium"
                          ? "Medio"
                          : transaction.riskLevel === "high"
                          ? "Alto"
                          : transaction.riskLevel}
                      </p>
                    </div>
                  </div>

                  {/* Applied Rules */}
                  {transaction.fraudReasons &&
                    transaction.fraudReasons.trim() !== "" && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Reglas Aplicadas
                        </label>
                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {transaction.fraudReasons}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Review Information */}
                {transaction.reviewedBy && transaction.reviewedAt && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Información de Revisión
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Revisado por
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {transaction.reviewer?.name ||
                            `Usuario #${transaction.reviewedBy}`}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Fecha de Revisión
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(transaction.reviewedAt).toLocaleString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                    {transaction.reviewReason && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-500">
                          Razón
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {transaction.reviewReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Created By */}
                {transaction.userId && transaction.user && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Creado por
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {transaction.user.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Email del creador
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {transaction.user.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {canReview ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setShowApproveModal(true)}
                    className="ml-3"
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectModal(true)}
                  >
                    Rechazar
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Aprobar Transacción
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Por favor, proporciona una razón para aprobar esta transacción
                (mínimo 10 caracteres).
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Verificado con el cliente, transacción legítima..."
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setReason("");
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Aprobando..." : "Confirmar Aprobación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Rechazar Transacción
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Por favor, proporciona una razón para rechazar esta transacción
                (mínimo 10 caracteres).
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Patrón de fraude detectado, múltiples intentos sospechosos..."
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setReason("");
                    setError(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Rechazando..." : "Confirmar Rechazo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionDetailsModal;
