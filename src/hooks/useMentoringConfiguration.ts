import { useState, useEffect, useCallback } from 'react';

export interface TimeRange {
  start: string; // formato "HH:MM"
  end: string;   // formato "HH:MM"
}

export interface ProfessorSchedule {
  day: string;
  timeRanges: TimeRange[]; // Cambio de slots a timeRanges
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
  saveConfiguration: (schedule: ProfessorSchedule[]) => Promise<boolean>;
}

/**
 * Hook para obtener y guardar la configuración de horarios de un profesor
 */
export function useMentoringConfiguration(profileId: number | string): UseMentoringConfigurationReturn {
  const [configuration, setConfiguration] = useState<MentoringConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguration = useCallback(async () => {
    if (!profileId) {
      // Si no hay profileId, no hacer la llamada pero mantener loading en false
      setConfiguration(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Hook - Fetching configuration for profileId:', profileId);
      const response = await fetch(`/api/mentoring/configuration?userId=${profileId}`);
      const data = await response.json();
      console.log('Hook - API response:', data);

      if (!response.ok) {
        if (response.status === 404) {
          // No hay configuración, esto es normal para usuarios nuevos
          console.log('Hook - No configuration found (404)');
          setConfiguration(null);
          return;
        }
        throw new Error(data.message || 'Error al obtener la configuración');
      }

      console.log('Hook - Configuration set:', data.configuration);
      setConfiguration(data.configuration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Hook - Error:', errorMessage);
      setError(errorMessage);
      setConfiguration(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const saveConfiguration = useCallback(async (schedule: ProfessorSchedule[]): Promise<boolean> => {
    if (!profileId) {
      // No mostrar error si no hay profileId, solo retornar false
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const configData = {
        schedule
      };

      const method = configuration ? 'PUT' : 'POST';
      const response = await fetch('/api/mentoring/configuration', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(profileId),
          category: 1, // Categoría por defecto
          data: configData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la configuración');
      }

      // Recargar configuración después de guardar
      await fetchConfiguration();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [profileId, configuration, fetchConfiguration]);

  useEffect(() => {
    if (profileId) {
      fetchConfiguration();
    }
  }, [fetchConfiguration]);

  return {
    configuration,
    loading,
    error,
    refetch: fetchConfiguration,
    saveConfiguration
  };
} 