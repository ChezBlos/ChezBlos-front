import { X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Order } from "../../../../types/order";

interface AdminOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";

export const AdminOrderDetailsModal = ({
  isOpen,
  onClose,
  order,
}: AdminOrderDetailsModalProps): JSX.Element => {
  if (!order) return <></>;

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };
  const getTotalItems = (): number => {
    return order.items.reduce(
      (total: number, item: any) => total + item.quantite,
      0
    );
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPaymentMethodName = (
    modePaiement: string | undefined
  ): string => {
    if (!modePaiement) return "Non défini";

    switch (modePaiement.toUpperCase()) {
      case "ESPECES":
        return "Espèces";
      case "CARTE_BANCAIRE":
      case "CARTE":
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
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Order Number & Basic Info */}
          <div className="mb-6">
            <h3 className="font-title-t4-semibold text-gray-900 mb-1">
              Commande #{order.numeroCommande}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              ID: {order._id.slice(-6).toUpperCase()}
            </p>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-10 rounded-xl">
              <div>
                <span className="text-xs text-gray-500 block">Table</span>
                <span className="font-semibold text-gray-900">
                  {order.numeroTable || "Non définie"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Serveur</span>
                <span className="font-semibold text-gray-900">
                  {order.serveur
                    ? `${order.serveur.prenom} ${
                        order.serveur.nom || ""
                      }`.trim()
                    : "Non défini"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Statut</span>
                <span className="font-semibold text-gray-900">
                  {order.statut}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Paiement</span>
                <span className="font-semibold text-gray-900">
                  {formatPaymentMethodName(order.modePaiement)}
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-title-t5-semibold text-gray-900 mb-3">
              Articles commandés
            </h4>

            <div className="max-h-[300px] overflow-y-auto pr-2">
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-10 rounded-xl"
                  >
                    {/* Item Image */}
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      {item.menuItem &&
                      typeof item.menuItem === "object" &&
                      item.menuItem.image ? (
                        <img
                          src={`${IMAGE_BASE_URL}${item.menuItem.image}`}
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
                      </h5>
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
                        </span>
                        <span className="text-base font-bold text-gray-500 ml-1">
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
          <div className="space-y-3 p-4 bg-gray-10 rounded-xl mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Nombre de plats:</span>
              <span className="font-semibold text-gray-900">
                {getTotalItems().toString().padStart(2, "0")}{" "}
                {getTotalItems() > 1 ? "plats" : "plat"}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Date/Heure:</span>
              <span className="font-semibold text-gray-900">
                {formatDateTime(order.dateCreation)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-title-t5-semibold text-gray-900">
                Coût total:
              </span>
              <div className="flex items-center gap-1">
                <span className="font-title-t4-semibold font-bold text-gray-900">
                  {formatPrice(order.montantTotal)}
                </span>
                <span className="font-title-t5-medium font-bold text-gray-500">
                  XOF
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {order.notes && (
            <div className="space-y-3">
              <h4 className="font-title-t5-semibold text-gray-900">
                Notes de commande
              </h4>
              <div className="text-sm">
                <p className="p-3 bg-white rounded-lg font-bold text-gray-900 border border-gray-200">
                  {order.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
