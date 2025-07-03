import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { DateFilterValue } from "../components/filters/DateFilter";
import { getRecettes, RecetteDay } from "../services/recetteService";
import { logger } from "../utils/logger";

// Cache global persistant (survit aux remontages de composants)
const globalRecettesCache = new Map<
  string,
  { data: RecetteDay[]; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Set pour tracker les requêtes en cours et éviter les doublons
const ongoingRequests = new Set<string>();

export function useRecettes(
  filter: DateFilterValue,
  groupBy: "day" | "month" = "day"
) {
  const [data, setData] = useState<RecetteDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref pour éviter les mises à jour après démontage
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
    const cached = globalRecettesCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Fonction pour mettre en cache
  const setCachedData = useCallback((key: string, data: RecetteDay[]) => {
    globalRecettesCache.set(key, { data, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    // Vérifier d'abord si une requête est déjà en cours pour cette clé
    if (ongoingRequests.has(cacheKey)) {
      logger.debug(`⏳ [useRecettes] Requête déjà en cours pour: ${cacheKey}`);
      return;
    }

    setLoading(true);
    setError(null);

    // Log de debug pour traquer les requêtes multiples
    logger.debug(
      `🔍 [useRecettes] Démarrage requête avec cacheKey: ${cacheKey}`
    );

    // Vérifier le cache d'abord
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      logger.debug(
        `💾 [useRecettes] Données trouvées en cache pour: ${cacheKey}`
      );
      if (isMountedRef.current) {
        setData(cachedData);
        setLoading(false);
      }
      return;
    }

    // Marquer la requête comme en cours
    ongoingRequests.add(cacheKey);

    // Si pas de cache, faire l'appel API
    logger.debug(`📡 [useRecettes] Appel API pour: ${cacheKey}`, {
      filter,
      groupBy,
    });

    getRecettes(filter, groupBy)
      .then((res) => {
        if (isMountedRef.current) {
          logger.debug(
            `✅ [useRecettes] Réponse reçue pour: ${cacheKey}`,
            res.length,
            "éléments"
          );
          setData(res);
          setCachedData(cacheKey, res);
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          setError(err?.message || "Erreur lors du chargement des recettes");
          logger.error("[useRecettes] Erreur:", err);
        }
      })
      .finally(() => {
        // Retirer la requête de la liste des requêtes en cours
        ongoingRequests.delete(cacheKey);
        if (isMountedRef.current) {
          setLoading(false);
        }
      });
  }, [cacheKey, getCachedData, setCachedData, filter, groupBy]);

  // Fonction pour vider le cache si nécessaire
  const clearCache = useCallback(() => {
    globalRecettesCache.clear();
    ongoingRequests.clear();
  }, []);

  return { data, loading, error, clearCache };
}
