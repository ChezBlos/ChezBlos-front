import { useState, useEffect, useCallback } from "react";
import { OrderService } from "../services/orderService";
import axios from "axios";
import {
  Order,
  CreateOrderRequest,
  OrderStats,
  KitchenOrder,
} from "../types/order";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Hook pour récupérer les commandes
export const useOrders = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Assurer qu'on a un token valide
      const token = localStorage.getItem("token");
      if (!token) {
        // Connecter automatiquement en mode dev
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          telephone: "0623456789",
          codeAcces: "MOCH5457",
        });

        if (response.status === 200) {
          localStorage.setItem("token", response.data.data.token);
        }
      }
      const result = await OrderService.getOrders();
      // S'assurer que result est un tableau
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Token expiré, reconnecter
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            telephone: "0623456789",
            codeAcces: "MOCH5457",
          });
          if (response.status === 200) {
            localStorage.setItem("token", response.data.data.token);
            const result = await OrderService.getOrders();
            // S'assurer que result est un tableau
            setData(Array.isArray(result) ? result : []);
            return;
          }
        } catch (authErr) {
          console.error("Erreur d'authentification:", authErr);
        }

        setData([]);
        setError("Non authentifié");
      } else {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    data,
    loading,
    error,
    refetch: fetchOrders,
  };
};

// Hook pour les statistiques des commandes
export const useOrderStats = () => {
  const [data, setData] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await OrderService.getOrderStats();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook pour les commandes de cuisine
export const useKitchenOrders = () => {
  const [data, setData] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await OrderService.getKitchenOrders();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKitchenOrders();
  }, [fetchKitchenOrders]);

  return {
    data,
    loading,
    error,
    refetch: fetchKitchenOrders,
  };
};

// Hook pour récupérer une commande par ID
export const useOrder = (id: string | null) => {
  const [data, setData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await OrderService.getOrderById(orderId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id, fetchOrder]);

  return {
    data,
    loading,
    error,
    refetch: () => id && fetchOrder(id),
  };
};

// Hook pour les actions sur les commandes
export const useOrderActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (data: CreateOrderRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.createOrder(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, data: Partial<CreateOrderRequest>) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.updateOrder(id, data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendToKitchen = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.sendToKitchen(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'envoi en cuisine"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startCooking = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.startCooking(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du démarrage de la préparation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const finishCooking = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.finishCooking(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la finalisation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await OrderService.cancelOrder(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'annulation"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOrder,
    updateOrder,
    sendToKitchen,
    startCooking,
    finishCooking,
    cancelOrder,
  };
};
