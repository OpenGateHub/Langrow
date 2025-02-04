"use client";
import React, { useState } from "react";
import WeeklyAgendaModal, { SelectedSlotType, DaySchedule } from "../components/ModalClassRequest";
import MessageModal from "../components/Modal"; // Ajusta la ruta según corresponda

const bookingOptions = [
  {
    id: "unica",
    label: "Reservar única clase",
    bg: "bg-blue-700",
    hoverBg: "hover:bg-blue-800",
  },
  {
    id: "10clases",
    label: "Reservar 10 clases x 30% de descuento",
    bg: "bg-green-700",
    hoverBg: "hover:bg-green-800",
  },
  {
    id: "20clases",
    label: "Reservar 20 clases x 50% de descuento",
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

// Mock de la agenda disponible para un profesor (se pasa al modal)
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
  const [selectedBooking, setSelectedBooking] = useState<"unica" | "10clases" | "20clases" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<SelectedSlotType[]>([]);
  const [category, setCategory] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [motivoError, setMotivoError] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [scheduleError, setScheduleError] = useState<string>("");

  // Estado para el MessageModal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  const [messageModalType, setMessageModalType] = useState<"success" | "error">("success");
  const [messageModalMessage, setMessageModalMessage] = useState<string>("");

  // Al elegir una opción de reserva se reinicia la selección previa
  const handleBookingClick = (bookingId: "unica" | "10clases" | "20clases") => {
    setSelectedBooking(bookingId);
    setSelectedSchedule([]); // Reiniciamos la selección de horarios
    setIsModalOpen(true);
  };

  // Callback desde el modal de agenda
  const handleModalSubmit = (slots: SelectedSlotType[]) => {
    // Actualizamos la selección según lo que retorne el modal
    if (slots.length === 0) {
      setScheduleError("Debes seleccionar al menos un horario.");
      setSelectedSchedule([]); // Aseguramos que quede vacío
    } else {
      setScheduleError("");
      setSelectedSchedule(slots);
    }
    setIsModalOpen(false);
  };

  // Función para obtener la cantidad requerida según la opción de reserva
  const getRequiredCount = (option: "unica" | "10clases" | "20clases"): number => {
    if (option === "unica") return 1;
    if (option === "10clases") return 10;
    if (option === "20clases") return 20;
    return 0;
  };

  // Al confirmar la reserva se validan todos los campos
  const handleConfirmReservation = () => {
    let valid = true;
  
    if (!category) {
      setCategoryError("Debes seleccionar una categoría.");
      valid = false;
    } else {
      setCategoryError("");
    }
  
    const requiredCount = selectedBooking ? getRequiredCount(selectedBooking) : 0;
    console.log("Requerido:", requiredCount, "Seleccionado:", selectedSchedule.length);
  
    if (selectedSchedule.length !== requiredCount) {
      setScheduleError(`Te faltan reservar clases. Debes seleccionar ${requiredCount} clase(s).`);
      valid = false;
    } else {
      setScheduleError("");
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
  
    // 🚨 IMPORTANTE: Asegurar que si hay errores, no se continúe
    if (!valid) {
      console.log("Validación fallida, no se abrirá el modal de éxito");
      return;
    }
  
    console.log("Reserva confirmada", {
      selectedBooking,
      category,
      motivo,
      selectedSchedule,
    });
  
    // Mostrar modal de éxito solo si todas las validaciones pasaron
    setMessageModalType("success");
    setMessageModalMessage("Reserva confirmada: ¡Éxito obvio!");
    setIsMessageModalOpen(true);
  
    // Reiniciar formulario
    setSelectedBooking(null);
    setCategory("");
    setMotivo("");
    setSelectedSchedule([]);
  };
  

  const handleCancel = () => {
    setSelectedBooking(null);
    setCategory("");
    setMotivo("");
    setMotivoError("");
    setCategoryError("");
    setScheduleError("");
    setSelectedSchedule([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Solicitar Clase</h1>

      {/* Botones para seleccionar el tipo de reserva */}
      <div className="flex justify-center space-x-4 mb-6">
        {bookingOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleBookingClick(option.id as "unica" | "10clases" | "20clases")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedBooking === option.id
                ? `${option.bg} ${option.hoverBg} shadow-md text-white`
                : `${option.bg} text-white ${option.hoverBg} shadow-md`
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Resumen de horarios seleccionados (si existen) */}
      {selectedSchedule.length > 0 && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold">Horarios seleccionados:</h3>
          <ul className="list-disc pl-5">
            {selectedSchedule.map((slot, index) => (
              <li key={index}>
                {slot.day} - {slot.time}
              </li>
            ))}
          </ul>
        </div>
      )}
      {scheduleError && <p className="text-red-500 text-sm mb-2">{scheduleError}</p>}

      {/* Selección de categoría */}
      <div className="mb-4">
        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
          Selecciona la categoría
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full p-2 border rounded-md focus:outline-none ${categoryError ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="">-- Selecciona una categoría --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {categoryError && <p className="text-red-500 text-sm mt-1">{categoryError}</p>}
      </div>

      {/* Motivo de clase */}
      <div className="mb-4">
        <label htmlFor="motivo" className="block text-gray-700 font-medium mb-2">
          Motivo de clase
        </label>
        <textarea
          id="motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Escribe el motivo de la clase..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
          rows={4}
          minLength={50}
          maxLength={200}
        />
        {motivoError && <p className="text-red-500 text-sm mt-1">{motivoError}</p>}
        <p className="mt-1 text-sm text-gray-500">{motivo.length} / 200 caracteres</p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmReservation}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
        >
          Confirmar Reserva
        </button>
      </div>

      {/* Modal de Agenda Semanal para un único profesor */}
      {isModalOpen && selectedBooking && (
        <WeeklyAgendaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bookingOption={selectedBooking}
          availableSchedule={professorSchedule}
          professor="Profesor X"
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Message Modal para mostrar éxito o error */}
      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          type={messageModalType}
          message={messageModalMessage}
        />
      )}
    </div>
  );
};

export default SolicitudClase;

