import { useState, useEffect, useCallback } from "react";
import { MenuService } from "../services/menuService";
import { MenuItemResponse, PaginatedMenuResponse } from "../types/menu";
import { logger } from "../utils/logger";

interface UseMenuWithPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  categorie?: string;
  disponible?: boolean;
}

interface UseMenuWithPaginationReturn {
  menuItems: MenuItemResponse[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  refreshMenu: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setCategorie: (categorie: string) => void;
  setDisponible: (disponible: boolean | undefined) => void;
  createMenuItem: (formData: FormData) => Promise<MenuItemResponse>;
  updateMenuItem: (id: string, formData: FormData) => Promise<MenuItemResponse>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<MenuItemResponse>;
}

export const useMenuWithPagination = (
  initialParams: UseMenuWithPaginationParams = {}
): UseMenuWithPaginationReturn => {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialParams.page || 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialParams.limit || 20,
  });

  // Paramètres de recherche et filtrage
  const [params, setParams] = useState({
    page: initialParams.page || 1,
    limit: initialParams.limit || 20,
    search: initialParams.search || "",
    categorie: initialParams.categorie || "",
    disponible: initialParams.disponible,
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.debug("🔄 [USE MENU PAGINATION] Fetching menu items:", params);

      const response: PaginatedMenuResponse = await MenuService.getMenuItems({
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        categorie: params.categorie || undefined,
        disponible: params.disponible,
      });

      setMenuItems(response.data);

      // Adapter la réponse du backend au format attendu
      const backendResponse = response as any;
      if (backendResponse.pagination) {
        // Adapter la structure de pagination du backend
        setPagination({
          currentPage: backendResponse.pagination.page || params.page,
          totalPages:
            backendResponse.pagination.totalPages ||
            Math.ceil((backendResponse.pagination.total || 0) / params.limit),
          totalItems: backendResponse.pagination.total || 0, // Adapter total -> totalItems
          itemsPerPage: backendResponse.pagination.limit || params.limit,
        });
      } else {
        // Si la réponse a l'ancien format, l'adapter
        setPagination({
          currentPage: backendResponse.page || params.page,
          totalPages:
            backendResponse.totalPages ||
            Math.ceil((backendResponse.total || 0) / params.limit),
          totalItems: backendResponse.total || 0,
          itemsPerPage: backendResponse.limit || params.limit,
        });
      }

      logger.debug("✅ [USE MENU PAGINATION] Menu items fetched:", {
        itemsCount: response.data.length,
        pagination: response.pagination,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      logger.error("❌ [USE MENU PAGINATION] Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  }, [
    params.page,
    params.limit,
    params.search,
    params.categorie,
    params.disponible,
  ]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const refreshMenu = useCallback(async () => {
    await fetchMenuItems();
  }, [fetchMenuItems]);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 })); // Reset to page 1 when searching
  }, []);

  const setCategorie = useCallback((categorie: string) => {
    setParams((prev) => ({ ...prev, categorie, page: 1 })); // Reset to page 1 when filtering
  }, []);

  const setDisponible = useCallback((disponible: boolean | undefined) => {
    setParams((prev) => ({ ...prev, disponible, page: 1 })); // Reset to page 1 when filtering
  }, []);

  const createMenuItem = useCallback(
    async (formData: FormData): Promise<MenuItemResponse> => {
      try {
        // Utilise l'API directement avec FormData comme dans l'ancien hook
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          // Ne pas définir Content-Type pour FormData
        };

        const API_BASE_URL = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${API_BASE_URL}/menu`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        await refreshMenu(); // Refresh the list
        return data.data || data.menuItem || data;
      } catch (err) {
        throw err;
      }
    },
    [refreshMenu]
  );

  const updateMenuItem = useCallback(
    async (id: string, formData: FormData): Promise<MenuItemResponse> => {
      try {
        // Utilise l'API directement avec FormData comme dans l'ancien hook
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          // Ne pas définir Content-Type pour FormData
        };

        const API_BASE_URL = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
          method: "PUT",
          headers,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        await refreshMenu(); // Refresh the list
        return data.data || data.menuItem || data;
      } catch (err) {
        throw err;
      }
    },
    [refreshMenu]
  );

  const deleteMenuItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        await MenuService.deleteMenuItem(id);
        await refreshMenu(); // Refresh the list
      } catch (err) {
        throw err;
      }
    },
    [refreshMenu]
  );

  const toggleItemAvailability = useCallback(
    async (id: string): Promise<MenuItemResponse> => {
      try {
        const updatedItem = await MenuService.toggleAvailability(id);
        await refreshMenu(); // Refresh the list
        return updatedItem;
      } catch (err) {
        throw err;
      }
    },
    [refreshMenu]
  );

  return {
    menuItems,
    loading,
    error,
    pagination,
    refreshMenu,
    setPage,
    setSearch,
    setCategorie,
    setDisponible,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  };
};
