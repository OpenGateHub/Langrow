"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useProfileContext } from "@/context/ProfileContext";
import useWindowSize from "@/hooks/useWindowSize";
import MessageModal from "@/app/components/Modal"; // Asegurate de que la ruta sea correcta

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function WeeklySchedulePage() {
  // Solo permite el acceso si el usuario tiene rol "org:profesor"
  const { role } = useProfileContext();
  if (role !== "org:profesor") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600">
          No tienes permisos para ver esta página.
        </p>
      </main>
    );
  }

  // Hook para conocer el tamaño de la ventana y definir nombres de días según el breakpoint
  const { width } = useWindowSize();
  const DAYS = width < 768 
    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    : WEEK_DAYS;

  // Estado para los horarios disponibles
  const [availableSlots, setAvailableSlots] = useState<{ day: string; hour: number }[]>([]);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Calcula el lunes de la semana actual
  const getMonday = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));

  // Genera un array de objetos con el nombre del día y la fecha formateada
  const getWeekDays = (monday: Date) => {
    return DAYS.map((day, i) => {
      const dayDate = new Date(monday);
      dayDate.setDate(dayDate.getDate() + i);
      return {
        dayName: day,
        date: dayDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        fullDate: dayDate,
      };
    });
  };

  const weekDays = getWeekDays(currentWeekStart);

  // Navegación entre semanas
  const previousWeek = () => {
    const newMonday = new Date(currentWeekStart);
    newMonday.setDate(newMonday.getDate() - 7);
    setCurrentWeekStart(newMonday);
  };

  const nextWeek = () => {
    const newMonday = new Date(currentWeekStart);
    newMonday.setDate(newMonday.getDate() + 7);
    setCurrentWeekStart(newMonday);
  };

  // Alterna un horario en una celda
  const toggleSlot = (day: string, hour: number) => {
    const exists = availableSlots.some(slot => slot.day === day && slot.hour === hour);
    if (exists) {
      setAvailableSlots(availableSlots.filter(slot => !(slot.day === day && slot.hour === hour)));
    } else {
      setAvailableSlots([...availableSlots, { day, hour }]);
    }
  };

  const isSlotAvailable = (day: string, hour: number) =>
    availableSlots.some(slot => slot.day === day && slot.hour === hour);

  // Horarios: de 5 a 23 horas (19 filas)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  const handleSave = async () => {
    try {
      // Simulamos una llamada a la API con un retardo
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Disponibilidad guardada:", availableSlots);
      setModalType("success");
      setModalMessage("¡Disponibilidad guardada exitosamente!");
      setModalOpen(true);
    } catch (error) {
      console.error("Error al guardar disponibilidad", error);
      setModalType("error");
      setModalMessage("Ocurrió un error al guardar. Inténtalo nuevamente.");
      setModalOpen(true);
    }
  };

  return (
    <main className="min-h-screen relative bg-gray-100 p-4 flex flex-col">
      {/* Modal */}
      <MessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        message={modalMessage}
      />
      {/* Fondo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/bg-login.jpg"
          alt="Fondo"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
        />
      </div>
      {/* Header */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary">Agenda Semanal</h1>
        <p className="mt-2 text-base md:text-lg text-gray-700">
          Selecciona tus horarios disponibles para dar clases
        </p>
      </header>
      {/* Navegación entre semanas */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousWeek}
          className="px-2 py-1 md:px-4 md:py-2 bg-white rounded-full shadow hover:bg-gray-200 transition duration-300 text-xs md:text-base"
        >
          ← Anterior
        </button>
        <div className="text-xs md:text-xl font-semibold">
          {currentWeekStart.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          -{" "}
          {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <button
          onClick={nextWeek}
          className="px-2 py-1 md:px-4 md:py-2 bg-white rounded-full shadow hover:bg-gray-200 transition duration-300 text-xs md:text-base"
        >
          Siguiente →
        </button>
      </div>
      {/* Agenda en grid */}
      <div className="overflow-auto flex-1">
        <div className="min-w-full bg-white bg-opacity-70 shadow-lg rounded-3xl p-2 md:p-4">
          <div className="grid grid-cols-8 gap-1 md:gap-2">
            {/* Columna de horas */}
            <div className="col-span-1 flex flex-col">
              <div className="h-8 md:h-12"></div>
              {hours.map(hour => (
                <div key={hour} className="h-8 md:h-12 flex items-center justify-center font-semibold border-b border-gray-200 text-[10px] md:text-sm">
                  {hour}:00
                </div>
              ))}
            </div>
            {/* Columnas para cada día */}
            {weekDays.map(dayObj => (
              <div key={dayObj.dayName} className="flex flex-col">
                <div className="h-8 md:h-12 flex flex-col items-center justify-center font-medium border-b border-gray-200">
                  <span className="text-[10px] md:text-base">{dayObj.dayName}</span>
                  <span className="text-[8px] md:text-sm text-gray-600">{dayObj.date}</span>
                </div>
                {hours.map(hour => {
                  const available = isSlotAvailable(dayObj.dayName, hour);
                  return (
                    <div
                      key={dayObj.dayName + hour}
                      onClick={() => toggleSlot(dayObj.dayName, hour)}
                      className={`h-8 md:h-12 flex items-center justify-center border-b border-gray-200 cursor-pointer transition-colors duration-200 text-[8px] md:text-sm ${
                        available ? "bg-[#9dd295]" : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {available ? "✓" : ""}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Botón de Guardar */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSave}
          className="px-4 py-2 md:px-8 md:py-3 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-full shadow transition duration-200 text-xs md:text-base"
        >
          Guardar Disponibilidad
        </button>
      </div>
    </main>
  );
}
