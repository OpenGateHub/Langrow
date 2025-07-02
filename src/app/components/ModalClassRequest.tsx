"use client";

import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useWindowSize from "../../hooks/useWindowSize";
import { useMentoringConfiguration } from "../../hooks/useMentoringConfiguration";

export type SelectedSlotType = {
  date: Date;
  dayName: string;
  timestamp: string;
  time: string;
  period?: string; // Agregado para período
  duration: string; // Agregado para duración
};

export type DaySchedule = {
  day: string;
  slots: string[];
};

export type WeeklyAgendaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  requiredClasses: number;
  professorId: string | number;
  professor: string;
  onSubmit: (selectedSlots: SelectedSlotType[]) => void;
};

const WEEK_DAYS_MAP: { [key: string]: string } = {
  Dom: "Domingo",
  Lun: "Lunes",
  Mar: "Martes",
  "Mié": "Miércoles",
  Jue: "Jueves",
  Vie: "Viernes",
  Sáb: "Sábado",
};

const WEEK_DAYS = Object.keys(WEEK_DAYS_MAP);

const CLASS_DURATION = 60; // Duración fija de las clases en minutos

// Función para convertir timeRanges a slots individuales
const convertTimeRangesToSlots = (timeRanges: { start: string; end: string }[]): string[] => {
  console.log('convertTimeRangesToSlots - Input timeRanges:', timeRanges);
  const slots: string[] = [];
  
  timeRanges.forEach(range => {
    console.log('convertTimeRangesToSlots - Processing range:', range);
    const startTime = new Date(`2000-01-01T${range.start}:00`);
    const endTime = new Date(`2000-01-01T${range.end}:00`);
    
    console.log('convertTimeRangesToSlots - startTime:', startTime, 'endTime:', endTime);
    
    // Generar slots cada 60 minutos dentro del rango
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5); // HH:MM
      console.log('convertTimeRangesToSlots - Adding slot:', timeString);
      slots.push(timeString);
      currentTime = new Date(currentTime.getTime() + CLASS_DURATION * 60 * 1000);
    }
  });
  
  console.log('convertTimeRangesToSlots - Final slots:', slots);
  return slots;
};

// Función para convertir formato antiguo a nuevo formato
const convertOldFormatToNew = (oldConfig: any): { schedule: any[] } => {
  console.log('convertOldFormatToNew - Input:', oldConfig);
  
  const dayMapping: { [key: string]: string } = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const schedule: any[] = [];

  Object.entries(oldConfig).forEach(([day, timeRange]) => {
    if (typeof timeRange === 'string' && dayMapping[day]) {
      console.log('convertOldFormatToNew - Processing day:', day, 'timeRange:', timeRange);
      
      // Convertir formato "8am-5pm" a timeRanges
      const timeRanges = convertTimeStringToRanges(timeRange as string);
      
      schedule.push({
        day: dayMapping[day],
        timeRanges: timeRanges
      });
    }
  });

  console.log('convertOldFormatToNew - Output schedule:', schedule);
  return { schedule };
};

// Función para convertir formato de tiempo "8am-5pm" a timeRanges
const convertTimeStringToRanges = (timeString: string): { start: string; end: string }[] => {
  console.log('convertTimeStringToRanges - Input:', timeString);
  
  const parts = timeString.split('-');
  if (parts.length !== 2) {
    console.log('convertTimeStringToRanges - Invalid format, returning empty array');
    return [];
  }

  const startTime = convert12HourTo24Hour(parts[0].trim());
  const endTime = convert12HourTo24Hour(parts[1].trim());
  
  console.log('convertTimeStringToRanges - Converted:', { start: startTime, end: endTime });
  return [{ start: startTime, end: endTime }];
};

// Función para convertir formato 12h a 24h
const convert12HourTo24Hour = (time12h: string): string => {
  console.log('convert12HourTo24Hour - Input:', time12h);
  
  const [time, modifier] = time12h.toLowerCase().split(/(am|pm)/);
  const [hours, minutes] = time.split(":");
  
  let finalHours = hours;
  if (hours === '12') {
    finalHours = modifier === 'pm' ? '12' : '00';
  } else if (modifier === 'pm') {
    finalHours = String(parseInt(hours) + 12);
  } else {
    finalHours = hours.padStart(2, '0');
  }
  
  const result = `${finalHours}:${minutes || '00'}`;
  console.log('convert12HourTo24Hour - Output:', result);
  return result;
};

export default function WeeklyAgendaModal({
  isOpen,
  onClose,
  requiredClasses,
  professorId,
  professor,
  onSubmit,
}: WeeklyAgendaModalProps) {
  // Función para obtener el inicio de la semana actual (lunes)
  const getCurrentWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Si es domingo (0), retroceder 6 días; si no, calcular días hasta lunes
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0); // Resetear a inicio del día
    return monday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getCurrentWeekStart);

  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Estados para animación de entrada/salida
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Hook para obtener la configuración del profesor
  const { configuration, loading: loadingConfiguration, error: configurationError } = useMentoringConfiguration(professorId);

  // Resetear a la semana actual cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentWeekStart(getCurrentWeekStart());
      setSelectedSlots([]); // Limpiar selecciones previas
      setErrorMessage(""); // Limpiar errores previos
      setVisible(true);
      setTimeout(() => setShowContent(true), 10);
    } else {
      setShowContent(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Convertir el nuevo formato de timeRanges al formato esperado por el modal
  const availableSchedule: DaySchedule[] = React.useMemo(() => {
    console.log('Modal - Configuration recibida:', configuration);
    console.log('Modal - Configuration.configuration:', configuration?.configuration);
    console.log('Modal - Configuration.configuration.schedule:', configuration?.configuration?.schedule);
    
    if (!configuration?.configuration) {
      console.log('Modal - No hay configuración');
      return [];
    }

    let processedConfig;
    
    // Detectar si es formato antiguo o nuevo
    if (configuration.configuration.schedule) {
      // Es formato nuevo
      console.log('Modal - Detectado formato nuevo');
      processedConfig = configuration.configuration;
    } else {
      // Es formato antiguo, convertir
      console.log('Modal - Detectado formato antiguo, convirtiendo...');
      processedConfig = convertOldFormatToNew(configuration.configuration);
    }
    
    if (!processedConfig.schedule) {
      console.log('Modal - No hay schedule en la configuración procesada');
      return [];
    }
    
    const converted = processedConfig.schedule.map(daySchedule => {
      console.log('Modal - Procesando día:', daySchedule);
      const slots = convertTimeRangesToSlots(daySchedule.timeRanges);
      console.log('Modal - Slots convertidos:', slots);
      return {
        day: daySchedule.day,
        slots: slots
      };
    });
    
    console.log('Modal - Schedule final:', converted);
    return converted;
  }, [configuration]);

  // Genera los 7 días de la semana a partir de currentWeekStart
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // Hook que obtiene el tamaño de la ventana
  const { width } = useWindowSize();
  let daysToShow = 7;
  if (width < 640) {
    daysToShow = 3;
  } else if (width < 1024) {
    daysToShow = 5;
  }

  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    setStartIndex(0);
  }, [daysToShow]);

const toggleSlotSelection = (date: Date, dayName: string, time: string) => {
  setErrorMessage("");

  const dateTime = date.getTime();

  const exists = selectedSlots.find(
    (slot) => slot.date.getTime() === dateTime && slot.time.includes(time)
  );

  if (exists) {
    setSelectedSlots(
      selectedSlots.filter(
        (slot) => !(slot.date.getTime() === dateTime && slot.time.includes(time))
      )
    );
  } else {
    if (selectedSlots.length < requiredClasses) {
      const [hours, minutes] = time.split(":").map(Number);
      const startDate = new Date(date);
      startDate.setHours(hours, minutes);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + CLASS_DURATION); // ← dinámico

      const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

      const formattedTime = `${formatTime(startDate)} - ${formatTime(endDate)}`;

      setSelectedSlots([
        ...selectedSlots,
        {
          date,
          timestamp: date.toISOString(),
          dayName,
          time,
          period: formattedTime,
          duration: `${CLASS_DURATION} min`,
        },
      ]);
    } else {
      setErrorMessage(`Solo puedes seleccionar ${requiredClasses} clase(s).`);
    }
  }
};

  const handleSubmit = () => {
    if (selectedSlots.length !== requiredClasses) {
      setErrorMessage(`Debes seleccionar ${requiredClasses} clase(s).`);
      return;
    }
    onSubmit(selectedSlots);
    onClose();
  };

  if (!visible) return null;

  const visibleDays = weekDays.slice(startIndex, startIndex + daysToShow);

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        showContent ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-xl p-6 w-[95%] max-w-4xl shadow-lg transform transition-transform duration-300 ${
          showContent ? "scale-100" : "scale-75"
        }`}
      >
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold">Agenda Semanal - {professor}</h2>
        </div>
        
        {/* Mostrar loading o error de configuración */}
        {loadingConfiguration && (
          <div className="text-center py-4">
            <p>Cargando horarios disponibles...</p>
          </div>
        )}
        
        {configurationError && (
          <div className="text-center py-4">
            <p className="text-red-500">Error al cargar horarios: {configurationError}</p>
          </div>
        )}

        {!loadingConfiguration && !configurationError && availableSchedule.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No hay horarios configurados para este profesor.</p>
            <p className="text-sm text-gray-500">El profesor debe configurar su disponibilidad en &quot;Mi Agenda&quot;.</p>
          </div>
        )}

        {!loadingConfiguration && !configurationError && availableSchedule.length > 0 && (
          <>
            <div className="flex justify-between mb-4">
              <button
                onClick={() => {
                  if (daysToShow < 7) {
                    if (startIndex > 0) setStartIndex(startIndex - 1);
                  } else {
                    setCurrentWeekStart((prev) => {
                      const newDate = new Date(prev);
                      newDate.setDate(prev.getDate() - 7);
                      return newDate;
                    });
                  }
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                <FaArrowLeft />
              </button>
              
              <button
                onClick={() => setCurrentWeekStart(getCurrentWeekStart())}
                className="px-4 py-1 bg-secondary text-white rounded hover:bg-secondary-hover text-sm"
              >
                Hoy
              </button>
              
              <button
                onClick={() => {
                  if (daysToShow < 7) {
                    if (startIndex + daysToShow < 7) setStartIndex(startIndex + 1);
                  } else {
                    setCurrentWeekStart((prev) => {
                      const newDate = new Date(prev);
                      newDate.setDate(prev.getDate() + 7);
                      return newDate;
                    });
                  }
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                <FaArrowRight />
              </button>
            </div>
            <div
              className="gap-2 text-center"
              style={{ display: "grid", gridTemplateColumns: `repeat(${daysToShow}, minmax(0, 1fr))` }}
            >
              {visibleDays.map((date, idx) => {
                const dayAbbr = WEEK_DAYS[date.getDay()];
                const fullDayName = WEEK_DAYS_MAP[dayAbbr];
                return (
                  <div
                    key={idx}
                    className="border p-2 rounded-xl bg-gray-100 hover:bg-gray-300 transition-all duration-200 ease-in-out"
                  >
                    <div className="text-sm font-semibold">{dayAbbr}</div>
                    <div className="text-xs mb-2">{date.getDate()}</div>
                    <div className="flex flex-col gap-1">
                      {availableSchedule.find((s) => s.day === fullDayName)?.slots.map((time, i) => {
                        const isSelected = selectedSlots.some(
                          (slot) =>
                            slot.date.toDateString() === date.toDateString() && slot.time === time
                        );
                        return (
                          <button
                            key={i}
                            onClick={() => toggleSlotSelection(date, fullDayName, time)}
                            className={`transition-all duration-200 ease-in-out px-3 py-1 hover:scale-105 rounded ${
                              isSelected
                                ? "bg-secondary text-white"
                                : "bg-white text-gray-800 border"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      }) || <p className="text-xs text-gray-500">Sin horarios</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {errorMessage && (
              <p className="text-red-500 text-center mt-2">{errorMessage}</p>
            )}
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 ease-in-out"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-secondary text-white hover:bg-secondary-hover transition-all duration-200 ease-in-out"
              >
                Confirmar Selección
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
