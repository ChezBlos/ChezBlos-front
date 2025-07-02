import api from "./api";
import { DateFilterValue } from "../components/filters/DateFilter";
import { logger} from "../utils/logger";

export interface RecetteDay {
  _id: { year: number; month: number; day?: number };
  recettes: number;
  commandes: number;
}

export interface RecetteResponse {
  data: RecetteDay[];
}

/**
 * Service pour récupérer les recettes filtrées par date ou période.
 * Utilisable dans toutes les pages (Caisse, Statistiques, etc.)
 */
export async function getRecettes(
  filter: DateFilterValue,
  groupBy: "day" | "month" = "day"
): Promise<RecetteDay[]> {
  let url = "/recettes";
  let params: Record<string, string> = {
    groupBy,
  };
  if (filter.mode === "single") {
    params.date = filter.date;
  } else {
    params.startDate = filter.startDate;
    params.endDate = filter.endDate;
  }

  try {
    const res = await api.get<RecetteResponse>(url, { params });
    return res.data.data;
  } catch (error) {
    logger.error("[recetteService] Erreur API:", error);
    throw error;
  }
}
