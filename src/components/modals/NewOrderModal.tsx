import { XIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { MenuSection } from "../../screens/ServeurDashboard/sections/ServeurOrdersSection/steps/MenuSection";
import { ItemListSection } from "../../screens/ServeurDashboard/sections/ServeurOrdersSection/steps/ItemListSection";
import { OrderSummarySection } from "../../screens/ServeurDashboard/sections/ServeurOrdersSection/steps/OrderSummarySection";
import { OrderRecapSection } from "../../screens/ServeurDashboard/sections/ServeurOrdersSection/steps/OrderRecapSection";
import { OrderConfirmationSection } from "../../screens/ServeurDashboard/sections/ServeurOrdersSection/steps/OrderConfirmationSection";
import { OrderProvider, useOrder } from "../../contexts/OrderContext";
import { MenuProvider } from "../../contexts/MenuContext";
import { TabProvider, useTab } from "../../contexts/TabContext";
import { Order } from "../../types/order";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
  isEditMode?: boolean;
}

interface FrameScreenProps {
  onClose?: () => void;
  orderToEdit?: Order | null;
  isEditMode?: boolean;
}

const FrameScreenContent = ({ onClose }: FrameScreenProps): JSX.Element => {
  const { currentTab } = useTab();
  const { isEditMode } = useOrder();

  const renderTabContent = () => {
    switch (currentTab) {
      case "selection":
        return (
          <>
            <MenuSection />
            <ItemListSection />
          </>
        );
      case "recap":
        return <OrderRecapSection />;
      case "confirmation":
        return <OrderConfirmationSection onClose={onClose} />;
      default:
        return (
          <>
            <MenuSection />
            <ItemListSection />
          </>
        );
    }
  };

  const renderTabFooter = () => {
    switch (currentTab) {
      case "selection":
        return <OrderSummarySection />;
      case "recap":
      case "confirmation":
        return null; // Ces sections gèrent leur propre footer
      default:
        return <OrderSummarySection />;
    }
  };
  return (
    <Card className="flex flex-col w-full h-full relative bg-white rounded-[32px] overflow-hidden shadow-shadow-xl">
      {/* Header - Hidden for confirmation section */}
      {currentTab !== "confirmation" && (
        <header className="flex w-full items-center justify-between pt-6 pb-4 px-6 relative border-b border-slate-200 flex-shrink-0">
          {" "}
          <h1 className="font-gilroy text-2xl font-semibold text-gray-80">
            {isEditMode ? "Modifier la commande" : "Commande"}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex w-[38px] h-[38px] items-center justify-center p-0 bg-[#eff1f3] rounded-full"
          >
            <XIcon className="w-6 h-6" />
          </Button>
        </header>
      )}

      {/* Special handling for confirmation section */}
      {currentTab === "confirmation" ? (
        <div className="flex-1 overflow-y-auto relative">
          {/* Close button for confirmation - positioned absolutely */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex w-[38px] h-[38px] items-center justify-center p-0 bg-[#eff1f3] rounded-full"
          >
            <XIcon className="w-6 h-6" />
          </Button>
          {renderTabContent()}
        </div>
      ) : (
        <>
          {/* Content Area - Scrollable avec height fixe */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {renderTabContent()}
          </div>

          {/* Footer - Always Visible */}
          <div className="flex-shrink-0">{renderTabFooter()}</div>
        </>
      )}
    </Card>
  );
};

export const FrameScreen = ({
  onClose,
  orderToEdit,
  isEditMode,
}: FrameScreenProps): JSX.Element => {
  return (
    <OrderProvider orderToEdit={orderToEdit} isEditMode={isEditMode}>
      <MenuProvider>
        <TabProvider>
          <FrameScreenContent onClose={onClose} />
        </TabProvider>
      </MenuProvider>
    </OrderProvider>
  );
};

// Wrapper modal component for compatibility
const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  orderToEdit,
  isEditMode,
}) => {
  // Gestion du scroll de la page principale
  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll de la page principale
      document.body.style.overflow = "hidden";
      // Optionnel: ajouter du padding pour compenser la scrollbar qui disparaît
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Restaurer le scroll normal
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Cleanup function pour restaurer le scroll quand le composant se démonte
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />{" "}
      {/* Modal Content */}
      <div className="relative w-full max-w-3xl h-full max-h-[90vh] flex">
        <FrameScreen
          onClose={onClose}
          orderToEdit={orderToEdit}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
};

export default NewOrderModal;
