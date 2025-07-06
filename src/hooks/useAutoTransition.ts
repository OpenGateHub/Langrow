import { useState, useEffect, useCallback } from "react";

interface AutoTransitionResponse {
  processed: number;
  notificationsSent: number;
  details: {
    classesProcessed: number[];
    notificationsSent: Array<{
      type: 'student' | 'professor';
      profileId: number;
      classId: number;
    }>;
  };
}

interface ClassesToReviewResponse {
  data: Array<{
    id: number;
    userId: number;
    studentId: number;
    beginsAt: string;
    endsAt: string;
    title: string;
    status: string;
    requestDescription: string;
  }>;
  count: number;
}

export const useAutoTransition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para ejecutar transiciones automáticas
  const executeAutoTransition = useCallback(async (): Promise<AutoTransitionResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mentoring/auto-transition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al ejecutar transiciones automáticas');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en executeAutoTransition:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener clases que necesitan revisión
  const getClassesToReview = useCallback(async (userId: string): Promise<ClassesToReviewResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/mentoring/auto-transition?userId=${userId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener clases para revisar');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error en getClassesToReview:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para programar transiciones automáticas (se ejecuta cada 5 minutos)
  const scheduleAutoTransition = useCallback(() => {
    const interval = setInterval(async () => {
      console.log('Ejecutando transiciones automáticas...');
      await executeAutoTransition();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [executeAutoTransition]);

  return {
    loading,
    error,
    executeAutoTransition,
    getClassesToReview,
    scheduleAutoTransition,
  };
}; 