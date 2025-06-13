"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useProfileContext } from "@/context/ProfileContext";
import useWindowSize from "@/hooks/useWindowSize";
import MessageModal from "@/app/components/Modal";
import { useGetMentoring, MentoringSession } from "@/hooks/useMentoring";

const WEEK_DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
type SlotStatus = "none" | "available" | "reserved";

export default function WeeklySchedulePage() {
  const { clerkUser, role } = useProfileContext();
  const { width } = useWindowSize();

  // Modal de notificaciones
  const [modalOpen, setModalOpen]       = useState(false);
  const [modalType, setModalType]       = useState<"success"|"error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Estado local de todos los slots
  const [slotStates, setSlotStates] = useState<Record<string,SlotStatus>>({});

  // Calcula el lunes de la semana
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const diff = (date.getDay() + 6) % 7; // lunes = 0
    date.setDate(date.getDate() - diff);
    return date;
  };
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));

  // Formateo ISO para la API
  const dateFrom = useMemo(() => currentWeekStart.toISOString().slice(0,10), [currentWeekStart]);
  const dateTo   = useMemo(
    () => new Date(currentWeekStart.getTime() + 6*86400000).toISOString().slice(0,10),
    [currentWeekStart]
  );

  // Trae sesiones y reservedSlots del hook
  const {
    sessions,
    loading: loadingSessions,
    error: errorSessions,
    reservedSlots
  } = useGetMentoring({
    userId: clerkUser?.id || "",
    dateFrom,
    dateTo,
    page: 50
  });

  // Días abreviados/completos según ancho
  const DAYS = width<768
    ? ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
    : WEEK_DAYS;

  // Memoiza los días de la semana con fecha y nombre
  const weekDays = useMemo(() => {
    return DAYS.map((dayName,i) => {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate()+i);
      return {
        dayName,
        dateStr: date.toLocaleDateString("es-ES",{day:"numeric",month:"short"}),
        fullDate: date,
      };
    });
  }, [currentWeekStart, width]);

  // Inicializa slotStates cada vez que cambian reservedSlots o weekDays
  useEffect(() => {
    const all: Record<string,SlotStatus> = {};
    weekDays.forEach(({ fullDate }) => {
      const longDay = fullDate.toLocaleDateString("es-ES",{weekday:"long"});
      for (let hr=5; hr<=23; hr++) {
        const key = `${longDay}-${hr}`;
        all[key] = reservedSlots[key] ?? "none";
      }
    });
    setSlotStates(all);
  }, [reservedSlots, weekDays]);

  // Alterna none <-> available (no toca reserved)
  const cycleSlot = (day:string, hour:number) => {
    const key = `${day}-${hour}`;
    if (slotStates[key] === "reserved") return;
    setSlotStates(st => ({
      ...st,
      [key]: st[key]==="available" ? "none" : "available"
    }));
  };

  // Navegación entre semanas
  const previousWeek = () =>
    setCurrentWeekStart(d => new Date(d.getTime() - 7*86400000));
  const nextWeek = () =>
    setCurrentWeekStart(d => new Date(d.getTime() + 7*86400000));

  // Guardar (aquí luego integrarás tu hook de POST)
  const handleSave = useCallback(() => {
    console.log("Disponibilidad a guardar:", slotStates);
    setModalType("success");
    setModalMessage("¡Disponibilidad guardada exitosamente!");
    setModalOpen(true);
  }, [slotStates]);

  const hours = Array.from({length:19},(_,i)=>i+5);

  if (role !== "org:profesor") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600">No tienes permisos para ver esta página.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative bg-gray-100 p-4 flex flex-col">
      <MessageModal
        isOpen={modalOpen}
        onClose={()=>setModalOpen(false)}
        type={modalType}
        message={modalMessage}
      />

      <div className="absolute inset-0 -z-10">
        <Image src="/bg-login.jpg" alt="Fondo" fill style={{objectFit:"cover"}} className="opacity-80"/>
      </div>

      <header className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary">Mi Agenda</h1>
        <p className="mt-2 text-lg text-gray-700">Marca tus franjas disponibles para dar clases</p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <button onClick={previousWeek} className="px-4 py-2 bg-white rounded-full shadow">← Anterior</button>
        <div className="font-semibold">
          {currentWeekStart.toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}
          {" – "}
          {new Date(currentWeekStart.getTime()+6*86400000).toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"})}
        </div>
        <button onClick={nextWeek} className="px-4 py-2 bg-white rounded-full shadow">Siguiente →</button>
      </div>

      {loadingSessions && <p className="text-center">Cargando sesiones reservadas…</p>}
      {errorSessions && <p className="text-center text-red-500">{errorSessions}</p>}

      <div className="overflow-auto flex-1">
        <div className="min-w-full bg-white bg-opacity-70 shadow-lg rounded-3xl p-4">
          <div className="grid grid-cols-8 gap-1 md:gap-2">
            {/* Horas */}
            <div className="col-span-1 flex flex-col">
              <div className="h-12" />
              {hours.map(hr=>(
                <div key={hr} className="h-12 flex items-center justify-center border-b text-sm">
                  {hr}:00
                </div>
              ))}
            </div>
            {/* Días */}
            {weekDays.map(({ dayName, dateStr, fullDate })=>{
              const longDay = fullDate.toLocaleDateString("es-ES",{weekday:"long"});
              return (
                <div key={dayName} className="flex flex-col">
                  <div className="h-12 flex flex-col items-center justify-center border-b">
                    <span className="font-medium">{dayName}</span>
                    <span className="text-sm text-gray-600">{dateStr}</span>
                  </div>
                  {hours.map(hr=>{
                    const key = `${longDay}-${hr}`;
                    const status = slotStates[key] || "none";
                    const base = "h-12 flex items-center justify-center border-b text-sm transition-colors";
                    if(status==="reserved"){
                      return <div key={key} className={`${base} bg-blue-300 cursor-default`}>RSV</div>;
                    }
                    if(status==="available"){
                      return <div
                        key={key}
                        onClick={()=>cycleSlot(longDay,hr)}
                        className={`${base} bg-[#9dd295] cursor-pointer`}
                      >Disponible</div>;
                    }
                    return <div
                      key={key}
                      onClick={()=>cycleSlot(longDay,hr)}
                      className={`${base} bg-white cursor-pointer`}
                    >X</div>;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-around text-sm">
        <div><span className="inline-block w-5 h-5 bg-white border mr-1"/>No disponible</div>
        <div><span className="inline-block w-5 h-5 bg-[#9dd295] mr-1"/>Disponible</div>
        <div><span className="inline-block w-5 h-5 bg-blue-300 mr-1"/>Clase reservada</div>
      </div>

      <div className="mt-6 flex justify-center">
        <button onClick={handleSave} className="px-8 py-3 bg-secondary hover:bg-secondary-hover text-white rounded-full shadow">
          Guardar Disponibilidad
        </button>
      </div>
    </main>
  );
}
