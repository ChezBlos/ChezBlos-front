import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { CreditCard, Money } from "phosphor-react";

interface SendToCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
  selectedPaymentMethod: string;
  onPaymentMethodSelect: (method: string) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const SendToCashierModal = ({
  isOpen,
  onClose,
  order,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onConfirm,
  isLoading,
}: SendToCashierModalProps): JSX.Element => {
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const handleClose = () => {
    if (!isLoading) {
      onPaymentMethodSelect("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <div className="bg-gray-5 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200 bg-center bg-cover overflow-hidden flex-shrink-0">
                  {order.items?.[0]?.menuItem &&
                  typeof order.items[0].menuItem === "object" &&
                  order.items[0].menuItem.image ? (
                    <img
                      src={`http://localhost:3000/uploads/menu/${order.items[0].menuItem.image}`}
                      alt={order.items[0]?.nom || "Plat"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/img/plat_petit.png";
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
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    Commande #{order.numeroCommande}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Table {order.numeroTable} •{" "}
                    {formatPrice(order.montantTotal)} XOF
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid des options de paiement */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Carte bancaire */}
            <div
              onClick={() => onPaymentMethodSelect("CARTE_BANCAIRE")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "CARTE_BANCAIRE"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CreditCard
                    size={24}
                    weight="regular"
                    className="text-orange-600"
                  />
                </div>
                <span className="font-medium text-gray-900">
                  Carte de crédit
                </span>
              </div>
              {selectedPaymentMethod === "CARTE_BANCAIRE" && (
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

            {/* Orange Money */}
            <div
              onClick={() => onPaymentMethodSelect("ORANGE_MONEY")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "ORANGE_MONEY"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/img/orange_money.jpg"
                    alt="Orange Money"
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900">Orange money</span>
              </div>
              {selectedPaymentMethod === "ORANGE_MONEY" && (
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

            {/* MTN Money */}
            <div
              onClick={() => onPaymentMethodSelect("MTN_MONEY")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "MTN_MONEY"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/img/mtn_money.jpg"
                    alt="MTN Money"
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900">MTN money</span>
              </div>
              {selectedPaymentMethod === "MTN_MONEY" && (
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

            {/* Moov Money */}
            <div
              onClick={() => onPaymentMethodSelect("MOOV_MONEY")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "MOOV_MONEY"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/img/moov_money.jpg"
                    alt="Moov Money"
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900">Moov money</span>
              </div>
              {selectedPaymentMethod === "MOOV_MONEY" && (
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

            {/* Wave */}
            <div
              onClick={() => onPaymentMethodSelect("WAVE")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "WAVE"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/img/wave.jpg"
                    alt="Wave"
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <span className="font-medium text-gray-900">Wave</span>
              </div>
              {selectedPaymentMethod === "WAVE" && (
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

            {/* Espèces */}
            <div
              onClick={() => onPaymentMethodSelect("ESPECES")}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedPaymentMethod === "ESPECES"
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Money
                    size={24}
                    weight="regular"
                    className="text-orange-600"
                  />
                </div>
                <span className="font-medium text-gray-900">Espèces</span>
              </div>
              {selectedPaymentMethod === "ESPECES" && (
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
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
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
              {isLoading ? "Envoi en cours..." : "Envoyer en caisse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
