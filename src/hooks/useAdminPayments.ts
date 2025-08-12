import { useEffect, useState } from "react";


export type Payment = {
    amount: number;
    external_ref: string;
    fecha: string;
    payment_id: string;
    profesor_id: string | null;
    status: string;
}

export const useAdminPayments = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const parseAmountToLocale = (amount: number | null) => {
        if (amount === null || amount === undefined) return "0.00";
        return amount.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };
    function parsePayments(dataArray:any[]) {
        return dataArray.map(item => {
            const paymentDetails = item.payment_details || {};
            const metadata = paymentDetails.metadata || {};
            
            const data = {
            payment_id: item.payment_id || null,
            amount: paymentDetails.transaction_amount || null,
            fecha:parseAmountToLocale(item.created_at || null),
            status: item.status || 'pending',
            external_ref: item.external_ref || null,
            profesor_id: metadata.profesor_id || null
            };
            return data
        });
    }


    const fetchAdminPayments = async (options?: {
        page?: number;
        limit?: number;
        status?: string;
        from?: string;
        to?: string;
        profesor_name?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options?.page) params.append('page', options.page.toString());
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.status) params.append('status', options.status);
            if (options?.from) params.append('from', options.from);
            if (options?.to) params.append('to', options.to);
            if (options?.profesor_name) params.append('profesor_name', options.profesor_name);

            const response = await fetch(`/api/admin/payments?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al consultar pagos');
            }
            if (result.data) {
                const parsedPayments = parsePayments(result.data);
                setPayments(parsedPayments);
                return result;
            } else {
                throw new Error(result.message || 'Respuesta inválida del servidor');
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error en fetchAdminPayments:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminPayments();
    }, []);

    return {
        payments,
        loading,
        error,
        setLoading,
        setError,
        fetchAdminPayments,
    };


}