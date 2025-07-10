import React, { useState } from "react";
import { ClassCardProps } from "@/types/class";
import { useProfileContext } from "@/context/ProfileContext";
import { GroupTabs } from "@/hooks/useClassManagement";

export const ClassCard: React.FC<ClassCardProps> = ({ classData, activeTab, onConfirm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { role } = useProfileContext();

  const renderActions = () => {
    if (activeTab === GroupTabs.Solicitudes) {
      if (role === "org:profesor") {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onConfirm(classData, "aceptar")}
              className="bg-green-500 text-white px-3 py-1 rounded-md text-sm shadow hover:bg-green-600"
            >
              Aceptar
            </button>
            <button
              onClick={() => onConfirm(classData, "reagendar")}
              className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm shadow hover:bg-yellow-600"
            >
              Re-agendar
            </button>
          </div>
        );
      } else {
        return (
          <button
            onClick={() => onConfirm(classData, "reagendar_alumno")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-yellow-600"
          >
            Re-agendar
          </button>
        );
      }
    }
    if (activeTab === GroupTabs.Atencion) {
      return (
        <button
          onClick={() => onConfirm(classData, "confirmar")}
          className="bg-secondary text-white px-4 py-2 rounded-md text-sm shadow hover:bg-secondary-hover"
        >
          ¿Ya tuviste esta clase?
        </button>
      );
    }
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{classData.title}</h3>
          <p className="text-gray-500">
            {classData.instructor}{" "}
            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm ml-2">
              {classData.category}
            </span>
          </p>
          <p className="text-gray-600 mt-2 text-sm">
            {classData.date} | {classData.time}
          </p>
          <p className="text-gray-600 text-sm">
            Duración: {classData.duration}
          </p>
        </div>
        <div>{renderActions()}</div>
      </div>
      <button
        onClick={() => setIsExpanded(x => !x)}
        className="mt-4 text-sm text-blue-600 hover:underline"
      >
        {isExpanded ? "Ocultar detalles" : "Ver detalles"}
      </button>
      {isExpanded && (
        <div className="mt-2">
          {(activeTab === "Solicitudes" ||
            activeTab === "Calificar" ||
            activeTab === "Próximas") && (
            <>
              <p className="text-gray-800 font-semibold">
                Categoría: {classData.category}
              </p>
              <p className="text-gray-700 mt-1">
                Detalle: {classData.requestDescription}
              </p>
            </>
          )}
          {activeTab === "Revisadas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-2 border rounded-lg">
                <h5 className="font-semibold mb-2">Reseña Profesor</h5>
                {classData.professorReview ? (
                  <>
                    <p>{classData.professorReview.text}</p>
                    <p>
                      {"★".repeat(classData.professorReview.rating) +
                        "☆".repeat(5 - classData.professorReview.rating)}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-500">Sin reseña</p>
                )}
              </div>
              <div className="p-2 border rounded-lg">
                <h5 className="font-semibold mb-2">Reseña Alumno</h5>
                {classData.studentReview ? (
                  <>
                    <p>{classData.studentReview.text}</p>
                    <p>
                      {"★".repeat(classData.studentReview.rating) +
                        "☆".repeat(5 - classData.studentReview.rating)}
                    </p>
                  </>
                ) : (
                  <p className="italic text-gray-500">Sin reseña</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 