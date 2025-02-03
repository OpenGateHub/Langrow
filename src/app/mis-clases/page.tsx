"use client"
import { useState } from "react";
import ReviewModal from "../components/ModalReview";

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
};

const mockClasses: Record<string, ClassData[]> = {
  "Solicitudes": [],
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
          className={`py-2 px-6 rounded-md transition-all duration-200 ${
            activeTab === tab
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
  // Determinamos el label del botón según el status
  const buttonLabel =
    classData.status === "no-confirmada" ? "Confirmar" : "Ver";

  const handleButtonClick = () => {
    if (classData.status === "no-confirmada") {
      // Si la clase está sin confirmar, ejecutamos la función para abrir el modal
      onConfirm?.();
    } else {
      // Para "proxima" o "revisada", se podría redirigir a ver detalles
      console.log("Ver detalles de la clase:", classData.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-4 shadow-md bg-white flex justify-between items-center">
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
