"use client";
import { useState } from "react";

interface PaymentFormProps {
  clases: number;
  precioClase: number;
  total: number;
  alumnoId: string;
  profesorId: string;
  purchaseId: string;
}

const PaymentForm = ({ clases, precioClase, total, alumnoId, profesorId, purchaseId }: PaymentFormProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      console.log('[PaymentForm] Iniciando pago', { clases, precioClase, total, alumnoId, profesorId, purchaseId });

      // Validar datos antes de enviar
      if (!clases || !precioClase || !total || !alumnoId || !profesorId || !purchaseId) {
        console.error('[PaymentForm] Faltan datos requeridos');
        throw new Error("Faltan datos requeridos para procesar el pago. Por favor, recarga la página e intenta nuevamente.");
      }

      const paymentData = {
        items: [
          {
            title: "Clase de inglés",
            quantity: clases,
            unit_price: precioClase,
          },
        ],
        external_reference: `reserva-${purchaseId}-${alumnoId}`,
        metadata: {
          alumnoId: alumnoId,
          profesorId: profesorId,
          purchaseId: purchaseId,
        },
      };

      console.log('[PaymentForm] Enviando datos a /api/create-preference', paymentData);

      if (isNaN(precioClase) || precioClase <= 0 || isNaN(clases) || clases <= 0) {
        console.error('[PaymentForm] Error en los datos: precio o cantidad inválidos', { precioClase, clases });
        throw new Error(`Error en los datos: precio por clase (${precioClase}) o cantidad (${clases}) inválidos.`);
      }

      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      console.log('[PaymentForm] Respuesta de /api/create-preference', response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PaymentForm] Error en respuesta de /api/create-preference', errorData);
        // Mostrar el error específico del servidor
        let errorMsg = 'Error al procesar el pago';
        if (errorData.error) {
          errorMsg = errorData.error;
        } else if (errorData.details) {
          errorMsg = `${errorData.error || 'Error de datos'}: ${errorData.details}`;
        } else {
          errorMsg = `Error del servidor (${response.status}): No se pudo crear la preferencia de pago. Intente nuevamente.`;
        }
        throw new Error(errorMsg);
      }

      const preference = await response.json();
      console.log('[PaymentForm] Preferencia recibida', preference);

      if (!preference.init_point) {
        console.error('[PaymentForm] No se recibió la URL de pago');
        throw new Error("No se recibió la URL de pago. Por favor, intente nuevamente o contacte al soporte.");
      }

      // Redirige al checkout de MercadoPago
      window.location.href = preference.init_point;
    } catch (err) {
      let errorMessage = "Error desconocido al procesar el pago. Por favor, intente nuevamente.";
      if (err instanceof Error) {
        errorMessage = err.message;
        console.error('[PaymentForm] Error en handlePayment', err);
      }
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        ¡Asegurate tu Lugar!
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalle del pago</h2>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Clase de inglés x {clases}</span>
            <span className="text-gray-900 font-medium">
              ${precioClase.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-gray-900 font-bold">
                ${total ? total.toLocaleString("es-AR") : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <button
        className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        onClick={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            <span>Procesando pago...</span>
          </>
        ) : (
          <>
            <span>Pagar ahora</span>
            <span className="text-sm">${total.toLocaleString("es-AR")}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentForm;
