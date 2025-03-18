"use client";
import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/app/api/supabaseClient";

export interface Notification {
  id: number;
  profileId: number;
  message: string;
  isStaff: boolean;
  url?: string;
  isActive: boolean;
}

export interface CreateNotificationPayload {
  profileId: number;
  message: string;
  isStaff: boolean;
  url?: string;
}

export interface ReadNotificationPayload {
  notificationId: number;
}

export interface GetNotificationPayload {
  profileId: number;
  isStaff: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<GetNotificationPayload | null>(
    null
  );

  const getNotifications = useCallback(async (payload: GetNotificationPayload) => {
    try {
      setLoading(true);
      setError(null);
      setLastParams(payload);

      const queryParams = new URLSearchParams({
        profileId: String(payload.profileId),
        isStaff: String(payload.isStaff),
      });
      const res = await fetch(`/api/notification?${queryParams.toString()}`, {
        method: "GET",
      });
      if (!res.ok) {
        throw new Error("Error al obtener notificaciones");
      }
      const data = await res.json();
      console.log("Respuesta de /api/notification =>", data);

      setNotifications(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Suscripción en tiempo real con Supabase
  useEffect(() => {
    // Se crea la suscripción solo si se han obtenido parámetros previamente (por ejemplo, el profileId)
    if (!lastParams) return;

    const channel = supabaseClient
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notifications" },
        (payload) => {
          // Cada vez que haya un cambio, se vuelve a llamar a getNotifications
          getNotifications(lastParams);
        }
      )
      .subscribe();

    // Limpiar la suscripción al desmontar el hook o si cambia lastParams
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [lastParams, getNotifications]);

  // Otras funciones: createNotification, markAsRead, etc.
  const createNotification = async (
    payload: CreateNotificationPayload
  ): Promise<Notification | null> => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("Enviando payload a /api/notification:", payload);
  
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const responseData = await res.json(); // Leemos la respuesta una sola vez
      console.log("Respuesta del servidor:", responseData);
  
      if (!res.ok) {
        throw new Error(responseData.message || "Error al crear notificación");
      }
  
      return responseData.data;
    } catch (err: any) {
      setError(err.message);
      console.error("Error en createNotification:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  const markAsRead = async (
    payload: ReadNotificationPayload
  ): Promise<Notification | null> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/notification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al marcar notificación como leída");
      }
      // La suscripción se encargará de actualizar la lista si hay cambios
      return (await res.json()).data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading,
    error,
    getNotifications,
    createNotification,
    markAsRead,
  };
};
