"use client";
import React, { useState, useEffect } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";
import { useUpdatePaymentStatus } from "@/hooks/useUpdatePaymentStatus";
import { useBankInfo } from "@/hooks/useBankInfo";
import { useAdminPayments, Payment } from "@/hooks/useAdminPayments";

interface BankInfo {
  bank_name: string;
  account_number: string;
  account_type: string;
  dni_number: string;
  dni_type: string;
  alias: string;
}

type SortField =
  | "id"
  | "transaction_amount"
  | "date"
  | "status"
  | "external_reference"
  | "profesor"
  | "";

export default function Dashboard() {
  const router = useRouter();
  const { role } = useProfileContext();
  const { updatePayment, loading: updateLoading, error: updateError } = useUpdatePaymentStatus();
  const { getPlainBankInfoByCode, getMaskedBankInfo } = useBankInfo();
  const {payments} = useAdminPayments()

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loadingBankInfo, setLoadingBankInfo] = useState(false);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);

  // Función para copiar al portapapeles
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copiado al portapapeles: ${text}`);
    } catch (error) {
      console.error("Error al copiar al portapapeles:", error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert(`${label} copiado al portapapeles: ${text}`);
      } catch (fallbackError) {
        alert("No se pudo copiar al portapapeles");
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    if (role && role !== "org:admin") {
      router.push('/');
    }
  }, [role, router]);

  // Función para abrir el modal y consultar información bancaria
  const handleViewPayment = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
    setBankInfoError(null);

    if (payment?.profesor_id) {
      setLoadingBankInfo(true);
      try {
        // CONSULTAR informacion masked de la cuenta bancaria del profesor
        
        const data = await getPlainBankInfoByCode("BNK-1754536484933-990");
          setBankInfo(data as BankInfo);
          console.log("Bank info data:", data);
      } catch (error) {
        setBankInfoError("Error al cargar la información bancaria");
        console.error("Error fetching bank info:", error);
      } finally {
        setLoadingBankInfo(false);
      }
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setBankInfo(null);
    setBankInfoError(null);
  };

  // Función para marcar como pagado
  const handleMarkAsPaid = async () => {    
    try {
      // await updatePayment({
      //   collection_id: selectedPayment.id,
      //   collection_status: "approved",
      //   external_reference: selectedPayment.external_reference,
      //   payment_id: selectedPayment.id,
      //   status: "approved",
      //   merchant_order_id: selectedPayment.id,
      //   payment_type: "credit_card",
      //   preference_id: selectedPayment.preference_id,
      //   site_id: "MLA",
      //   processing_mode: "aggregator",
      // });
      
      if (!updateError) {
        // Aquí podrías actualizar el estado si usaras state management
        handleCloseModal();
        alert("Pago marcado como aprobado exitosamente");
      }
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
    }
  };

  if (!role || role !== "org:admin") {
    return <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <p className="text-xl text-gray-600">Acceso no autorizado</p>
    </div>;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Función para renderizar la flecha (icono SVG) siempre visible
  const renderSortArrow = (field: SortField) => {
    return (
      <svg
        className={`h-4 w-4 transform transition-transform duration-300 ml-1 ${
          sortField === field
            ? sortOrder === "asc"
              ? "rotate-0 text-blue-500"
              : "rotate-180 text-blue-500"
            : "rotate-0 text-gray-400"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 01.707.293l6 6a1 1 0 11-1.414 1.414L10 5.414 4.707 10.707A1 1 0 013.293 9.293l6-6A1 1 0 0110 3z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Dashboard de Pagos
        </h1>

        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar por ID, referencia o profesor..."
            className="w-full sm:w-1/2 border p-2 rounded mb-2 sm:mb-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                >
                  ID Pago {renderSortArrow("id")}
                </th>
                <th
                  onClick={() => handleSort("transaction_amount")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto {renderSortArrow("transaction_amount")}
                </th>
                <th
                  onClick={() => handleSort("date")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha {renderSortArrow("date")}
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado {renderSortArrow("status")}
                </th>
                <th
                  onClick={() => handleSort("external_reference")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ref. Externa {renderSortArrow("external_reference")}
                </th>
                <th
                  onClick={() => handleSort("profesor")}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Profesor {renderSortArrow("profesor")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length > 0 ? (
                payments.map((payment, index) => (  
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-[150px] overflow-hidden text-ellipsis">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {payment.payment_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      ${payment?.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      { new Date(payment?.fecha).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 break-words text-sm text-gray-800 max-w-[200px]">
                      {payment.external_ref}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      "Pedro tapia"
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <button 
                        onClick={() => handleViewPayment(payment)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Ver pago
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para ver información del pago */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Información del Pago</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {selectedPayment && (
              <div className="space-y-4">
                {/* Información del Pago */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Detalles del Pago</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ID de Pago</p>
                      <p className="text-gray-800">{selectedPayment.payment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monto</p>
                      <p className="text-gray-800">${selectedPayment.amount.toLocaleString("es-AR")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedPayment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedPayment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fecha</p>
                      <p className="text-gray-800">{selectedPayment.fecha}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-600">Referencia Externa</p>
                      <p className="text-gray-800 break-words">{selectedPayment.external_ref}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profesor</p>
                      <p className="text-gray-800">Nombre del profesor</p>
                    </div>
                  </div>
                </div>

                {/* Información Bancaria del Profesor */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">Información Bancaria del Profesor</h3>
                  
                  {loadingBankInfo ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Cargando información bancaria...</span>
                    </div>
                  ) : bankInfoError ? (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
                      {bankInfoError}
                    </div>
                  ) : bankInfo ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Banco</p>
                        <p className="text-gray-800">{bankInfo.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tipo de Cuenta</p>
                        <p className="text-gray-800">{bankInfo.account_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Número de Cuenta</p>
                        <button
                          onClick={() => copyToClipboard(bankInfo.account_number, "Número de cuenta")}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1 rounded transition-colors text-left w-full cursor-pointer border-dashed border-2 border-transparent hover:border-blue-300"
                          title="Click para copiar al portapapeles"
                        >
                          {bankInfo.account_number}
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">DNI</p>
                        <p className="text-gray-800">{bankInfo.dni_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tipo de DNI</p>
                        <p className="text-gray-800">{bankInfo.dni_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Alias</p>
                        {bankInfo.alias ? (
                          <button
                            onClick={() => copyToClipboard(bankInfo.alias, "Alias")}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1 rounded transition-colors text-left w-full cursor-pointer border-dashed border-2 border-transparent hover:border-blue-300"
                            title="Click para copiar al portapapeles"
                          >
                            {bankInfo.alias}
                          </button>
                        ) : (
                          <p className="text-gray-800">No especificado</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No se encontró información bancaria</p>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={updateLoading || selectedPayment.status === "approved"}
                    className={`flex-1 px-4 py-2 rounded font-medium ${
                      selectedPayment.status === "approved"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    } ${updateLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {updateLoading ? "Procesando..." : 
                     selectedPayment.status === "approved" ? "Ya está pagado" : "Marcar como pagado"}
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium"
                  >
                    Cancelar
                  </button>
                </div>

                {/* Mostrar errores */}
                {updateError && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
                    Error: {updateError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
