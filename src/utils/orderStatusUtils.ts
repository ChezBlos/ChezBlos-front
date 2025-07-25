/**
 * Utilitaires pour la gestion des statuts de commande
 */

export interface StatusBadgeInfo {
  label: string;
  color: string;
}

/**
 * Retourne les informations d'affichage pour un badge de statut de commande
 * @param statut - Le statut de la commande
 * @returns Objet contenant le label et les classes CSS de couleur
 */
export const getOrderStatusBadge = (statut: string): StatusBadgeInfo => {
  switch (statut) {
    case "EN_ATTENTE":
    case "en-attente":
      return {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-600 border-yellow-200",
      };
    case "EN_COURS":
    case "en-cours":
      return {
        label: "En cours",
        color: "bg-blue-100 text-blue-600 border-blue-200",
      };
    case "EN_PREPARATION":
    case "en-preparation":
      return {
        label: "En préparation",
        color: "bg-orange-100 text-orange-600 border-orange-200",
      };
    case "TERMINE":
    case "terminee":
      return {
        label: "Terminé",
        color: "bg-green-100 text-green-600 border-green-200",
      };
    case "EN_ATTENTE_PAIEMENT":
    case "en-attente-paiement":
      return {
        label: "Attente paiement",
        color: "bg-purple-100 text-purple-600 border-purple-200",
      };
    case "PRET":
    case "pret":
      return {
        label: "Prêt",
        color: "bg-emerald-100 text-emerald-600 border-emerald-200",
      };
    case "ANNULE":
    case "annule":
      return {
        label: "Annulé",
        color: "bg-red-100 text-red-600 border-red-200",
      };
    default:
      return {
        label: statut,
        color: "bg-gray-10 text-gray-600 border-gray-200",
      };
  }
};

/**
 * Retourne la couleur d'icône appropriée pour un statut
 * @param statut - Le statut de la commande
 * @returns Classe CSS de couleur pour les icônes
 */
export const getOrderStatusIconColor = (statut: string): string => {
  switch (statut) {
    case "EN_ATTENTE":
    case "en-attente":
      return "text-yellow-600";
    case "EN_COURS":
    case "en-cours":
      return "text-blue-600";
    case "EN_PREPARATION":
    case "en-preparation":
      return "text-orange-600";
    case "TERMINE":
    case "terminee":
      return "text-green-600";
    case "ANNULE":
    case "annule":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
