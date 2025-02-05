"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import WeeklyAgendaModal, { SelectedSlotType, DaySchedule } from "../components/ModalClassRequest";
import PaymentForm from "../components/payment/PaymentForm"; // Importamos el PaymentForm embebido

// Tipo de paquete con datos y estilos
type Package = {
  nombre: string;
  total: number;
  precioClase: string;
  ahorro: string;
  clases: number;
  bg: string;
  hoverBg: string;
};

const packages: Package[] = [
  {
    nombre: "Única Clase",
    total: 67200,
    precioClase: "18.000",
    ahorro: "",
    clases: 1,
    bg: "bg-blue-700",
    hoverBg: "hover:bg-blue-800",
  },
  {
    nombre: "Combo 4 clases",
    total: 67200,
    precioClase: "16.800",
    ahorro: "4.800",
    clases: 4,
    bg: "bg-green-700",
    hoverBg: "hover:bg-green-800",
  },
  {
    nombre: "Combo 8 clases",
    total: 124800,
    precioClase: "15.600",
    ahorro: "9.600",
    clases: 8,
    bg: "bg-yellow-700",
    hoverBg: "hover:bg-yellow-800",
  },
  {
    nombre: "Combo 12 clases",
    total: 172800,
    precioClase: "14.400",
    ahorro: "14.400",
    clases: 12,
    bg: "bg-red-700",
    hoverBg: "hover:bg-red-800",
  },
];

const categories = [
  "Escritura",
  "Conversación",
  "Vocabulario",
  "Vocabulario Profesional",
  "Integral",
  "Pronunciación",
];

// Agenda disponible para el profesor
const professorSchedule: DaySchedule[] = [
  { day: "Lunes", slots: ["10:00", "14:00"] },
  { day: "Martes", slots: ["11:00", "15:00"] },
  { day: "Miércoles", slots: ["09:00", "13:00"] },
  { day: "Jueves", slots: ["10:30", "16:00"] },
  { day: "Viernes", slots: ["12:00"] },
  { day: "Sábado", slots: [] },
  { day: "Domingo", slots: [] },
];

const SolicitudClase: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [category, setCategory] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [motivoError, setMotivoError] = useState<string>("");

  // Estados para el modal de selección de horarios y la selección guardada
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotType[]>([]);

  // Estado para activar el paso de pago
  const [isPaymentStep, setIsPaymentStep] = useState<boolean>(false);

  const router = useRouter();

  const handleOpenScheduleModal = () => {
    if (!selectedPackage) {
      alert("Debes seleccionar un paquete.");
      return;
    }
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (slots: SelectedSlotType[]) => {
    setSelectedSlots(slots);
    setIsScheduleModalOpen(false);
  };

  // Al confirmar la reserva se validan todos los campos y la cantidad de horarios seleccionados.
  // Si todo es correcto, se activa el paso de pago que mostrará el PaymentForm embebido.
  const handleConfirmReserva = () => {
    let valid = true;
    if (!selectedPackage) {
      alert("Debes seleccionar un paquete.");
      valid = false;
    }
    if (!category) {
      setCategoryError("Debes seleccionar una categoría.");
      valid = false;
    } else {
      setCategoryError("");
    }
    if (motivo.trim().length < 50) {
      setMotivoError("El motivo debe tener al menos 50 caracteres.");
      valid = false;
    } else if (motivo.trim().length > 200) {
      setMotivoError("El motivo no puede exceder 200 caracteres.");
      valid = false;
    } else {
      setMotivoError("");
    }
    if (selectedPackage && selectedSlots.length !== selectedPackage.clases) {
      alert(`Debes seleccionar ${selectedPackage.clases} clase(s).`);
      valid = false;
    }
    if (!valid) return;

    // Aquí podrías realizar la lógica de confirmación de la reserva y generar bookingId y eventTypeId.
    // Por ahora, usamos valores de ejemplo.
    setIsPaymentStep(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Solicitar Clase
      </h1>

      {/* Selección de paquete */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {packages.map((pkg, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => {
                setSelectedPackage(pkg);
                setSelectedSlots([]); // Reinicia la selección de horarios al cambiar de paquete
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pkg.bg} ${pkg.hoverBg} ${selectedPackage?.nombre === pkg.nombre
                ? "shadow-md text-white border-2 border-white"
                : "text-white"
                }`}
            >
              {pkg.nombre}
            </button>
            {Number(pkg.ahorro) > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 z-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                <div className={`${pkg.bg} text-white text-xs rounded py-1 px-2 shadow-lg`}>
                  ¡Ahorrá ${pkg.ahorro.toLocaleString()}!
                </div>
                <div
                  className="w-0 h-0 border-x-4 border-x-transparent border-t-4 mx-auto"
                  style={{
                    borderTopColor:
                      pkg.bg === "bg-blue-700"
                        ? "#1D4ED8"
                        : pkg.bg === "bg-green-700"
                          ? "#047857"
                          : pkg.bg === "bg-yellow-700"
                            ? "#B45309"
                            : pkg.bg === "bg-red-700"
                              ? "#B91C1C"
                              : "#000",
                  }}
                ></div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Recuadro de precios */}
      {selectedPackage && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50 text-center">
          <h3 className="text-lg font-semibold">
            Precio Total: ${selectedPackage.total.toLocaleString("es-AR")}
          </h3>
          <p className="text-md">
            Precio por Clase: ${selectedPackage.precioClase}
          </p>
        </div>
      )}

      {/* Botón para abrir el modal de selección de horarios */}
      {selectedPackage && selectedSlots.length === 0 && (
        <div className="mb-4 flex justify-center">
          <button
            onClick={handleOpenScheduleModal}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
          >
            Elegir Horarios
          </button>
        </div>
      )}

      {/* Resumen opcional de horarios seleccionados */}
      {selectedSlots.length > 0 && (
        <div className="mb-4 text-center">
          <p className="text-green-600 font-medium">Horarios seleccionados</p>
          {/* Aquí podrías mapear y mostrar los horarios elegidos */}
        </div>
      )}

      {/* Selección de categoría */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Selecciona la categoría
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full p-2 border rounded-md focus:outline-none ${categoryError ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value="">-- Selecciona una categoría --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {categoryError && (
          <p className="text-red-500 text-sm mt-1">{categoryError}</p>
        )}
      </div>

      {/* Motivo de clase */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Motivo de clase
        </label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Escribe el motivo de la clase..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          rows={4}
          minLength={50}
          maxLength={200}
        />
        {motivoError && (
          <p className="text-red-500 text-sm mt-1">{motivoError}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {motivo.length} / 200 caracteres
        </p>
      </div>

      {/* Modal de selección de horarios */}
      {selectedPackage && (
        <WeeklyAgendaModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          requiredClasses={selectedPackage.clases}
          availableSchedule={professorSchedule}
          professor="Profesor X"
          onSubmit={handleScheduleSubmit}
        />
      )}


      {/* Botón para confirmar reserva */}
      {!isPaymentStep && (selectedSlots.length > 0) && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirmReserva}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
          >
            Continuar al pago
          </button>
        </div>
      )}
      {/* Componente de Pago embebido que se muestra debajo del formulario */}
      {isPaymentStep && selectedPackage && (
        <div className="mt-8">
          <PaymentForm
            clases={selectedPackage.clases}
            precioClase={Number(selectedPackage.precioClase.replace(/\./g, ''))}
            total={selectedPackage.total}
          />
        </div>
      )}
    </div>
  );
};

export default SolicitudClase;

