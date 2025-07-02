/**
 * Service de logging centralisé
 * Désactive automatiquement les logs en production
 */

// Détection de l'environnement
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const logLevel =
  import.meta.env.VITE_LOG_LEVEL || (isProduction ? "error" : "debug");

// Niveaux de logging
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const currentLogLevel =
  LOG_LEVELS[logLevel as keyof typeof LOG_LEVELS] || LOG_LEVELS.debug;

// Configuration du logging selon l'environnement et le niveau
const shouldLog = (level: keyof typeof LOG_LEVELS) => {
  return currentLogLevel <= LOG_LEVELS[level];
};

/**
 * Logger centralisé avec contrôle par environnement
 */
export const logger = {
  /**
   * Log d'information (désactivé en production par défaut)
   */
  info: (...args: any[]) => {
    if (shouldLog("info")) {
      console.info("[INFO]", ...args);
    }
  },

  /**
   * Log de debug (désactivé en production par défaut)
   */
  debug: (...args: any[]) => {
    if (shouldLog("debug")) {
      console.debug("[DEBUG]", ...args);
    }
  },

  /**
   * Log d'avertissement (actif par défaut)
   */
  warn: (...args: any[]) => {
    if (shouldLog("warn")) {
      console.warn("[WARN]", ...args);
    }
  },

  /**
   * Log d'erreur (toujours actif sauf si level=silent)
   */
  error: (...args: any[]) => {
    if (shouldLog("error")) {
      logger.error("[ERROR]", ...args);
    }
  },

  /**
   * Log général (désactivé en production par défaut)
   */
  log: (...args: any[]) => {
    if (shouldLog("debug")) {
      console.log("[LOG]", ...args);
    }
  },

  /**
   * Groupe de logs (pour le debugging)
   */
  group: (label: string) => {
    if (shouldLog("debug")) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (shouldLog("debug")) {
      console.groupEnd();
    }
  },

  /**
   * Table pour les objets (développement seulement)
   */
  table: (data: any) => {
    if (shouldLog("debug")) {
      console.table(data);
    }
  },

  /**
   * Log conditionnel selon l'environnement
   */
  devOnly: (...args: any[]) => {
    if (isDevelopment) {
      console.log("[DEV]", ...args);
    }
  },

  /**
   * Log de performance (développement seulement)
   */
  time: (label: string) => {
    if (shouldLog("debug")) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (shouldLog("debug")) {
      console.timeEnd(label);
    }
  },
};

/**
 * Helper pour logger les réponses API
 */
export const logApiResponse = (endpoint: string, response: any) => {
  logger.debug(`API Response [${endpoint}]:`, response);
};

/**
 * Helper pour logger les erreurs API
 */
export const logApiError = (endpoint: string, error: any) => {
  logger.error(`API Error [${endpoint}]:`, error);
};

/**
 * Helper pour logger les actions utilisateur (analytics)
 */
export const logUserAction = (action: string, data?: any) => {
  logger.info(`User Action [${action}]:`, data);
};

/**
 * Affichage de l'environnement au démarrage
 */
if (isDevelopment) {
  logger.info("🚀 Application en mode DÉVELOPPEMENT");
  logger.info(`📝 Logs activés (niveau: ${logLevel})`);
} else {
  // En production, affichage minimal
  if (shouldLog("info")) {
    console.log("🏭 Application en mode PRODUCTION");
    console.log(`📝 Niveau de log: ${logLevel}`);
  }
}

export default logger;
