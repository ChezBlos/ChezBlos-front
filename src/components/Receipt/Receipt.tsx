import React from "react";
import { Order } from "../../types/order";

interface ReceiptProps {
  order: Order;
  montantRecu?: number;
  monnaiRendue?: number;
  nomCaissier?: string;
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
  ({ order, montantRecu, monnaiRendue, nomCaissier }, ref) => {
    const formatPrice = (price: number): string => {
      return price.toLocaleString();
    };

    const formatPaymentMethod = (modePaiement: string | undefined): string => {
      if (!modePaiement) return "Non défini";

      switch (modePaiement.toUpperCase()) {
        case "ESPECES":
          return "Espèces";
        case "CARTE_BANCAIRE":
          return "Carte bancaire";
        case "WAVE":
          return "Wave";
        case "MTN_MONEY":
          return "MTN Money";
        case "ORANGE_MONEY":
          return "Orange Money";
        case "MOOV_MONEY":
          return "Moov Money";
        default:
          return modePaiement;
      }
    };

    const formatDateTime = (
      dateString: string
    ): { date: string; time: string } => {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("fr-FR"),
        time: date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    };

    const { date, time } = formatDateTime(order.dateCreation);

    return (
      <div
        ref={ref}
        className="bg-white p-6 max-w-sm mx-auto font-mono text-sm leading-tight"
        style={{
          fontFamily: "Gilroy, monospace",
          width: "80mm", // Largeur standard ticket de caisse
          minHeight: "auto",
        }}
      >
        {/* Header avec logo */}
        <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
          <img
            src="/img/logo.png"
            alt="Chez Blos"
            className="mx-auto mb-2 h-12 w-auto"
          />
          <h1 className="text-lg font-bold text-gray-900">CHEZ BLOS</h1>
          <p className="text-xs text-gray-600">Restaurant</p>
        </div>

        {/* Informations de commande */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between">
            <span>Heure:</span>
            <span>{time}</span>
          </div>
          <div className="flex justify-between">
            <span>Table:</span>
            <span>N° {order.numeroTable}</span>
          </div>
          <div className="flex justify-between">
            <span>Commande:</span>
            <span>#{order.numeroCommande}</span>
          </div>
          {nomCaissier && (
            <div className="flex justify-between">
              <span>Caissier:</span>
              <span>{nomCaissier}</span>
            </div>
          )}
        </div>

        {/* Ligne de séparation */}
        <div className="border-b border-dashed border-gray-400 mb-4"></div>

        {/* Articles */}
        <div className="mb-4">
          <div className="flex justify-between font-semibold mb-2 text-xs">
            <span>DESIGNATION</span>
            <span>QTE</span>
            <span>P.U.</span>
            <span>MONTANT</span>
          </div>

          {order.items.map((item, index) => {
            // Gérer le prix selon que menuItem est un objet ou un string
            const prix =
              typeof item.menuItem === "object"
                ? item.menuItem.prix
                : item.prixUnitaire || 0;

            return (
              <div key={index} className="mb-2">
                <div className="text-xs font-medium text-gray-900 mb-1">
                  {item.nom}
                </div>
                <div className="flex justify-between text-xs">
                  <span></span>
                  <span>{item.quantite}</span>
                  <span>{formatPrice(prix)}</span>
                  <span>{formatPrice(prix * item.quantite)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ligne de séparation */}
        <div className="border-b border-dashed border-gray-400 mb-4"></div>

        {/* Total */}
        <div className="mb-4 space-y-1">
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL À PAYER:</span>
            <span>{formatPrice(order.montantTotal)} XOF</span>
          </div>

          {montantRecu !== undefined && (
            <div className="flex justify-between">
              <span>Montant reçu:</span>
              <span>{formatPrice(montantRecu)} XOF</span>
            </div>
          )}

          {monnaiRendue !== undefined && monnaiRendue > 0 && (
            <div className="flex justify-between">
              <span>Monnaie rendue:</span>
              <span>{formatPrice(monnaiRendue)} XOF</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Mode de paiement:</span>
            <span>{formatPaymentMethod(order.modePaiement)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-gray-400 pt-4 text-center text-xs text-gray-600">
          <p>Merci pour votre visite!</p>
          <p>À bientôt chez Chez Blos</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
