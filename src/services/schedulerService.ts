import api from "./api";

// Types pour le scheduler
export interface ScheduledTask {
  name: string;
  running: boolean;
  lastRun?: string;
  nextRun?: string;
  description?: string;
}

export interface SchedulerStats {
  totalTasks: number;
  runningTasks: number;
  stoppedTasks: number;
  tasks: ScheduledTask[];
}

export class SchedulerService {
  // Récupérer le statut de toutes les tâches
  static async getTasksStatus(): Promise<SchedulerStats> {
    try {
      const response = await api.get("/scheduler/status");
      return response.data.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du statut des tâches:",
        error
      );
      throw error;
    }
  }

  // Démarrer toutes les tâches
  static async startAllTasks(): Promise<void> {
    try {
      await api.post("/scheduler/start");
    } catch (error) {
      console.error("Erreur lors du démarrage des tâches:", error);
      throw error;
    }
  }

  // Arrêter toutes les tâches
  static async stopAllTasks(): Promise<void> {
    try {
      await api.post("/scheduler/stop");
    } catch (error) {
      console.error("Erreur lors de l'arrêt des tâches:", error);
      throw error;
    }
  }

  // Démarrer une tâche spécifique
  static async startTask(taskName: string): Promise<void> {
    try {
      await api.post(`/scheduler/start/${taskName}`);
    } catch (error) {
      console.error(`Erreur lors du démarrage de la tâche ${taskName}:`, error);
      throw error;
    }
  }

  // Arrêter une tâche spécifique
  static async stopTask(taskName: string): Promise<void> {
    try {
      await api.post(`/scheduler/stop/${taskName}`);
    } catch (error) {
      console.error(`Erreur lors de l'arrêt de la tâche ${taskName}:`, error);
      throw error;
    }
  }

  // Exécuter manuellement une tâche
  static async runTask(taskName: string): Promise<void> {
    try {
      await api.post(`/scheduler/run/${taskName}`);
    } catch (error) {
      console.error(
        `Erreur lors de l'exécution de la tâche ${taskName}:`,
        error
      );
      throw error;
    }
  }

  // Récupérer les logs du scheduler
  static async getLogs(limit: number = 50): Promise<string[]> {
    try {
      const response = await api.get(`/scheduler/logs?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      throw error;
    }
  }

  // Récupérer les statistiques d'exécution
  static async getExecutionStats(): Promise<any> {
    try {
      const response = await api.get("/scheduler/execution-stats");
      return response.data.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des stats d'exécution:",
        error
      );
      throw error;
    }
  }
}
