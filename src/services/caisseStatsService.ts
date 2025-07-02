import api from "./api";

export interface OverviewStats {
  today: { commandes: number; recettes: number };
  total: { commandes: number; recettes: number };
  week: { commandes: number; recettes: number };
  month: { commandes: number; recettes: number };
}

export interface SalesDay {
  _id: { year: number; month: number; day: number };
  commandes: number;
  recettes: number;
}

export interface PaymentStat {
  _id: string;
  montantTotal: number;
  nombreTransactions: number;
  pourcentageTransactions: number;
  pourcentageMontant: number;
}

// Cache simple pour éviter les requêtes répétées
const caisseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes pour les données de caisse

function getCachedData(key: string) {
  const cached = caisseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  caisseCache.set(key, { data, timestamp: Date.now() });
}

export async function fetchOverviewStats() {
  const cacheKey = "overview";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { data } = await api.get("/stats/overview");
  const result = data.data as OverviewStats;
  setCachedData(cacheKey, result);
  return result;
}

export async function fetchSalesStats(params: {
  startDate?: string;
  endDate?: string;
  periode?: string;
}) {
  const cacheKey = `sales-${JSON.stringify(params)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // Utilise periode OU startDate/endDate
  const query = new URLSearchParams();
  if (params.periode) query.append("periode", params.periode);
  query.append("groupBy", "day");
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  const { data } = await api.get(`/stats/sales?${query.toString()}`);
  const result = data.data.daily as SalesDay[];
  setCachedData(cacheKey, result);
  return result;
}

export async function fetchPaymentStats(params: {
  periode?: string;
  startDate?: string;
  endDate?: string;
}) {
  const cacheKey = `payment-${JSON.stringify(params)}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const query = new URLSearchParams();
  if (params.periode) query.append("periode", params.periode);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);

  const { data } = await api.get(`/stats/payment-methods?${query.toString()}`);
  const result = data.data.data as PaymentStat[];
  setCachedData(cacheKey, result);
  return result;
}

// Fonction pour vider le cache si nécessaire
export function clearCaisseCache() {
  caisseCache.clear();
}
