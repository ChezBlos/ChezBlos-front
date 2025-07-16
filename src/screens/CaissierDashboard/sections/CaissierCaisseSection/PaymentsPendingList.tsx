import { useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { CreditCard, Money, Check, Clock, Eye } from "phosphor-react";

// Types pour les commandes en attente de paiement
interface PaymentPendingOrder {
  _id: string;
  numeroCommande: string;
  numeroTable: number;
  montantTotal: number;
  modePaiement: string;
  serveur: {
    prenom: string;
    nom: string;
  };
  items: Array<{
    nom: string;
    quantite: number;
    prix: number;
  }>;
  dateCreation: string;
}

interface PaymentsPendingListProps {
  orders?: PaymentPendingOrder[];
  onProcessPayment?: (orderId: string) => void;
  onViewDetails?: (order: PaymentPendingOrder) => void;
}

export const PaymentsPendingList = ({
  orders = [],
  onProcessPayment,
  onViewDetails,
}: PaymentsPendingListProps) => {
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null
  );

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string): string => {
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

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "especes":
        return <Money size={20} className="text-green-600" />;
      case "carte_bancaire":
        return <CreditCard size={20} className="text-blue-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const handleProcessPayment = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      await onProcessPayment?.(orderId);
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <Clock size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2">
          Aucun paiement en attente
        </h3>
        <p className="text-sm">
          Les commandes envoyées par les serveurs apparaîtront ici pour
          traitement des paiements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id} className="border border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Informations de la commande */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 border-orange-300"
                  >
                    Table {order.numeroTable}
                  </Badge>
                  <span className="font-semibold text-gray-900">
                    Commande #{order.numeroCommande}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTime(order.dateCreation)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(order.modePaiement)}
                    <span className="font-medium text-gray-700">
                      {getPaymentMethodLabel(order.modePaiement)}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(order.montantTotal)} XOF
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">Serveur:</span>{" "}
                  {order.serveur.prenom} {order.serveur.nom}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {order.items.length} article
                  {order.items.length > 1 ? "s" : ""} •
                  {order.items
                    .map((item) => `${item.quantite}x ${item.nom}`)
                    .join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => onViewDetails?.(order)}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Eye size={16} className="mr-2" />
                  Détails
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleProcessPayment(order._id)}
                  disabled={processingOrderId === order._id}
                  className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                >
                  <Check size={16} className="mr-2" />
                  {processingOrderId === order._id
                    ? "Traitement..."
                    : "Encaisser"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
