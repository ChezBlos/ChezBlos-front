import { useState, useEffect } from "react";
import axios from "axios";
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
  // Utiliser la variable d'environnement pour l'URL de base de l'API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const fetchMenuItems = async () => {
    try {
      console.log("🔄 [FRONTEND] Début du chargement du menu");
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      console.log("🔑 [FRONTEND] Headers de la requête:", headers);

      const response = await axios.get(`${API_BASE_URL}/api/menu`, {
        headers,
      });

      console.log("📡 [FRONTEND] Réponse reçue:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200,
        contentType: response.headers["content-type"],
      });

      // Vérifier le content-type avant de parser en JSON
      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        console.log("❌ [FRONTEND] Type de contenu inattendu:", contentType);
        throw new Error(
          "Réponse inattendue du serveur (pas de JSON). Vérifiez que l'API backend fonctionne correctement."
        );
      }

      const data = response.data;
      console.log("📦 [FRONTEND] Données reçues:", data);
      console.log("📊 [FRONTEND] Structure des données:", {
        hasData: !!data.data,
        hasMenuItems: !!data.menuItems,
        dataLength: data.data?.length || 0,
        menuItemsLength: data.menuItems?.length || 0,
        keys: Object.keys(data),
      });

      // Adapter selon la structure de réponse (pagination ou liste simple)
      const menuItems = data.data || data.menuItems || [];
      console.log("✅ [FRONTEND] Menu items à définir:", menuItems.length);

      setMenuItems(menuItems);
    } catch (err) {
      console.error("❌ [FRONTEND] Erreur lors du chargement du menu:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      console.log("🏁 [FRONTEND] Fin du chargement du menu");
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
      console.log("➕ [FRONTEND] Début de la création d'un article");
      console.log("📤 [FRONTEND] FormData à envoyer:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File(${value.name})` : value
        );
      }
      const headers = getAuthHeaders(true); // true pour FormData
      console.log("🔑 [FRONTEND] Headers pour création:", headers);

      const response = await axios.post(`${API_BASE_URL}/api/menu`, formData, {
        headers,
      });

      console.log("📡 [FRONTEND] Réponse création reçue:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200,
      });
      if (response.status !== 200) {
        const errorData = response.data || {
          message: "Erreur de communication avec le serveur",
        };
        console.log("❌ [FRONTEND] Erreur création:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        // Message d'erreur plus spécifique
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Erreur ${response.status}: ${response.statusText}`;

        throw new Error(errorMessage);
      }

      const data = response.data;
      console.log("✅ [FRONTEND] Article créé:", data);

      // Adapter selon la structure de réponse
      return data.data || data.menuItem || data;
    } catch (err) {
      console.error(
        "❌ [FRONTEND] Erreur lors de la création de l'article:",
        err
      );
      throw err;
    }
  };
  const updateMenuItem = async (
    id: string,
    formData: FormData
  ): Promise<MenuItemResponse> => {
    try {
      console.log("✏️ [FRONTEND] Début de la mise à jour de l'article:", id);
      console.log("📤 [FRONTEND] FormData à envoyer:");
      for (const [key, value] of formData.entries()) {
        console.log(
          `  ${key}:`,
          value instanceof File ? `File(${value.name})` : value
        );
      }
      const headers = getAuthHeaders(true); // true pour FormData
      console.log("🔑 [FRONTEND] Headers pour mise à jour:", headers);

      const response = await axios.put(
        `${API_BASE_URL}/api/menu/${id}`,
        formData,
        {
          headers,
        }
      );

      console.log("📡 [FRONTEND] Réponse mise à jour reçue:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200,
      });

      if (response.status !== 200) {
        const errorData = response.data;
        console.log("❌ [FRONTEND] Erreur mise à jour:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de la modification de l'article"
        );
      }

      const data = response.data;
      console.log("✅ [FRONTEND] Article mis à jour:", data);

      // Adapter selon la structure de réponse
      return data.data || data.menuItem || data;
    } catch (err) {
      console.error(
        "❌ [FRONTEND] Erreur lors de la modification de l'article:",
        err
      );
      throw err;
    }
  };
  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      console.log("🗑️ [FRONTEND] Début de la suppression de l'article:", id);

      const headers = getAuthHeaders();
      console.log("🔑 [FRONTEND] Headers pour suppression:", headers);

      const response = await axios.delete(`${API_BASE_URL}/api/menu/${id}`, {
        headers,
      });

      console.log("📡 [FRONTEND] Réponse suppression reçue:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200,
      });

      if (response.status !== 200) {
        const errorData = response.data;
        console.log("❌ [FRONTEND] Erreur suppression:", errorData);
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'article"
        );
      }

      console.log("✅ [FRONTEND] Article supprimé avec succès:", id);
    } catch (err) {
      console.error(
        "❌ [FRONTEND] Erreur lors de la suppression de l'article:",
        err
      );
      throw err;
    }
  };
  const toggleItemAvailability = async (
    id: string
  ): Promise<MenuItemResponse> => {
    try {
      console.log("🔄 [FRONTEND] Début du changement de disponibilité:", id);

      const headers = getAuthHeaders();
      console.log("🔑 [FRONTEND] Headers pour toggle:", headers);

      const response = await axios.patch(
        `${API_BASE_URL}/api/menu/${id}/toggle-availability`,
        null,
        {
          headers,
        }
      );

      console.log("📡 [FRONTEND] Réponse toggle reçue:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.status === 200,
      });

      if (response.status !== 200) {
        const errorData = response.data;
        console.log("❌ [FRONTEND] Erreur toggle:", errorData);
        throw new Error(
          errorData.message ||
            "Erreur lors de la modification de la disponibilité"
        );
      }

      const data = response.data;
      console.log("✅ [FRONTEND] Disponibilité changée:", data);

      // Adapter selon la structure de réponse
      return data.data || data.menuItem || data;
    } catch (err) {
      console.error(
        "❌ [FRONTEND] Erreur lors de la modification de la disponibilité:",
        err
      );
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
