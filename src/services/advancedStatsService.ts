import api from "./api";
import { logger} from "../utils/logger";
// import axios from "axios";

// Types pour les statistiques avancées
export interface AdvancedDashboardStats {
  today: {
    commandes: number;
    recettes: number;
  };
  yesterday: {
    commandes: number;
    recettes: number;
  };
  week: {
    commandes: number;
    recettes: number;
  };
  month: {
    commandes: number;
    recettes: number;
  };
}

export interface SalesStats {
  daily: Array<{
    date: string;
    commandes: number;
    recettes: number;
  }>;
  weekly: Array<{
    week: string;
    commandes: number;
    recettes: number;
  }>;
  monthly: Array<{
    month: string;
    commandes: number;
    recettes: number;
  }>;
}

export interface TopSellingItem {
  _id: string;
  nom: string;
  quantiteVendue: number;
  revenus: number;
  nombreCommandes: number;
}

export interface ServerPerformance {
  _id: string;
  nom: string;
  prenom: string;
  commandesServies: number;
  recettesGenerees: number;
  moyenneParCommande: number;
  tempsService?: number;
}

export interface PersonnelStats {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
  nombreCommandes: number;
  nombrePlatsServis: number;
  tempsServiceMoyen: number;
  tempsPreparationMoyen: number;
  tempsLivraisonMoyen: number;
  scoreEfficacite: number;
  performanceGlobale: number;
  recettesTotales: number;
  commandesAnnulees: number;
}

export interface PersonnelStatsResponse {
  success: boolean;
  data: {
    periode?: string;
    dateDebut?: Date;
    dateFin?: Date;
    detailsPersonnel: PersonnelStats[];
    resumeGlobal?: {
      totalServeurs: number;
      commandesTotales: number;
      recettesTotales: number;
      tempsServiceMoyen: number;
    };
    // Rétrocompatibilité avec l'ancienne structure
    statsGlobales?: {
      totalPersonnel: number;
      personnelActif: number;
      personnelInactif: number;
    };
  };
}

export interface PaymentMethodStats {
  modePaiement: string;
  nombreTransactions: number;
  montantTotal: number;
  pourcentage: number;
}

export interface PreparationTimeStats {
  moyenne: number;
  median: number;
  min: number;
  max: number;
  parPlat: Array<{
    nom: string;
    tempsMoyen: number;
  }>;
}

export interface ComparisonData {
  period1: {
    label: string;
    commandes: number;
    recettes: number;
  };
  period2: {
    label: string;
    commandes: number;
    recettes: number;
  };
  differences: {
    commandesPercent: number;
    recettesPercent: number;
  };
}

export interface GeneralStats {
  totalPersonnel: number;
  personnelActif: number;
  totalPlatsMenu: number;
  platsSeason: number;
}

// Nouveaux types pour Stock & Dépenses
export interface StockStats {
  totalArticles: number;
  articlesEnStock: number;
  alertesStock: number;
  valeurTotaleStock: number;
  depensesTotales: number;
  densesMensuelles: number;
}

export interface StockAlert {
  _id: string;
  nom: string;
  quantiteStock: number;
  seuilAlerte: number;
  unite: string;
  categorie?: string;
}

export interface StockItem {
  _id: string;
  nom: string;
  categorie?: string;
  quantiteStock: number;
  unite: string;
  seuilAlerte: number;
  prixAchat: number;
  fournisseur?: string;
  datePeremption?: string;
}

export interface StockMovement {
  _id: string;
  articleId: string;
  articleNom: string;
  type: "entree" | "sortie" | "ajustement" | "perte";
  quantite: number;
  prixUnitaire?: number;
  motif?: string;
  date: string;
  creePar: string;
}

export interface ExpenseStats {
  totalDepenses: number;
  depensesMensuelle: number;
  depensesHebdomadaire: number;
  depensesJournaliere: number;
  moyenneDepenseParCommande: number;
  parCategorie: Array<{
    categorie: string;
    montant: number;
    pourcentage: number;
  }>;
}

// Nouvelle version : accepte PeriodSelection (mode, value)
export interface PeriodSelection {
  mode: "quick" | "date" | "range";
  value: string | { startDate: string; endDate: string };
}

// Helper pour convertir une période en start/end date
function getStartEndFromPeriod(period: PeriodSelection): {
  start: string;
  end: string;
} {
  if (period.mode === "quick") {
    // Pour les périodes rapides, on mappe vers une date ou un intervalle
    // (à adapter selon la logique métier, ici on suppose que l'API backend sait gérer les valeurs comme "today", "this_week", etc.)
    return { start: period.value as string, end: period.value as string };
  }
  if (period.mode === "date") {
    return { start: period.value as string, end: period.value as string };
  }
  if (period.mode === "range") {
    const v = period.value as { startDate: string; endDate: string };
    return { start: v.startDate, end: v.endDate };
  }
  return { start: "", end: "" };
}

export class AdvancedStatsService {
  // Cache simple pour éviter les appels trop fréquents
  private static cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  // Nettoyer le cache des entrées expirées
  private static cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now > value.timestamp + value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Récupérer depuis le cache ou faire l'appel API
  private static async getFromCacheOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number = 30000 // 30 secondes par défaut
  ): Promise<T> {
    this.cleanExpiredCache();

    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now <= cached.timestamp + cached.ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(cacheKey, { data, timestamp: now, ttl });
    return data;
  }

  // Invalider le cache pour une clé spécifique ou tout le cache
  public static invalidateCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Fonction utilitaire pour retry avec délai exponentiel
  private static async retryWithDelay<T>(
    fn: () => Promise<T>,
    retries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && error.response?.status === 429) {
        logger.warn(`Retry après ${delay}ms. Tentatives restantes: ${retries}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryWithDelay(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // Récupérer les statistiques du dashboard (nouvelles APIs)
  static async getDashboardStats(): Promise<AdvancedDashboardStats> {
    return this.retryWithDelay(async () => {
      try {
        // Utilise la nouvelle API /stats/overview qui est compatible
        const response = await api.get(`/stats/overview`);
        const data = response.data.data;

        // Récupérer séparément les vraies stats de la semaine calendaire
        const currentWeekStats = await this.getCurrentWeekStats();

        // Remplacer les stats de semaine par les vraies stats calendaires
        return {
          ...data,
          week: currentWeekStats,
        };
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération des stats dashboard:",
          error
        );
        throw error;
      }
    });
  }
  // Récupérer les statistiques de ventes (nouvelles APIs)
  static async getSalesStats(period: string = "30days"): Promise<SalesStats> {
    return this.retryWithDelay(async () => {
      try {
        const response = await api.get(`/stats/sales?periode=${period}`);
        return response.data.data;
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération des stats de ventes:",
          error
        );
        throw error;
      }
    });
  }

  // Récupérer le top des plats les plus vendus (nouvelles APIs)
  static async getTopSellingItems(
    limit: number = 10
  ): Promise<TopSellingItem[]> {
    return this.retryWithDelay(async () => {
      try {
        const response = await api.get(`/stats/top-selling?limit=${limit}`);
        return response.data.data;
      } catch (error) {
        logger.error("Erreur lors de la récupération du top des plats:", error);
        throw error;
      }
    });
  }

  // Récupérer les statistiques des serveurs (nouvelles APIs)
  static async getServerStats(): Promise<ServerPerformance[]> {
    try {
      const response = await api.get("/stats/performance-complete");
      return response.data.data.detailsPersonnel || [];
    } catch (error) {
      logger.error("Erreur lors de la récupération des stats serveurs:", error);
      throw error;
    }
  }

  // Récupérer les statistiques des modes de paiement (nouvelles APIs)
  static async getPaymentMethodStats(): Promise<PaymentMethodStats[]> {
    try {
      const response = await api.get("/stats/payment-methods");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des stats paiements:",
        error
      );
      throw error;
    }
  }
  // Récupérer les statistiques des temps de préparation (nouvelles APIs)
  static async getPreparationTimeStats(): Promise<PreparationTimeStats> {
    try {
      const response = await api.get("/stats/preparation-time");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des temps de préparation:",
        error
      );
      throw error;
    }
  } // Récupérer les statistiques détaillées du personnel
  static async getPersonnelStats(
    dateDebut?: string,
    dateFin?: string
  ): Promise<PersonnelStatsResponse> {
    const cacheKey = `personnel-stats-${dateDebut || "default"}-${
      dateFin || "default"
    }`;

    // Log de débogage
    logger.debug("🔍 [advancedStatsService.getPersonnelStats] Paramètres:", {
      dateDebut,
      dateFin,
      cacheKey,
    });

    return this.getFromCacheOrFetch(
      cacheKey,
      async () => {
        try {
          // Utilisation de la nouvelle API v2 performance-complete qui gère TOUTES les statistiques
          let url = "/stats/performance-complete";
          const params = new URLSearchParams();

          // Convertir les dates en période si nécessaire, sinon utiliser 30days par défaut
          if (dateDebut && dateFin) {
            const start = new Date(dateDebut);
            const end = new Date(dateFin);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Mapping approximatif vers les périodes supportées
            if (diffDays <= 7) {
              params.append("periode", "7days");
            } else if (diffDays <= 30) {
              params.append("periode", "30days");
            } else if (diffDays <= 90) {
              params.append("periode", "3months");
            } else if (diffDays <= 180) {
              params.append("periode", "6months");
            } else {
              params.append("periode", "1year");
            }
          } else {
            params.append("periode", "30days");
          }

          // Log de la période et des paramètres
          logger.debug(
            "🔍 [advancedStatsService.getPersonnelStats] Requête API:",
            {
              url,
              params: params.toString(),
            }
          );

          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          const response = await api.get(url);
          return response.data;
        } catch (error) {
          logger.error(
            "Erreur lors de la récupération des stats du personnel:",
            error
          );
          // Données de démonstration pour développement
          logger.debug(
            "Utilisation des données de démonstration pour le personnel"
          );
          return {
            success: true,
            data: {
              periode: {
                debut: new Date(
                  dateDebut ||
                    new Date(
                      Date.now() - 30 * 24 * 60 * 60 * 1000
                    ).toISOString()
                ),
                fin: new Date(dateFin || new Date().toISOString()),
              },
              statsGlobales: {
                totalPersonnel: 8,
                personnelActif: 6,
                personnelInactif: 2,
              },
              detailsPersonnel: [
                {
                  _id: "1",
                  nom: "Diallo",
                  prenom: "Amadou",
                  role: "SERVEUR",
                  email: "amadou.diallo@chezblos.com",
                  nombreCommandes: 156,
                  nombrePlatsServis: 312,
                  tempsServiceMoyen: 12.5,
                  tempsPreparationMoyen: 18.2,
                  tempsLivraisonMoyen: 3.1,
                  scoreEfficacite: 88.5,
                  performanceGlobale: 92.3,
                  recettesTotales: 45600,
                  commandesAnnulees: 2,
                },
                {
                  _id: "2",
                  nom: "Sané",
                  prenom: "Fatou",
                  role: "CUISINIER",
                  email: "fatou.sane@chezblos.com",
                  nombreCommandes: 189,
                  nombrePlatsServis: 445,
                  tempsServiceMoyen: 15.8,
                  tempsPreparationMoyen: 14.6,
                  tempsLivraisonMoyen: 2.8,
                  scoreEfficacite: 91.2,
                  performanceGlobale: 94.7,
                  recettesTotales: 52300,
                  commandesAnnulees: 1,
                },
                {
                  _id: "3",
                  nom: "Traoré",
                  prenom: "Ibrahim",
                  role: "SERVEUR",
                  email: "ibrahim.traore@chezblos.com",
                  nombreCommandes: 134,
                  nombrePlatsServis: 268,
                  tempsServiceMoyen: 16.3,
                  tempsPreparationMoyen: 19.8,
                  tempsLivraisonMoyen: 4.2,
                  scoreEfficacite: 76.8,
                  performanceGlobale: 78.5,
                  recettesTotales: 38900,
                  commandesAnnulees: 5,
                },
                {
                  _id: "4",
                  nom: "Koné",
                  prenom: "Aminata",
                  role: "CUISINIER",
                  email: "aminata.kone@chezblos.com",
                  nombreCommandes: 167,
                  nombrePlatsServis: 389,
                  tempsServiceMoyen: 14.1,
                  tempsPreparationMoyen: 16.7,
                  tempsLivraisonMoyen: 3.5,
                  scoreEfficacite: 85.4,
                  performanceGlobale: 87.9,
                  recettesTotales: 48750,
                  commandesAnnulees: 3,
                },
                {
                  _id: "5",
                  nom: "Ba",
                  prenom: "Moussa",
                  role: "SERVEUR",
                  email: "moussa.ba@chezblos.com",
                  nombreCommandes: 98,
                  nombrePlatsServis: 196,
                  tempsServiceMoyen: 22.4,
                  tempsPreparationMoyen: 21.3,
                  tempsLivraisonMoyen: 5.8,
                  scoreEfficacite: 65.2,
                  performanceGlobale: 68.1,
                  recettesTotales: 28400,
                  commandesAnnulees: 8,
                },
                {
                  _id: "6",
                  nom: "Ndiaye",
                  prenom: "Awa",
                  role: "SERVEUR",
                  email: "awa.ndiaye@chezblos.com",
                  nombreCommandes: 142,
                  nombrePlatsServis: 284,
                  tempsServiceMoyen: 13.7,
                  tempsPreparationMoyen: 17.9,
                  tempsLivraisonMoyen: 3.9,
                  scoreEfficacite: 82.6,
                  performanceGlobale: 85.3,
                  recettesTotales: 41250,
                  commandesAnnulees: 4,
                },
              ],
            },
          };
        }
      },
      45000 // Cache pour 45 secondes pour les stats personnel
    );
  }

  // Comparer deux périodes
  static async getComparisonStats(
    period1: PeriodSelection,
    period2: PeriodSelection
  ): Promise<ComparisonData> {
    const { start: startDate1, end: endDate1 } = getStartEndFromPeriod(period1);
    const { start: startDate2, end: endDate2 } = getStartEndFromPeriod(period2);
    try {
      const response = await api.get(
        `/stats/comparison?startDate1=${startDate1}&endDate1=${endDate1}&startDate2=${startDate2}&endDate2=${endDate2}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      logger.error("Erreur lors de la comparaison des périodes:", error);
      throw error;
    }
  }
  // Récupérer les statistiques générales (personnel, menu, etc.)
  static async getGeneralStats(): Promise<GeneralStats> {
    try {
      const [personnelResponse, menuResponse] = await Promise.all([
        api.get("/users"),
        api.get("/menu"),
      ]);

      const personnel = personnelResponse.data;
      const menu = menuResponse.data;

      // Vérifier que les données sont bien des tableaux
      const personnelArray = Array.isArray(personnel) ? personnel : [];
      const menuArray = Array.isArray(menu) ? menu : [];

      return {
        totalPersonnel: personnelArray.length,
        personnelActif: personnelArray.filter(
          (user: any) => user?.actif !== false
        ).length,
        totalPlatsMenu: menuArray.length,
        platsSeason: menuArray.filter((item: any) => item?.disponible === true)
          .length,
      };
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des stats générales:",
        error
      );
      return {
        totalPersonnel: 0,
        personnelActif: 0,
        totalPlatsMenu: 0,
        platsSeason: 0,
      };
    }
  }

  // NOUVELLES FONCTIONS POUR STOCK & DÉPENSES (utilisant les nouvelles APIs)

  // Récupérer les statistiques du stock
  static async getStockStats(): Promise<StockStats> {
    try {
      const response = await api.get("/stats/stock");
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération des stats stock:", error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalArticles: 0,
        articlesEnStock: 0,
        alertesStock: 0,
        valeurTotaleStock: 0,
        depensesTotales: 0,
        densesMensuelles: 0,
      };
    }
  }

  // Récupérer les alertes de stock
  static async getStockAlerts(): Promise<StockAlert[]> {
    try {
      const response = await api.get("/stock/alerts");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      logger.error("Erreur lors de la récupération des alertes stock:", error);
      return [];
    }
  }

  // Récupérer tous les articles de stock
  static async getStockItems(): Promise<StockItem[]> {
    try {
      const response = await api.get("/stock");
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      logger.error("Erreur lors de la récupération des articles stock:", error);
      return [];
    }
  }

  // Récupérer les mouvements de stock récents
  static async getStockMovements(limit = 10): Promise<StockMovement[]> {
    try {
      const response = await api.get(`/stock/movements?limit=${limit}`);
      // Les données sont directement dans response.data.data selon la structure du backend
      const movements = response.data.data || [];
      return Array.isArray(movements) ? movements : [];
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des mouvements stock:",
        error
      );
      return [];
    }
  }

  // Récupérer les statistiques des dépenses (uniquement via l'API backend)
  static async getExpenseStats(period = "30days"): Promise<ExpenseStats> {
    try {
      const response = await api.get(`/stats/expenses?period=${period}`);
      return response.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération des stats dépenses:", error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalDepenses: 0,
        depensesMensuelle: 0,
        depensesHebdomadaire: 0,
        depensesJournaliere: 0,
        moyenneDepenseParCommande: 0,
        parCategorie: [],
      };
    }
  }

  // Exporter les données
  static async exportData(format: "excel" | "pdf" = "excel"): Promise<void> {
    try {
      const response = await api.get(`/stats/export?format=${format}`, {
        responseType: "blob",
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `statistiques_${new Date().toISOString().split("T")[0]}.${
          format === "excel" ? "xlsx" : "pdf"
        }`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error("Erreur lors de l'export des données:", error);
      throw error;
    }
  }

  // Nouvelles méthodes pour utiliser les APIs avancées

  // Récupérer les métriques en temps réel
  static async getRealTimeMetrics(): Promise<any> {
    try {
      const response = await api.get("/stats/realtime");
      return response.data.data;
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des métriques temps réel:",
        error
      );
      throw error;
    }
  }

  // Vider le cache des statistiques
  static async clearStatsCache(): Promise<void> {
    try {
      await api.post("/stats/clear-cache");
      // Aussi vider le cache local
      this.cache.clear();
    } catch (error) {
      logger.error("Erreur lors de la suppression du cache:", error);
      throw error;
    }
  }

  // Récupérer les statistiques avancées avec filtres
  static async getAdvancedStats(
    filters: {
      periode?: string;
      groupBy?: "hour" | "day" | "week" | "month" | "year";
    } = {}
  ): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters.periode) params.append("periode", filters.periode);
      if (filters.groupBy) params.append("groupBy", filters.groupBy);

      const response = await api.get(`/stats/advanced?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      logger.error("Erreur lors de la récupération des stats avancées:", error);
      throw error;
    }
  }

  // Récupérer les statistiques de la semaine calendaire (lundi au dimanche)
  static async getCurrentWeekStats(): Promise<{
    commandes: number;
    recettes: number;
  }> {
    return this.retryWithDelay(async () => {
      try {
        // Calculer le lundi de cette semaine
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si dimanche, reculer de 6 jours, sinon reculer au lundi

        const mondayOfThisWeek = new Date(now);
        mondayOfThisWeek.setDate(now.getDate() - daysToSubtract);
        mondayOfThisWeek.setHours(0, 0, 0, 0);

        // Calculer le dimanche de cette semaine
        const sundayOfThisWeek = new Date(mondayOfThisWeek);
        sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
        sundayOfThisWeek.setHours(23, 59, 59, 999);

        // Formater les dates pour l'API
        const dateDebut = mondayOfThisWeek.toISOString().split("T")[0];
        const dateFin = sundayOfThisWeek.toISOString().split("T")[0];

        logger.debug(
          `[getCurrentWeekStats] Semaine calendaire: ${dateDebut} au ${dateFin}`
        );

        // Appeler l'API avec les dates spécifiques
        const response = await api.get(
          `/stats/recettes-periode?dateDebut=${dateDebut}&dateFin=${dateFin}`
        );
        const data = response.data.data;

        return {
          commandes: data.totalCommandes || 0,
          recettes: data.totalRecettes || 0,
        };
      } catch (error) {
        logger.error(
          "Erreur lors de la récupération des stats de la semaine calendaire:",
          error
        );
        // Fallback vers les données par défaut
        return { commandes: 0, recettes: 0 };
      }
    });
  }
}
