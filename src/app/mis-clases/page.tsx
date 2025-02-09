"use client"
import { useState } from "react";
import ReviewModal from "../components/ModalReview";
import { useUser } from "@clerk/nextjs";


type Review = {
  text: string;
  stars: number;
};

type ClassData = {
  id: number;
  title: string;
  instructor: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  cost: string;
  status: string;
  userReview?: Review;
  instructorReview?: Review;
  requestDescription: string;

};

const mockClasses: Record<string, ClassData[]> = {
  "Solicitudes": [
    {
      id: 4,
      title: "Clase Solicitada",
      instructor: "Instructor Solicitado",
      category: "Lectura",
      date: "Martes, 21 Febrero",
      time: "03:00 PM - 03:30 PM",
      duration: "30 min",
      cost: "3 USD",
      status: "solicitada",
      requestDescription: "Quiero mejorar mi lectura para poder leer newsletters de mi trabajo sin usar el traductor.",
      // No tiene reseñas ya que aún no pasó la clase
    },
  ],
  "Próximas": [
    {
      id: 1,
      title: "Seguimiento",
      instructor: "Tomek Siergiejuk",
      category: "Vocabulario profesional",
      date: "Jueves, 23 Enero",
      time: "02:00 PM - 02:30 PM GMT-3",
      duration: "30 min",
      cost: "3 USD",
      status: "proxima",
      requestDescription: "Quiero seguir incorporando nuevo vocabulario para mi trabajo como abogado de comercio exterior.",
      // Aún no hay reseña
    },
  ],
  "Necesita Atención": [
    {
      id: 2,
      title: "Revisión de tarea",
      instructor: "Philippe Gales",
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
      category: "Escritura",
      date: "Miércoles, 18 Diciembre",
      time: "01:15 PM - 01:45 PM GMT-3",
      duration: "30 min",
      cost: "3 USD",
      status: "revisada",
      requestDescription: "Tengo que aprender a redactar mails para mi nuevo trabajo en inglés.",
      userReview: {
        text: "La clase fue muy enriquecedora y me ayudó a mejorar mi escritura.",
        stars: 5,
      },
      instructorReview: {
        text: "El alumno participó de manera activa y mostró mejoras notables.",
        stars: 4,
      },
    },
  ],
};

type TabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = Object.keys(mockClasses);
  return (
    <div className="flex border-b mb-4 space-x-4 text-gray-700 text-lg font-medium">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`py-2 px-6 rounded-md transition-all duration-200 ${activeTab === tab
            ? "bg-secondary text-white shadow-md"
            : "bg-gray-100 hover:bg-gray-200"
            }`}
          onClick={() => setActiveTab(tab)}
        >
          {tab} ({mockClasses[tab].length})
        </button>
      ))}
    </div>
  );
};

type ClassCardProps = {
  classData: ClassData;
  onConfirm?: () => void;
};

const ClassCard: React.FC<ClassCardProps> = ({ classData, onConfirm }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { user } = useUser();
  const isTeacher = user?.unsafeMetadata?.role === "org:profesor";

  // Si el status es "no-confirmada" el botón mostrará "Confirmar"; para los demás mostrará "Ver"
  const buttonLabel =
    classData.status === "no-confirmada" ? "Confirmar" : isExpanded ? "Ocultar" : "Ver";

  const handleButtonClick = () => {
    if (classData.status === "no-confirmada") {
      onConfirm?.();
    } else {
      // Alterna el estado expandido
      setIsExpanded((prev) => !prev);
      console.log("Ver/Ocultar detalles de la clase:", classData.id);
    }
  };

  // Función auxiliar para renderizar las estrellas
  const renderStars = (stars: number) => {
    // Puedes personalizar la forma de mostrar las estrellas. Aquí se muestra un string repetido.
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 shadow-md bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {classData.title}
          </h3>
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

      {/* Contenido expandido con transición PERFECTA TRANSICIÓN PARA COPIAR */}
      <div
        className={`border-t overflow-hidden transition-all duration-500 ease-in-out 
    ${isExpanded ? "scale-y-100 max-h-[500px] opacity-100 py-4" : "scale-y-0 max-h-0 opacity-0 py-0"}
  `}
        style={{ transformOrigin: "top" }} // Se expande desde arriba
      >
        {/* Si la clase tiene reseñas, mostramos ambas */}
        {classData.userReview || classData.instructorReview ? (
          <div className="space-y-4">
            {classData.userReview && (
              <div>
                <h4 className="font-semibold text-gray-800">
                  Mi Reseña
                </h4>
                <p className="text-gray-700">{classData.userReview.text}</p>
                <p className="text-yellow-500">
                  {renderStars(classData.userReview.stars)}
                </p>
              </div>
            )}
            {classData.instructorReview && (
              <div>
                <h4 className="font-semibold text-gray-800">
                  {isTeacher ? "Reseña del alumno" : "Reseña del tutor"}
                </h4>
                <p className="text-gray-700">{classData.instructorReview.text}</p>
                <p className="text-yellow-500">
                  {renderStars(classData.instructorReview.stars)}
                </p>
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-800">
                Descripción de la Solicitud
              </h4>
              <p className="text-gray-700">{classData.requestDescription}</p>
            </div>
          </div>
        ) : (
          // Si no hay reseñas, solo mostramos la descripción de la solicitud
          <div>
            <h4 className="font-semibold text-gray-800">
              Descripción de la Solicitud
            </h4>
            <p className="text-gray-700">{classData.requestDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};


type ClassListProps = {
  activeTab: string;
  onConfirm: () => void;
};

const ClassList: React.FC<ClassListProps> = ({ activeTab, onConfirm }) => (
  <div className="mt-6">
    {mockClasses[activeTab].length > 0 ? (
      mockClasses[activeTab].map((classItem) => (
        <ClassCard
          key={classItem.id}
          classData={classItem}
          onConfirm={onConfirm}
        />
      ))
    ) : (
      <p className="text-gray-500 text-center">
        No hay clases en esta categoría.
      </p>
    )}
  </div>
);

const MisClases: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Necesita Atención");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Función para abrir y cerrar el modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Callback que se dispara al enviar la reseña desde el modal
  const handleReviewSubmit = (reviewText: string, rating: number) => {
    console.log("Reseña enviada:", reviewText, rating);
    // Aquí podrías agregar la lógica para enviar la reseña al backend
  };

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Mis Clases
      </h1>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ClassList activeTab={activeTab} onConfirm={openModal} />
      <ReviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default MisClases;
