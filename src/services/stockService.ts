import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

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

export interface StockItem {
  _id: string;
  nom: string;
  categorie?: string;
  quantiteStock: number;
  unite: string;
  seuilAlerte: number;
  prixAchat?: number;
  fournisseur?: string;
  datePeremption?: string;
  dateCreation: string;
  dateModification: string;
}

export interface StockAdjustment {
  type: "ENTREE" | "SORTIE" | "AJUSTEMENT" | "PERTE";
  quantite: number;
  motif: string;
}

export interface StockStats {
  totalArticles: number;
  totalValeur: number;
  articlesEnAlerte: number;
  articlesCritiques: number;
}

export class StockService {
  // Récupérer tous les articles de stock
  static async getStockItems(): Promise<StockItem[]> {
    try {
      const response = await apiClient.get("/stock");
      return response.data.data.stockItems; // Correction ici
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des articles de stock"
      );
    }
  }

  // Récupérer un article de stock par ID
  static async getStockItemById(id: string): Promise<StockItem> {
    try {
      const response = await apiClient.get(`/stock/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération de l'article"
      );
    }
  }

  // Ajuster le stock (pour les cuisiniers)
  static async adjustStock(
    id: string,
    adjustment: StockAdjustment
  ): Promise<StockItem> {
    try {
      const response = await apiClient.post(`/stock/${id}/adjust`, adjustment);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erreur lors de l'ajustement du stock"
      );
    }
  }

  // Récupérer les statistiques du stock
  static async getStockStats(): Promise<StockStats> {
    try {
      const response = await apiClient.get("/stock/stats");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des statistiques"
      );
    }
  }
  // Récupérer les alertes de stock
  static async getStockAlerts(): Promise<StockItem[]> {
    try {
      const response = await apiClient.get("/stock/alerts");
      const alertsData = response.data.data;
      // Combiner les articles en stock bas et les articles qui expirent
      return [...(alertsData.stockBas || []), ...(alertsData.expiration || [])];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des alertes"
      );
    }
  }
}
