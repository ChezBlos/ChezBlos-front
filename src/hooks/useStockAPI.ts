import { useState, useEffect } from "react";
import {
  StockService,
  StockItem,
  StockStats,
  StockAdjustment,
} from "../services/stockService";

// Hook pour récupérer les articles de stock
export const useStockItems = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await StockService.getStockItems();
      setData(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);

  const refetch = () => {
    fetchStockItems();
  };

  return { data, loading, error, refetch };
};

// Hook pour récupérer les statistiques de stock
export const useStockStats = () => {
  const [data, setData] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await StockService.getStockStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockStats();
  }, []);

  const refetch = () => {
    fetchStockStats();
  };

  return { data, loading, error, refetch };
};

// Hook pour récupérer les alertes de stock
export const useStockAlerts = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const alerts = await StockService.getStockAlerts();
      setData(alerts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const refetch = () => {
    fetchStockAlerts();
  };

  return { data, loading, error, refetch };
};

// Hook pour ajuster le stock
export const useStockAdjustment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adjustStock = async (
    id: string,
    adjustment: StockAdjustment
  ): Promise<StockItem> => {
    try {
      setLoading(true);
      setError(null);
      const result = await StockService.adjustStock(id, adjustment);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { adjustStock, loading, error };
};
