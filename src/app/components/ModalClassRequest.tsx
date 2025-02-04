"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export type SelectedSlotType = {
  day: string;
  time: string;
};

export type DaySchedule = {
  day: string;
  slots: string[]; // Horarios disponibles para ese día
};

export type WeeklyAgendaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingOption: "unica" | "10clases" | "20clases";
  availableSchedule: DaySchedule[];
  professor: string;
  onSubmit: (selectedSlots: SelectedSlotType[]) => void;
};

const getMaxSelections = (
  bookingOption: "unica" | "10clases" | "20clases"
): number => {
  switch (bookingOption) {
    case "unica":
      return 1;
    case "10clases":
      return 10;
    case "20clases":
      return 20;
    default:
      return 1;
  }
};

const WeeklyAgendaModal: React.FC<WeeklyAgendaModalProps> = ({
  isOpen,
  onClose,
  bookingOption,
  availableSchedule,
  professor,
  onSubmit,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotType[]>([]);
  const maxSelections = getMaxSelections(bookingOption);

  // Alterna la selección de un horario para un día determinado
  const toggleSlotSelection = (day: string, time: string) => {
    const exists = selectedSlots.find(
      (slot) => slot.day === day && slot.time === time
    );
    if (exists) {
      setSelectedSlots(
        selectedSlots.filter(
          (slot) => !(slot.day === day && slot.time === time)
        )
      );
    } else {
      if (selectedSlots.length < maxSelections) {
        setSelectedSlots([...selectedSlots, { day, time }]);
      } else {
        alert(`Solo puedes seleccionar ${maxSelections} clase(s).`);
      }
    }
  };

  const handleSubmit = () => {
    if (selectedSlots.length !== maxSelections) {
      alert(`Debes seleccionar ${maxSelections} clase(s).`);
      return;
    }
    onSubmit(selectedSlots);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl p-6 w-[95%] max-w-5xl shadow-lg transform transition-transform duration-300">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            Agenda Semanal - {professor}
          </h2>
        </div>
        {/* Agenda dispuesta horizontalmente: cada día es una columna */}
        <div className="overflow-x-auto">
          <div className="flex space-x-4">
            {availableSchedule.map((daySchedule) => (
              <div key={daySchedule.day} className="min-w-[120px] border rounded p-2">
                <h3 className="text-center font-semibold text-gray-800 mb-2">
                  {daySchedule.day}
                </h3>
                {daySchedule.slots.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">Sin horarios</p>
                ) : (
                  daySchedule.slots.map((time, index) => {
                    const isSelected = selectedSlots.some(
                      (slot) => slot.day === daySchedule.day && slot.time === time
                    );
                    return (
                      <button
                        key={index}
                        onClick={() => toggleSlotSelection(daySchedule.day, time)}
                        className={`block w-full border rounded-lg px-2 py-1 mb-2 text-sm transition-all ${
                          isSelected
                            ? "bg-secondary text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
          >
            Confirmar Selección ({selectedSlots.length}/{maxSelections})
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAgendaModal;
