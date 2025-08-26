import { Fragment, useEffect, useState } from "react";
import { format } from 'date-fns'
import { BankInfo } from "./bank-info";
import toast from "react-hot-toast";


type Payment = {
    id: number;
    created_at: string
    payment_id: string
    external_ref: string
    preference_id: string | null
    status: string | null
    payment_type: string | null
    updated_at: string | null
    is_paid: boolean | null
    paid_at: string | null
    receipt: number
    receipt_name: string
    payee: number | null
    description: string | null
    currency: string | null
    date_approved: string | null
    net_amount: number | null
    gross_amount: number | null
}

export const PaymentsSection = ({ profesorId }: { profesorId: string }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [meta, setMeta] = useState({
        total:0,
        page: 0,
        limit: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const paymentTypesText = {
        credit_card: "Tarjeta de Crédito",
        debit_card: "Tarjeta de Débito",
        paypal: "PayPal",
        bank_transfer: "Transferencia Bancaria",
    };

    const getPaymentType = (type: string | null) => {
        return paymentTypesText[type as keyof typeof paymentTypesText] || 'N/A';
    }

    const updateStatusPayment = async (paymentId: string, isPaid: boolean) => {
        if (!window.confirm(`¿Estás seguro de marcar este pago como ${isPaid ? 'pagado' : 'no pagado'}?`)) {
            return;
        }
        setIsLoadingUpdate(true);
        await fetch(`/api/payments/change-status/${paymentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_paid: Boolean(isPaid) }),
        }).then((res) => {
            console.log(res);
            getPayments();
            toast.success(`Pago marcado como ${isPaid ? 'pagado' : 'pendiente de pago'}`);
        }).finally(() => {
            setIsLoadingUpdate(false);
        })
    };

    const getPayments = () => {
        setIsLoading(true);
        fetch(`/api/payments?professor_id=${profesorId}&limit=30`)
            .then(async (response) => {
                const data = await response.json();
                setPayments(data.data);
                setMeta(data.meta);
            }).catch((error) => {
                console.error("Error fetching payments:", error);
                toast.error("Error al consultar los pagos");
            }).finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        getPayments();
    }, [profesorId]);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <main className="w-full max-w-6xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Gestión de Pagos
                    </h1>
                    <p className="text-gray-500 text-base">
                        Administra todos los pagos y datos financieros
                    </p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow p-8">
                            <h2 className="flex items-center text-xl font-semibold text-gray-900 mb-6">
                                <svg
                                    className="w-6 h-6 text-blue-500 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.4 15A7.963 7.963 0 0020 12c0-4.418-3.582-8-8-8S4 7.582 4 12c0 1.042.2 2.04.563 2.95"
                                    />
                                </svg>
                                Pagos
                            </h2>
                            <ul className="space-y-4">
                                {payments.map((item) => (
                                    <Fragment key={item.id}>
                                        <li className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <svg
                                                        className="w-7 h-7 text-gray-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25V19.5z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">
                                                           {item.receipt_name}
                                                        </span>
                                                        <span className={ ` ${item.is_paid ? 'text-green-500' : 'text-red-500'} flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${item.is_paid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                                            <svg
                                                                className="w-3 h-3 mr-1"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                            {item.is_paid ? 'Pagado' : 'Pendiente de pago'}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-600 text-sm">
                                                       {item.description}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8"
                                                                />
                                                            </svg>
                                                            {format(new Date(item.created_at), 'dd/MM/yyyy')}
                                                        </span>
                                                        <span>
                                                            {getPaymentType(item.payment_type) || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-lg text-gray-900">
                                                    {item.currency} {item.net_amount?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    ID: {item.payment_id}
                                                </span>
                                                <button onClick={() => updateStatusPayment(item.payment_id, !item.is_paid)} className={`${item.is_paid ? 'bg-red-600' : 'bg-green-600'} p-2 text-white font-semibold rounded hover:bg-opacity-80 transition text-xs mt-2`}>
                                                    Marcar como {item.is_paid ? 'pendiente de pago' : 'pagado'}
                                                </button>
                                            </div>
                                        </li>
                                    </Fragment>
                                ))}
                            </ul>
                        </div>
                    </section>
                    <BankInfo />
                </div>
            </main>
        </>
    );
};
