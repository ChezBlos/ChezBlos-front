import { CreditCard, TrendDown, Package, FileText } from "phosphor-react";
import { Button } from "../../../../components/ui/button";

interface CaisseMobileBottomNavProps {
  activeTab: "paiements" | "sorties" | "inventaire" | "historique";
  onTabChange: (
    tab: "paiements" | "sorties" | "inventaire" | "historique"
  ) => void;
}

export const CaisseMobileBottomNav = ({
  activeTab,
  onTabChange,
}: CaisseMobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant="ghost"
          size="sm"
          className={`flex flex-col items-center gap-1 p-3 h-auto ${
            activeTab === "paiements"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-600"
          }`}
          onClick={() => onTabChange("paiements")}
        >
          <CreditCard size={20} />
          <span className="text-xs">Paiements</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex flex-col items-center gap-1 p-3 h-auto ${
            activeTab === "sorties"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-600"
          }`}
          onClick={() => onTabChange("sorties")}
        >
          <TrendDown size={20} />
          <span className="text-xs">Sorties</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex flex-col items-center gap-1 p-3 h-auto ${
            activeTab === "inventaire"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-600"
          }`}
          onClick={() => onTabChange("inventaire")}
        >
          <Package size={20} />
          <span className="text-xs">Inventaire</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex flex-col items-center gap-1 p-3 h-auto ${
            activeTab === "historique"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-600"
          }`}
          onClick={() => onTabChange("historique")}
        >
          <FileText size={20} />
          <span className="text-xs">Historique</span>
        </Button>
      </div>
    </div>
  );
};
