import { useState, useEffect, useCallback } from "react";
import { OrderService } from "../services/orderService";
import api from "../services/api";
import {
  Order,
  CreateOrderRequest,
  OrderStats,
  KitchenOrder,
} from "../types/order";
import { logger } from "../utils/logger";

// Hook pour récupérer les commandes
export const useOrders = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Log de débogage pour tracer l'authentification
      logger.debug("🔍 [useOrders] Vérification du token");

      // Assurer qu'on a un token valide
      const token = localStorage.getItem("token");
      if (!token) {
        // Connecter automatiquement en mode dev
        const response = await api.post("/auth/login", {
          telephone: "0623456789",
          codeAcces: "MOCH5457",
        });

        if (response.status === 200) {
          localStorage.setItem("token", response.data.data.token);
          logger.debug("✅ [useOrders] Authentification automatique réussie");
        }
      }
      const result = await OrderService.getOrders();
      // S'assurer que result est un tableau
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expiré, reconnecter
        try {
          logger.debug(
            "🔄 [useOrders] Tentative de reconnexion après token expiré"
          );
          const response = await api.post("/auth/login", {
            telephone: "0623456789",
            codeAcces: "MOCH5457",
          });
          if (response.status === 200) {
            localStorage.setItem("token", response.data.data.token);
            logger.debug(
              "✅ [useOrders] Reconnexion réussie, récupération des commandes"
            );
            const result = await OrderService.getOrders();
            // S'assurer que result est un tableau
            setData(Array.isArray(result) ? result : []);
            return;
          }
        } catch (authErr) {
          logger.error("Erreur d'authentification:", authErr);
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

  const sendToCashier = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await OrderService.sendToCashier(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'envoi à la caisse"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: string, motif?: string) => {
    try {
      setLoading(true);
      setError(null);
      await OrderService.cancelOrder(id, motif);
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
    sendToCashier,
    cancelOrder,
  };
};

/**
 * Utilitaire pour harmoniser les périodes entre les différentes statistiques
 * Permet de s'assurer que les statistiques du personnel et de la caisse
 * utilisent les mêmes périodes pour une meilleure cohérence des données
 */
export const useStatsPeriodSync = () => {
  /**
   * Génère des paramètres de période cohérents pour tous les hooks de statistiques
   * @param type - Type de période à générer ('day', 'month', 'year', 'custom')
   * @param customDates - Dates personnalisées si type='custom'
   * @returns Paramètres formatés pour les hooks useRecettes et usePersonnelStats
   */
  const generatePeriodParams = (
    type: "day" | "month" | "year" | "custom" | "30days",
    customDates?: { startDate: string; endDate: string }
  ) => {
    const now = new Date();

    // Log de débogage
    logger.debug(
      `🔍 [useStatsPeriodSync] Génération paramètres pour période: ${type}`
    );

    switch (type) {
      case "day": {
        // Jour courant (aujourd'hui)
        const today = now.toISOString().split("T")[0];
        return {
          recettes: {
            mode: "single" as const,
            date: today,
          },
          personnel: {
            dateDebut: today,
            dateFin: today,
          },
        };
      }

      case "month": {
        // Mois courant (du 1er au dernier jour)
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const firstDay = `${year}-${month.toString().padStart(2, "0")}-01`;

        // Dernier jour du mois
        const lastDay = new Date(year, month, 0)
          .getDate()
          .toString()
          .padStart(2, "0");
        const lastDate = `${year}-${month
          .toString()
          .padStart(2, "0")}-${lastDay}`;

        return {
          recettes: {
            mode: "period" as const,
            startDate: firstDay,
            endDate: lastDate,
          },
          personnel: {
            dateDebut: firstDay,
            dateFin: lastDate,
          },
        };
      }

      case "year": {
        // Année courante (du 1er janvier au 31 décembre)
        const year = now.getFullYear();
        const firstDay = `${year}-01-01`;
        const lastDay = `${year}-12-31`;

        return {
          recettes: {
            mode: "period" as const,
            startDate: firstDay,
            endDate: lastDay,
          },
          personnel: {
            dateDebut: firstDay,
            dateFin: lastDay,
          },
        };
      }

      case "30days": {
        // 30 derniers jours
        const endDate = now.toISOString().split("T")[0];
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        const startDateStr = startDate.toISOString().split("T")[0];

        return {
          recettes: {
            mode: "period" as const,
            startDate: startDateStr,
            endDate: endDate,
          },
          personnel: {
            dateDebut: startDateStr,
            dateFin: endDate,
          },
        };
      }

      case "custom": {
        // Période personnalisée
        if (!customDates) {
          logger.error(
            "❌ [useStatsPeriodSync] Dates personnalisées requises pour type=custom"
          );
          return null;
        }

        return {
          recettes: {
            mode: "period" as const,
            startDate: customDates.startDate,
            endDate: customDates.endDate,
          },
          personnel: {
            dateDebut: customDates.startDate,
            dateFin: customDates.endDate,
          },
        };
      }
    }
  };

  /**
   * Analyse les données de recettes et du personnel pour identifier les incohérences
   * @param recettesData - Données des recettes provenant des différentes périodes
   * @param personnelData - Données du personnel avec leurs recettes
   * @returns Analyse des incohérences et recommandations
   */
  const analyzeDataConsistency = (
    recettesData: {
      day?: { data: any[]; total: number };
      month?: { data: any[]; total: number };
      year?: { data: any[]; total: number };
    },
    personnelData?: { detailsPersonnel?: any[] }
  ) => {
    logger.debug(
      "🔍 [useStatsPeriodSync] Analyse de cohérence des données de recettes"
    );

    // Analyse des données de recettes
    const analysis = {
      hasData: {
        day:
          Array.isArray(recettesData.day?.data) &&
          recettesData.day?.data?.length > 0,
        month:
          Array.isArray(recettesData.month?.data) &&
          recettesData.month?.data?.length > 0,
        year:
          Array.isArray(recettesData.year?.data) &&
          recettesData.year?.data?.length > 0,
        personnel:
          Array.isArray(personnelData?.detailsPersonnel) &&
          personnelData?.detailsPersonnel?.length > 0,
      },
      totals: {
        day: recettesData.day?.total || 0,
        month: recettesData.month?.total || 0,
        year: recettesData.year?.total || 0,
        personnel: personnelData?.detailsPersonnel
          ? personnelData.detailsPersonnel.reduce(
              (sum, emp) => sum + (emp.recettesTotales || 0),
              0
            )
          : 0,
      },
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Détection des problèmes
    if (
      !analysis.hasData.day &&
      !analysis.hasData.month &&
      !analysis.hasData.year
    ) {
      analysis.issues.push(
        "Aucune donnée de recettes trouvée pour toutes les périodes"
      );
      analysis.recommendations.push(
        "Vérifier que des commandes avec statut TERMINE existent en base de données"
      );
    } else {
      if (!analysis.hasData.day) {
        analysis.issues.push("Aucune donnée de recettes pour aujourd'hui");
      }
      if (!analysis.hasData.month) {
        analysis.issues.push("Aucune donnée de recettes pour le mois en cours");
      }
      if (analysis.hasData.year && !analysis.hasData.month) {
        analysis.issues.push(
          "Données disponibles pour l'année mais pas pour le mois (incohérent)"
        );
        analysis.recommendations.push(
          "Les commandes sont peut-être concentrées sur des mois antérieurs"
        );
      }
    }

    // Vérification de la cohérence entre recettes et personnel
    if (analysis.hasData.personnel) {
      const personnelTotal = analysis.totals.personnel;
      const bestRecettesTotal = Math.max(
        analysis.totals.day,
        analysis.totals.month,
        analysis.totals.year
      );

      if (personnelTotal > 0 && bestRecettesTotal === 0) {
        analysis.issues.push(
          "Recettes du personnel > 0 mais aucune recette dans les périodes standards"
        );
        analysis.recommendations.push(
          "Les périodes utilisées pour le personnel et les recettes sont probablement différentes"
        );
      }

      const discrepancy = Math.abs(personnelTotal - bestRecettesTotal);
      const discrepancyPercent =
        bestRecettesTotal > 0
          ? Math.round((discrepancy / bestRecettesTotal) * 100)
          : 100;

      if (discrepancyPercent > 10) {
        analysis.issues.push(
          `Écart de ${discrepancyPercent}% entre recettes personnel (${personnelTotal}) et recettes sections (${bestRecettesTotal})`
        );
        analysis.recommendations.push(
          "Harmoniser les périodes entre les deux sections"
        );
      }
    }

    // Affichage du diagnostic
    console.table({
      Jour: { Données: analysis.hasData.day, Total: analysis.totals.day },
      Mois: { Données: analysis.hasData.month, Total: analysis.totals.month },
      Année: { Données: analysis.hasData.year, Total: analysis.totals.year },
      Personnel: {
        Données: analysis.hasData.personnel,
        Total: analysis.totals.personnel,
      },
    });

    if (analysis.issues.length > 0) {
      console.group("⚠️ Problèmes détectés");
      analysis.issues.forEach((issue) => logger.warn(`- ${issue}`));
      console.groupEnd();
    }

    if (analysis.recommendations.length > 0) {
      console.group("💡 Recommandations");
      analysis.recommendations.forEach((rec) => console.info(`- ${rec}`));
      console.groupEnd();
    }

    return analysis;
  };

  return {
    generatePeriodParams,
    analyzeDataConsistency,
  };
};
