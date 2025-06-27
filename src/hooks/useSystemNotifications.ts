import { useState, useEffect, useCallback } from "react";
import {
  NotificationService,
  Notification,
  NotificationStats,
} from "../services/notificationService";

// Hook pour récupérer les notifications système
export const useSystemNotifications = (
  filters?: {
    lu?: boolean;
    type?: string;
    priorite?: string;
    limit?: number;
    offset?: number;
  },
  autoRefresh: boolean = true
) => {
  const [data, setData] = useState<{
    notifications: Notification[];
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await NotificationService.getNotifications(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des notifications");
      console.error("Erreur useSystemNotifications:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotifications();

    if (autoRefresh) {
      const interval = setInterval(fetchNotifications, 30000); // Refresh toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, autoRefresh]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await NotificationService.markAsRead(notificationId);
        await fetchNotifications(); // Refresh les données
      } catch (err: any) {
        setError(err.message || "Erreur lors du marquage de la notification");
      }
    },
    [fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      await fetchNotifications(); // Refresh les données
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du marquage de toutes les notifications"
      );
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await NotificationService.deleteNotification(notificationId);
        await fetchNotifications(); // Refresh les données
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la suppression de la notification"
        );
      }
    },
    [fetchNotifications]
  );

  return {
    data,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

// Hook pour les statistiques des notifications
export const useNotificationStats = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await NotificationService.getNotificationStats();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des statistiques");
      console.error("Erreur useNotificationStats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 60000); // Refresh toutes les minutes
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook pour la gestion des notifications
export const useNotificationActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotification = useCallback(
    async (notification: {
      type: string;
      titre: string;
      message: string;
      priorite: string;
      roles: string[];
      dateExpiration?: string;
      metadata?: any;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const result = await NotificationService.createNotification(
          notification
        );
        return result;
      } catch (err: any) {
        setError(
          err.message || "Erreur lors de la création de la notification"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const triggerChecks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await NotificationService.triggerChecks();
    } catch (err: any) {
      setError(err.message || "Erreur lors du déclenchement des vérifications");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanup = useCallback(async (olderThanDays: number = 7) => {
    try {
      setLoading(true);
      setError(null);
      const result = await NotificationService.cleanup(olderThanDays);
      return result;
    } catch (err: any) {
      setError(err.message || "Erreur lors du nettoyage des notifications");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateThresholds = useCallback(
    async (thresholds: {
      stockBas?: number;
      stockCritique?: number;
      performanceMinimale?: number;
      tempsReponseMax?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);
        await NotificationService.updateThresholds(thresholds);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la mise à jour des seuils");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createNotification,
    triggerChecks,
    cleanup,
    updateThresholds,
  };
};
