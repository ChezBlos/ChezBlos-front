import React, { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "./button";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import { MobileOrderFlow } from "./mobile-order-flow";
import NewOrderModal from "../modals/NewOrderModal";
import { Order } from "../../types/order";
import { OrderProvider } from "../../contexts/OrderContext";
import { MenuProvider } from "../../contexts/MenuContext";

interface NewOrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
  isEditMode?: boolean;
  onOrderCreated?: () => void;
}

export const NewOrderBottomSheet: React.FC<NewOrderBottomSheetProps> = ({
  isOpen,
  onClose,
  orderToEdit,
  isEditMode,
  onOrderCreated,
}) => {
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  const handleOpenDesktopModal = () => {
    setShowDesktopModal(true);
    onClose(); // Fermer le bottom sheet
  };
  const handleCloseDesktopModal = () => {
    setShowDesktopModal(false);
    if (onOrderCreated) {
      onOrderCreated();
    }
  };

  const handleOrderCreated = () => {
    // Callback appelée après création de commande réussie
    if (onOrderCreated) {
      onOrderCreated();
    }
    onClose(); // Fermer le bottom sheet après création
  };

  return (
    <>
      {/* Mobile Flow avec Bottom Sheets - visible uniquement sur mobile */}
      <div className="lg:hidden">
        <OrderProvider orderToEdit={orderToEdit} isEditMode={isEditMode}>
          <MenuProvider>
            {" "}
            <MobileOrderFlow
              isOpen={isOpen}
              onClose={onClose}
              orderToEdit={orderToEdit}
              isEditMode={isEditMode}
              onOrderCreated={handleOrderCreated}
            />
          </MenuProvider>
        </OrderProvider>
      </div>

      {/* Desktop Modal - visible uniquement sur desktop */}
      <div className="hidden lg:block">
        <MobileBottomSheet
          isOpen={isOpen && !showDesktopModal}
          onClose={onClose}
          title={isEditMode ? "Modifier la commande" : "Nouvelle commande"}
          subtitle="Ouvrir l'interface de commande complète"
          maxHeight="25vh"
        >
          <div className="space-y-3">
            <Button
              onClick={handleOpenDesktopModal}
              className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <PlusIcon className="w-5 h-5" />
              <span>
                {isEditMode ? "Ouvrir l'éditeur" : "Commencer une commande"}
              </span>
            </Button>

            <Button
              onClick={onClose}
              variant="outline"
              className="w-full py-4 rounded-xl font-medium"
            >
              Annuler
            </Button>
          </div>
        </MobileBottomSheet>

        {/* Modal plein écran pour desktop */}
        <NewOrderModal
          isOpen={showDesktopModal}
          onClose={handleCloseDesktopModal}
          orderToEdit={orderToEdit}
          isEditMode={isEditMode}
        />
      </div>
    </>
  );
};

interface MobileNewOrderBarProps {
  onClick: () => void;
  disabled?: boolean;
}

export const MobileNewOrderBar: React.FC<MobileNewOrderBarProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4">
      <Button
        onClick={onClick}
        disabled={disabled}
        className="w-full py-4 h-12 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 text-white rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Nouvelle Commande</span>
      </Button>
    </div>
  );
};
