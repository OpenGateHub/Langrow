"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAutoTransition } from "@/hooks/useAutoTransition";
import { useNotifications } from "@/hooks/useNotifications";

export const AutoTransitionHandler = () => {
  const { user } = useUser();
  const { executeAutoTransition, scheduleAutoTransition } = useAutoTransition();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Ejecutar transiciones automáticas al cargar la página
    const runInitialTransition = async () => {
      try {
        const result = await executeAutoTransition();
        if (result && result.processed > 0) {
          console.log(`Procesadas ${result.processed} clases automáticamente`);
          console.log(`Enviadas ${result.notificationsSent} notificaciones`);
        }
      } catch (error) {
        console.error('Error en transición inicial:', error);
      }
    };

    runInitialTransition();

    // Programar transiciones automáticas cada 5 minutos
    const cleanup = scheduleAutoTransition();

    return cleanup;
  }, [user, executeAutoTransition, scheduleAutoTransition]);

  // Este componente no renderiza nada visible
  return null;
}; 