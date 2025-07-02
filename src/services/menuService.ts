import api from "./api";
import {
  MenuItemResponse,
  MenuByCategoryResponse,
  PaginatedMenuResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuSearchParams,
  UploadImageResponse,
} from "../types/menu";

export class MenuService {
  // Upload d'image
  static async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/menu/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data;
  }

  // Créer un nouvel article de menu
  static async createMenuItem(
    data: CreateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await api.post("/menu", data, {
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

    const response = await api.get(`/menu?${searchParams.toString()}`);

    return response.data;
  }

  // Récupérer le menu par catégorie (pour affichage public)
  static async getMenuByCategory(): Promise<MenuByCategoryResponse[]> {
    const response = await api.get("/menu/by-category");

    return response.data.data;
  }

  // Récupérer un article par ID
  static async getMenuItemById(id: string): Promise<MenuItemResponse> {
    const response = await api.get(`/menu/${id}`);

    return response.data.data;
  }

  // Mettre à jour un article de menu
  static async updateMenuItem(
    id: string,
    data: UpdateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await api.put(`/menu/${id}`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data.data;
  }

  // Supprimer un article de menu
  static async deleteMenuItem(id: string): Promise<void> {
    await api.delete(`/menu/${id}`);
  }

  // Basculer la disponibilité
  static async toggleAvailability(id: string): Promise<MenuItemResponse> {
    const response = await api.patch(`/menu/${id}/toggle-availability`);

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

    const response = await api.get(`/menu/search?${searchParams.toString()}`);

    return response.data.data;
  }

  // Récupérer les statistiques du menu
  static async getMenuStats(): Promise<any> {
    const response = await api.get("/menu/stats");

    return response.data.data;
  }
}
