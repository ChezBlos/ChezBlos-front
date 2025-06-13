import { useState, useEffect } from "react";
import { MenuService } from "../services/menuService";
import {
  MenuItemResponse,
  MenuByCategoryResponse,
  PaginatedMenuResponse,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
} from "../types/menu";

export const useMenuItems = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categorie?: string;
  disponible?: boolean;
  search?: string;
}) => {
  const [data, setData] = useState<PaginatedMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await MenuService.getMenuItems(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};

export const useMenuByCategory = () => {
  const [data, setData] = useState<MenuByCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuByCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await MenuService.getMenuByCategory();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuByCategory();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchMenuByCategory,
  };
};

export const useMenuItem = (id: string | null) => {
  const [data, setData] = useState<MenuItemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await MenuService.getMenuItemById(itemId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMenuItem(id);
    }
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: () => id && fetchMenuItem(id),
  };
};

export const useMenuActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      return await MenuService.uploadImage(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMenuItem = async (data: CreateMenuItemRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await MenuService.createMenuItem(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id: string, data: UpdateMenuItemRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await MenuService.updateMenuItem(id, data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await MenuService.deleteMenuItem(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await MenuService.toggleAvailability(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du changement de disponibilité"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadImage,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  };
};
