"use client";

import { useState } from "react";
import ReviewModal from "../components/ModalReview";
import WeeklyAgendaModal, { SelectedSlotType, DaySchedule } from "../components/ModalClassRequest";
import { useProfileContext } from "@/context/ProfileContext";
import { useReviews } from "@/hooks/useReview";

type Review = {
  id: number;
  reviewerName: string;
  reviewText: string;
  stars: number;
};

export type ClassData = {
  id: number;
  title: string;
  instructor: string;
  professorId: number;
  studentId?: number;
  category: string;
  date: string;
  time: string;
  duration: string;
  cost: string;
  status: string; // "solicitada", "no-confirmada", "reagendar", "revisada"
  requestDescription: string;
  professorReview?: { text: string; rating: number };
  studentReview?: { text: string; rating: number };
};

// --- Datos Mock ---
const mockClasses: Record<string, ClassData[]> = {
  "Solicitudes": [
    {
      id: 4,
      title: "Clase Solicitada",
      instructor: "Instructor Solicitado",
      professorId: 101,
      studentId: 201,
      category: "Lectura",
      date: "Martes, 21 Febrero",
      time: "03:00 PM - 03:30 PM",
      duration: "30 min",
      cost: "3 USD",
      status: "solicitada",
      requestDescription: "Quiero mejorar mi lectura sin usar traductores",
    },
  ],
  "Próximas": [
    {
      id: 1,
      title: "Seguimiento",
      instructor: "Tomek Siergiejuk",
      professorId: 102,
      studentId: 202,
      category: "Vocabulario profesional",
      date: "Jueves, 23 Enero",
      time: "02:00 PM - 02:30 PM GMT-3",
      duration: "30 min",
      cost: "3 USD",
      status: "proxima",
      requestDescription: "Continuar las clases de vocabulario laboral.",
    },
  ],
  "Necesita Atención": [
    {
      id: 2,
      title: "Revisión de tarea",
      instructor: "Philippe Gales",
      professorId: 103,
      studentId: 203,
      category: "Conversación",
      date: "Miércoles, 08 Enero",
      time: "01:15 PM - 01:45 PM GMT-3",
      duration: "30 min",
      cost: "3 USD",
      status: "no-confirmada",
      requestDescription: "Conversar e incorporar más seguridad en el idioma.",
    },
    {
      id: 5,
      title: "Clase para reagendar",
      instructor: "Profesor Ejemplo",
      professorId: 104,
      studentId: 204,
      category: "Gramática",
      date: "Lunes, 15 Febrero",
      time: "10:00 AM - 10:30 AM",
      duration: "30 min",
      cost: "3 USD",
      status: "reagendar",
      requestDescription: "No usar tanto el chat gpt para redactar mis mails.",
      professorReview: { text: "El alumno estuvo muy atento y participativo.", rating: 5 },
      studentReview: { text: "La clase fue muy amena y útil.", rating: 4 },
    },
  ],
  "Revisadas": [
    {
      id: 3,
      title: "Revisión de tarea",
      instructor: "Philippe Gales",
      professorId: 103,
      studentId: 203,
      category: "Escritura",
      date: "Miércoles, 18 Diciembre",
      time: "01:15 PM - 01:45 PM GMT-3",
      duration: "30 min",
      cost: "3 USD",
      status: "revisada",
      requestDescription: "Clase realizada, pendiente de reseña.",
      professorReview: { text: "El alumno estuvo muy atento y participativo.", rating: 5 },
      studentReview: { text: "La clase fue muy amena y útil.", rating: 4 },
    },
  ],
};

// --- Componente Tabs ---
type TabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.keys(mockClasses);
  return (
    <div className="flex flex-col sm:flex-row border-b mb-4 text-gray-700 font-medium">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-2 px-4 w-full sm:w-auto text-left transition-all duration-200 ${
            activeTab === tab
              ? "bg-secondary text-white shadow-md"
              : "bg-gray-100 hover:bg-gray-200"
          } ${index !== tabs.length - 1 ? "mb-2 sm:mb-0 sm:mr-2" : ""}`}
        >
          {tab} ({mockClasses[tab].length})
        </button>
      ))}
    </div>
  );
};

// --- Componente ClassCard ---
type ClassCardProps = {
  classData: ClassData;
  activeTab: string;
  onConfirm: (classData: ClassData, action: string) => void;
};

const ClassCard: React.FC<ClassCardProps> = ({ classData, activeTab, onConfirm }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { role } = useProfileContext();

  const renderActions = () => {
    if (activeTab === "Solicitudes") {
      if (role === "org:profesor") {
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <button
                onClick={() => onConfirm(classData, "aceptar")}
                className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow hover:bg-green-600 transition"
              >
                Aceptar
              </button>
              <button
                onClick={() => onConfirm(classData, "reagendar")}
                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow hover:bg-yellow-600 transition"
              >
                Re-agendar
              </button>
            </div>
          </div>
        );
      } else if (role === "org:alumno") {
        return (
          <button
            onClick={() => onConfirm(classData, "reagendar_alumno")}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow hover:bg-yellow-600 transition"
          >
            Re-agendar
          </button>
        );
      }
    } else if (activeTab === "Necesita Atención") {
      return (
        <button
          onClick={() => onConfirm(classData, "confirmar")}
          className="bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium shadow hover:bg-secondary-hover transition"
        >
          ¿Ya tuviste esta clase?
        </button>
      );
    }
    return null;
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{classData.title}</h3>
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
            Duración: {classData.duration} | Costo: {classData.cost}
          </p>
        </div>
        <div>{renderActions()}</div>
      </div>
      <div className="mt-4">
        <button
          onClick={toggleExpand}
          className="text-sm text-blue-600 hover:underline mb-2"
        >
          {isExpanded ? "Ocultar detalles" : "Ver detalles"}
        </button>
        <div
          className="overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: isExpanded ? "300px" : "0px" }}
        >
          {/* Para "Necesita Atención", "Solicitudes" y "Próximas" se muestran detalles básicos */}
          {(activeTab === "Necesita Atención" ||
            activeTab === "Solicitudes" ||
            activeTab === "Próximas") && (
            <div className="mt-2">
                <p className="text-gray-700 mt-1">
                Motivo: {classData.requestDescription}
              </p>
            </div>
          )}
          {/* En "Revisadas", se muestran reseñas si existen */}
          {activeTab === "Revisadas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-2 border rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2">Reseña del Profesor</h5>
                {classData.professorReview ? (
                  <>
                    <p className="text-gray-700">{classData.professorReview.text}</p>
                    <p className="text-yellow-500">
                      {"★".repeat(classData.professorReview.rating) +
                        "☆".repeat(5 - classData.professorReview.rating)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Sin reseña</p>
                )}
              </div>
              <div className="p-2 border rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-2">Reseña del Alumno</h5>
                {classData.studentReview ? (
                  <>
                    <p className="text-gray-700">{classData.studentReview.text}</p>
                    <p className="text-yellow-500">
                      {"★".repeat(classData.studentReview.rating) +
                        "☆".repeat(5 - classData.studentReview.rating)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500 italic">Sin reseña</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Componente ClassList ---
type ClassListProps = {
  activeTab: string;
  onConfirm: (classData: ClassData, action: string) => void;
};

const ClassList: React.FC<ClassListProps> = ({ activeTab, onConfirm }) => (
  <div className="mt-6">
    {mockClasses[activeTab].length > 0 ? (
      mockClasses[activeTab].map((classItem) => (
        <ClassCard key={classItem.id} classData={classItem} activeTab={activeTab} onConfirm={onConfirm} />
      ))
    ) : (
      <p className="text-gray-500 text-center">No hay clases en esta categoría.</p>
    )}
  </div>
);

// --- Componente principal MisClases ---
const MisClases: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Necesita Atención");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const { clerkUser, role } = useProfileContext();

  // Para el modal de reseñas: si el usuario es alumno, target es el profesor; si es profesor, target es el alumno.
  const targetForModal =
    role === "org:alumno"
      ? selectedClass?.professorId
      : selectedClass?.studentId || "";
  const { submitReview } = useReviews(String(targetForModal || ""), role === "org:alumno" ? "professor" : "student");

  const openModal = (classData: ClassData, action: string) => {
    if (action === "confirmar") {
      setSelectedClass(classData);
      setIsReviewModalOpen(true);
    } else if (action === "reagendar") {
      setSelectedClass(classData);
      setIsScheduleModalOpen(true);
    } else if (action === "reagendar_alumno") {
      setSelectedClass(classData);
      setIsScheduleModalOpen(true);
    } else if (action === "aceptar") {
      alert("Clase aceptada");
    }
  };

  const closeModal = () => {
    setIsReviewModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedClass(null);
  };

  const handleReviewSubmit = async (reviewText: string, rating: number) => {
    if (!selectedClass || !clerkUser) return;
    const reviewerId = Number(clerkUser.id);
    try {
      await submitReview(reviewText, rating, reviewerId);
      console.log("Reseña enviada para el target:", targetForModal);
    } catch (err) {
      console.error("Error al enviar reseña:", err);
    }
  };

  // Datos ficticios para el modal de agenda
  const availableSchedule: DaySchedule[] = [
    { day: "Lunes", slots: ["10:00", "11:00", "15:00"] },
    { day: "Martes", slots: ["09:00", "13:00", "16:00"] },
    { day: "Miércoles", slots: ["10:00", "12:00", "17:00"] },
    { day: "Jueves", slots: ["11:00", "14:00", "18:00"] },
    { day: "Viernes", slots: ["09:00", "15:00", "16:00"] },
    { day: "Sábado", slots: [] },
    { day: "Domingo", slots: [] },
  ];
  const requiredClasses = 1; // Por ejemplo

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Mis Clases</h1>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ClassList activeTab={activeTab} onConfirm={openModal} />
      <ReviewModal isOpen={isReviewModalOpen} onClose={closeModal} onSubmit={handleReviewSubmit} />
      {isScheduleModalOpen && selectedClass && (
        <WeeklyAgendaModal
          isOpen={isScheduleModalOpen}
          onClose={closeModal}
          requiredClasses={requiredClasses}
          availableSchedule={availableSchedule}
          professor={selectedClass.instructor}
          onSubmit={(selectedSlots) => {
            alert("Modal de agendar confirmado (Alumno): " + JSON.stringify(selectedSlots));
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default MisClases;
