import { Order, CreateOrderRequest, OrderStats } from "../types/order";
import api from "./api";
import { logger, logApiResponse, logApiError } from "../utils/logger";

export interface OrderFilters {
  statut?: string;
  serveur?: string;
  numeroTable?: number;
  search?: string;
  dateFilter?: {
    mode: "single" | "period";
    date?: string;
    startDate?: string;
    endDate?: string;
  };
}

export class OrderService {
  // Créer une nouvelle commande
  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    logger.debug("🌐 [OrderService] Début de createOrder");
    logger.debug("📤 [OrderService] URL:", `/orders`);
    logger.debug("📦 [OrderService] Données:", JSON.stringify(data, null, 2));

    try {
      const response = await api.post("/orders", data);

      logger.debug("📡 [OrderService] Statut de la réponse:", response.status);
      logApiResponse("/orders", response.data);
      logger.debug("🏁 [OrderService] Fin de createOrder");

      return response.data.data;
    } catch (error: any) {
      logApiError("/orders", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de la commande"
      );
    }
  }

  // Récupérer toutes les commandes avec pagination et filtres
  async getOrders(
    page: number = 1,
    limit: number = 10,
    filters: OrderFilters = {}
  ): Promise<{
    orders: Order[];
    totalPages: number;
    currentPage: number;
    totalOrders: number;
  }> {
    try {
      logger.debug("🔍 [OrderService] Récupération des commandes:", {
        page,
        limit,
        filters,
      });

      const params: any = { page, limit };

      // Ajouter les filtres aux paramètres
      if (filters.statut && filters.statut !== "TOUTES") {
        params.statut = filters.statut;
      }
      if (filters.serveur) {
        params.serveur = filters.serveur;
      }
      if (filters.numeroTable) {
        params.numeroTable = filters.numeroTable;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.dateFilter) {
        if (filters.dateFilter.mode === "single") {
          params.date = filters.dateFilter.date;
        } else {
          params.startDate = filters.dateFilter.startDate;
          params.endDate = filters.dateFilter.endDate;
        }
      }

      const response = await api.get("/orders", { params });

      logger.debug("✅ [OrderService] Commandes récupérées:", response.data);

      return {
        orders: response.data.data.orders || [],
        totalPages: response.data.data.totalPages || 1,
        currentPage: response.data.data.currentPage || 1,
        totalOrders: response.data.data.totalOrders || 0,
      };
    } catch (error: any) {
      logger.error(
        "❌ [OrderService] Erreur lors de la récupération des commandes:",
        error
      );
      throw new Error("Erreur lors de la récupération des commandes");
    }
  }

  // Récupérer toutes les commandes (sans pagination)
  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/orders");
      logger.debug("📦 [OrderService] API response complet:", response.data);

      // S'assurer qu'on retourne toujours un tableau
      const data = response.data.data;
      logger.debug("📦 [OrderService] Data extrait:", data);

      // Vérifier la structure de la réponse
      if (data && typeof data === "object") {
        // Si la structure est { orders: [], totalPages: ..., etc }
        if (Array.isArray(data.orders)) {
          logger.debug(
            "✅ [OrderService] Structure avec data.orders trouvée, nombre de commandes:",
            data.orders.length
          );
          return data.orders;
        }
        // Si c'est directement un tableau
        else if (Array.isArray(data)) {
          logger.debug(
            "✅ [OrderService] Structure tableau direct trouvée, nombre de commandes:",
            data.length
          );
          return data;
        }
      }

      // Fallback : retourner un tableau vide si la structure est inattendue
      logger.warn("⚠️ [OrderService] Format de données inattendu:", data);
      return [];
    } catch (error: any) {
      logger.error(
        "❌ [OrderService] Erreur lors de la récupération des commandes:",
        error
      );
      throw new Error("Erreur lors de la récupération des commandes");
    }
  }

  // Récupérer une commande par ID
  static async getOrderById(id: string): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération de la commande");
    }
  }

  // Récupérer les commandes pour la cuisine
  static async getKitchenOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/orders/kitchen");
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération des commandes cuisine");
    }
  }

  // Récupérer les statistiques des commandes
  static async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await api.get("/orders/stats");
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération des statistiques");
    }
  }

  // Envoyer une commande en cuisine
  static async sendToKitchen(id: string): Promise<Order> {
    try {
      const response = await api.patch(`/orders/${id}/send-to-kitchen`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de l'envoi en cuisine");
    }
  }

  // Commencer la préparation d'une commande
  static async startCooking(id: string): Promise<Order> {
    try {
      const response = await api.patch(`/orders/${id}/start-cooking`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors du démarrage de la préparation");
    }
  }

  // Terminer la préparation d'une commande (EN_PREPARATION -> PRET)
  static async finishCooking(id: string): Promise<Order> {
    try {
      const response = await api.patch(`/orders/${id}/finish-cooking`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la finalisation de la préparation");
    }
  }

  // Marquer une commande comme terminée (PRET -> TERMINE)
  static async markAsCompleted(id: string): Promise<Order> {
    try {
      const response = await api.patch(`/orders/${id}/mark-completed`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la finalisation de la commande");
    }
  }

  // Mettre à jour une commande
  static async updateOrder(
    id: string,
    data: Partial<CreateOrderRequest>
  ): Promise<Order> {
    try {
      const response = await api.put(`/orders/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la mise à jour de la commande");
    }
  }

  // Mettre à jour complètement une commande (y compris les items)
  static async updateOrderComplete(
    id: string,
    data: CreateOrderRequest
  ): Promise<Order> {
    logger.debug("🌐 [OrderService] Début de updateOrderComplete");
    logger.debug("📤 [OrderService] URL:", `/orders/${id}/complete`);
    logger.debug("📦 [OrderService] Données:", JSON.stringify(data, null, 2));

    try {
      const response = await api.put(`/orders/${id}/complete`, data);

      logger.debug("📡 [OrderService] Statut de la réponse:", response.status);
      logger.debug("✅ [OrderService] Résultat du backend:", response.data);
      logger.debug("🏁 [OrderService] Fin de updateOrderComplete");

      return response.data.data;
    } catch (error: any) {
      logger.debug(
        "❌ [OrderService] Erreur du backend:",
        error.response?.data
      );
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors de la mise à jour complète de la commande"
      );
    }
  }

  // Annuler une commande
  static async cancelOrder(
    id: string,
    motifAnnulation?: string
  ): Promise<void> {
    try {
      await api.delete(`/orders/${id}`, {
        data: { motifAnnulation },
      });
    } catch (error: any) {
      throw new Error("Erreur lors de l'annulation de la commande");
    }
  }
}
