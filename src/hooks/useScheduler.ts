import { useState, useEffect, useCallback } from "react";
import { SchedulerService, SchedulerStats } from "../services/schedulerService";
import { logger } from "../utils/logger";

// Hook pour récupérer le statut du scheduler
export const useSchedulerStatus = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<SchedulerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SchedulerService.getTasksStatus();
      setData(result);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement du statut du scheduler"
      );
      logger.error("Erreur useSchedulerStatus:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 10000); // Refresh toutes les 10 secondes
      return () => clearInterval(interval);
    }
  }, [fetchStatus, autoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchStatus,
  };
};

// Hook pour les actions du scheduler
export const useSchedulerActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await SchedulerService.startAllTasks();
    } catch (err: any) {
      setError(err.message || "Erreur lors du démarrage des tâches");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await SchedulerService.stopAllTasks();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'arrêt des tâches");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const startTask = useCallback(async (taskName: string) => {
    try {
      setLoading(true);
      setError(null);
      await SchedulerService.startTask(taskName);
    } catch (err: any) {
      setError(
        err.message || `Erreur lors du démarrage de la tâche ${taskName}`
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopTask = useCallback(async (taskName: string) => {
    try {
      setLoading(true);
      setError(null);
      await SchedulerService.stopTask(taskName);
    } catch (err: any) {
      setError(err.message || `Erreur lors de l'arrêt de la tâche ${taskName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runTask = useCallback(async (taskName: string) => {
    try {
      setLoading(true);
      setError(null);
      await SchedulerService.runTask(taskName);
    } catch (err: any) {
      setError(
        err.message || `Erreur lors de l'exécution de la tâche ${taskName}`
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    startAllTasks,
    stopAllTasks,
    startTask,
    stopTask,
    runTask,
  };
};

// Hook pour les logs du scheduler
export const useSchedulerLogs = (
  limit: number = 50,
  autoRefresh: boolean = true
) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SchedulerService.getLogs(limit);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des logs");
      logger.error("Erreur useSchedulerLogs:", err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchLogs();

    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 15000); // Refresh toutes les 15 secondes
      return () => clearInterval(interval);
    }
  }, [fetchLogs, autoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchLogs,
  };
};

// Hook pour les statistiques d'exécution
export const useSchedulerExecutionStats = (autoRefresh: boolean = true) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SchedulerService.getExecutionStats();
      setData(result);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des statistiques d'exécution"
      );
      logger.error("Erreur useSchedulerExecutionStats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000); // Refresh toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh]);

  return {
    data,
    loading,
    error,
    refetch: fetchStats,
  };
};
