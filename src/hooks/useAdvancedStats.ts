import { useState, useEffect, useCallback } from "react";
import {
  AdvancedStatsService,
  AdvancedDashboardStats,
  SalesStats,
  TopSellingItem,
  ServerPerformance,
  PaymentMethodStats,
  PreparationTimeStats,
  ComparisonData,
  GeneralStats,
  StockStats,
  StockAlert,
  StockItem,
  StockMovement,
  ExpenseStats,
  PersonnelStatsResponse,
} from "../services/advancedStatsService";
import type { PeriodSelection } from "../services/advancedStatsService";
import { logger } from "../utils/logger";

// Système de limitation des appels API pour éviter le spam
class ApiLimiter {
  private requests: Map<string, number> = new Map();
  private readonly maxRequestsPerMinute = 10;
  private readonly windowMs = 60000; // 1 minute

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / this.windowMs)}`;
    const currentCount = this.requests.get(key) || 0;

    if (currentCount >= this.maxRequestsPerMinute) {
      logger.warn(
        `Limite d'API atteinte pour ${endpoint}. Veuillez patienter.`
      );
      return false;
    }

    this.requests.set(key, currentCount + 1);
    // Nettoyer les anciennes entrées
    this.cleanup();
    return true;
  }

  private cleanup() {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.windowMs);

    for (const [key] of this.requests) {
      const keyWindow = parseInt(key.split("_").pop() || "0");
      if (keyWindow < currentWindow - 1) {
        this.requests.delete(key);
      }
    }
  }
}

const apiLimiter = new ApiLimiter();

// Hook pour les statistiques dashboard avancées
export const useAdvancedDashboardStats = () => {
  const [data, setData] = useState<AdvancedDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("dashboard-stats")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getDashboardStats();
      setData(stats);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des statistiques:", err);
      if (err.response?.status === 429) {
        setError(
          "Trop de requêtes simultanées. Veuillez patienter et actualiser la page."
        );
      } else {
        setError("Erreur lors du chargement des statistiques");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Délai pour éviter le spam d'appels simultanés
    const timeout = setTimeout(() => {
      fetchStats();
    }, 100);

    return () => clearTimeout(timeout);
  }, []); // Pas de dépendance fetchStats pour éviter la boucle infinie

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook pour les statistiques de ventes
export const useSalesStats = (period: string = "30days") => {
  const [data, setData] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getSalesStats(period);
      setData(stats);
    } catch (err) {
      logger.error("Erreur lors de la récupération des stats de ventes:", err);
      setError("Erreur lors du chargement des statistiques de ventes");
    } finally {
      setLoading(false);
    }
  }, [period]);

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

// Hook pour le top des plats vendus
export const useTopSellingItems = (limit: number = 10) => {
  const [data, setData] = useState<TopSellingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getTopSellingItems(limit);
      setData(stats);
    } catch (err) {
      logger.error("Erreur lors de la récupération du top des plats:", err);
      setError("Erreur lors du chargement du top des plats");
    } finally {
      setLoading(false);
    }
  }, [limit]);

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

// Hook pour les performances des serveurs
export const useServerPerformance = () => {
  const [data, setData] = useState<ServerPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getServerStats();
      setData(stats);
    } catch (err) {
      logger.error("Erreur lors de la récupération des stats serveurs:", err);
      setError("Erreur lors du chargement des performances des serveurs");
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

// Hook pour les statistiques des modes de paiement
export const usePaymentMethodStats = () => {
  const [data, setData] = useState<PaymentMethodStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getPaymentMethodStats();
      setData(stats);
    } catch (err) {
      logger.error("Erreur lors de la récupération des stats paiements:", err);
      setError("Erreur lors du chargement des statistiques de paiement");
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

// Hook pour les temps de préparation
export const usePreparationTimeStats = () => {
  const [data, setData] = useState<PreparationTimeStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getPreparationTimeStats();
      setData(stats);
    } catch (err) {
      logger.error(
        "Erreur lors de la récupération des temps de préparation:",
        err
      );
      setError("Erreur lors du chargement des temps de préparation");
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

// Hook pour la comparaison de périodes
export const useComparisonStats = (
  period1: PeriodSelection | null,
  period2: PeriodSelection | null
) => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!period1 || !period2) return;
    // Validation : il faut que chaque période soit bien renseignée
    if (
      (period1.mode === "quick" && !period1.value) ||
      (period1.mode === "date" && !period1.value) ||
      (period1.mode === "range" &&
        (!(period1.value as any).startDate ||
          !(period1.value as any).endDate)) ||
      (period2.mode === "quick" && !period2.value) ||
      (period2.mode === "date" && !period2.value) ||
      (period2.mode === "range" &&
        (!(period2.value as any).startDate || !(period2.value as any).endDate))
    ) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getComparisonStats(
        period1,
        period2
      );
      setData(stats);
    } catch (err) {
      logger.error("Erreur lors de la comparaison des périodes:", err);
      setError("Erreur lors du chargement de la comparaison");
    } finally {
      setLoading(false);
    }
  }, [period1, period2]);

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

// Hook pour les statistiques générales
export const useGeneralStats = () => {
  const [data, setData] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("general-stats")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getGeneralStats();
      setData(stats);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des stats générales:", err);
      if (err.response?.status === 429) {
        setError(
          "Trop de requêtes simultanées. Veuillez patienter et actualiser la page."
        );
      } else {
        setError("Erreur lors du chargement des statistiques générales");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Délai plus long pour éviter la collision avec les autres hooks
    const timeout = setTimeout(() => {
      fetchStats();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchStats]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook pour exporter les données
export const useExportStats = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (format: "excel" | "pdf" = "excel") => {
    try {
      setLoading(true);
      setError(null);
      await AdvancedStatsService.exportData(format);
    } catch (err) {
      logger.error("Erreur lors de l'export:", err);
      setError("Erreur lors de l'export des données");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportData,
    loading,
    error,
  };
};

// NOUVEAUX HOOKS POUR STOCK & DÉPENSES

// Hook pour les statistiques du stock
export const useStockStats = () => {
  const [data, setData] = useState<StockStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("stock-stats")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getStockStats();
      setData(stats);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des stats stock:", err);
      setError("Erreur lors du chargement des statistiques stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStats();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

// Hook pour les alertes de stock
export const useStockAlerts = () => {
  const [data, setData] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("stock-alerts")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const alerts = await AdvancedStatsService.getStockAlerts();
      setData(alerts);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des alertes stock:", err);
      setError("Erreur lors du chargement des alertes stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAlerts();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchAlerts]);

  return { data, loading, error, refetch: fetchAlerts };
};

// Hook pour les articles de stock
export const useStockItems = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("stock-items")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await AdvancedStatsService.getStockItems();
      setData(items);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des articles stock:", err);
      setError("Erreur lors du chargement des articles stock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchItems();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchItems]);

  return { data, loading, error, refetch: fetchItems };
};

// Hook pour les mouvements de stock
export const useStockMovements = (limit = 10) => {
  const [data, setData] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("stock-movements")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const movements = await AdvancedStatsService.getStockMovements(limit);
      setData(movements);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des mouvements stock:", err);
      setError("Erreur lors du chargement des mouvements stock");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMovements();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchMovements]);

  return { data, loading, error, refetch: fetchMovements };
};

// Hook pour les statistiques des dépenses
export const useExpenseStats = (period = "30days") => {
  const [data, setData] = useState<ExpenseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("expense-stats")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getExpenseStats(period);
      setData(stats);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des stats dépenses:", err);
      setError("Erreur lors du chargement des statistiques dépenses");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStats();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};

// Hook pour les statistiques détaillées du personnel avec polling automatique
export const usePersonnelStats = (
  dateDebut?: string,
  dateFin?: string,
  enablePolling: boolean = true,
  pollingInterval: number = 60000 // 1 minute par défaut
) => {
  const [data, setData] = useState<PersonnelStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = useCallback(
    async (bypassLimiter: boolean = false) => {
      // Bypass du limiter pour les refreshs manuels
      if (!bypassLimiter && !apiLimiter.canMakeRequest("personnel-stats")) {
        logger.warn("Limite d'API atteinte pour personnel-stats");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const stats = await AdvancedStatsService.getPersonnelStats(
          dateDebut,
          dateFin
        );

        // Log simple pour confirmer la récupération des données
        const statsAny = stats as any;
        const employeeCount =
          statsAny?.data?.data?.detailsPersonnel?.length || 0;
        logger.debug(`📊 Personnel stats: ${employeeCount} employés récupérés`);

        setData(stats);
        setLastUpdate(new Date());
      } catch (err: any) {
        logger.error(
          "Erreur lors de la récupération des stats personnel:",
          err
        );
        logger.error("Détails erreur:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });

        if (err.response?.status === 429) {
          setError(
            "Trop de requêtes simultanées. Veuillez patienter et actualiser la page."
          );
        } else if (err.response?.status === 401) {
          setError("Accès non autorisé. Veuillez vous reconnecter.");
        } else if (err.response?.status === 404) {
          setError(
            "API personnel non trouvée. Vérifiez la configuration du serveur."
          );
        } else {
          setError(
            `Erreur lors du chargement des statistiques du personnel: ${err.message}`
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [dateDebut, dateFin]
  );

  // Fonction de refresh manuel qui bypass le limiter
  const manualRefetch = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    // Premier chargement
    const timeout = setTimeout(() => {
      fetchStats();
    }, 100);
    return () => clearTimeout(timeout);
  }, [fetchStats]);

  useEffect(() => {
    if (!enablePolling) return;

    // Polling automatique
    const interval = setInterval(() => {
      // Ne pas faire de polling si on est dans l'onglet en arrière-plan
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchStats, enablePolling, pollingInterval]);

  // Écouter les changements de visibilité pour refresh quand on revient sur l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enablePolling) {
        // Attendre un peu avant de refetch pour éviter le spam
        setTimeout(() => fetchStats(), 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchStats, enablePolling]);

  return {
    data,
    loading,
    error,
    refetch: manualRefetch,
    lastUpdate,
    isPolling: enablePolling,
  };
};

// Nouveaux hooks pour les APIs avancées

// Hook pour les métriques en temps réel
export const useRealTimeMetrics = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await AdvancedStatsService.getRealTimeMetrics();
      setData(metrics);
    } catch (err: any) {
      logger.error(
        "Erreur lors de la récupération des métriques temps réel:",
        err
      );
      setError("Erreur lors du chargement des métriques temps réel");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 10000); // Refresh toutes les 10 secondes
      return () => clearInterval(interval);
    }
  }, [fetchMetrics, autoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
};

// Hook pour les statistiques avancées avec filtres
export const useAdvancedStatsWithFilters = (
  filters: {
    periode?: string;
    groupBy?: "hour" | "day" | "week" | "month";
  } = {}
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getAdvancedStats(filters);
      setData(stats);
    } catch (err: any) {
      logger.error("Erreur lors de la récupération des stats avancées:", err);
      setError("Erreur lors du chargement des statistiques avancées");
    } finally {
      setLoading(false);
    }
  }, [filters]);

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

// Hook pour vider le cache des statistiques
export const useClearStatsCache = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await AdvancedStatsService.clearStatsCache();
    } catch (err: any) {
      logger.error("Erreur lors de la suppression du cache:", err);
      setError("Erreur lors de la suppression du cache");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    clearCache,
    loading,
    error,
  };
};

// Hook pour les statistiques de la semaine calendaire
export const useCurrentWeekStats = () => {
  const [data, setData] = useState<{
    commandes: number;
    recettes: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!apiLimiter.canMakeRequest("week-stats")) {
      setError("Trop de requêtes. Veuillez patienter quelques instants.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await AdvancedStatsService.getCurrentWeekStats();
      setData(stats);
    } catch (err: any) {
      logger.error(
        "Erreur lors de la récupération des statistiques de la semaine:",
        err
      );
      setError("Erreur lors du chargement des statistiques de la semaine");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
};
