import { useState, useMemo } from "react";
import { useGetMentoring, MentoringSession, useUpdateMentoringStatus } from "./useMentoring";
import { ClassData } from "@/types/class";
import { SelectedSlotType } from "@/app/components/ModalClassRequest";
import { ClassRoomStatus } from "@/types/classRoom";

interface UseClassManagementReturn {
  classesData: Record<GroupTabs, ClassData[]>;
  loading: boolean;
  error: string | null;
  selectedClass: ClassData | null;
  isReviewModalOpen: boolean;
  isScheduleModalOpen: boolean;
  isMessageModalOpen: boolean;
  modalMessage: string;
  modalType: "success" | "error";
  openModal: (c: ClassData, action: string) => void;
  closeModal: () => void;
  handleReviewSubmit: (text: string, rating: number, reviewerId: number) => Promise<void>;
  handleScheduleSubmit: (slots: SelectedSlotType[]) => Promise<void>;
  setMessageModalOpen: (isOpen: boolean) => void;
}

export enum GroupTabs {
  Solicitudes = "Solicitudes",
  Proximas = "Próximas",
  Atencion = "Atencion",
  Revisadas = "Revisadas",
}

export function useClassManagement(userId: string): UseClassManagementReturn {
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState<"success" | "error">("success");

  const { sessions: raw, loading, error, refetch } = useGetMentoring({
    userId: userId || "",
    page: 50,
  });
  const { updateStatus } = useUpdateMentoringStatus();

  const sessions: ClassData[] = useMemo(() => {
    return raw.map((s: MentoringSession) => {
      const professorReviewData = s.professorReview && s.professorRate
        ? { text: s.professorReview, rating: s.professorRate }
        : undefined;

      const studentReviewData = s.studentReview && s.studentRate
        ? { text: s.studentReview, rating: s.studentRate }
        : undefined;

      return {
        id: s.id,
        title: s.title,
        instructor: s.professorName || `Profesor ${s.userId}`,
        professorId: Number(s.userId),
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
        professorReview: professorReviewData,
        studentReview: studentReviewData,
      };
    });
  }, [raw]);

  const classesData = useMemo(() => {
    const grouped: Record<GroupTabs, ClassData[]> = {
      [GroupTabs.Solicitudes]: [],
      [GroupTabs.Proximas]: [],
      [GroupTabs.Atencion]: [],
      [GroupTabs.Revisadas]: [],
    };

    sessions.forEach(c => {
      switch (c.status) {
        case ClassRoomStatus.REQUESTED:
          grouped[GroupTabs.Solicitudes].push(c);
          break;
        case ClassRoomStatus.NEXT:
          grouped[GroupTabs.Proximas].push(c);
          break;
        case ClassRoomStatus.NOTCONFIRMED:
          grouped["Revisar"].push(c);
          break;
        case ClassRoomStatus.CANCELLED:
          grouped[GroupTabs.Atencion].push(c);
          // Las clases canceladas van a Revisadas
          break;
        case ClassRoomStatus.CONFIRMED:
        default:
          grouped[GroupTabs.Revisadas].push(c);
          break;
      }
    });

    return grouped;
  }, [sessions]);

  const openModal = async (c: ClassData, action: string) => {
    setSelectedClass(c);
    setSelectedAction(action);

    if (action === "confirmar") {
      setIsReviewModalOpen(true);
    } else if (action === "aceptar") {
      try {
        const result = await updateStatus({ id: c.id, status: ClassRoomStatus.NEXT });
        if (result?.success) {
          setModalMessage("¡Clase aceptada con éxito!");
          setModalType("success");
          refetch();
        } else {
          throw new Error(result?.error || "Error al aceptar la clase");
        }
      } catch (err) {
        setModalMessage(err instanceof Error ? err.message : "Error al aceptar la clase");
        setModalType("error");
      } finally {
        setIsMessageModalOpen(true);
      }
    } else {
      setIsScheduleModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsReviewModalOpen(false);
    setIsScheduleModalOpen(false);
    setSelectedClass(null);
    setSelectedAction("");
  };

  const handleReviewSubmit = async (text: string, rating: number, reviewerId: number) => {
    if (!selectedClass) return;
    try {
      const result = await updateStatus({ id: selectedClass.id, status: "CONFIRMED" });
      if (!result?.success) {
        throw new Error(result?.error || "Error al confirmar la clase");
      }
      setModalMessage("¡Reseña enviada!");
      setModalType("success");
      refetch();
    } catch (err) {
      setModalMessage(err instanceof Error ? err.message : "Error al enviar reseña");
      setModalType("error");
    } finally {
      setIsMessageModalOpen(true);
      closeModal();
    }
  };

  const handleScheduleSubmit = async (slots: SelectedSlotType[]) => {
    if (!selectedClass) return;
    try {
      const result = await updateStatus({ id: selectedClass.id, status: "NEXT" });
      if (!result?.success) {
        throw new Error(result?.error || "Error al reagendar la clase");
      }
      setModalMessage("¡Clase reagendada con éxito!");
      setModalType("success");
      refetch();
    } catch (err) {
      setModalMessage(err instanceof Error ? err.message : "Error al reagendar la clase");
      setModalType("error");
    } finally {
      setIsMessageModalOpen(true);
      closeModal();
    }
  };

  return {
    classesData,
    loading,
    error,
    selectedClass,
    isReviewModalOpen,
    isScheduleModalOpen,
    isMessageModalOpen,
    modalMessage,
    modalType,
    openModal,
    closeModal,
    handleReviewSubmit,
    handleScheduleSubmit,
    setMessageModalOpen: setIsMessageModalOpen,
  };
}
