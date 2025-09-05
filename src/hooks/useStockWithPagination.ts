import { useState, useCallback, useEffect } from "react";
import {
  StockService,
  StockItem,
  PaginatedStockResponse,
  StockSearchParams,
} from "../services/stockService";
import { logger } from "../utils/logger";

interface UseStockWithPaginationParams extends StockSearchParams {}

interface UseStockWithPaginationReturn {
  stockItems: StockItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  refreshStock: () => Promise<void>;
  setPage: (page: number) => void;
  setUnite: (unite: string) => void;
  setAlerte: (alerte: boolean | undefined) => void;
  setPerime: (perime: boolean | undefined) => void;
  createStockItem: (data: any) => Promise<StockItem>;
  updateStockItem: (id: string, data: any) => Promise<StockItem>;
  deleteStockItem: (id: string) => Promise<void>;
  adjustStock: (id: string, adjustment: any) => Promise<StockItem>;
}

export const useStockWithPagination = (
  initialParams: UseStockWithPaginationParams = {}
): UseStockWithPaginationReturn => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
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
    unite: initialParams.unite || "",
    alerte: initialParams.alerte,
    perime: initialParams.perime,
  });

  const fetchStockItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.debug("🔄 [USE STOCK PAGINATION] Fetching stock items:", params);

      const response: PaginatedStockResponse =
        await StockService.getStockItemsPaginated({
          page: params.page,
          limit: params.limit,
          unite: params.unite || undefined,
          alerte: params.alerte,
          perime: params.perime,
        });

      setStockItems(response.stockItems);
      setPagination(response.pagination);

      logger.debug("✅ [USE STOCK PAGINATION] Stock items fetched:", {
        itemsCount: response.stockItems.length,
        pagination: response.pagination,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      logger.error(
        "❌ [USE STOCK PAGINATION] Error fetching stock items:",
        err
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStockItems();
  }, [fetchStockItems]);

  // Fonctions de navigation et filtrage
  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const setUnite = useCallback((unite: string) => {
    setParams((prev) => ({ ...prev, unite, page: 1 })); // Reset à la page 1
  }, []);

  const setAlerte = useCallback((alerte: boolean | undefined) => {
    setParams((prev) => ({ ...prev, alerte, page: 1 })); // Reset à la page 1
  }, []);

  const setPerime = useCallback((perime: boolean | undefined) => {
    setParams((prev) => ({ ...prev, perime, page: 1 })); // Reset à la page 1
  }, []);

  const refreshStock = useCallback(async () => {
    await fetchStockItems();
  }, [fetchStockItems]);

  // Fonctions CRUD
  const createStockItem = useCallback(
    async (data: any): Promise<StockItem> => {
      try {
        const newItem = await StockService.createStockItem(data);
        await refreshStock(); // Rafraîchir la liste
        return newItem;
      } catch (error) {
        throw error;
      }
    },
    [refreshStock]
  );

  const updateStockItem = useCallback(
    async (id: string, data: any): Promise<StockItem> => {
      try {
        const updatedItem = await StockService.updateStockItem(id, data);
        await refreshStock(); // Rafraîchir la liste
        return updatedItem;
      } catch (error) {
        throw error;
      }
    },
    [refreshStock]
  );

  const deleteStockItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        await StockService.deleteStockItem(id);
        await refreshStock(); // Rafraîchir la liste
      } catch (error) {
        throw error;
      }
    },
    [refreshStock]
  );

  const adjustStock = useCallback(
    async (id: string, adjustment: any): Promise<StockItem> => {
      try {
        const adjustedItem = await StockService.adjustStock(id, adjustment);
        await refreshStock(); // Rafraîchir la liste
        return adjustedItem;
      } catch (error) {
        throw error;
      }
    },
    [refreshStock]
  );

  return {
    stockItems,
    loading,
    error,
    pagination,
    refreshStock,
    setPage,
    setUnite,
    setAlerte,
    setPerime,
    createStockItem,
    updateStockItem,
    deleteStockItem,
    adjustStock,
  };
};
