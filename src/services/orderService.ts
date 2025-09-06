import { Order, CreateOrderRequest, OrderStats } from "../types/order";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

// Configuration des logs
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || "debug";
const ENABLE_LOGS =
  LOG_LEVEL !== "error" &&
  (import.meta.env.DEV || import.meta.env.VITE_DEBUG_ORDERS === "true");

/**
 * Fonction de logging conditionnel pour le service de commandes
 */
function logOrder(message: string, ...args: any[]) {
  if (ENABLE_LOGS) {
    console.log(`📋 [ORDER-SERVICE] ${message}`, ...args);
  }
}

// Configuration axios avec intercepteurs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class OrderService {
  // Créer une nouvelle commande
  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    logOrder("Début de createOrder");
    logOrder("URL:", `/orders`);
    logOrder("Données:", JSON.stringify(data, null, 2));

    try {
      const response = await apiClient.post("/orders", data);

      logOrder("Statut de la réponse:", response.status);
      logOrder("Résultat du backend:", response.data);
      logOrder("Fin de createOrder");

      return response.data.data;
    } catch (error: any) {
      logOrder("Erreur du backend:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de la commande"
      );
    }
  } // Récupérer toutes les commandes (sans pagination)
  static async getOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get("/orders");
      logOrder("API response complet:", response.data);

      // S'assurer qu'on retourne toujours un tableau
      const data = response.data.data;
      logOrder("Data extrait:", data);

      // Vérifier la structure de la réponse
      if (data && typeof data === "object") {
        // Si la structure est { orders: [], totalPages: ..., etc }
        if (Array.isArray(data.orders)) {
          logOrder(
            "Structure avec data.orders trouvée, nombre de commandes:",
            data.orders.length
          );
          return data.orders;
        }
        // Si c'est directement un tableau
        else if (Array.isArray(data)) {
          logOrder(
            "Structure tableau direct trouvée, nombre de commandes:",
            data.length
          );
          return data;
        }
      }

      // Fallback : retourner un tableau vide si la structure est inattendue
      console.warn("⚠️ [OrderService] Format de données inattendu:", data);
      return [];
    } catch (error: any) {
      console.error(
        "❌ [OrderService] Erreur lors de la récupération des commandes:",
        error
      );
      throw new Error("Erreur lors de la récupération des commandes");
    }
  }

  // Récupérer une commande par ID
  static async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération de la commande");
    }
  }

  // Récupérer les commandes pour la cuisine
  static async getKitchenOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get("/orders/kitchen");
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération des commandes cuisine");
    }
  }

  // Récupérer les statistiques des commandes
  static async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await apiClient.get("/orders/stats");
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la récupération des statistiques");
    }
  }

  // Envoyer une commande en cuisine
  static async sendToKitchen(id: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/send-to-kitchen`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de l'envoi en cuisine");
    }
  }

  // Commencer la préparation d'une commande
  static async startCooking(id: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/start-cooking`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors du démarrage de la préparation");
    }
  }

  // Terminer la préparation d'une commande (EN_PREPARATION -> PRET)
  static async finishCooking(id: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/finish-cooking`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la finalisation de la préparation");
    }
  }

  // Marquer une commande comme terminée (PRET -> TERMINE)
  static async markAsCompleted(id: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/mark-completed`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de la finalisation de la commande");
    }
  }

  // Envoyer une commande à la caisse (PRET -> EN_ATTENTE_PAIEMENT)
  static async sendToCashier(id: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/send-to-cashier`);
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de l'envoi à la caisse");
    }
  }

  // Mettre à jour une commande
  static async updateOrder(
    id: string,
    data: Partial<CreateOrderRequest>
  ): Promise<Order> {
    try {
      const response = await apiClient.put(`/orders/${id}`, data);
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
    logOrder("🌐 [OrderService] Début de updateOrderComplete");
    logOrder("📤 [OrderService] URL:", `/orders/${id}/complete`);
    logOrder("📦 [OrderService] Données:", JSON.stringify(data, null, 2));

    try {
      const response = await apiClient.put(`/orders/${id}/complete`, data);

      logOrder("📡 [OrderService] Statut de la réponse:", response.status);
      logOrder("✅ [OrderService] Résultat du backend:", response.data);
      logOrder("🏁 [OrderService] Fin de updateOrderComplete");

      return response.data.data;
    } catch (error: any) {
      logOrder("❌ [OrderService] Erreur du backend:", error.response?.data);
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors de la mise à jour complète de la commande"
      );
    }
  }

  // Annuler une commande avec motif
  static async cancelOrder(id: string, motif?: string): Promise<void> {
    try {
      const response = await apiClient.patch(`/orders/${id}/cancel`, {
        motifAnnulation: motif || "Annulation par l'utilisateur",
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error("Erreur lors de l'annulation de la commande");
    }
  }

  // Mettre à jour le statut d'une commande directement
  static async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await apiClient.patch(`/orders/${id}/update-status`, {
        statut: status,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Erreur lors de la mise à jour du statut vers ${status}`);
    }
  }

  // Traiter un paiement pour une commande (utilise le système de paiements)
  static async processPayment(
    orderId: string,
    paymentData: {
      modePaiement: string;
      montant?: number;
      referenceTransaction?: string;
    }
  ): Promise<any> {
    try {
      const response = await apiClient.post("/payments/process", {
        commande: orderId,
        ...paymentData,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erreur lors du traitement du paiement"
      );
    }
  }

  // Mettre à jour le mode de paiement d'une commande
  static async updatePaymentMethod(
    orderId: string,
    newPaymentMethod: string
  ): Promise<Order> {
    try {
      const response = await apiClient.put(`/orders/${orderId}`, {
        modePaiement: newPaymentMethod,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du mode de paiement"
      );
    }
  }
}
