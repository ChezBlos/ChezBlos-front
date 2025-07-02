import { useState, useMemo } from "react";
import { Tabs, TabsContent } from "../../../../components/ui/tabs";
import { Spinner } from "../../../../components/ui/spinner";
import { useDashboardStats } from "../../../../hooks/useDashboardStats";
import {
  useAdvancedDashboardStats,
  useSalesStats,
  useTopSellingItems,
  useServerPerformance,
  usePaymentMethodStats,
  useComparisonStats,
  useGeneralStats,
  useStockStats,
  useStockAlerts,
  useStockMovements,
  useExpenseStats,
  usePersonnelStats,
} from "../../../../hooks/useAdvancedStats";
import { ComparisonModal } from "../../../../components/modals/ComparisonModal/ComparisonModal";
import { logger } from "../../../../utils/logger";
// import { useAlert } from "../../../../contexts/AlertContext";
import PersonnelStatsSection from "./PersonnelStatsSection";
import CommandesRecettesStatsSection from "./CommandesStatsSection";
import StocksDepensesStatsSection from "./StocksDepensesStatsSection";
import { CaisseStatsSection } from "./CaisseStatsSection";

export const AdminStatistiquesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personnel");
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonPeriods, setComparisonPeriods] = useState<{
    period1: any;
    period2: any;
  }>({ period1: null, period2: null });
  // Variables pour la section personnel (même si la version simple ne les utilise pas)
  const [personnelDateRange] = useState({
    dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
  });
  const [sortCriteria] = useState("performanceGlobale");
  // Hooks pour les données
  const {
    dashboardStats,
    loading: dashboardLoading,
    error: dashboardError,
  } = useDashboardStats();
  const {
    data: advancedStats,
    loading: advancedLoading,
    error: advancedError,
  } = useAdvancedDashboardStats();
  const { data: salesStats, error: salesError } = useSalesStats("7days");
  const { data: topItems, error: topItemsError } = useTopSellingItems(10);
  const { error: serverError } = useServerPerformance();
  const { data: paymentStats, error: paymentError } = usePaymentMethodStats();
  // TODO: Mettre à jour ces hooks pour supporter selectedPeriod en paramètre
  const {
    // data: generalStats,
    loading: generalLoading,
    error: generalError,
  } = useGeneralStats();
  const { data: comparisonData, error: comparisonError } = useComparisonStats(
    comparisonPeriods.period1,
    comparisonPeriods.period2
  );
  // Nouveaux hooks pour Stock & Dépenses - avec gestion d'erreur améliorée
  const {
    data: stockStats,
    loading: stockLoading,
    error: stockError,
  } = useStockStats();
  const {
    data: stockMovements,
    error: movementsError,
    refetch: refetchMovements,
  } = useStockMovements(10);
  const { error: alertsError } = useStockAlerts();
  const {
    data: expenseStats,
    loading: expenseLoading,
    error: expenseError,
  } = useExpenseStats("7days"); // Hook pour les statistiques du personnel avec polling automatique accéléré
  const {
    data: personnelStats,
    loading: personnelLoading,
    error: personnelError,
    refetch: refetchPersonnelStats,
  } = usePersonnelStats(
    personnelDateRange.dateDebut,
    personnelDateRange.dateFin,
    false, // Désactiver le polling automatique
    30000 // Intervalle non utilisé
  );
  // Nouveaux hooks pour les fonctionnalités avancées - temporairement commentés
  // const { data: realTimeMetrics, loading: realTimeLoading } = useRealTimeMetrics(true);
  // const { data: advancedFiltered } = useAdvancedStatsWithFilters({
  //   periode: selectedPeriod,
  //   groupBy: 'day'
  // });
  // const { clearCache, loading: cacheLoading } = useClearStatsCache();

  // const { showAlert } = useAlert();

  // Calculs des variations avec gestion robuste des undefined
  const todayVsYesterday = useMemo(() => {
    try {
      if (
        advancedStats?.today?.commandes === undefined ||
        advancedStats?.yesterday?.commandes === undefined
      ) {
        return { value: 0, isPositive: true };
      }
      const today = Number(advancedStats.today.commandes) || 0;
      const yesterday = Number(advancedStats.yesterday.commandes) || 0;
      if (yesterday === 0)
        return { value: today > 0 ? 100 : 0, isPositive: true };
      const change = ((today - yesterday) / yesterday) * 100;
      return { value: Math.abs(change), isPositive: change >= 0 };
    } catch (error) {
      logger.error("Erreur dans le calcul todayVsYesterday:", error);
      return { value: 0, isPositive: true };
    }
  }, [advancedStats]);
  const revenueChange = useMemo(() => {
    try {
      if (
        advancedStats?.today?.recettes === undefined ||
        advancedStats?.yesterday?.recettes === undefined
      ) {
        return { value: 0, isPositive: true };
      }
      const today = Number(advancedStats.today.recettes) || 0;
      const yesterday = Number(advancedStats.yesterday.recettes) || 0;
      if (yesterday === 0)
        return { value: today > 0 ? 100 : 0, isPositive: true };
      const change = ((today - yesterday) / yesterday) * 100;
      return { value: Math.abs(change), isPositive: change >= 0 };
    } catch (error) {
      logger.error("Erreur dans le calcul revenueChange:", error);
      return { value: 0, isPositive: true };
    }
  }, [advancedStats]);
  // Données pour les graphiques avec adaptabilité selon la période sélectionnée
  const { trendData, revenueData, trendTitle } = useMemo(() => {
    if (!salesStats) {
      return {
        trendData: null,
        revenueData: null,
        trendTitle: "Tendance des Commandes",
      };
    }

    // Configuration selon la période
    const periodConfig = {
      "7days": {
        trendTitle: "Commandes 7 derniers jours",
        revenueTitle: "Évolution des Ventes (7 jours)",
        dataLimit: 7,
        dateFormat: "day", // Format jour/mois
      },
      "30days": {
        trendTitle: "Commandes 30 derniers jours",
        revenueTitle: "Évolution des Ventes (30 jours)",
        dataLimit: 30,
        dateFormat: "day", // Format jour/mois
      },
      "3months": {
        trendTitle: "Commandes 3 derniers mois",
        revenueTitle: "Évolution des Ventes (3 mois)",
        dataLimit: 12, // Semaines ou mois
        dateFormat: "week", // Format semaine ou mois
      },
      "6months": {
        trendTitle: "Commandes 6 derniers mois",
        revenueTitle: "Évolution des Ventes (6 mois)",
        dataLimit: 6,
        dateFormat: "month", // Format mois
      },
      "1year": {
        trendTitle: "Commandes sur l'année",
        revenueTitle: "Évolution des Ventes (12 mois)",
        dataLimit: 12,
        dateFormat: "month", // Format mois
      },
    };

    const config = periodConfig["7days"] || periodConfig["7days"];

    // Fonction pour formater les dates selon la période
    const formatDateForPeriod = (item: any, format: string) => {
      if (!item._id) return "N/A";

      switch (format) {
        case "day":
          if (item._id.day && item._id.month) {
            return `${item._id.day}/${item._id.month}`;
          }
          break;
        case "week":
          if (item._id.week && item._id.year) {
            return `S${item._id.week}`;
          } else if (item._id.day && item._id.month) {
            return `${item._id.day}/${item._id.month}`;
          }
          break;
        case "month":
          if (item._id.month && item._id.year) {
            const months = [
              "Jan",
              "Fév",
              "Mar",
              "Avr",
              "Mai",
              "Jun",
              "Jul",
              "Aoû",
              "Sep",
              "Oct",
              "Nov",
              "Déc",
            ];
            return months[item._id.month - 1] || `M${item._id.month}`;
          }
          break;
      }
      return "N/A";
    };

    // Données pour la tendance (priorité: monthly > weekly > daily)
    let trendSource: any[] = salesStats?.daily || [];
    if (
      ["6months", "1year"].includes("7days") &&
      salesStats?.monthly?.length > 0
    ) {
      trendSource = salesStats.monthly;
    } else if (
      ["3months"].includes("7days") &&
      salesStats?.weekly?.length > 0
    ) {
      trendSource = salesStats.weekly;
    }

    const trendData =
      Array.isArray(trendSource) && trendSource.length > 0
        ? trendSource.slice(0, config.dataLimit).map((item: any) => ({
            date: formatDateForPeriod(item, config.dateFormat),
            value: Number(item?.commandes) || 0,
          }))
        : [];

    // Données pour les revenus (même logique)
    let revenueSource: any[] = salesStats?.daily || [];
    if (
      ["6months", "1year"].includes("7days") &&
      salesStats?.monthly?.length > 0
    ) {
      revenueSource = salesStats.monthly;
    } else if (
      ["3months"].includes("7days") &&
      salesStats?.weekly?.length > 0
    ) {
      revenueSource = salesStats.weekly;
    }

    const revenueData =
      Array.isArray(revenueSource) && revenueSource.length > 0
        ? revenueSource.slice(0, config.dataLimit).map((item: any) => ({
            date: formatDateForPeriod(item, config.dateFormat),
            commandes: Number(item?.commandes) || 0,
            recettes: Number(item?.recettes) || 0,
          }))
        : [];

    return {
      trendData: trendData.length > 0 ? trendData : null,
      revenueData: revenueData.length > 0 ? revenueData : null,
      trendTitle: config.trendTitle,
    };
  }, [salesStats, "7days"]);
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };
  // Ajout d'un état pour le filtre date unique (pour toutes les sections)
  // const [filterDate, setFilterDate] = useState<string | null>(null);

  // // Ajout de l'état pour le filtre date (modal)
  // const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  // const [dateFilter, setDateFilter] = useState<{
  //   startDate: string;
  //   endDate: string;
  // } | null>(null);

  // Handler pour appliquer le filtre date
  // const handleApplyDateFilter = (start: string, end: string) => {
  //   setDateFilter({ startDate: start, endDate: end });
  //   setIsDateFilterOpen(false);
  // };
  // const handleClearDateFilter = () => {
  //   setDateFilter(null);
  //   setIsDateFilterOpen(false);
  // };

  // Adaptation du callback pour le modal
  const handleComparison = (date1: string, date2?: string) => {
    if (date2) {
      // Comparaison de deux dates
      setComparisonPeriods({
        period1: { type: "date", value: date1 },
        period2: { type: "date", value: date2 },
      });
      // setFilterDate(null); // désactive le filtre simple
    } else {
      // Filtre simple sur une date
      // setFilterDate(date1);
      setComparisonPeriods({ period1: null, period2: null });
    }
  };

  // Fonction pour trier les données du personnel
  const sortedPersonnelData = useMemo(() => {
    if (!personnelStats?.data?.detailsPersonnel) {
      return [];
    }

    // Normalisation de la casse des rôles pour éviter les bugs d'affichage
    const normalized = personnelStats.data.detailsPersonnel.map((p) => ({
      ...p,
      role: p.role ? p.role.toUpperCase() : "NON DEFINI",
    }));

    const sorted = [...normalized].sort((a, b) => {
      switch (sortCriteria) {
        case "performanceGlobale":
          return (b.performanceGlobale || 0) - (a.performanceGlobale || 0);
        case "scoreEfficacite":
          return (b.scoreEfficacite || 0) - (a.scoreEfficacite || 0);
        case "nombreCommandes":
          return (b.nombreCommandes || 0) - (a.nombreCommandes || 0);
        case "recettesTotales":
          return (b.recettesTotales || 0) - (a.recettesTotales || 0);
        case "tempsServiceMoyen":
          return (a.tempsServiceMoyen || 0) - (b.tempsServiceMoyen || 0);
        case "nom":
          return (a.nom || "").localeCompare(b.nom || "");
        default:
          return (b.performanceGlobale || 0) - (a.performanceGlobale || 0);
      }
    });

    return sorted;
  }, [personnelStats, sortCriteria]);
  const loading =
    dashboardLoading ||
    advancedLoading ||
    generalLoading ||
    stockLoading ||
    expenseLoading;
  // Agrégation de toutes les erreurs
  const allErrors = [
    dashboardError,
    advancedError,
    salesError,
    topItemsError,
    serverError,
    paymentError,
    // preparationError,
    generalError,
    comparisonError,
    stockError,
    movementsError,
    expenseError,
  ].filter(Boolean);
  const hasErrors = allErrors.length > 0;
  const hasCriticalErrors = dashboardError || advancedError || generalError;
  if (loading) {
    return (
      <div className="flex justify-center items-center  h-[70vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (hasCriticalErrors) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-600 mb-4">
            Impossible de charger les statistiques principales.
          </p>
          <div className="text-sm text-red-500">
            {allErrors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Actualiser la page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Statistiques
          </h2>
          <p className="text-gray-600">
            Analysez les performances de votre restaurant en détail
          </p>
        </div>
        {/* Filtres globaux supprimés ici : select période, bouton comparer, bouton exporter */}
      </div>
      {/* Bannière d'avertissement pour erreurs non critiques */}
      {hasErrors && !hasCriticalErrors && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Certaines données ne sont pas disponibles. Certains graphiques
                peuvent être incomplets.
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Cela peut être dû à une surcharge temporaire du serveur. Essayez
                d'actualiser la page dans quelques instants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center gap-3 mb-6 p-1 bg-gray-10 rounded-full w-fit">
          <button
            onClick={() => setActiveTab("personnel")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "personnel"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Personnel
          </button>
          <button
            onClick={() => setActiveTab("commandes")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "commandes"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Commandes
          </button>
          <button
            onClick={() => setActiveTab("stocks")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "stocks"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Stock & Dépenses
          </button>
          <button
            onClick={() => setActiveTab("caisse")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "caisse"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Caisse
          </button>
        </div>
        {/* Contenu des onglets */}
        <TabsContent value="caisse">
          <CaisseStatsSection />
        </TabsContent>
        <TabsContent value="commandes">
          <CommandesRecettesStatsSection
            advancedStats={advancedStats}
            dashboardStats={dashboardStats}
            todayVsYesterday={todayVsYesterday}
            revenueChange={revenueChange}
            monthlyRevenueData={revenueData}
            weeklyTrendData={trendData}
            trendTitle={trendTitle}
            paymentStats={paymentStats}
            topItems={topItems}
            comparisonData={comparisonData}
            formatPrice={formatPrice}
          />
        </TabsContent>
        <TabsContent value="stocks">
          <StocksDepensesStatsSection
            stockStats={stockStats}
            stockLoading={stockLoading}
            stockError={stockError}
            expenseStats={expenseStats}
            expenseLoading={expenseLoading}
            expenseError={expenseError}
            alertsError={alertsError}
            stockMovements={stockMovements}
            movementsError={movementsError}
            itemsError={null} // Pour l'instant, pas d'erreur spécifique aux items
            formatPrice={formatPrice}
            refetchMovements={refetchMovements}
          />
        </TabsContent>
        <TabsContent value="personnel">
          <PersonnelStatsSection
            personnelStats={personnelStats}
            refetchPersonnelStats={refetchPersonnelStats}
            personnelLoading={personnelLoading}
            personnelError={personnelError}
            sortedPersonnelData={sortedPersonnelData}
          />
        </TabsContent>
      </Tabs>
      {/* Modal de comparaison */}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        onCompare={handleComparison}
      />
    </div>
  );
};
