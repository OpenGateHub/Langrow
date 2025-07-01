import { useState } from "react";

type PaymentData = {
  collection_id: string;
  collection_status: string;
  external_reference: string;
  payment_id: string;
  status: string;
  merchant_order_id: string;
  payment_type: string;
  preference_id: string;
  site_id: string;
  processing_mode: string;
  merchant_account_id?: string;
};

type UseUpdatePaymentStatusResult = {
  loading: boolean;
  error: string | null;
  success: boolean;
  updatePayment: (data: PaymentData) => Promise<void>;
};

export function useUpdatePaymentStatus(): UseUpdatePaymentStatusResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updatePayment = async (data: PaymentData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.result) {
        throw new Error(result.message || "Error desconocido");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error al actualizar el pago");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, updatePayment };
}
