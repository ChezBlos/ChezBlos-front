import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ValidatedOrder {
  _id: string;
  numeroCommande: string;
  items: Array<{
    menuItem: {
      _id: string;
      nom: string;
      prix: number;
      categorie: string;
    };
    nom: string;
    quantite: number;
    prixUnitaire: number;
    notes?: string;
  }>;
  montantTotal: number;
  statut: string;
  caissier?: {
    _id: string;
    nom: string;
    prenom: string;
    photoProfil?: string;
  };
  modePaiement?: string;
  montantPaye?: number;
  dateCreation: string;
  notes?: string;
}

export interface RevenueStats {
  today: {
    nombreCommandes: number;
    chiffreAffaires: number;
  };
  week: {
    nombreCommandes: number;
    chiffreAffaires: number;
  };
  month: {
    nombreCommandes: number;
    chiffreAffaires: number;
  };
  all: {
    nombreCommandes: number;
    chiffreAffaires: number;
  };
}

export interface DeleteOrderResponse {
  numeroCommande: string;
  montantTotal: number;
  dateCreation: string;
  items: number;
  supprimePar: string;
  motif: string;
  dateSuppression: string;
}

export interface ResetRevenueResponse {
  type: string;
  description: string;
  periode: {
    debut: string | Date;
    fin: string | Date;
  };
  statistiques: {
    commandesSupprimees: number;
    chiffreAffairesPerdu: number;
  };
  effectuePar: string;
  motif: string;
  dateReinitialisation: string;
}

export class SettingsService {
  /**
   * Récupérer toutes les commandes validées et payées
   */
  static async getValidatedOrders(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    orders: ValidatedOrder[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const response = await api.get("/settings/orders/validated", { params });
    return response.data.data;
  }

  /**
   * Supprimer une commande validée
   */
  static async deleteValidatedOrder(
    orderId: string,
    motifSuppression: string
  ): Promise<DeleteOrderResponse> {
    const response = await api.delete(`/settings/orders/${orderId}`, {
      data: { motifSuppression },
    });
    return response.data.data;
  }

  /**
   * Récupérer les statistiques du chiffre d'affaires
   */
  static async getRevenueStats(): Promise<RevenueStats> {
    const response = await api.get("/settings/revenue/stats");
    return response.data.data;
  }

  /**
   * Réinitialiser le chiffre d'affaires
   */
  static async resetRevenue(params: {
    type: "today" | "week" | "month" | "all" | "custom";
    startDate?: string;
    endDate?: string;
    motif: string;
  }): Promise<ResetRevenueResponse> {
    const response = await api.post("/settings/revenue/reset", params);
    return response.data.data;
  }
}
