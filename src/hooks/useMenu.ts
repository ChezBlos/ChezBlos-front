import { useState, useEffect } from "react";
import axios from "axios";
import { MenuItemResponse } from "../types/menu";
import { logger } from "../utils/logger";

interface UseMenuReturn {
  menuItems: MenuItemResponse[];
  loading: boolean;
  error: string | null;
  refreshMenu: () => Promise<void>;
  createMenuItem: (formData: FormData) => Promise<MenuItemResponse>;
  updateMenuItem: (id: string, formData: FormData) => Promise<MenuItemResponse>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<MenuItemResponse>;
}

export const useMenu = (): UseMenuReturn => {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getAuthHeaders = (isFormData = false) => {
    const token = localStorage.getItem("token");
    
    logger.debug("🔑 [USE MENU] Auth headers:", {
      hasToken: !!token,
      tokenLength: token?.length,
      isFormData
    });
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };
  // Utiliser la variable d'environnement pour l'URL de base de l'API
  const API_BASE_URL = import.meta.env.VITE_API_URL || "";
  
  // Log de debug pour vérifier la configuration
  logger.debug("🌐 [USE MENU] Configuration API:", {
    API_BASE_URL,
    envViteApiUrl: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE
  });
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/menu`, { headers });

      const contentType =
        response.headers["content-type"] || response.headers["Content-Type"];
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Réponse inattendue du serveur (pas de JSON). Vérifiez que l'API backend fonctionne correctement."
        );
      }

      const data = response.data;
      const menuItems = data.data || data.menuItems || [];
      setMenuItems(menuItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const refreshMenu = async () => {
    await fetchMenuItems();
  };
  const createMenuItem = async (
    formData: FormData
  ): Promise<MenuItemResponse> => {
    try {
      const headers = getAuthHeaders(true); // true pour FormData
      const response = await axios.post(`${API_BASE_URL}/menu`, formData, {
        headers,
      });
      const data = response.data;
      return data.data || data.menuItem || data;
    } catch (err) {
      throw err;
    }
  };
  const updateMenuItem = async (
    id: string,
    formData: FormData
  ): Promise<MenuItemResponse> => {
    try {
      const headers = getAuthHeaders(true); // true pour FormData
      const response = await axios.put(`${API_BASE_URL}/menu/${id}`, formData, {
        headers,
      });
      const data = response.data;
      return data.data || data.menuItem || data;
    } catch (err) {
      throw err;
    }
  };
  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/menu/${id}`, { headers });
    } catch (err) {
      throw err;
    }
  };
  const toggleItemAvailability = async (
    id: string
  ): Promise<MenuItemResponse> => {
    try {
      const headers = getAuthHeaders();
      
      logger.debug("🔄 [USE MENU] Toggle availability pour ID:", {
        id,
        idType: typeof id,
        idLength: id?.length,
        url: `${API_BASE_URL}/menu/${id}/toggle-availability`,
        headers: {
          ...headers,
          Authorization: headers.Authorization ? "[TOKEN PRESENT]" : "[TOKEN MISSING]"
        }
      });
      
      const response = await axios.patch(
        `${API_BASE_URL}/menu/${id}/toggle-availability`,
        {}, // Objet vide au lieu de null
        { headers }
      );
      const data = response.data;
      
      logger.debug("✅ [USE MENU] Toggle availability succès:", data);
      
      return data.data || data.menuItem || data;
    } catch (err) {
      logger.error("❌ [USE MENU] Erreur toggle availability:", {
        id,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        status: err instanceof Error && 'response' in err ? (err as any).response?.status : undefined,
        responseData: err instanceof Error && 'response' in err ? (err as any).response?.data : undefined,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    error,
    refreshMenu,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  };
};
