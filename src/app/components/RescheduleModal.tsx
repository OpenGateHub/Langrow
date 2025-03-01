"use client";

import React, { useEffect, useState } from "react";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  message,
}: RescheduleModalProps) {
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const defaultMessage = "¿Seguro que querés pedir que se reagende la clase?";

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

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300 ${
        showContent ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-3xl shadow-lg w-[90%] max-w-md p-6 transform transition-transform duration-300 ${
          showContent ? "scale-100" : "scale-75"
        }`}
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary">Re-agendar Clase</h2>
        </div>
        {/* Message */}
        <div className="mt-4">
          <p className="text-gray-700 text-center text-lg">
            {message || defaultMessage}
          </p>
        </div>
        {/* Botones */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full text-white font-semibold bg-secondary hover:bg-secondary-hover transition duration-200"
          >
            Sí, reagendar
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
