import { useState, useEffect } from "react";
import {
  AdminStatsService,
  DashboardStats,
  UserStats,
} from "../services/adminStatsService";

interface UseDashboardStatsReturn {
  dashboardStats: DashboardStats | null;
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques du dashboard et des utilisateurs en parallèle
      const [dashboardData, userData] = await Promise.all([
        AdminStatsService.getDashboardStats(),
        AdminStatsService.getUserStats(),
      ]);
      // Pas de changement ici, les nouveaux champs sont automatiquement intégrés via DashboardStats
      setDashboardStats(dashboardData);
      setUserStats(userData);
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = async () => {
    await fetchStats();
  };

  return {
    dashboardStats,
    userStats,
    loading,
    error,
    refetch,
  };
};

// Hook pour les autres statistiques spécifiques
interface UseAdminStatsReturn {
  menuStats: any;
  paymentStats: any;
  topSellingItems: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminStats = (): UseAdminStatsReturn => {
  const [menuStats, setMenuStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [topSellingItems, setTopSellingItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [menuData, paymentData, topSellingData] = await Promise.all([
        AdminStatsService.getMenuStats(),
        AdminStatsService.getPaymentStats(),
        AdminStatsService.getTopSellingItems(5),
      ]);

      setMenuStats(menuData);
      setPaymentStats(paymentData);
      setTopSellingItems(topSellingData);
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des statistiques détaillées:",
        err
      );
      setError("Erreur lors du chargement des statistiques détaillées");
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchStats();
  };

  return {
    menuStats,
    paymentStats,
    topSellingItems,
    loading,
    error,
    refetch,
  };
};
