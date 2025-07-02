import api from "./api";
import { logger } from "../utils/logger";

// Types pour les notifications
export interface Notification {
  _id: string;
  type: "STOCK_BAS" | "STOCK_RUPTURE" | "ALERTE_GENERALE" | "PERFORMANCE";
  titre: string;
  message: string;
  priorite: "BASSE" | "MOYENNE" | "HAUTE" | "CRITIQUE";
  roles: string[];
  lu: boolean;
  dateCreation: string;
  dateExpiration?: string;
  metadata?: any;
}

export interface NotificationStats {
  total: number;
  nonLues: number;
  parPriorite: {
    [key: string]: number;
  };
  parType: {
    [key: string]: number;
  };
}

export class NotificationService {
  // Récupérer toutes les notifications
  static async getNotifications(filters?: {
    lu?: boolean;
    type?: string;
    priorite?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.lu !== undefined) params.append("lu", filters.lu.toString());
      if (filters?.type) params.append("type", filters.type);
      if (filters?.priorite) params.append("priorite", filters.priorite);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      logger.error("Erreur lors du marquage de la notification:", error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  static async markAllAsRead(): Promise<void> {
    try {
      await api.patch("/notifications/mark-all-read");
    } catch (error) {
      logger.error(
        "Erreur lors du marquage de toutes les notifications:",
        error
      );
      throw error;
    }
  }

  // Supprimer une notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      logger.error("Erreur lors de la suppression de la notification:", error);
      throw error;
    }
  }

  // Récupérer les statistiques des notifications
  static async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get("/notifications/stats");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des stats notifications:",
        error
      );
      throw error;
    }
  }

  // Créer une notification manuelle
  static async createNotification(notification: {
    type: string;
    titre: string;
    message: string;
    priorite: string;
    roles: string[];
    dateExpiration?: string;
    metadata?: any;
  }): Promise<Notification> {
    try {
      const response = await api.post("/notifications", notification);
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors de la création de la notification:", error);
      throw error;
    }
  }

  // Déclencher les vérifications manuelles
  static async triggerChecks(): Promise<void> {
    try {
      await api.post("/notifications/trigger-checks");
    } catch (error) {
      logger.error("Erreur lors du déclenchement des vérifications:", error);
      throw error;
    }
  }

  // Nettoyage des anciennes notifications
  static async cleanup(
    olderThanDays: number = 7
  ): Promise<{ deletedCount: number }> {
    try {
      const response = await api.post("/notifications/cleanup", {
        olderThanDays,
      });
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors du nettoyage des notifications:", error);
      throw error;
    }
  }

  // Configuration des seuils
  static async updateThresholds(thresholds: {
    stockBas?: number;
    stockCritique?: number;
    performanceMinimale?: number;
    tempsReponseMax?: number;
  }): Promise<void> {
    try {
      await api.put("/notifications/config/thresholds", thresholds);
    } catch (error) {
      logger.error("Erreur lors de la mise à jour des seuils:", error);
      throw error;
    }
  }

  // Récupérer la configuration actuelle
  static async getConfig(): Promise<any> {
    try {
      const response = await api.get("/notifications/config");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération de la configuration:",
        error
      );
      throw error;
    }
  }
}
