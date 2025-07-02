import { useState, useEffect } from "react";
import { useStatsPeriodSync } from "../hooks/useOrderAPI";
import { useRecettes } from "../hooks/useRecettes";
import { usePersonnelStats } from "../hooks/useAdvancedStats";
import { logger } from "../utils/logger";

/**
 * Exemple d'utilisation de l'utilitaire de synchronisation de périodes
 * Ce hook permet de résoudre les incohérences entre les recettes affichées
 * dans différentes sections de l'application
 */
export const useSynchronizedStats = (
  defaultPeriodType: "day" | "month" | "year" | "30days" = "30days"
) => {
  // État pour stocker le type de période sélectionné
  const [periodType, setPeriodType] = useState(defaultPeriodType);

  // État pour stocker les paramètres de période générés
  const [periodParams, setPeriodParams] = useState<any>(null);

  // Utilitaire de synchronisation
  const { generatePeriodParams, analyzeDataConsistency } = useStatsPeriodSync();

  // Générer les paramètres de période au changement de type
  useEffect(() => {
    const params = generatePeriodParams(periodType);
    setPeriodParams(params);

    // Log pour débogage
    logger.debug(
      `📅 [useSynchronizedStats] Période ${periodType} sélectionnée:`,
      params
    );
  }, [periodType, generatePeriodParams]);

  // Charger les statistiques avec les périodes synchronisées
  const { data: dayRecettes, loading: loadingDayRecettes } = useRecettes(
    periodParams?.recettes.mode === "single"
      ? periodParams?.recettes
      : { mode: "single", date: new Date().toISOString().split("T")[0] }
  );

  const { data: monthRecettes, loading: loadingMonthRecettes } = useRecettes(
    periodType === "month" && periodParams?.recettes.mode === "period"
      ? periodParams?.recettes
      : generatePeriodParams("month")?.recettes
  );

  const { data: yearRecettes, loading: loadingYearRecettes } = useRecettes(
    periodType === "year" && periodParams?.recettes.mode === "period"
      ? periodParams?.recettes
      : generatePeriodParams("year")?.recettes
  );

  const { data: personnelStats, loading: loadingPersonnelStats } =
    usePersonnelStats(
      periodParams?.personnel.dateDebut,
      periodParams?.personnel.dateFin
    );

  // Calculer les totaux pour chaque période
  const dayTotal = dayRecettes.reduce(
    (sum, day) => sum + (day.recettes || 0),
    0
  );
  const monthTotal = monthRecettes.reduce(
    (sum, day) => sum + (day.recettes || 0),
    0
  );
  const yearTotal = yearRecettes.reduce(
    (sum, day) => sum + (day.recettes || 0),
    0
  );

  // Analyser la cohérence des données une fois qu'elles sont toutes chargées
  useEffect(() => {
    if (
      !loadingDayRecettes &&
      !loadingMonthRecettes &&
      !loadingYearRecettes &&
      !loadingPersonnelStats
    ) {
      const analysis = analyzeDataConsistency(
        {
          day: { data: dayRecettes, total: dayTotal },
          month: { data: monthRecettes, total: monthTotal },
          year: { data: yearRecettes, total: yearTotal },
        },
        personnelStats?.data
      );

      // Vous pourriez utiliser l'analyse pour afficher des alertes à l'utilisateur
      // ou pour ajuster automatiquement la période si nécessaire
      if (analysis.issues.length > 0) {
        logger.warn(
          `⚠️ [useSynchronizedStats] ${analysis.issues.length} problème(s) détecté(s)`
        );
      }
    }
  }, [
    dayRecettes,
    monthRecettes,
    yearRecettes,
    personnelStats,
    loadingDayRecettes,
    loadingMonthRecettes,
    loadingYearRecettes,
    loadingPersonnelStats,
    dayTotal,
    monthTotal,
    yearTotal,
    analyzeDataConsistency,
  ]);

  return {
    // Paramètres de période pour les composants enfants
    periodParams,
    // État de chargement global
    loading:
      loadingDayRecettes ||
      loadingMonthRecettes ||
      loadingYearRecettes ||
      loadingPersonnelStats,
    // Données pour différentes périodes
    data: {
      day: { recettes: dayRecettes, total: dayTotal },
      month: { recettes: monthRecettes, total: monthTotal },
      year: { recettes: yearRecettes, total: yearTotal },
      personnel: personnelStats,
    },
    // Contrôles pour changer la période
    periodType,
    setPeriodType,
    // Utilitaires
    refreshAll: () => {
      // Forcer le rafraîchissement en regénérant les paramètres
      setPeriodParams(generatePeriodParams(periodType));
    },
  };
};
