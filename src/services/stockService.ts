import api from "./api";

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
      const response = await api.get("/stock");
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
      const response = await api.get(`/stock/${id}`);
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
      const response = await api.post(`/stock/${id}/adjust`, adjustment);
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
      const response = await api.get("/stock/stats");
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
      const response = await api.get("/stock/alerts");
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

  // Créer un nouvel article de stock (JSON)
  static async createStockItem(data: any): Promise<StockItem> {
    try {
      console.log(
        "[StockService] Données envoyées à l’API (createStockItem):",
        data
      );
      const response = await api.post("/stock", data);
      console.log(
        "[StockService] Réponse API (createStockItem):",
        response.data
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        console.error(
          "[StockService] Erreur API (createStockItem):",
          error.response.status,
          error.response.data
        );
      } else {
        console.error(
          "[StockService] Erreur inconnue (createStockItem):",
          error
        );
      }
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la création de l'article de stock"
      );
    }
  }

  // Mettre à jour un article de stock (JSON)
  static async updateStockItem(id: string, data: any): Promise<StockItem> {
    try {
      console.log(
        "[StockService] Données envoyées à l’API (updateStockItem):",
        data
      );
      const response = await api.put(`/stock/${id}`, data);
      console.log(
        "[StockService] Réponse API (updateStockItem):",
        response.data
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response) {
        console.error(
          "[StockService] Erreur API (updateStockItem):",
          error.response.status,
          error.response.data
        );
        if (error.response.data && error.response.data.details) {
          console.error(
            "[StockService] Détails de l’erreur de validation:",
            error.response.data.details
          );
        }
      } else {
        console.error(
          "[StockService] Erreur inconnue (updateStockItem):",
          error
        );
      }
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la modification de l'article de stock"
      );
    }
  }

  // Supprimer un article de stock
  static async deleteStockItem(id: string): Promise<void> {
    try {
      await api.delete(`/stock/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'article de stock"
      );
    }
  }
}
