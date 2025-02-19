import { useState, useEffect } from "react";

export interface Notification {
  id: number;
  profileId: number;
  message: string;
  isStaff: boolean;
  isActive: boolean;
  createdAt: string;
  // Puedes agregar otros campos según lo que retorne la API
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  markAsRead: (notificationId: number) => Promise<any>;
  createNotification: (data: {
    profileId: number;
    message: string;
    isStaff: boolean;
  }) => Promise<any>;
}

export function useNotifications(
  profileId: number | string,
  isStaff: boolean
): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/notifications?profileId=${profileId}&isStaff=${isStaff}`
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al obtener notificaciones");
      }
      setNotifications(json.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profileId, isStaff]);

  const markAsRead = async (notificationId: number) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al marcar notificación como leída");
      }
      await fetchNotifications();
      return json;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createNotification = async (data: {
    profileId: number;
    message: string;
    isStaff: boolean;
  }) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Error al crear notificación");
      }
      await fetchNotifications();
      return json;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    createNotification,
  };
}
