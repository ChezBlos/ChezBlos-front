/**
 * Utilitaires pour la gestion des unités de stock
 */

/**
 * Convertit les codes d'unités en noms complets français
 * @param unite - Le code de l'unité (ex: "KG", "LITRE", etc.)
 * @returns Le nom complet de l'unité en français (ex: "kilogrammes", "litres", etc.)
 */
export const formatUnite = (unite: string): string => {
  const unites: { [key: string]: string } = {
    // Poids
    KG: "kilogrammes",
    KILOGRAMME: "kilogrammes",
    GRAMME: "grammes",
    GRAM: "grammes",
    G: "grammes",

    // Volume
    LITRE: "litres",
    L: "litres",
    MILLILITRE: "millilitres",
    ML: "millilitres",

    // Quantité
    UNITE: "unités",
    U: "unités",
    PIECE: "pièces",
    PC: "pièces",

    // Autres unités courantes
    BOITE: "boîtes",
    CARTON: "cartons",
    SACHET: "sachets",
    BOUTEILLE: "bouteilles",
    PAQUET: "paquets",
  };

  return unites[unite.toUpperCase()] || unite.toLowerCase();
};

/**
 * Convertit les codes d'unités en abréviations pour l'affichage mobile
 * @param unite - Le code de l'unité (ex: "KG", "LITRE", etc.)
 * @returns L'abréviation de l'unité (ex: "kg", "L", etc.)
 */
export const formatUniteAbreviation = (unite: string): string => {
  const abreviations: { [key: string]: string } = {
    // Poids
    KG: "kg",
    KILOGRAMME: "kg",
    GRAMME: "g",
    GRAM: "g",
    G: "g",

    // Volume
    LITRE: "L",
    L: "L",
    MILLILITRE: "mL",
    ML: "mL",

    // Quantité
    UNITE: "u.",
    U: "u.",
    PIECE: "pc",
    PC: "pc",

    // Autres unités courantes
    BOITE: "boîte",
    CARTON: "carton",
    SACHET: "sachet",
    BOUTEILLE: "btl",
    PAQUET: "paquet",
  };

  return abreviations[unite.toUpperCase()] || unite.toLowerCase();
};

/**
 * Formate une quantité avec son unité
 * @param quantite - La quantité numérique
 * @param unite - Le code de l'unité
 * @returns La chaîne formatée (ex: "15 kilogrammes", "2.5 litres")
 */
export const formatQuantiteAvecUnite = (
  quantite: number,
  unite: string
): string => {
  return `${quantite} ${formatUnite(unite)}`;
};

/**
 * Obtient l'unité au singulier ou pluriel selon la quantité
 * @param quantite - La quantité numérique
 * @param unite - Le code de l'unité
 * @returns L'unité au singulier ou pluriel
 */
export const formatUniteSelonQuantite = (
  quantite: number,
  unite: string
): string => {
  const uniteFormatee = formatUnite(unite);

  // Si la quantité est 1 ou moins, utiliser le singulier
  if (quantite <= 1) {
    // Retirer le 's' final pour la plupart des unités
    if (uniteFormatee.endsWith("s") && !uniteFormatee.endsWith("ss")) {
      return uniteFormatee.slice(0, -1);
    }
  }

  return uniteFormatee;
};
