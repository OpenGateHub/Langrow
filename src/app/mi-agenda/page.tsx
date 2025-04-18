"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useProfileContext } from "@/context/ProfileContext";
import useWindowSize from "@/hooks/useWindowSize";
import MessageModal from "@/app/components/Modal"; // El modal que nos pasaste

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type SlotStatus = "none" | "available" | "reserved";

export default function WeeklySchedulePage() {
  const { role } = useProfileContext();
  const { width } = useWindowSize();

  // A modo de mock se definen algunos horarios ocupados (clases reservadas)
  // Nota: se usan los mismos nombres que en WEEK_DAYS para mayor consistencia (para pantallas grandes)
  const [slotStates, setSlotStates] = useState<Record<string, SlotStatus>>({
    "Lunes-10": "reserved",       // Lunes 10:00 ya está reservado
    "Miércoles-14": "reserved",   // Miércoles 14:00 ya está reservado
    "Viernes-18": "reserved",     // Viernes 18:00 ya está reservado
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Dependiendo del ancho, se usa la versión corta o completa de los nombres de días.
  const DAYS = width < 768 ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] : WEEK_DAYS;

  // Calcula el lunes de la semana actual
  const getMonday = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay(); // 0 = domingo, 1 = lunes, etc.
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

  // Función para ciclar entre los tres estados: no disponible -> disponible -> reservado -> no disponible.
  const cycleSlot = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const currentStatus = slotStates[key] || "none";
    let nextStatus: SlotStatus;
    if (currentStatus === "none") {
      nextStatus = "available";
    } else if (currentStatus === "available") {
      nextStatus = "reserved";
    } else {
      nextStatus = "none";
    }
    setSlotStates({
      ...slotStates,
      [key]: nextStatus,
    });
  };

  // Horarios: de 5 a 23 horas (19 filas)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5);

  // Función para simular guardar la disponibilidad/clases
  const handleSave = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Estados de horarios guardados:", slotStates);
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
    <>
      {role !== "org:profesor" ? (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <p className="text-lg text-red-600">No tienes permisos para ver esta página.</p>
        </main>
      ) : (
        <main className="min-h-screen relative bg-gray-100 p-4 flex flex-col">
          {/* Modal para notificaciones */}
          <MessageModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            type={modalType}
            message={modalMessage}
          />
          {/* Imagen de fondo */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/bg-login.jpg"
              alt="Fondo"
              fill
              style={{ objectFit: "cover" }}
              className="opacity-80"
            />
          </div>
          {/* Encabezado */}
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
                      const key = `${dayObj.dayName}-${hour}`;
                      const status: SlotStatus = slotStates[key] || "none";
                      let bgColor = "";
                      let content = "";
                      if (status === "available") {
                        bgColor = "bg-[#9dd295]";
                        content = "Disponible";
                      } else if (status === "reserved") {
                        bgColor = "bg-blue-300";
                        content = "Clase Reservada";
                      } else {
                        bgColor = "bg-white";
                        content = "X";
                      }
                      return (
                        <div
                          key={key}
                          onClick={() => cycleSlot(dayObj.dayName, hour)}
                          className={`h-8 md:h-12 flex items-center justify-center border-b border-gray-200 cursor-pointer transition-colors duration-200 text-[8px] md:text-sm ${bgColor}`}
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Leyenda de estados */}
          <div className="mt-4 flex justify-around">
            <div className="flex items-center">
              <span className="w-5 h-5 bg-white border border-gray-300 flex items-center justify-center text-xs mr-1">X</span>
              <span className="text-sm">No disponible</span>
            </div>
            <div className="flex items-center">
              <span className="w-5 h-5 bg-[#9dd295] flex items-center justify-center text-xs mr-1">✓</span>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center">
              <span className="w-5 h-5 bg-blue-300 flex items-center justify-center text-xs mr-1">RSV</span>
              <span className="text-sm">Clase reservada</span>
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
      )}
    </>
  );
}
