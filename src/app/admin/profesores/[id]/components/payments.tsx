import { BankInfo } from "./bank-info";

export const PaymentsSection = () => {
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
                                    stroke-width="2"
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
                                <li className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg
                                                className="w-7 h-7 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.5"
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
                                                    María González
                                                </span>
                                                <span className="flex items-center text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                                    <svg
                                                        className="w-3 h-3 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    Completado
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                                Matemáticas Avanzadas
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M8 7V3m8 4V3m-9 8h10m-9 4h6m-7 4h8"
                                                        />
                                                    </svg>
                                                    2024-01-15
                                                </span>
                                                <span>2 horas</span>
                                                <span>Tarjeta de Crédito</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-lg text-gray-900">
                                            $45.00
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ID: PAY-001
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg
                                                className="w-7 h-7 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.5"
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
                                                    Carlos Rodríguez
                                                </span>
                                                <span className="flex items-center text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                                    <svg
                                                        className="w-3 h-3 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                    Completado
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                                Física Cuántica
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span>2024-01-14</span>
                                                <span>1.5 horas</span>
                                                <span>PayPal</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-lg text-gray-900">
                                            $60.00
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ID: PAY-002
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg
                                                className="w-7 h-7 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.5"
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
                                                    Ana Martínez
                                                </span>
                                                <span className="flex items-center text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                                                    <svg
                                                        className="w-3 h-3 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            fill="none"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 8v4l2 2"
                                                        />
                                                    </svg>
                                                    Pendiente
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                                Química Orgánica
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span>2024-01-13</span>
                                                <span>1 hora</span>
                                                <span>Transferencia</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-lg text-gray-900">
                                            $35.00
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ID: PAY-003
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center justify-between bg-gray-50 rounded-xl px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg
                                                className="w-7 h-7 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="1.5"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    stroke-linejoin="round"
                                                    d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    stroke-linejoin="round"
                                                    d="M4.5 19.5a7.5 7.5 0 1115 0v.75A2.25 2.25 0 0117.25 22.5h-10.5A2.25 2.25 0 014.5 20.25V19.5z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    Luis Fernández
                                                </span>
                                                <span className="flex items-center text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                                                    <svg
                                                        className="w-3 h-3 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            stroke-width="2"
                                                            fill="none"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            stroke-linejoin="round"
                                                            d="M8 12l2 2 4-4"
                                                        />
                                                    </svg>
                                                    Fallido
                                                </span>
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                                Cálculo Diferencial
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                <span>2024-01-12</span>
                                                <span>2 horas</span>
                                                <span>Tarjeta de Débito</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-bold text-lg text-gray-900">
                                            $50.00
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ID: PAY-004
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>
                  <BankInfo />
                </div>
            </main>
        </>
    );
};
