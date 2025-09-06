import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ButtonSpinner } from "../ui/spinner";
import { Order } from "../../types/order";
import { formatPrice } from "../../utils/priceUtils";
import { getOrderItemImage } from "../../services/imageService";
import { CreditCard, Money } from "phosphor-react";

// Composant mémorisé pour l'image de commande
const MemoizedOrderImage = React.memo(({ order }: { order: Order | null }) => {
  if (!order?.items?.[0]?.menuItem) {
    return (
      <img
        src="/img/plat_petit.png"
        alt="Plat"
        className="w-full h-full object-cover"
      />
    );
  }

  const menuItem = order.items[0].menuItem;
  const imagePath = typeof menuItem === "object" ? menuItem.image : undefined;

  return (
    <img
      src={imagePath ? getOrderItemImage(imagePath) : "/img/plat_petit.png"}
      alt={typeof menuItem === "object" ? menuItem.nom : "Plat"}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = "/img/plat_petit.png";
      }}
    />
  );
});

MemoizedOrderImage.displayName = "MemoizedOrderImage";

interface SendToCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  selectedPaymentMethod: string;
  onPaymentMethodSelect: (method: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const SendToCashierModal: React.FC<SendToCashierModalProps> = ({
  isOpen,
  onClose,
  order,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onConfirm,
  isLoading,
}) => {
  const paymentMethods = [
    {
      id: "CARTE_BANCAIRE",
      label: "Carte de crédit",
      icon: (
        <CreditCard size={24} weight="regular" className="text-orange-600" />
      ),
      isImage: false,
    },
    {
      id: "ORANGE_MONEY",
      label: "Orange money",
      imageSrc: "/img/orange_money.jpg",
      isImage: true,
    },
    {
      id: "MTN_MONEY",
      label: "MTN money",
      imageSrc: "/img/mtn_money.jpg",
      isImage: true,
    },
    {
      id: "MOOV_MONEY",
      label: "Moov money",
      imageSrc: "/img/moov_money.jpg",
      isImage: true,
    },
    {
      id: "WAVE",
      label: "Wave",
      imageSrc: "/img/wave.jpg",
      isImage: true,
    },
    {
      id: "ESPECES",
      label: "Espèces",
      icon: <Money size={24} weight="regular" className="text-orange-600" />,
      isImage: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <div className="px-8 py-6">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Envoyer en caisse
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Sélectionnez le mode de paiement et envoyez la commande au
              caissier
            </p>
          </DialogHeader>

          {/* Info de la commande */}
          {order && (
            <div className="bg-gray-10 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                  <MemoizedOrderImage order={order} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Commande #{order.numeroCommande}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(order.montantTotal)} XOF
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid des options de paiement */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => onPaymentMethodSelect(method.id)}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {method.isImage ? (
                      <img
                        src={method.imageSrc}
                        alt={method.label}
                        className="w-12 h-12 object-cover"
                      />
                    ) : (
                      method.icon
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {method.label}
                  </span>
                </div>
                {selectedPaymentMethod === method.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 font-medium text-base rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!selectedPaymentMethod || isLoading}
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium text-base rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <ButtonSpinner />
                  Envoi en cours...
                </div>
              ) : (
                "Envoyer en caisse"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
