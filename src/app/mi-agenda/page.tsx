"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useProfileContext } from "@/context/ProfileContext";
import useWindowSize from "@/hooks/useWindowSize";
import MessageModal from "@/app/components/Modal";
import BlockUi from "@/app/components/BlockUi";
import { useMentoringConfiguration, ProfessorSchedule, TimeRange } from "@/hooks/useMentoringConfiguration";

const WEEK_DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
type SlotStatus = "none" | "available" | "reserved";

export default function WeeklySchedulePage() {
  const { clerkUser, role, profile } = useProfileContext();
  const { width } = useWindowSize();

  // Modal de notificaciones
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"success"|"error">("success");
  const [modalMessage, setModalMessage] = useState("");

  // Estado local de todos los slots
  const [slotStates, setSlotStates] = useState<Record<string,SlotStatus>>({});
  
  // Estado global para persistir selecciones por semana (temporales, no guardadas)
  const [tempSelections, setTempSelections] = useState<Record<string, Record<string,SlotStatus>>>({});

  // Calcula el lunes de la semana actual (lunes)
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const diff = (date.getDay() + 6) % 7; // lunes = 0
    date.setDate(date.getDate() - diff);
    return date;
  };
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));

  // Obtener configuración de mentoring
  const {
    configuration,
    loading: loadingConfiguration,
    error: errorConfiguration,
    refetch: refetchConfiguration,
    saveConfiguration
  } = useMentoringConfiguration(profile?.id || "");

  // Estado de carga inicial - mostrar spinner hasta que el perfil y la configuración estén listos
  const isLoading = !profile || loadingConfiguration;

  // Días abreviados/completos según ancho
  const DAYS = width<768
    ? ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
    : WEEK_DAYS;

  // Memoiza los días de la semana con fecha y nombre
  const weekDays = useMemo(() => {
    return DAYS.map((dayName,i) => {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      return {
        dayName,
        dateStr: date.getDate().toString(),
        fullDate: date,
      };
    });
  }, [currentWeekStart, width]);

  // Función para verificar si una hora está dentro de un rango
  const isHourInRange = (hour: number, timeRanges: TimeRange[]): boolean => {
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    return timeRanges.some(range => {
      const startHour = parseInt(range.start.split(':')[0]);
      const endHour = parseInt(range.end.split(':')[0]);
      const currentHour = hour;
      return currentHour >= startHour && currentHour < endHour;
    });
  };

  // Función para obtener la clave de la semana actual
  const getWeekKey = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD del lunes
  };

  // Inicializa slotStates cada vez que cambia la configuración o weekDays
  useEffect(() => {
    const weekKey = getWeekKey(currentWeekStart);
    const all: Record<string,SlotStatus> = {};
    
    weekDays.forEach(({ fullDate }) => {
      const longDay = fullDate.toLocaleDateString("es-ES",{weekday:"long"});
      for (let hr=5; hr<=23; hr++) {
        const key = `${longDay}-${hr}`;
        
        // Primero verificar si hay selecciones temporales para esta semana
        const tempSelection = tempSelections[weekKey]?.[key];
        if (tempSelection !== undefined) {
          all[key] = tempSelection;
        } else {
          // Si no hay selección temporal, usar la configuración guardada
          const daySchedule = configuration?.configuration?.schedule?.find(
            day => day.day === longDay
          );
          const isAvailable = daySchedule ? isHourInRange(hr, daySchedule.timeRanges) : false;
          all[key] = isAvailable ? "available" : "none";
        }
      }
    });
    setSlotStates(all);
  }, [configuration, weekDays, tempSelections, currentWeekStart]);

  // Función para alternar un rango de horas
  const toggleTimeRange = (day: string, startHour: number, endHour: number) => {
    const weekKey = getWeekKey(currentWeekStart);
    const newSlotStates = { ...slotStates };
    
    // Verificar si todo el rango está disponible
    const isRangeAvailable = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
      .every(hour => slotStates[`${day}-${hour}`] === "available");
    
    // Si todo el rango está disponible, lo marcamos como no disponible
    // Si no, marcamos todo el rango como disponible
    const newStatus: SlotStatus = isRangeAvailable ? "none" : "available";
    
    for (let hour = startHour; hour < endHour; hour++) {
      const key = `${day}-${hour}`;
      newSlotStates[key] = newStatus;
    }
    
    // Actualizar estado local
    setSlotStates(newSlotStates);
    
    // Guardar en selecciones temporales por semana
    setTempSelections(prev => ({
      ...prev,
      [weekKey]: {
        ...prev[weekKey],
        ...Object.fromEntries(
          Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
            .map(hour => [`${day}-${hour}`, newStatus])
        )
      }
    }));
  };

  // Navegación entre semanas
  const previousWeek = () =>
    setCurrentWeekStart(d => new Date(d.getTime() - 7*86400000));
  const nextWeek = () =>
    setCurrentWeekStart(d => new Date(d.getTime() + 7*86400000));

  // Guardar configuración
  const handleSave = useCallback(async () => {
    if (!profile?.id) {
      setModalType("error");
      setModalMessage("Error: No se pudo identificar tu perfil");
      setModalOpen(true);
      return;
    }

    try {
      // Combinar todas las selecciones temporales de todas las semanas
      const allSelections: Record<string, SlotStatus> = {};
      
      // Agregar todas las selecciones temporales
      Object.values(tempSelections).forEach(weekSelections => {
        Object.assign(allSelections, weekSelections);
      });
      
      // Agregar la configuración guardada existente (para días que no tienen selecciones temporales)
      if (configuration?.configuration?.schedule) {
        configuration.configuration.schedule.forEach(daySchedule => {
          daySchedule.timeRanges.forEach(range => {
            const startHour = parseInt(range.start.split(':')[0]);
            const endHour = parseInt(range.end.split(':')[0]);
            
            for (let hour = startHour; hour < endHour; hour++) {
              const key = `${daySchedule.day}-${hour}`;
              if (!allSelections[key]) {
                allSelections[key] = "available";
              }
            }
          });
        });
      }

      // Convertir todas las selecciones a formato de configuración con rangos
      const schedule: ProfessorSchedule[] = [];
      const daysMap = new Map<string, number[]>();

      // Agrupar horas disponibles por día
      Object.entries(allSelections).forEach(([key, status]) => {
        if (status === "available") {
          const [day, hour] = key.split("-");
          if (!daysMap.has(day)) {
            daysMap.set(day, []);
          }
          daysMap.get(day)!.push(parseInt(hour));
        }
      });

      // Convertir horas agrupadas a rangos de tiempo
      daysMap.forEach((hours, day) => {
        if (hours.length > 0) {
          const sortedHours = hours.sort((a, b) => a - b);
          const timeRanges: TimeRange[] = [];
          let currentStart = sortedHours[0];
          let currentEnd = sortedHours[0];

          for (let i = 1; i < sortedHours.length; i++) {
            if (sortedHours[i] === currentEnd + 1) {
              currentEnd = sortedHours[i];
            } else {
              // Finalizar rango actual
              timeRanges.push({
                start: `${currentStart.toString().padStart(2, '0')}:00`,
                end: `${(currentEnd + 1).toString().padStart(2, '0')}:00`
              });
              currentStart = sortedHours[i];
              currentEnd = sortedHours[i];
            }
          }
          
          // Agregar último rango
          timeRanges.push({
            start: `${currentStart.toString().padStart(2, '0')}:00`,
            end: `${(currentEnd + 1).toString().padStart(2, '0')}:00`
          });

          schedule.push({ day, timeRanges });
        }
      });

      const success = await saveConfiguration(schedule);
      
      if (success) {
        // Limpiar selecciones temporales después de guardar exitosamente
        setTempSelections({});
        setModalType("success");
        setModalMessage("¡Disponibilidad guardada exitosamente!");
        setModalOpen(true);
      } else {
        setModalType("error");
        setModalMessage("Error al guardar la configuración");
        setModalOpen(true);
      }
    } catch (error) {
      setModalType("error");
      setModalMessage(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setModalOpen(true);
    }
  }, [tempSelections, configuration, profile?.id, saveConfiguration]);

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
        <p className="mt-2 text-lg text-gray-700">Marca tus rangos de horarios disponibles para dar clases</p>
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

      <BlockUi isActive={isLoading} />
      {errorConfiguration && <p className="text-center text-red-500">{errorConfiguration}</p>}

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
                    if(status==="available"){
                      return <div
                        key={key}
                        onClick={()=>toggleTimeRange(longDay, hr, hr+1)}
                        className={`${base} bg-[#9dd295] cursor-pointer`}
                      >Disponible</div>;
                    }
                    return <div
                      key={key}
                      onClick={()=>toggleTimeRange(longDay, hr, hr+1)}
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
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-8 py-3 bg-secondary text-white rounded-full font-semibold shadow-lg hover:bg-secondary-hover transition-colors disabled:opacity-50"
        >
          {isLoading ? "Guardando..." : 
           Object.keys(tempSelections).length > 0 ? "Guardar Cambios" : "Guardar Disponibilidad"}
        </button>
        {Object.keys(tempSelections).length > 0 && (
          <div className="ml-4 flex items-center text-orange-600 text-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Tienes cambios sin guardar
          </div>
        )}
      </div>
    </main>
  );
}
