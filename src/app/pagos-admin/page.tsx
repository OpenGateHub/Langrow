"use client";
import React, { useState, useEffect } from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { useRouter } from "next/navigation";
import { Payment, useAdminPayments } from "@/hooks/useAdminPayments";
import { TableRow } from "./components/table-row";
import { PaymentInfoModal } from "./components/payment-info-modal";

export interface BankInfo {
  bank_name: string;
  account_number: string;
  account_type: string;
  dni_number: string;
  dni_type: string;
  alias: string;
}

type SortField =
  | "id"
  | "transaction_amount"
  | "date"
  | "status"
  | "external_reference"
  | "profesor"
  | "";

export default function Dashboard() {
  const router = useRouter();
  const { role } = useProfileContext();
  const { payments, loading , fetchAdminPayments} = useAdminPayments()

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (role && role !== "org:admin") {
      router.push('/');
    }
  }, [role, router]);


  if (!role || role !== "org:admin") {
    return <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <p className="text-xl text-gray-600">Acceso no autorizado</p>
    </div>;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

      // Función para cerrar el modal
   const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    const handleSuccess = () => {
      setIsModalOpen(false);
      setSelectedPayment(null);
      fetchAdminPayments()
    };


  // Función para renderizar la flecha (icono SVG) siempre visible
  const renderSortArrow = (field: SortField) => {
    return (
      <svg
        className={`h-4 w-4 transform transition-transform duration-300 ml-1 ${sortField === field
            ? sortOrder === "asc"
              ? "rotate-0 text-blue-500"
              : "rotate-180 text-blue-500"
            : "rotate-0 text-gray-400"
          }`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 01.707.293l6 6a1 1 0 11-1.414 1.414L10 5.414 4.707 10.707A1 1 0 013.293 9.293l6-6A1 1 0 0110 3z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Dashboard de Pagos
        </h1>

        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar por ID, referencia o profesor..."
            className="w-full sm:w-1/2 border p-2 rounded mb-2 sm:mb-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {
          loading ? "Cargando..." : <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort("id")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider "
                  >
                    ID Pago {renderSortArrow("id")}
                  </th>
                  <th
                    onClick={() => handleSort("transaction_amount")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Monto {renderSortArrow("transaction_amount")}
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha {renderSortArrow("date")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado {renderSortArrow("status")}
                  </th>
                  <th
                    onClick={() => handleSort("external_reference")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ref. Externa {renderSortArrow("external_reference")}
                  </th>
                  <th
                    onClick={() => handleSort("profesor")}
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Profesor {renderSortArrow("profesor")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <TableRow key={index} payment={payment} onClickAction={(data) => {
                      setProfile(data.profile);
                      setSelectedPayment(data.payment);
                      setIsModalOpen(true);
                    }} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
      </div>

        {/* Modal para ver información del pago */}
            {isModalOpen && selectedPayment && (
                <PaymentInfoModal selectedPayment={selectedPayment} profile={profile} onClose={handleCloseModal} onSuccess={handleSuccess} />
            )}
    </div>
  );
}
