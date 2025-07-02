import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchOverviewStats,
  fetchSalesStats,
  fetchPaymentStats,
  OverviewStats,
  SalesDay,
  PaymentStat,
  clearCaisseCache,
} from "../services/caisseStatsService";
import { logger } from "../utils/logger";

interface CaisseStatsParams {
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
}

export function useCaisseStats(params: CaisseStatsParams) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [sales, setSales] = useState<SalesDay[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Créer les paramètres de requête de manière optimisée
  const queryParams = useMemo(() => {
    let periode = undefined;
    if (!params.startDate && !params.endDate && !params.date) {
      periode = "30days";
    }

    const sDate = params.startDate || params.date;
    const eDate = params.endDate || params.date;

    return {
      startDate: sDate || undefined,
      endDate: eDate || undefined,
      periode,
    };
  }, [params.startDate, params.endDate, params.date]);

  // Fonction pour charger toutes les données
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lancer les 3 requêtes en parallèle avec les paramètres optimisés
      const [overviewData, salesData, paymentData] = await Promise.all([
        fetchOverviewStats(),
        fetchSalesStats(queryParams),
        fetchPaymentStats(queryParams),
      ]);

      setOverview(overviewData);
      setSales(salesData);
      setPaymentStats(paymentData);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des données");
      logger.error("[useCaisseStats] Erreur:", err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  // Charger les données quand les paramètres changent
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Fonction pour forcer le rechargement sans cache
  const refetch = useCallback(() => {
    clearCaisseCache();
    loadAllData();
  }, [loadAllData]);

  // Données formatées pour l'affichage
  const formattedData = useMemo(() => {
    // Cartes de résumé
    const summaryCards = [
      {
        title:
          params.date || params.startDate || params.endDate
            ? "Recette filtrée"
            : "Recette du jour",
        value: `${overview?.today?.recettes ?? 0} XOF`,
        subtitle: `${overview?.today?.commandes ?? 0} commandes`,
        color: "text-orange-500",
      },
      {
        title: "Recette totale (toutes périodes)",
        value: `${overview?.total?.recettes ?? 0} XOF`,
        subtitle: "Depuis l'ouverture",
        color: "text-green-600",
      },
    ];

    // Recettes par jour formatées
    const recettesParJour = sales.map((row) => ({
      date: `${row._id.year}-${String(row._id.month).padStart(2, "0")}-${String(
        row._id.day
      ).padStart(2, "0")}`,
      ca: row.recettes,
      commandes: row.commandes,
    }));

    return {
      summaryCards,
      recettesParJour,
      paymentStats,
    };
  }, [overview, sales, paymentStats, params]);

  return {
    loading,
    error,
    overview,
    sales,
    paymentStats,
    formattedData,
    refetch,
  };
}
