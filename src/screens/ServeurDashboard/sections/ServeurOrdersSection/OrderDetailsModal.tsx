import { X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Order } from "../../../../types/order";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

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
        <div className="px-6 py-5">
          {/* Order Number */}
          <div className="mb-6">
            <h3 className="font-title-t4-semibold text-gray-900 mb-1">
              Commande #{order.numeroCommande}
            </h3>
            <p className="text-sm text-gray-500">
              ID: {order._id.slice(-6).toUpperCase()}
            </p>
          </div>{" "}
          {/* Items List */}
          <div className="mb-6">
            <h4 className="font-title-t5-semibold text-gray-900 mb-3">
              Articles commandés
            </h4>{" "}
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-10 rounded-xl"
                  >
                    {" "}
                    {/* Item Image */}
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          item.menuItem &&
                          typeof item.menuItem === "object" &&
                          item.menuItem.image
                            ? `${import.meta.env.VITE_IMAGE_BASE_URL}${
                                item.menuItem.image
                              }`
                            : "/img/plat_petit.png"
                        }
                        alt={item.nom || "Plat"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/img/plat_petit.png";
                        }}
                      />
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
          {/* Additional Information */}
          {(order.numeroTable || order.notes || order.modePaiement) && (
            <div className="mt-6 space-y-3">
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

              {order.modePaiement && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paiement:</span>
                  <span className="font-medium text-gray-900">
                    {order.modePaiement}
                  </span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
