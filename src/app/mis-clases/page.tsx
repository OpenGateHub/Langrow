"use client";

import React, { useState, useMemo } from "react";
import ReviewModal from "../components/ModalReview";
import WeeklyAgendaModal, { SelectedSlotType } from "../components/ModalClassRequest";
import RescheduleModal from "../components/RescheduleModal";
import MessageModal from "../components/Modal";
import { useProfileContext } from "@/context/ProfileContext";
import { useReviews } from "@/hooks/useReview";
import { useGetMentoring, MentoringSession } from "@/hooks/useMentoring";

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
  status: string; // "REQUESTED" | "NEXT" | "NOTCONFIRMED" | "CANCELLED" | "CONFIRMED"
  requestDescription: string;
  professorReview?: { text: string; rating: number };
  studentReview?: { text: string; rating: number };
};

type TabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  classesData: Record<string, ClassData[]>;
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, classesData }) => {
  const tabs = Object.keys(classesData);
  return (
    <div className="flex flex-col sm:flex-row border-b mb-4 text-gray-700 font-medium">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`
            py-2 px-4 w-full sm:w-auto text-left transition-all duration-200
            ${activeTab === tab ? "bg-secondary text-white shadow-md" : "bg-gray-100 hover:bg-gray-200"}
            ${i < tabs.length - 1 ? "mb-2 sm:mb-0 sm:mr-2" : ""}
          `}
        >
          {tab} ({classesData[tab]?.length || 0})
        </button>
      ))}
    </div>
  );
};

type ClassCardProps = {
  classData: ClassData;
  activeTab: string;
  onConfirm: (c: ClassData, action: string) => void;
};

const ClassCard: React.FC<ClassCardProps> = ({ classData, activeTab, onConfirm }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { role } = useProfileContext();

  const renderActions = () => {
    if (activeTab === "Solicitudes") {
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
    if (activeTab === "Necesita Atención") {
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
            Duración: {classData.duration} | Costo: {classData.cost}
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
            activeTab === "Necesita Atención" ||
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

const MisClases: React.FC = () => {
  const { clerkUser, role } = useProfileContext();
  const [activeTab, setActiveTab] = useState<string>("Necesita Atención");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  // 1) Traigo sesiones
  const { sessions: raw, loading, error } = useGetMentoring({
    userId: clerkUser?.id || "",
    page: 50,
  });

  // 2) Las transformo a ClassData
  const sessions: ClassData[] = useMemo(() => {
    return raw.map((s: MentoringSession) => ({
      id: s.id,
      title: s.title,
      instructor: `Profesor ${s.userId}`,
      professorId: Number(s.userId),        // <-- ahora es número
      studentId: s.studentId,
      category: s.category.toString(),
      date: new Date(s.beginsAt).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      time:
        new Date(s.beginsAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) +
        " - " +
        new Date(s.endsAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      duration: `${s.duration} min`,
      cost: s.cost,
      status: s.status,
      requestDescription: s.requestDescription,
      professorReview: undefined,
      studentReview: undefined,
    }));
  }, [raw]);

  // 3) Agrupo por pestañas
  const classesData = useMemo(() => {
    const grouped: Record<string, ClassData[]> = {
      Solicitudes: [],
      Próximas: [],
      "Necesita Atención": [],
      Revisadas: [],
    };
    sessions.forEach(c => {
      switch (c.status) {
        case "REQUESTED":
          grouped.Solicitudes.push(c);
          break;
        case "NEXT":
          grouped["Próximas"].push(c);
          break;
        case "NOTCONFIRMED":
        case "CANCELLED":
          grouped["Necesita Atención"].push(c);
          break;
        case "CONFIRMED":
        default:
          grouped.Revisadas.push(c);
      }
    });
    return grouped;
  }, [sessions]);

  // 4) hook de reseñas
  const { reviews, loading: revLoading, error: revError, submitReview } = useReviews(
    String(selectedClass ? selectedClass.professorId : ""),
    role === "org:alumno" ? "professor" : "student"
  );

  const openModal = (c: ClassData, action: string) => {
    setSelectedClass(c);
    setSelectedAction(action);
    if (action === "confirmar") setIsReviewModalOpen(true);
    else setIsScheduleModalOpen(true);
  };
  const closeModal = () => {
    setIsReviewModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedClass(null);
    setSelectedAction("");
  };

  const handleReviewSubmit = async (text: string, rating: number) => {
    if (!selectedClass || !clerkUser) return;
    try {
      await submitReview(text, rating, Number(clerkUser.id));
      setModalMessage("¡Reseña enviada!");
      setModalType("success");
    } catch {
      setModalMessage("Error al enviar reseña.");
      setModalType("error");
    } finally {
      setIsMessageModalOpen(true);
      closeModal();
    }
  };

  const handleScheduleSubmit = (slots: SelectedSlotType[]) => {
    setModalMessage("¡Clase reagendada con éxito!");
    setModalType("success");
    setIsMessageModalOpen(true);
    closeModal();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        type={modalType}
        message={modalMessage}
      />

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} classesData={classesData} />

      {(loading || revLoading) && <p className="text-center">Cargando…</p>}
      {(error || revError) && <p className="text-center text-red-500">{error || revError}</p>}

      {!loading && !error && (
        <div className="mt-6">
          {classesData[activeTab]?.length ? (
            classesData[activeTab].map(c => (
              <ClassCard key={c.id} classData={c} activeTab={activeTab} onConfirm={openModal} />
            ))
          ) : (
            <p className="text-gray-500 text-center">No hay clases en esta categoría.</p>
          )}
        </div>
      )}

      <ReviewModal isOpen={isReviewModalOpen} onClose={closeModal} onSubmit={handleReviewSubmit} />

      {isScheduleModalOpen && selectedClass && role === "org:alumno" && (
        <WeeklyAgendaModal
          isOpen
          onClose={closeModal}
          requiredClasses={1}
          availableSchedule={[{ day: "Lunes", slots: ["10:00", "11:00"] }]}
          professor={selectedClass.instructor}
          onSubmit={handleScheduleSubmit}
        />
      )}
      {isScheduleModalOpen && selectedClass && role === "org:profesor" && (
        <RescheduleModal
          isOpen
          onClose={closeModal}
          onConfirm={() =>
            handleScheduleSubmit([{ date: new Date(), dayName: selectedClass.category, time: selectedClass.time }])
          }
        />
      )}
    </div>
  );
};

export default MisClases;
