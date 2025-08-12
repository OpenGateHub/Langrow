import { useBankInfo } from "@/hooks/useBankInfo";
import { BankInfo } from "../page";
import { Payment } from "@/hooks/useAdminPayments";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const PaymentInfoModal = ({
    profile,
    selectedPayment,
    onClose,
    onSuccess
}: {
    profile: any;
    selectedPayment: Payment;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { getPlainBankInfoByCode } = useBankInfo();
    const [loadingBankInfo, setLoadingBankInfo] = useState(false);
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
    const [bankInfoError, setBankInfoError] = useState<string | null>(null);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);



    const handleCloseModal = () => {
        onClose();
        setBankInfo(null);
        setBankInfoError(null);
    };

    // Función para copiar al portapapeles
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copiado al portapapeles: ${text}`);
        } catch (error) {
            toast.error("No se pudo copiar al portapapeles");
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand("copy");
                toast.success(`${label} copiado al portapapeles: ${text}`);
            } catch (fallbackError) {
                toast.error("No se pudo copiar al portapapeles");
            }
            document.body.removeChild(textArea);
        }
    };


    // Función para marcar como pagado
    const handleMarkAsPaid = async () => {
        setIsLoadingUpdate(true)
        try {
            const response = await fetch(`/api/payments/change-status/${selectedPayment.payment_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "approved" }),
            });
            const data = await response.json();
            if (response.ok) {
                handleCloseModal();
                toast.success("Pago marcado como aprobado exitosamente");
                onSuccess();
            } else {
                toast.error(`Error al marcar como pagado: ${data.message}`);
            }
        } catch (error) {
            console.error("Error al marcar como pagado:", error);
        }finally{
            setIsLoadingUpdate(false)
        }
    };

    const getBankInfo = async (payment: Payment) => {
        if (payment?.profesor_id) {
            setLoadingBankInfo(true);
            try {
                const res = await fetch(`/api/profile/banks/${payment.profesor_id}`);
                const masked_info = await res.json();
                // CONSULTAR informacion masked de la cuenta bancaria del profesor
                const data = await getPlainBankInfoByCode(masked_info.data.code);
                setBankInfo(data as BankInfo);
            } catch (error) {
                console.error("Error fetching bank info:", error);
            } finally {
                setLoadingBankInfo(false);
            }
        }
    }

    useEffect(() => {
        getBankInfo(selectedPayment)
    }, [selectedPayment])   

    return (
        <>
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
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedPayment.status === "approved"
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
                                <h3 className="text-lg font-semibold mb-3 text-gray-700">Información Bancaria del Profesor {profile.name}</h3>

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
                                    disabled={isLoadingUpdate || selectedPayment.status === "approved"}
                                    className={`flex-1 px-4 py-2 rounded font-medium ${selectedPayment.status === "approved"
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-600 text-white"
                                        } ${isLoadingUpdate ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isLoadingUpdate ? "Procesando..." :
                                        selectedPayment.status === "approved" ? "Ya está pagado" : "Marcar como pagado"}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}