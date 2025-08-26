
import { useBankInfo } from "@/hooks/useBankInfo";
import { useEffect, useState } from "react";
import { PasteIcon } from "./paste-icon";

type BankInfoType = {
    bank_name: string;
    account_number?: string;
    dni_number?: string;
    alias?: string;
    code?: string;
};

export const BankInfo = ({ profesorId }: { profesorId: string }) => {
    const [bankInfo, setBankInfo] = useState<BankInfoType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unMasked, setUnMasked] = useState(false);

    const { getPlainBankInfoByCode } = useBankInfo()

    useEffect(() => {
        setLoading(true);
        fetch(`/api/profile/banks/${profesorId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data.data);
                if (data.result && data.data) {
                    setBankInfo(data.data);
                } else {
                    setError(data.message || "No se pudo obtener la información bancaria");
                }
            })
            .catch(() => setError("Error al obtener la información bancaria"))
            .finally(() => setLoading(false));
    }, [profesorId]);

    const handleReveal = async () => {
        if (!bankInfo?.code) return;
        setLoading(true);
        setError(null);
        const response= await getPlainBankInfoByCode(bankInfo.code);
        setBankInfo({
            bank_name: response?.bank_name ?? "",
            account_number: response?.account_number ?? "",
            dni_number: response?.dni_number ?? "",
            alias: response?.alias ?? ""
        });
        setUnMasked(true);
        setLoading(false);
    };

    // Estado para feedback de copiado
    const [copied, setCopied] = useState<string | null>(null);

    // Copiar al portapapeles usando solo JS vanilla
    const handleCopy = (value?: string, label?: string) => {
        if (!value) return;
        if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(value).then(() => {
                setCopied(label || value);
                setTimeout(() => setCopied(null), 1200);
            });
        }
    };

    return (
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
                {loading && <div className="mb-4 text-blue-600">Cargando...</div>}
                {error && <div className="mb-4 text-red-600">{error}</div>}
                {bankInfo && (
                    <>
                        <div className="mb-4">
                            <div className="font-semibold text-gray-700 mb-1">Información Bancaria</div>
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span>Banco:</span>
                                <span className="font-medium">{bankInfo.bank_name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span>Cuenta:</span>
                                <span className="flex items-center font-medium gap-2">
                                    {bankInfo.account_number}
                                    {unMasked && (
                                        <span
                                            title="Copiar cuenta"
                                            className="cursor-pointer"
                                            onClick={() => handleCopy(bankInfo.account_number, 'Cuenta')}
                                        >
                                            <PasteIcon />
                                        </span>
                                    )}
                                    {copied === 'Cuenta' && <span className="text-green-600 text-xs ml-1">¡Copiado!</span>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span>DNI:</span>
                                <span className="flex items-center font-medium gap-2">
                                    {bankInfo.dni_number}
                                    {unMasked && (
                                        <span
                                            title="Copiar DNI"
                                            className="cursor-pointer"
                                            onClick={() => handleCopy(bankInfo.dni_number, 'DNI')}
                                        >
                                            <PasteIcon />
                                        </span>
                                    )}
                                    {copied === 'DNI' && <span className="text-green-600 text-xs ml-1">¡Copiado!</span>}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-700">
                                <span>Alias:</span>
                                <span className="flex items-center font-medium gap-2">
                                    {bankInfo.alias}
                                    {unMasked && (
                                        <span
                                            title="Copiar alias"
                                            className="cursor-pointer"
                                            onClick={() => handleCopy(bankInfo.alias, 'Alias')}
                                        >
                                            <PasteIcon />
                                        </span>
                                    )}
                                    {copied === 'Alias' && <span className="text-green-600 text-xs ml-1">¡Copiado!</span>}
                                </span>
                            </div>
                        </div>
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                            onClick={handleReveal}
                            disabled={loading}
                        >
                           { loading ? "Cargando..." : "Ver datos bancarios"}
                        </button>
                    </>
                )}
            </section>
        </aside>
    );
};
