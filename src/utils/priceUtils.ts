/**
 * Formate un prix en ajoutant des espaces comme séparateurs de milliers
 * @param price - Le prix à formater
 * @returns Le prix formaté sous forme de chaîne
 */
export const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Formate un prix avec la devise XOF
 * @param price - Le prix à formater
 * @returns Le prix formaté avec la devise
 */
export const formatPriceWithCurrency = (price: number): string => {
  return `${formatPrice(price)} XOF`;
};
