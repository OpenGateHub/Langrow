"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  message?: string;
}

export default function MessageModal({
  isOpen,
  onClose,
  type,
  message,
}: ModalProps) {
  const defaultMessages = {
    success: "Tu acción fue completada exitosamente.",
    error: "Ocurrió un error inesperado. Inténtalo de nuevo.",
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
        isOpen ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    >
      <div
        className={`bg-white rounded-3xl shadow-lg w-[90%] max-w-md p-6 transform ${
          isOpen ? "scale-100" : "scale-90"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="text-center">
          <h2
            className={`text-2xl font-bold ${
              type === "success" ? "text-secondary" : "text-red-600"
            }`}
          >
            {type === "success" ? "¡Éxito!" : "¡Error!"}
          </h2>
        </div>

        {/* Message */}
        <div className="mt-4">
          <p className="text-gray-700 text-center text-lg">
            {message || defaultMessages[type]}
          </p>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-full text-white font-semibold ${
              type === "success" ? "bg-secondary hover:bg-secondary-hover" : "bg-red-500 hover:bg-red-600"
            } transition duration-200`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
