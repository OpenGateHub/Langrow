"use client";

import React from "react";
import { usePayments } from "@/hooks/usePayments";

const PaymentsPage = () => {
  const {
    payments,
    totalAmount,
    loading,
    error,
    meta,
    setPage,
  } = usePayments();

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  const statusColor = {
    Paid: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Scheduled: "bg-blue-100 text-blue-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const paidPayments = payments.filter((p) => p.status === "Paid");

  const monthlyTotals = paidPayments.reduce<Record<string, number>>((acc, payment) => {
    const month = new Date(payment.date).toLocaleString("es-ES", { month: "long" });
    acc[month] = (acc[month] || 0) + payment.amount;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Tabla */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Mis Pagos</h2>

        {loading ? (
          <p className="text-gray-500">Cargando pagos...</p>
        ) : error ? (
          <p className="text-red-600 font-semibold">{error}</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-500">No hay pagos disponibles.</p>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">ID</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Fecha</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Concepto</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Monto</th>
                  <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(payment.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">${payment.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          statusColor[payment.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-4 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md border border-gray-200 ${
                      currentPage === page
                        ? "bg-green-200 text-green-800 font-bold"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Balance */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Balance de Cuenta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-200 shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-700 mb-2">Saldo Anual</h3>
            <p className="text-4xl font-extrabold text-gray-800">${totalAmount}</p>
          </div>
          <div className="bg-gray-200 shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-green-700 mb-2">Saldos Mensuales</h3>
            <ul>
              {Object.entries(monthlyTotals).map(([month, total]) => (
                <li key={month} className="text-base text-gray-800 mb-1">
                  <span className="capitalize font-semibold">{month}:</span> ${total}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
