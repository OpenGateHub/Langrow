"use client";
import React, { useState, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import WeeklyAgendaModal, { SelectedSlotType, DaySchedule } from "../../components/ModalClassRequest";
import PaymentForm, { ClassDetails } from "../../components/payment/PaymentForm";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
// Se asume que tienes un AuthContext configurado para obtener el usuario autenticado
import { useProfileContext } from "@/context/ProfileContext";

// Tipo de paquete con datos y estilos
type Package = {
  nombre: string;
  total: number;
  precioClase: string;
  ahorro: string;
  clases: number;
  bg: string;
  hoverBg: string;
};

/**
 * TODO:: Los paquetes y categorías deberían ser obtenidos desde una API o base de datos.
 * Actualmente están hardcodeados para simplificar el ejemplo.
 * En una aplicación real, deberías hacer una llamada a la API para obtener estos datos.
 * También se debería manejar el estado de carga y errores al obtener estos datos.
 * Esperado un custom hook
 */
const packages: Package[] = [
  {
    nombre: "Única Clase",
    total: 18000,
    precioClase: "18.000",
    ahorro: "",
    clases: 1,
    bg: "bg-blue-700",
    hoverBg: "hover:bg-blue-800",
  },
  {
    nombre: "Combo UNO: 4 clases",
    total: 67200,
    precioClase: "16.800",
    ahorro: "4.800",
    clases: 4,
    bg: "bg-green-700",
    hoverBg: "hover:bg-green-800",
  },
  {
    nombre: "Combo DOS: 8 clases",
    total: 124800,
    precioClase: "15.600",
    ahorro: "9.600",
    clases: 8,
    bg: "bg-yellow-700",
    hoverBg: "hover:bg-yellow-800",
  },
  {
    nombre: "Combo TRES: 12 clases",
    total: 172800,
    precioClase: "14.400",
    ahorro: "14.400",
    clases: 12,
    bg: "bg-red-700",
    hoverBg: "hover:bg-red-800",
  },
];

const categories = [
  {
    id: 1,
    name: "Conversación",
    code: "conversation_class",
  },
  {
    id: 2,
    name: "Escritura",
    code: "writing_class", // corregido el typo en "writting"
  },
  {
    id: 3,
    name: "Vocabulario",
    code: "vocabulary_class",
  },
  {
    id: 4,
    name: "Vocabulario Profesional",
    code: "professional_vocabulary_class",
  },
  {
    id: 5,
    name: "Integral",
    code: "integral_class",
  },
  {
    id: 6,
    name: "Pronunciación",
    code: "pronunciation_class",
  },
];


const SolicitudClase: React.FC = () => {
  const { clerkUser } = useProfileContext();
  const alumnoId = clerkUser?.id || "";

  // Se obtiene el id del profesor a partir de la URL
  const pathname = usePathname();
  const pathParts = pathname.split("/");
  const profesorId = pathParts[pathParts.length - 1];

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [category, setCategory] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string>("");
  const [motivoError, setMotivoError] = useState<string>("");

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlotType[]>([]);
  const [isPaymentStep, setIsPaymentStep] = useState<boolean>(false);
  // Se genera el id de la clase al confirmar la reserva
  const [purchaseId, setpurchaseId] = useState<string>("");

  const router = useRouter();

  const handleOpenScheduleModal = () => {
    if (!selectedPackage) {
      alert("Debes seleccionar un paquete.");
      return;
    }
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (slots: SelectedSlotType[]) => {
    setSelectedSlots(slots);
    setIsScheduleModalOpen(false);
  };

  // Al confirmar la reserva se validan los datos y se genera un id para la clase
  const handleConfirmReserva = () => {
    let valid = true;
    if (!selectedPackage) {
      alert("Debes seleccionar un paquete.");
      valid = false;
    }
    if (!category) {
      setCategoryError("Debes seleccionar una categoría.");
      valid = false;
    } else {
      setCategoryError("");
    }
    if (motivo.trim().length < 50) {
      setMotivoError("El motivo debe tener al menos 50 caracteres.");
      valid = false;
    } else if (motivo.trim().length > 200) {
      setMotivoError("El motivo no puede exceder 200 caracteres.");
      valid = false;
    } else {
      setMotivoError("");
    }
    if (selectedPackage && selectedSlots.length !== selectedPackage.clases) {
      alert(`Debes seleccionar ${selectedPackage.clases} clase(s).`);
      valid = false;
    }
    if (!valid) return;

    // Genera un id único para la clase
    // TODO: Aquí podrías integrar una lógica más robusta para generar un ID único utilizando el id del usuario, fecha, etc.
    setpurchaseId(`clase-${Date.now()}`);
    setIsPaymentStep(true);
  };

  const handleClassDetails = (): ClassDetails => {
    return {
      classTitle: motivo,
      classType: category,
      classSlots: selectedSlots,
    };
  }

  return (
    <div className="max-w-4xl mx-auto px-6 bg-gray-100 py-6 my-6 rounded-xl min-h-screen">
      <AnimateOnScroll>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Solicitar Clase
        </h1>
      </AnimateOnScroll>

      {/* Selección de paquete */}
      <AnimateOnScroll delay={100}>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {packages.map((pkg, index) => (
            <div key={index} className="relative group">
              <button
                onClick={() => {
                  setSelectedPackage(pkg);
                  setSelectedSlots([]); // Reinicia selección de horarios al cambiar de paquete
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pkg.bg} ${pkg.hoverBg} ${
                  selectedPackage?.nombre === pkg.nombre
                    ? "shadow-md text-white border-2 border-white"
                    : "text-white"
                }`}
              >
                {pkg.nombre}
              </button>
              {Number(pkg.ahorro) > 0 && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 z-10 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                  <div className={`${pkg.bg} text-white text-xs rounded py-1 px-2 shadow-lg`}>
                    ¡Ahorrá ${pkg.ahorro.toLocaleString()}!
                  </div>
                  <div
                    className="w-0 h-0 border-x-4 border-x-transparent border-t-4 mx-auto"
                    style={{
                      borderTopColor:
                        pkg.bg === "bg-blue-700"
                          ? "#1D4ED8"
                          : pkg.bg === "bg-green-700"
                          ? "#047857"
                          : pkg.bg === "bg-yellow-700"
                          ? "#B45309"
                          : pkg.bg === "bg-red-700"
                          ? "#B91C1C"
                          : "#000",
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Botón para elegir horarios */}
      {selectedPackage && selectedSlots.length === 0 && (
        <div
          className={`text-center overflow-hidden transform transition-all duration-700 ease-in-out origin-top ${
            selectedPackage ? "max-h-[1000px] opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0"
          }`}
        >
          <div className="mb-4 p-4 border rounded-md bg-gray-50 text-center">
            <div className="mb-4 flex flex-col justify-center">
              <h3 className="text-md">
                Precio Total: ${selectedPackage.total.toLocaleString("es-AR")}
              </h3>
              <p className="text-lg font-semibold">
                Precio por Clase: ${selectedPackage.precioClase}
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenScheduleModal}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
          >
            Elegir Horarios
          </button>
        </div>
      )}

      {/* Resumen de horarios seleccionados */}
      {selectedSlots.length > 0 && (
        <AnimateOnScroll delay={400}>
          <div className="mb-4 text-center">
            <p className="text-green-600 font-medium">Horarios seleccionados</p>
            {/* Aquí puedes mapear y mostrar los horarios elegidos */}
          </div>
        </AnimateOnScroll>
      )}

      {/* Selección de categoría */}
      <AnimateOnScroll delay={500}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Selecciona la categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none ${
              categoryError ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">-- Selecciona una categoría --</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryError && <p className="text-red-500 text-sm mt-1">{categoryError}</p>}
        </div>
      </AnimateOnScroll>

      {/* Motivo de clase */}
      <AnimateOnScroll delay={600}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Motivo de clase</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Escribe el motivo de la clase..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            rows={4}
            minLength={50}
            maxLength={200}
          />
          {motivoError && <p className="text-red-500 text-sm mt-1">{motivoError}</p>}
          <p className="mt-1 text-sm text-gray-500">{motivo.length} / 200 caracteres</p>
        </div>
      </AnimateOnScroll>

      {/* Modal de selección de horarios */}
      {selectedPackage && (
        <WeeklyAgendaModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          requiredClasses={selectedPackage.clases}
          professorId={profesorId}
          professor="Profesor X"
          onSubmit={handleScheduleSubmit}
        />
      )}

      {/* Botón para confirmar reserva y avanzar al paso de pago */}
      {!isPaymentStep && selectedSlots.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleConfirmReserva}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-white hover:bg-secondary-hover transition-all"
          >
            Continuar al pago
          </button>
        </div>
      )}

      {/* Componente de Pago embebido */}
      {selectedPackage !== null && (
        <AnimateOnScroll delay={800}>
          <div
            className={`mt-8 overflow-hidden origin-top transition-all duration-300 ease-in-out ${
              isPaymentStep ? "max-h-[1000px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"
            }`}
          >
            <PaymentForm
              clases={selectedPackage.clases}
              precioClase={Number(selectedPackage.precioClase.replace(/\./g, ""))}
              total={selectedPackage.total}
              alumnoId={alumnoId || ""}
              profesorId={profesorId}
              purchaseId={purchaseId}
              classDetails={handleClassDetails()}
            />
          </div>
        </AnimateOnScroll>
      )}
    </div>
  );
};

export default SolicitudClase;
