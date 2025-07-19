import { X, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Order } from "../../types/order";
import { getOrderItemImage } from "../../services/imageService";
import { OrderStatusBadge } from "../ui/order-status-badge";
import { CreditCard, Money } from "phosphor-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

// Utilisation du service d'images centralisé
// const IMAGE_BASE_URL = import.meta.env.VITE_API_URL || "";

export const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps): JSX.Element => {
  if (!order) return <></>;

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const getTotalItems = (): number => {
    return order.items.reduce((total, item) => total + item.quantite, 0);
  };

  // Fonction pour obtenir l'icône de paiement
  const getPaymentIcon = (modePaiement: string) => {
    const iconProps = {
      size: 20,
      strokeweigh: "1.5",
      color: "#F97316" as const,
    };

    // Si le mode de paiement est vide ou non défini
    if (!modePaiement) {
      return (
        <div className="flex w-8 h-8 text-gray-400 items-center justify-center rounded-full flex-shrink-0 bg-gray-10">
          <HelpCircle {...iconProps} />
        </div>
      );
    }

    switch (modePaiement.toLowerCase()) {
      case "especes":
        return (
          <div className="flex w-8 h-8 text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0 bg-orange-100">
            <Money {...iconProps} />
          </div>
        );
      case "carte_bancaire":
      case "carte":
        return (
          <div className="flex w-8 h-8 text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0 bg-orange-100">
            <CreditCard {...iconProps} />
          </div>
        );
      case "wave":
        return (
          <img
            src="/img/wave.jpg"
            alt="Wave"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "mtn_money":
        return (
          <img
            src="/img/mtn_money.jpg"
            alt="MTN Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "orange_money":
        return (
          <img
            src="/img/orange_money.jpg"
            alt="Orange Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      case "moov_money":
        return (
          <img
            src="/img/moov_money.jpg"
            alt="Moov Money"
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      default:
        return (
          <div className="flex w-8 h-8 items-center justify-center rounded-full flex-shrink-0 bg-orange-100">
            <Money {...iconProps} />
          </div>
        );
    }
  };

  // Fonction pour formater les noms des modes de paiement
  const formatPaymentMethodName = (
    modePaiement: string | undefined
  ): string => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto p-0 gap-0 rounded-3xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-title-t3-semibold text-gray-900">
              Détails de la commande
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>{" "}
        {/* Content */}
        <div className="p-6">
          {/* Order Number */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-title-t4-semibold text-gray-900">
                Commande #{order.numeroCommande}
              </h3>
              <OrderStatusBadge statut={order.statut} />
            </div>
            <p className="text-sm text-gray-500">
              ID: {order._id.slice(-6).toUpperCase()}
            </p>
          </div>{" "}
          {/* Additional Information */}
          {(order.numeroTable ||
            order.notes ||
            order.modePaiement ||
            order.motifAnnulation) && (
            <div className="mb-6 space-y-3">
              <h4 className="font-title-t5-semibold text-gray-900">
                Informations complémentaires
              </h4>

              {order.numeroTable && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Table:</span>
                  <span className="font-medium text-gray-900">
                    {order.numeroTable}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Paiement:</span>
                <div className="flex items-center gap-2">
                  {getPaymentIcon(order.modePaiement || "")}
                  <span className="font-medium text-gray-900">
                    {formatPaymentMethodName(order.modePaiement)}
                  </span>
                </div>
              </div>

              {order.motifAnnulation && (
                <div className="text-sm">
                  <span className="text-gray-600">Motif d'annulation:</span>
                  <p className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg font-medium text-red-800">
                    {order.motifAnnulation}
                  </p>
                </div>
              )}

              {order.notes && (
                <div className="text-sm">
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 p-2 bg-white rounded-lg font-bold text-gray-900">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-title-t5-semibold text-gray-900 mb-3">
              Articles commandés
            </h4>{" "}
            <div className="max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-10 rounded-xl"
                  >
                    {" "}
                    {/* Item Image */}
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {item.menuItem &&
                      typeof item.menuItem === "object" &&
                      item.menuItem.image ? (
                        <img
                          src={getOrderItemImage(item.menuItem.image)}
                          alt={item.nom || "Plat"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/img/plat_petit.png";
                          }}
                        />
                      ) : (
                        <img
                          src="/img/plat_petit.png"
                          alt="Plat"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-title-t5-semibold text-gray-900 truncate">
                        {item.nom || "Article"}
                      </h5>{" "}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Qté: {item.quantite}</span>
                        {item.prixUnitaire && (
                          <>
                            <span>•</span>
                            <span>{formatPrice(item.prixUnitaire)} XOF</span>
                          </>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-base font-bold text-gray-500 mt-1 truncate">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                    {/* Item Total */}
                    {item.prixUnitaire && (
                      <div className="text-right">
                        <span className="font-base font-bold text-gray-900">
                          {formatPrice(item.prixUnitaire * item.quantite)}
                        </span>{" "}
                        <span className="text-base font-bold text-gray-500">
                          XOF
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="space-y-3 p-4 bg-gray-10 rounded-xl">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Nombre de plats:</span>
              <span className="font-semibold text-gray-900">
                {getTotalItems().toString().padStart(2, "0")}{" "}
                {getTotalItems() > 1 ? "plats" : "plat"}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-title-t5-semibold text-gray-900">
                Coût total:
              </span>
              <div className="flex items-center gap-1">
                <span className="font-title-t4-semibold font-bold text-gray-900">
                  {formatPrice(order.montantTotal)}
                </span>{" "}
                <span className="font-title-t5-medium font-bold text-gray-500">
                  XOF
                </span>
              </div>
            </div>
          </div>{" "}
        </div>
      </DialogContent>
    </Dialog>
  );
};
