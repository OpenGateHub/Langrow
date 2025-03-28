"use client";
import { useProfileContext } from "@/context/ProfileContext";
import React, { useState } from 'react';

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Scheduled';
}

const PaymentsPage = () => {
  const payments: Payment[] = [
    { id: '1234', date: '2025-01-01', amount: 250, status: 'Paid' },
    { id: '1235', date: '2025-02-15', amount: 300, status: 'Paid' },
    { id: '1236', date: '2025-03-01', amount: 275, status: 'Paid' },
    { id: '1237', date: '2025-03-15', amount: 320, status: 'Pending' },
    // Añadí más para la demo de paginación
    { id: '1238', date: '2025-04-01', amount: 260, status: 'Paid' },
    { id: '1239', date: '2025-04-15', amount: 290, status: 'Paid' },
    { id: '1240', date: '2025-05-01', amount: 200, status: 'Pending' },
    { id: '1241', date: '2025-05-15', amount: 310, status: 'Paid' },
  ];

  // Mapeo de colores según estado
  const statusColor = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-blue-100 text-blue-800',
  };

  // --- PAGINACIÓN --- //
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Cantidad de pagos por página
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const { role } = useProfileContext();


  // Calculamos la porción de pagos a mostrar en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments.slice(startIndex, endIndex);

  // --- RESUMEN DE PAGOS --- //
  const paidPayments = payments.filter((p) => p.status === 'Paid');

  const totalAnnual = paidPayments.reduce((acc, payment) => acc + payment.amount, 0);

  const monthlyTotals: Record<string, number> = paidPayments.reduce(
    (acc: Record<string, number>, payment) => {
      const month = new Date(payment.date).toLocaleString('es-ES', {
        month: 'long',
      });
      acc[month] = (acc[month] || 0) + payment.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Tabla de pagos */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Mis Pagos</h2>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
          <thead>
            <tr className="bg-gray-200 text-gray-800">
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">ID</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Fecha</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Monto</th>
              <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{payment.id}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{payment.date}</td>
                <td className="py-3 px-4 text-sm text-gray-700">${payment.amount}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      statusColor[payment.status] || 'bg-gray-100 text-gray-800'
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
            {/* Botón Anterior */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Anterior
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 text-sm font-medium rounded-md border border-gray-200 ${
                  currentPage === page
                    ? 'bg-green-200 text-green-800 font-bold'
                    : 'bg-white text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Resumen de Pagos */}
      <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
  <h2 className="text-2xl font-bold mb-4 text-gray-800">Balance de Cuenta</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Saldo Anual */}
    <div className="bg-gray-200 shadow-md rounded-lg p-6">
      <h3 className="text-sm font-medium text-green-700 mb-2">Saldo Anual </h3>
      <p className="text-4xl font-extrabold text-gray-800">${totalAnnual}</p>
    </div>

    {/* Saldos Mensuales */}
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
