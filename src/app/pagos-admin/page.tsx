"use client";
import React, { useState } from "react";

interface Payment {
  id: string;
  transaction_amount: number;
  date_created: string;
  status: string;
  external_reference: string;
  profesor: {
    nombre: string;
    apellido: string;
  };
}

type SortField =
  | "id"
  | "transaction_amount"
  | "date"
  | "status"
  | "external_reference"
  | "profesor"
  | "";

const mockPayments: Payment[] = [
  {
    id: "12345",
    transaction_amount: 18000,
    date_created: "2025-04-06T00:11:33Z",
    status: "approved",
    external_reference:
      "reserva-clase-1743898243043-user_2tlwDBA8ovHFAOjFGFQsihh4qlL",
    profesor: { nombre: "Juan", apellido: "Pérez" },
  },
  {
    id: "12346",
    transaction_amount: 16000,
    date_created: "2025-04-05T20:11:33Z",
    status: "pending",
    external_reference:
      "reserva-clase-1743898243044-user_2tlwDBA8ovHFAOjFGFQsihh4qlL",
    profesor: { nombre: "María", apellido: "Gómez" },
  },
  {
    id: "12347",
    transaction_amount: 20000,
    date_created: "2025-04-04T18:30:00Z",
    status: "approved",
    external_reference:
      "reserva-clase-1743898243045-user_2tlwDBA8ovHFAOjFGFQsihh4qlL",
    profesor: { nombre: "Carlos", apellido: "Sánchez" },
  },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtrar pagos por id, external_reference o nombre completo del profesor
  const filteredPayments = mockPayments.filter((payment) => {
    const fullName = `${payment.profesor.nombre} ${payment.profesor.apellido}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      payment.id.toLowerCase().includes(term) ||
      payment.external_reference.toLowerCase().includes(term) ||
      fullName.includes(term)
    );
  });

  // Ordenar pagos según el campo seleccionado
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "profesor") {
      const nameA = `${a.profesor.nombre} ${a.profesor.apellido}`.toLowerCase();
      const nameB = `${b.profesor.nombre} ${b.profesor.apellido}`.toLowerCase();
      return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortField === "date") {
      const dateA = new Date(a.date_created).getTime();
      const dateB = new Date(b.date_created).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "transaction_amount") {
      return sortOrder === "asc"
        ? a.transaction_amount - b.transaction_amount
        : b.transaction_amount - a.transaction_amount;
    } else {
      // Para "id", "status" o "external_reference"
      const valA = (a as any)[sortField].toLowerCase();
      const valB = (b as any)[sortField].toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Función para renderizar la flecha (icono SVG) siempre visible
  const renderSortArrow = (field: SortField) => {
    return (
      <svg
        className={`h-4 w-4 transform transition-transform duration-300 ml-1 ${
          sortField === field
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

        <div className="overflow-x-auto">
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
              {sortedPayments.length > 0 ? (
                sortedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      ${payment.transaction_amount.toLocaleString("es-AR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {new Date(payment.date_created).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 break-words text-sm text-gray-800">
                      {payment.external_reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {payment.profesor.nombre} {payment.profesor.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                        Marcar como pagado
                      </button>
                    </td>
                  </tr>
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
      </div>
    </div>
  );
}
