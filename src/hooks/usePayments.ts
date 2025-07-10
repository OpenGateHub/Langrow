import { useState, useEffect } from "react";
import { SupabasePayment } from "@/types/supabase";

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Payment {
  id: number;
  description: string;
  amount: number;
  date: Date;
  status: "Paid" | "Pending" | "Scheduled";
}

interface PaymentItem {
  title: string;
  unit_price: number;
  quantity: number;
}

export interface UsePaymentsResult {
  payments: Payment[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
  meta: Meta | null;
  setPage: (page: number) => void;
  setDateRange: (from: string, to: string) => void;
}

export const usePayments = (): UsePaymentsResult => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  const setDateRange = (fromDate: string, toDate: string) => {
    setFrom(fromDate);
    setTo(toDate);
    setPage(1); // resetear página si cambian fechas
  };

  const setPaymentStatus = (
    status: string | "approved" | "pending" | "rejected" | "scheduled" | undefined
  ): "Paid" | "Pending" | "Rejected" | "Scheduled" => {
    const validStatuses: Record<
      string,
      "Paid" | "Pending" | "Rejected" | "Scheduled"
    > = {
      approved: "Paid",
      pending: "Pending",
      rejected: "Rejected",
      scheduled: "Scheduled",
    };

    return status ? validStatuses[status.toLowerCase()] || "Pending" : "Pending";
  };

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (from) params.append("from", from);
        if (to) params.append("to", to);

        const res = await fetch(`/api/payments?${params.toString()}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Error fetching payments");

        const mappedPayments: Payment[] = (json.data || []).map(
          (payment: SupabasePayment) => {
            let items: PaymentItem[] = [];

            try {
              const parsed =
                typeof payment.payment_details === "string"
                  ? JSON.parse(payment.payment_details)
                  : payment.payment_details;

              items = parsed.items || [];
            } catch (e) {
              console.warn("No se pudo parsear payment_details:", e);
              items = [];
            }
            console.log("Payment details:", items);
            return {
              id: payment.id,
              description: items[0]?.title || "Sin descripción",
              amount: items[0]?.unit_price || 0,
              date: new Date(payment.created_at ?? 0),
              status: setPaymentStatus(payment.status), // Puedes mapear aquí según `payment.status` si tienes esa info
            };
          }
        );

        const total = mappedPayments.reduce((acc, p) => acc + p.amount, 0);

        setPayments(mappedPayments);
        setMeta(json.meta || null);
        setTotalAmount(total);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setPayments([]);
        setMeta(null);
        setTotalAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [page, from, to, limit]);

  return {
    payments,
    totalAmount,
    loading,
    error,
    meta,
    setPage,
    setDateRange,
  };
};
