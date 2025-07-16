import { forwardRef } from "react";
import { Order } from "../../types/order";

interface ReceiptData {
  order: Order;
  montantRecu?: number;
  monnaieRendue?: number;
  caissier?: {
    nom: string;
    prenom: string;
  };
}

interface ReceiptComponentProps {
  data: ReceiptData;
}

export const ReceiptComponent = forwardRef<
  HTMLDivElement,
  ReceiptComponentProps
>(({ data }, ref) => {
  const { order, montantRecu, monnaieRendue, caissier } = data;

  // Formatage de la date et heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return {
      date: date.toLocaleDateString("fr-FR", dateOptions),
      time: date.toLocaleTimeString("fr-FR", timeOptions),
    };
  };

  // Formatage du prix
  const formatPrice = (price: number): string => {
    return price.toLocaleString("fr-FR");
  };

  // Formatage du mode de paiement
  const formatPaymentMethod = (method?: string): string => {
    if (!method) return "Non défini";

    switch (method.toUpperCase()) {
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
        return method;
    }
  };

  const { date, time } = formatDateTime(order.dateCreation);

  return (
    <div
      ref={ref}
      className="receipt bg-white p-6 max-w-sm mx-auto font-mono text-sm"
      style={{
        width: "58mm", // Largeur standard pour imprimantes thermiques
        fontSize: "12px",
        lineHeight: "1.4",
        fontFamily:
          'Gilroy, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header avec logo */}
      <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
        <img
          src="/img/logo.png"
          alt="Chez Blos"
          className="h-12 mx-auto mb-2"
          style={{ maxHeight: "48px" }}
        />
        <h1 className="font-bold text-lg">CHEZ BLOS</h1>
        <p className="text-xs text-gray-600">Restaurant & Cuisine</p>
      </div>

      {/* Informations de commande */}
      <div className="mb-4 text-center border-b border-dashed border-gray-300 pb-3">
        <p className="font-semibold">REÇU DE CAISSE</p>
        <p className="text-xs">N° {order.numeroCommande}</p>
        <p className="text-xs">
          {date} à {time}
        </p>
        {order.numeroTable && (
          <p className="text-xs">Table: {order.numeroTable}</p>
        )}
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex justify-between font-semibold text-xs border-b border-gray-300 pb-1 mb-2">
          <span>DÉSIGNATION</span>
          <span>QTÉ</span>
          <span>P.U.</span>
          <span>MONTANT</span>
        </div>

        {order.items.map((item, index) => {
          const prixUnitaire =
            item.prixUnitaire || (item.menuItem as any)?.prix || 0;
          const montantItem = prixUnitaire * item.quantite;

          return (
            <div key={index} className="mb-2">
              <div className="flex items-center text-xs">
                <span
                  className="flex-1 text-left mr-1"
                  style={{ minWidth: "40%" }}
                >
                  {item.nom || (item.menuItem as any)?.nom || "Article"}
                </span>
                <span className="w-8 text-center">{item.quantite}</span>
                <span className="w-12 text-right">
                  {formatPrice(prixUnitaire)}
                </span>
                <span className="w-12 text-right font-semibold">
                  {formatPrice(montantItem)}
                </span>
              </div>
              {item.notes && (
                <div className="text-xs text-gray-600 italic ml-1">
                  Note: {item.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totaux */}
      <div className="border-t-2 border-gray-400 pt-3 mb-4">
        <div className="flex justify-between font-bold text-base mb-2">
          <span>TOTAL À PAYER:</span>
          <span>{formatPrice(order.montantTotal)} XOF</span>
        </div>

        {montantRecu !== undefined && (
          <div className="flex justify-between text-sm">
            <span>Montant reçu:</span>
            <span>{formatPrice(montantRecu)} XOF</span>
          </div>
        )}

        {monnaieRendue !== undefined && monnaieRendue > 0 && (
          <div className="flex justify-between text-sm">
            <span>Monnaie rendue:</span>
            <span>{formatPrice(monnaieRendue)} XOF</span>
          </div>
        )}

        <div className="flex justify-between text-sm mt-2">
          <span>Mode de paiement:</span>
          <span>{formatPaymentMethod(order.modePaiement)}</span>
        </div>
      </div>

      {/* Informations du caissier */}
      <div className="border-t border-dashed border-gray-300 pt-3 mb-4">
        <div className="text-xs text-center">
          <p>
            Caissier:{" "}
            {caissier ? `${caissier.prenom} ${caissier.nom}` : "Non défini"}
          </p>
          <p>
            Serveur: {order.serveur.prenom} {order.serveur.nom}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t border-dashed border-gray-300 pt-3">
        <p>Merci de votre visite !</p>
        <p>À bientôt chez Blos</p>
      </div>

      {/* Styles pour l'impression */}
      <style>
        {`
        @media print {
          .receipt {
            width: 58mm !important;
            margin: 0 !important;
            padding: 5mm !important;
            font-size: 10px !important;
          }

          .receipt * {
            color: black !important;
            background: white !important;
          }

          .receipt img {
            max-height: 40px !important;
          }
        }
        `}
      </style>
    </div>
  );
});

ReceiptComponent.displayName = "ReceiptComponent";
