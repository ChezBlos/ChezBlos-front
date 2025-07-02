import { useEffect, useState, useMemo, useCallback } from "react";
import { DateFilterValue } from "../components/filters/DateFilter";
import { getRecettes, RecetteDay } from "../services/recetteService";
import { logger } from "../utils/logger";

// Cache simple en mémoire pour éviter les requêtes répétées
const recettesCache = new Map<
  string,
  { data: RecetteDay[]; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRecettes(
  filter: DateFilterValue,
  groupBy: "day" | "month" = "day"
) {
  const [data, setData] = useState<RecetteDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Créer une clé de cache stable basée sur les paramètres
  const cacheKey = useMemo(() => {
    const filterKey =
      filter.mode === "single"
        ? `single-${filter.date}`
        : `range-${filter.startDate}-${filter.endDate}`;
    return `${filterKey}-${groupBy}`;
  }, [
    filter.mode,
    filter.mode === "single"
      ? filter.date
      : `${filter.startDate}-${filter.endDate}`,
    groupBy,
  ]);

  // Fonction pour vérifier et utiliser le cache
  const getCachedData = useCallback((key: string) => {
    const cached = recettesCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Fonction pour mettre en cache
  const setCachedData = useCallback((key: string, data: RecetteDay[]) => {
    recettesCache.set(key, { data, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Vérifier le cache d'abord
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Si pas de cache, faire l'appel API
    getRecettes(filter, groupBy)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setCachedData(cacheKey, res);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Erreur lors du chargement des recettes");
          logger.error("[useRecettes] Erreur:", err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, filter, groupBy, getCachedData, setCachedData]);

  // Fonction pour vider le cache si nécessaire
  const clearCache = useCallback(() => {
    recettesCache.clear();
  }, []);

  return { data, loading, error, clearCache };
}
