"use client";
import { useState } from "react";

interface PaymentFormProps {
  clases: number;
  precioClase: number;
  total: number;
}

const PaymentForm = ({ clases, precioClase, total }: PaymentFormProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              title: "Clase de inglés",
              quantity: clases,
              unit_price: precioClase,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment preference");
      }
      const preference = await response.json();
      // Redirige al checkout de MercadoPago
      window.location.href = preference.init_point;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
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
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalle del pago</h2>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">
              Clase de inglés x {clases}
            </span>
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
        className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        onClick={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Procesando...
          </span>
        ) : (
          "Pagar"
        )}
      </button>
    </div>
  );
};

export default PaymentForm;
