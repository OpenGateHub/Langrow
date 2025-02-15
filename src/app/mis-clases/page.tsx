"use client";
import { useState } from "react";
import ReviewModal from "../components/ModalReview";
import { useUser } from "@clerk/nextjs";
import { useReviews } from "@/hooks/useReview";

// --- Tipos ---
type Review = {
  text: string;
  stars: number;
};

type ClassData = {
  id: number;
  title: string;
  instructor: string;
  professorId: number;
  studentId?: number; // para cuando el profesor deba reseñar al alumno
  category: string;
  date: string;
  time: string;
  duration: string;
  cost: string;
  status: string;
  // Los campos de reseña se eliminan ya que se obtendrán desde el hook
  requestDescription: string;
};

// --- Datos Mock (se agregó studentId para las clases donde corresponda) ---
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
      requestDescription:
        "Quiero mejorar mi lectura para poder leer newsletters de mi trabajo sin usar el traductor.",
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
      requestDescription:
        "Quiero seguir incorporando nuevo vocabulario para mi trabajo como abogado de comercio exterior.",
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
      requestDescription: "Revisión pendiente de confirmación.",
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
      requestDescription:
        "Tengo que aprender a redactar mails para mi nuevo trabajo en inglés.",
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
// Aquí se usa useReviews para obtener las reseñas del target adecuado según el rol
type ClassCardProps = {
  classData: ClassData;
  onConfirm: (classData: ClassData) => void;
};

const ClassCard: React.FC<ClassCardProps> = ({ classData, onConfirm }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { user } = useUser();
  const userRole = user?.unsafeMetadata?.role;
  // Si el usuario es alumno, se muestran reseñas del profesor;
  // si es profesor, se muestran reseñas del alumno (utilizando studentId)
  const reviewType = userRole === "org:alumno" ? "student" : "professor";
  const targetUserId =
    userRole === "org:alumno" ? classData.professorId : classData.studentId || "";
  const { reviews, loading, error } = useReviews(String(targetUserId), reviewType);

  const buttonLabel =
    classData.status === "no-confirmada" ? "Confirmar" : isExpanded ? "Ocultar" : "Ver";

  const handleButtonClick = () => {
    if (classData.status === "no-confirmada") {
      onConfirm(classData);
    } else {
      setIsExpanded((prev) => !prev);
    }
  };

  const renderStars = (stars: number) =>
    "★".repeat(stars) + "☆".repeat(5 - stars);

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white">
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
        <button
          onClick={handleButtonClick}
          className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-secondary-hover transition-all"
        >
          {buttonLabel}
        </button>
      </div>
      <div
        className={`border-t overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "scale-y-100 max-h-[500px] opacity-100 py-4" : "scale-y-0 max-h-0 opacity-0 py-0"
        }`}
        style={{ transformOrigin: "top" }}
      >
        {loading && <p>Cargando reseñas...</p>}
        {error && <p>Error al cargar reseñas: {error}</p>}
        {!loading && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="mb-4">
              <p className="font-semibold text-gray-800">{review.reviewerName}</p>
              <p className="text-gray-700">{review.reviewText}</p>
              <p className="text-yellow-500">{renderStars(review.stars)}</p>
            </div>
          ))
        ) : (
          <div>
            <h4 className="font-semibold text-gray-800">Descripción de la Solicitud</h4>
            <p className="text-gray-700">{classData.requestDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Componente ClassList ---
type ClassListProps = {
  activeTab: string;
  onConfirm: (classData: ClassData) => void;
};

const ClassList: React.FC<ClassListProps> = ({ activeTab, onConfirm }) => (
  <div className="mt-6">
    {mockClasses[activeTab].length > 0 ? (
      mockClasses[activeTab].map((classItem) => (
        <ClassCard key={classItem.id} classData={classItem} onConfirm={onConfirm} />
      ))
    ) : (
      <p className="text-gray-500 text-center">No hay clases en esta categoría.</p>
    )}
  </div>
);

// --- Componente principal MisClases ---
const MisClases: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Necesita Atención");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const { user } = useUser();
  const userRole = user?.unsafeMetadata?.role;

  // Para el modal, el target depende del rol:
  // - Si el usuario es alumno, target es el profesor (selectedClass.professorId)
  // - Si es profesor, target es el alumno (selectedClass.studentId)
  const targetForModal =
    userRole === "org:alumno"
      ? selectedClass?.professorId
      : selectedClass?.studentId;

  // Instanciamos useReviews para obtener la función submitReview.
  // La URL se construye con el target obtenido y reviewType según el rol.
  const { submitReview } = useReviews(
    String(targetForModal || ""),
    userRole === "org:alumno" ? "professor" : "student"
  );

  const openModal = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleReviewSubmit = async (reviewText: string, rating: number) => {
    if (!selectedClass || !user) return;
    const reviewerId = Number(user.id);
    try {
      await submitReview(reviewText, rating, reviewerId);
      console.log("Reseña enviada para el target:", targetForModal);
      // Aquí podrías refrescar la UI o notificar al usuario
    } catch (err) {
      console.error("Error al enviar reseña:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Mis Clases</h1>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ClassList activeTab={activeTab} onConfirm={openModal} />
      <ReviewModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleReviewSubmit} />
    </div>
  );
};

export default MisClases;
