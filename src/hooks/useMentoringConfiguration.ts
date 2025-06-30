import { useState, useEffect, useCallback } from 'react';

export interface ProfessorSchedule {
  day: string;
  slots: string[];
}

export interface MentoringConfiguration {
  id: number;
  userId: number;
  configuration: {
    schedule?: ProfessorSchedule[];
  };
  category?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UseMentoringConfigurationReturn {
  configuration: MentoringConfiguration | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener la configuración de horarios de un profesor
 */
export function useMentoringConfiguration(userId: number | string): UseMentoringConfigurationReturn {
  const [configuration, setConfiguration] = useState<MentoringConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguration = useCallback(async () => {
    if (!userId) {
      setError('userId es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mentoring/configuration?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener la configuración');
      }

      setConfiguration(data.configuration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setConfiguration(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  return {
    configuration,
    loading,
    error,
    refetch: fetchConfiguration
  };
} 