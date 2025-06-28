import { useState, useEffect } from "react";
import { MenuItemResponse } from "../types/menu";

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
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      const response = await fetch("/api/menu", {
        headers,
      });

      if (!response.ok) {
        // Vérifier si c'est une erreur d'authentification
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        if (response.status === 404) {
          throw new Error(
            "Endpoint menu non trouvé. Vérifiez que le serveur backend est démarré."
          );
        }
        if (response.status === 500) {
          throw new Error(
            "Erreur serveur. Vérifiez les logs du serveur backend."
          );
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      // Vérifier le content-type avant de parser en JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Réponse inattendue du serveur (pas de JSON). Vérifiez que l'API backend fonctionne correctement."
        );
      }

      const data = await response.json();

      // Adapter selon la structure de réponse (pagination ou liste simple)
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

      const response = await fetch("/api/menu", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Erreur de communication avec le serveur",
        }));

        // Message d'erreur plus spécifique
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Erreur ${response.status}: ${response.statusText}`;

        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Adapter selon la structure de réponse
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

      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la modification de l'article"
        );
      }

      const data = await response.json();

      // Adapter selon la structure de réponse
      return data.data || data.menuItem || data;
    } catch (err) {
      throw err;
    }
  };
  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'article"
        );
      }
    } catch (err) {
      throw err;
    }
  };
  const toggleItemAvailability = async (
    id: string
  ): Promise<MenuItemResponse> => {
    try {
      const headers = getAuthHeaders();

      const response = await fetch(`/api/menu/${id}/toggle-availability`, {
        method: "PATCH",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Erreur lors de la modification de la disponibilité"
        );
      }

      const data = await response.json();

      // Adapter selon la structure de réponse
      return data.data || data.menuItem || data;
    } catch (err) {
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
