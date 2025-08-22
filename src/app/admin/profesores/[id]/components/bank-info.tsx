export const BankInfo = () => {

    return <>
    
      <aside className="flex flex-col gap-6">
                        <section className="bg-white rounded-2xl shadow p-6">
                            <h3 className="flex items-center text-base font-semibold text-blue-700 mb-4">
                                <svg
                                    className="w-5 h-5 mr-2 text-blue-700"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 2.618L4.618 16h10.764L10 4.618z" />
                                </svg>
                                Datos de Pago
                            </h3>
                            <div className="mb-4">
                                <div className="font-semibold text-gray-900">
                                    Dr. Elena Vásquez
                                </div>
                                <div className="text-gray-600 text-sm">
                                    elena.vasquez@university.edu
                                </div>
                                <div className="text-gray-600 text-sm">
                                    +1 (555) 123-4567
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="font-semibold text-gray-700 mb-1">
                                    Información Bancaria
                                </div>
                                <div className="flex justify-between text-sm text-gray-700">
                                    <span>Banco:</span>
                                    <span className="font-medium">
                                        Banco Nacional
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700">
                                    <span>Cuenta:</span>
                                    <span className="font-medium">
                                        **** **** **** 1234
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-700">
                                    <span>RFC:</span>
                                    <span className="font-medium">
                                        RFC123456789
                                    </span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="font-semibold text-gray-700 mb-1">
                                    PayPal
                                </div>
                                <div className="text-gray-700 text-sm">
                                    elena.payments@email.com
                                </div>
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                                Ver datos bancarios
                            </button>
                        </section>
                    </aside>
    
    </>
}