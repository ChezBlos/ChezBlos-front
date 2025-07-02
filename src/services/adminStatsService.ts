import api from "./api";
import { logger } from "../utils/logger";

// Types pour les statistiques admin
export interface DashboardStats {
  today: {
    commandes: number;
    recettes: number;
    commandesTerminees?: number;
    commandesTermineesParServeur?: Array<{
      serveur: {
        _id: string;
        nom: string;
        prenom: string;
      };
      commandesTerminees: number;
    }>;
    platsPrepares?: number; // Ajouté
    platsServis?: number; // Ajouté
  };
  total: {
    commandes: number;
    recettes: number;
  };
  commandesEnAttente: number;
  utilisateursActifs: number;
}

export interface UserStats {
  total: number;
  actifs: number;
  parRole: Array<{
    _id: string;
    count: number;
    actifs: number;
  }>;
}

export interface SalesStats {
  dateDebut: string;
  dateFin: string;
  ventes: Array<{
    date: string;
    commandes: number;
    recettes: number;
  }>;
}

export class AdminStatsService {
  // Récupérer les statistiques du dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get("/stats/dashboard");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques du dashboard:",
        error
      );
      throw error;
    }
  }

  // Récupérer les statistiques des utilisateurs
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get("/users/stats");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques utilisateurs:",
        error
      );
      throw error;
    }
  }

  // Récupérer les statistiques de ventes
  static async getSalesStats(params?: {
    dateDebut?: string;
    dateFin?: string;
    groupBy?: "hour" | "day" | "week" | "month";
  }): Promise<SalesStats> {
    try {
      const response = await api.get("/stats/sales", { params });
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques de ventes:",
        error
      );
      throw error;
    }
  }

  // Récupérer les statistiques des paiements
  static async getPaymentStats() {
    try {
      const response = await api.get("/payments/stats");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques de paiements:",
        error
      );
      throw error;
    }
  }

  // Récupérer les statistiques du menu
  static async getMenuStats() {
    try {
      const response = await api.get("/menu/stats");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des statistiques du menu:",
        error
      );
      throw error;
    }
  }

  // Récupérer les top plats vendus
  static async getTopSellingItems(limit: number = 10) {
    try {
      const response = await api.get(`/stats/top-selling?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération du top des ventes:", error);
      throw error;
    }
  }
}
