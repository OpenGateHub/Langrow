"use client";

import React, { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewText: string, rating: number) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: ReviewModalProps) {
  const [visible, setVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [errorReview, setErrorReview] = useState("");
  const [errorRating, setErrorRating] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setShowContent(true), 10);
    } else {
      setShowContent(false);
      const timer = setTimeout(() => {
        setVisible(false);
        // Reiniciamos todos los estados al cerrar el modal
        setReviewText("");
        setRating(0);
        setErrorReview("");
        setErrorRating("");
        setSubmitting(false);
        setSubmitted(false);
      }, 300);
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
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  if (!visible) return null;

  const handleSubmit = () => {
    // Validación
    let valid = true;
    if (reviewText.trim().length < 50) {
      setErrorReview("La reseña debe tener al menos 50 caracteres.");
      valid = false;
    } else {
      setErrorReview("");
    }

    if (rating === 0) {
      setErrorRating("Debes seleccionar una calificación.");
      valid = false;
    } else {
      setErrorRating("");
    }

    if (!valid) return;

    // Simulación de envío
    setSubmitting(true);
    // Llamamos onSubmit para pasar la reseña y la calificación (puedes quitar esta línea si lo prefieres)
    onSubmit(reviewText, rating);

    // Simulamos un retardo para mostrar el estado "Enviando..." y luego "Enviado!"
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 2000);
  };

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
          <h2 className="text-2xl font-bold text-secondary">
            Deja tu Reseña
          </h2>
        </div>

        {/* Textarea para la reseña */}
        <div className="mt-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Escribe tu reseña aquí..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary text-black"
            rows={4}
          />
          {errorReview && (
            <p className="mt-1 text-sm text-red-500">{errorReview}</p>
          )}
        </div>

        {/* Selector de calificación con estrellas */}
        <div className="mt-4">
          <label className="block text-gray-700 mb-1">Calificación:</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none "
              >
                {rating >= star ? (
                  <FaStar className="text-yellow-500 w-6 h-6 hover:text-yellow-300" />
                ) : (
                  <FaRegStar className="text-gray-400 w-6 h-6 hover:text-yellow-300" />
                )}
              </button>
            ))}
          </div>
          {errorRating && (
            <p className="mt-1 text-sm text-red-500">{errorRating}</p>
          )}
        </div>

        {/* Botones */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 rounded-full text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition duration-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-full text-white font-semibold bg-secondary hover:bg-secondary-hover transition duration-200"
          >
            {submitting
              ? "Enviando..."
              : submitted
              ? "Enviado!"
              : "Enviar Reseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
