import {
  MenuItemResponse,
  MenuByCategoryResponse,
  PaginatedMenuResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuSearchParams,
  UploadImageResponse,
} from "../types/menu";

const API_BASE_URL = "http://localhost:3000/api";

export class MenuService {
  // Upload d'image
  static async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/menu/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload de l'image");
    }

    const result = await response.json();
    return result.data;
  }

  // Créer un nouvel article de menu
  static async createMenuItem(
    data: CreateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de l'article");
    }

    const result = await response.json();
    return result.data;
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

    const response = await fetch(
      `${API_BASE_URL}/menu?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des articles");
    }

    const result = await response.json();
    return result;
  }

  // Récupérer le menu par catégorie (pour affichage public)
  static async getMenuByCategory(): Promise<MenuByCategoryResponse[]> {
    const response = await fetch(`${API_BASE_URL}/menu/by-category`);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du menu par catégorie");
    }

    const result = await response.json();
    return result.data;
  }

  // Récupérer un article par ID
  static async getMenuItemById(id: string): Promise<MenuItemResponse> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de l'article");
    }

    const result = await response.json();
    return result.data;
  }

  // Mettre à jour un article de menu
  static async updateMenuItem(
    id: string,
    data: UpdateMenuItemRequest
  ): Promise<MenuItemResponse> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour de l'article");
    }

    const result = await response.json();
    return result.data;
  }

  // Supprimer un article de menu
  static async deleteMenuItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de l'article");
    }
  }

  // Basculer la disponibilité
  static async toggleAvailability(id: string): Promise<MenuItemResponse> {
    const response = await fetch(
      `${API_BASE_URL}/menu/${id}/toggle-availability`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors du changement de disponibilité");
    }

    const result = await response.json();
    return result.data;
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

    const response = await fetch(
      `${API_BASE_URL}/menu/search?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche");
    }

    const result = await response.json();
    return result.data;
  }

  // Récupérer les statistiques du menu
  static async getMenuStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/menu/stats`);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des statistiques");
    }

    const result = await response.json();
    return result.data;
  }
}
