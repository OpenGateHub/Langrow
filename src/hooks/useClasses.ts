import { useState, useEffect } from "react";
import { ClassData } from "@/types/class";
import { ClassRoomStatus } from "@/types/classRoom";

interface UseClassesReturn {
  classes: Record<string, ClassData[]>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateClassStatus: (classId: number, newStatus: string) => Promise<boolean>;
}

export function useClasses(userId: string): UseClassesReturn {
  const [classes, setClasses] = useState<Record<string, ClassData[]>>({
    "Solicitudes": [],
    "Próximas": [],
    "Revisar": [],
    "Revisadas": []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/mentoring?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener las clases');
      }

      // Organizamos las clases por categoría
      const organizedClasses: Record<string, ClassData[]> = {
        "Solicitudes": [],
        "Próximas": [],
        "Revisar": [],
        "Revisadas": []
      };

      data.data.forEach((classItem: any) => {
        const mappedClass: ClassData = {
          id: classItem.id,
          title: classItem.title,
          instructor: classItem.professorName,
          professorId: classItem.userId,
          studentId: classItem.studentId,
          category: String(classItem.category),
          date: new Date(classItem.beginsAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }),
          time: `${new Date(classItem.beginsAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })} - ${new Date(classItem.endsAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          duration: `${classItem.duration} min`,
          cost: "3 USD", // Esto debería venir de la API
          status: classItem.status,
          requestDescription: classItem.requestDescription,
          professorReview: classItem.professorReview ? {
            text: classItem.professorReview,
            rating: classItem.professorRate
          } : undefined
        };

        // Clasificar según el estado
        switch (classItem.status) {
          case ClassRoomStatus.REQUESTED:
            organizedClasses["Solicitudes"].push(mappedClass);
            break;
          case ClassRoomStatus.NEXT:
            organizedClasses["Próximas"].push(mappedClass);
            break;
          case ClassRoomStatus.NOTCONFIRMED:
            organizedClasses["Revisar"].push(mappedClass);
            break;
          case ClassRoomStatus.CONFIRMED:
            organizedClasses["Revisadas"].push(mappedClass);
            break;
        }
      });

      setClasses(organizedClasses);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateClassStatus = async (classId: number, newStatus: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/mentoring', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: classId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la clase');
      }

      // Refrescar las clases después de actualizar
      await fetchClasses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [userId]);

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
    updateClassStatus
  };
} 