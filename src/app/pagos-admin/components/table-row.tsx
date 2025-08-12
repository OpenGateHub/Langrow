import { Payment } from "@/hooks/useAdminPayments";
import { RenderProfesorName } from "./profesor-name";
import { useState } from "react";

export const TableRow = ({ payment, onClickAction }: { payment: Payment, onClickAction: (data:any) => void }) => {
    const [profile, setProfile] = useState<any>(null);
    return (
        <>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 max-w-[150px] overflow-hidden text-ellipsis">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                        {payment.payment_id}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    ${payment?.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {new Date(payment?.fecha).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                            }`}
                    >
                        {payment.status}
                    </span>
                </td>
                <td className="px-6 py-4 break-words text-sm text-gray-800 max-w-[200px]">
                    {payment.external_ref}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <RenderProfesorName profesorId={Number(payment.profesor_id)} onReady={setProfile} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <button
                        onClick={() => onClickAction({
                            payment,
                            profile
                        })}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        Ver pago
                    </button>
                </td>
            </tr>
        </>
    );
};
