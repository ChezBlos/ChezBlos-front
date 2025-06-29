import axios from "axios";
import {
  MenuItemResponse,
  MenuByCategoryResponse,
  PaginatedMenuResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuSearchParams,
  UploadImageResponse,
} from "../types/menu";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export class MenuService {
  // Upload d'image
  static async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${API_BASE_URL}/menu/upload-image`,
      formData
    );

    return response.data.data;
  }

  // Créer un nouvel article de menu
  static async createMenuItem(
    data: CreateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await axios.post(`${API_BASE_URL}/menu`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.data;
  }

  // Récupérer tous les articles du menu avec pagination
  static async getMenuItems(
    params: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      categorie?: string;
      disponible?: boolean;
      search?: string;
    } = {}
  ): Promise<PaginatedMenuResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/menu?${searchParams.toString()}`
    );

    return response.data;
  }

  // Récupérer le menu par catégorie (pour affichage public)
  static async getMenuByCategory(): Promise<MenuByCategoryResponse[]> {
    const response = await axios.get(`${API_BASE_URL}/menu/by-category`);

    return response.data.data;
  }

  // Récupérer un article par ID
  static async getMenuItemById(id: string): Promise<MenuItemResponse> {
    const response = await axios.get(`${API_BASE_URL}/menu/${id}`);

    return response.data.data;
  }

  // Mettre à jour un article de menu
  static async updateMenuItem(
    id: string,
    data: UpdateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await axios.put(`${API_BASE_URL}/menu/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.data;
  }

  // Supprimer un article de menu
  static async deleteMenuItem(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/menu/${id}`);
  }

  // Basculer la disponibilité
  static async toggleAvailability(id: string): Promise<MenuItemResponse> {
    const response = await axios.patch(
      `${API_BASE_URL}/menu/${id}/toggle-availability`
    );

    return response.data.data;
  }

  // Recherche avancée
  static async searchMenu(
    params: MenuSearchParams
  ): Promise<MenuItemResponse[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `${API_BASE_URL}/menu/search?${searchParams.toString()}`
    );

    return response.data.data;
  }

  // Récupérer les statistiques du menu
  static async getMenuStats(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/menu/stats`);

    return response.data.data;
  }
}
