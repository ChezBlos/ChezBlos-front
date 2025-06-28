import { Order, CreateOrderRequest, OrderStats } from "../types/order";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    try {
      const response = await apiClient.post("/orders", data);

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de la commande"
      );
    }
  } // Récupérer toutes les commandes (sans pagination)
  static async getOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get("/orders");

      // S'assurer qu'on retourne toujours un tableau
      const data = response.data.data;

      // Vérifier la structure de la réponse
      if (data && typeof data === "object") {
        // Si la structure est { orders: [], totalPages: ..., etc }
        if (Array.isArray(data.orders)) {
          return data.orders;
        }
        // Si c'est directement un tableau
        else if (Array.isArray(data)) {
          return data;
        }
      }

      // Fallback : retourner un tableau vide si la structure est inattendue
      return [];
    } catch (error: any) {
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
    try {
      const response = await apiClient.put(`/orders/${id}/complete`, data);

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Erreur lors de la mise à jour complète de la commande"
      );
    }
  }

  // Annuler une commande
  static async cancelOrder(id: string): Promise<void> {
    try {
      await apiClient.delete(`/orders/${id}`);
    } catch (error: any) {
      throw new Error("Erreur lors de l'annulation de la commande");
    }
  }
}
