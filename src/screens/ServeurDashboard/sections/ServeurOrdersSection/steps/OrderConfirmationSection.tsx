import { ChevronLeft } from "lucide-react";
import { CheckCircle } from "phosphor-react";
import { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import {
  SpinnerLarge,
  ButtonSpinner,
} from "../../../../../components/ui/spinner";
import { useOrder } from "../../../../../contexts/OrderContext";
import { useTab } from "../../../../../contexts/TabContext";
import { logger } from "../../../../../utils/logger";

interface OrderConfirmationSectionProps {
  onClose?: () => void;
}

export const OrderConfirmationSection = ({
  onClose,
}: OrderConfirmationSectionProps): JSX.Element => {
  const { orderItems, getTotalAmount, createOrder, error, isEditMode } =
    useOrder();
  const { setCurrentTab, previousTab } = useTab();

  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  // Fonction pour créer la commande (appelée uniquement par le bouton)
  const handleCreateOrder = async () => {
    logger.debug("🎯 [OrderConfirmationSection] handleCreateOrder appelé");

    if (orderItems.length === 0) {
      logger.debug(
        "❌ [OrderConfirmationSection] Aucun article dans la commande"
      );
      setCreationError("Aucun article dans la commande");
      return;
    }

    logger.debug("🔄 [OrderConfirmationSection] Début de la création...");
    setIsCreating(true);
    setCreationError(null);

    try {
      logger.debug("🔥 [OrderConfirmationSection] Appel de createOrder()");
      const order = await createOrder();
      logger.debug(
        "📥 [OrderConfirmationSection] Résultat createOrder:",
        order
      );

      if (order) {
        logger.debug(
          "✅ [OrderConfirmationSection] Commande créée avec succès"
        );
        setCreatedOrder(order);
      } else {
        logger.debug(
          "❌ [OrderConfirmationSection] createOrder a retourné null"
        );
        setCreationError(error || "Erreur lors de la création de la commande");
      }
    } catch (err) {
      logger.debug("❌ [OrderConfirmationSection] Exception capturée:", err);
      setCreationError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      logger.debug("🏁 [OrderConfirmationSection] Fin de la création");
      setIsCreating(false);
    }
  };

  // const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = getTotalAmount();

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const handleTerminate = () => {
    setCurrentTab("selection");
    if (onClose) {
      onClose();
    }
  }; // Afficher un spinner pendant la création
  if (isCreating) {
    return (
      <div className="flex flex-col w-full h-full bg-white min-h-[600px]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8">
          <SpinnerLarge />
          <div className="text-center">
            {" "}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {isEditMode
                ? "Modification de votre commande..."
                : "Création de votre commande..."}
            </h2>
            <p className="text-base text-gray-600">
              Veuillez patienter pendant que nous{" "}
              {isEditMode ? "modifions" : "enregistrons"} votre commande.
            </p>
          </div>
        </div>
      </div>
    );
  } // Afficher une erreur si la création a échoué
  if (creationError) {
    return (
      <div className="flex flex-col w-full h-full bg-white min-h-[600px]">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8">
          <div className="w-[152px] h-[152px] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-6xl">✕</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            {" "}
            <h2 className="text-2xl font-semibold text-red-600">
              {isEditMode
                ? "Erreur lors de la modification"
                : "Erreur lors de la création"}
            </h2>
            <p className="text-base text-gray-600 max-w-sm">{creationError}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={previousTab}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }
  // Si la commande a été créée avec succès
  if (createdOrder) {
    return (
      <div className="flex flex-col w-full h-full bg-white min-h-[600px]">
        {/* Content Area - Scrollable */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8 overflow-y-auto">
          {/* Success Icon - 152x152px comme dans le design Figma */}
          <div className="w-[152px] h-[152px] flex items-center justify-center">
            <CheckCircle
              className="w-full h-full text-green-500"
              strokeWidth={1}
              weight="fill"
            />
          </div>

          {/* Title and Description */}
          <div className="flex flex-col items-center gap-2 text-center">
            {" "}
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? "Commande modifiée" : "Commande créée"}
            </h2>
            <p className="text-base text-gray-600 max-w-sm">
              Votre commande a été {isEditMode ? "modifiée" : "créée"} avec
              succès et est en cours de préparation.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="w-full bg-gray-10 rounded-2xl p-6">
            <div className="flex flex-col gap-4">
              {/* Order ID */}
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-600">
                  Commande :
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  #{createdOrder?.numeroCommande || "N/A"}
                </span>
              </div>

              {/* Number of items */}
              {/* <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-600">
                  Nombre de plats :
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {totalItems.toString().padStart(2, "0")}{" "}
                  {totalItems > 1 ? "plats" : "plat"}
                </span>
              </div> */}

              {/* Total */}
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-900">
                  Coût total :
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-base font-semibold text-gray-900">
                    {formatPrice(createdOrder?.montantTotal || totalAmount)}
                  </span>
                  <span className="text-base font-semibold text-gray-400">
                    XOF
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium text-gray-600">
                  Statut :
                </span>
                <span className="text-sm font-semibold text-orange-600">
                  {createdOrder?.statut === "EN_ATTENTE"
                    ? "En attente"
                    : createdOrder?.statut || "En attente"}
                </span>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Footer avec bouton Terminer */}
        <div className="flex flex-col w-full items-start justify-center gap-5 pt-6 pr-6 pb-6 pl-6 border-t border-gray-200 flex-shrink-0 mt-auto bg-white">
          <div className="flex items-center justify-between w-full">
            {/* Progress Dots */}
            <div className="flex flex-col items-start gap-2.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <div className="w-3 h-3 rounded-full bg-orange-500" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={previousTab}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-title-t5-bold text-[#181818]">
                  Retour
                </span>
              </Button>

              <Button
                onClick={handleTerminate}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Terminer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // État par défaut : afficher le résumé de commande avec bouton de confirmation
  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Content Area - Scrollable */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 py-8 overflow-y-auto">
        {/* Order Icon */}
        <div className="w-[152px] h-[152px] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-500 text-6xl">📋</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex flex-col items-center gap-2 text-center">
          {" "}
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEditMode
              ? "Confirmation de modification"
              : "Confirmation de commande"}
          </h2>
          <p className="text-base text-gray-600 max-w-sm">
            Vérifiez les détails de votre commande avant de la{" "}
            {isEditMode ? "modifier" : "finaliser"}.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="w-full bg-gray-10 rounded-2xl p-6">
          <div className="flex flex-col gap-4">
            {/* Number of items
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-600">
                Nombre de plats :
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {totalItems.toString().padStart(2, "0")}{" "}
                {totalItems > 1 ? "plats" : "plat"}
              </span>
            </div> */}
            {/* Items list */}
            <div className="border-b pb-4">
              <span className="text-sm font-medium text-gray-600 mb-3 block">
                Articles commandés :
              </span>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-900">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)} XOF
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Total */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-900">
                Coût total :
              </span>
              <div className="flex items-center gap-1">
                <span className="text-base font-semibold text-gray-900">
                  {formatPrice(totalAmount)}
                </span>
                <span className="text-base font-semibold text-gray-400">
                  XOF
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Footer avec bouton de confirmation */}
      <div className="flex flex-col w-full items-start justify-center gap-5 py-6 px-6 border-t border-gray-200 flex-shrink-0 mt-auto bg-white">
        <div className="flex items-center justify-between w-full">
          {/* Progress Dots */}
          <div className="flex flex-col items-start gap-2.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button
              onClick={previousTab}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-title-t5-bold text-[#181818]">Retour</span>
            </Button>

            {/* Confirm Button */}
            <Button
              onClick={handleCreateOrder}
              disabled={isCreating || orderItems.length === 0}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              {" "}
              {isCreating ? (
                <>
                  <ButtonSpinner />
                  {isEditMode ? "Modification..." : "Création..."}
                </>
              ) : isEditMode ? (
                "Modifier la commande"
              ) : (
                "Confirmer la commande"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
