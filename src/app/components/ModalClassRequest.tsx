"use client";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export type SelectedSlotType = {
  date: Date;
  dayName: string;
  time: string;
};

export type DaySchedule = {
  day: string;
  slots: string[];
};

export type WeeklyAgendaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  requiredClasses: number;
  availableSchedule: DaySchedule[];
  professor: string;
  onSubmit: (selectedSlots: SelectedSlotType[]) => void;
};

const WEEK_DAYS_MAP: { [key: string]: string } = {
  "Dom": "Domingo",
  "Lun": "Lunes",
  "Mar": "Martes",
  "Mié": "Miércoles",
  "Jue": "Jueves",
  "Vie": "Viernes",
  "Sáb": "Sábado"
};

const WEEK_DAYS = Object.keys(WEEK_DAYS_MAP);

const WeeklyAgendaModal: React.FC<WeeklyAgendaModalProps> = ({
  isOpen,
  onClose,
  requiredClasses,
  availableSchedule,
  professor,
  onSubmit,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  });

  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Estados y useEffect para animaciones de entrada/salida
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setShowContent(true), 10);
    } else {
      setShowContent(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const toggleSlotSelection = (date: Date, dayName: string, time: string) => {
    setErrorMessage("");
    const exists = selectedSlots.find(
      (slot) =>
        slot.date.toDateString() === date.toDateString() && slot.time === time
    );
    if (exists) {
      setSelectedSlots(
        selectedSlots.filter(
          (slot) =>
            !(slot.date.toDateString() === date.toDateString() && slot.time === time)
        )
      );
    } else {
      if (selectedSlots.length < requiredClasses) {
        setSelectedSlots([...selectedSlots, { date, dayName, time }]);
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
        <div className="flex justify-between mb-4">
          <button
            onClick={() =>
              setCurrentWeekStart((prev) => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() - 7);
                return newDate;
              })
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={() =>
              setCurrentWeekStart((prev) => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() + 7);
                return newDate;
              })
            }
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <FaArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {weekDays.map((date, idx) => {
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
                        slot.date.toDateString() === date.toDateString() &&
                        slot.time === time
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
      </div>
    </div>
  );
};

export default WeeklyAgendaModal;
