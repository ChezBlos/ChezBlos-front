import axios, { AxiosResponse } from "axios";

// Utilisation de la variable d'environnement pour l'URL de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://chezblos-back.onrender.com/api";

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

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Ne pas rediriger automatiquement, laisser le composant gérer l'affichage de l'erreur
    }
    return Promise.reject(error);
  }
);

// Types pour les réponses API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Services d'authentification
export const loginApi = (credentials: {
  email?: string;
  motDePasse?: string;
  telephone?: string;
  codeAcces?: string;
}): Promise<AxiosResponse<ApiResponse>> => {
  return api.post("/auth/login", credentials);
};

export const getUserProfile = (): Promise<AxiosResponse<ApiResponse>> => {
  return api.get("/auth/profile");
};

// Services pour les commandes
export const getOrders = (params?: {
  statut?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<ApiResponse>> => {
  return api.get("/orders", { params });
};

export const createOrder = (orderData: {
  items: Array<{
    menuItem: string;
    quantite: number;
    notes?: string;
  }>;
  numeroTable?: number;
  notes?: string;
}): Promise<AxiosResponse<ApiResponse>> => {
  return api.post("/orders", orderData);
};

export const updateOrderStatus = (
  orderId: string,
  statut: string
): Promise<AxiosResponse<ApiResponse>> => {
  return api.patch(`/orders/${orderId}/status`, { statut });
};

// Services pour le menu
export const getMenu = (params?: {
  categorie?: string;
  disponible?: boolean;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<ApiResponse>> => {
  return api.get("/menu", { params });
};

export const getMenuByCategory = (): Promise<AxiosResponse<ApiResponse>> => {
  return api.get("/menu/by-category");
};

// Services pour les statistiques
export const getDashboardStats = (): Promise<AxiosResponse<ApiResponse>> => {
  return api.get("/stats/dashboard");
};

export default api;
