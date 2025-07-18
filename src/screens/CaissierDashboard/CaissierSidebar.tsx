import React from "react";
import { Button } from "../../components/ui/button";
import { CreditCard, Receipt } from "phosphor-react";

interface CaissierSidebarProps {
  selected: "commandes" | "historique";
  onSelect: (section: "commandes" | "historique") => void;
}

export const CaissierSidebar: React.FC<CaissierSidebarProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 py-8 px-4 gap-4 fixed left-0 top-0 h-screen">
      <img src="/img/logo.png" alt="Logo" className="h-12 mb-8 mx-auto" />

      <Button
        variant="ghost"
        className={`flex items-center gap-3 px-4 py-6 text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
          selected === "commandes"
            ? "bg-brand-primary-500 hover:text-white hover:bg-brand-primary-600 text-white"
            : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
        }`}
        onClick={() => onSelect("commandes")}
      >
        <CreditCard size={32} />
        <span>Commandes</span>
      </Button>

      <Button
        variant="ghost"
        className={`flex items-center gap-3 px-4 py-6 text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
          selected === "historique"
            ? "bg-brand-primary-500 hover:text-white hover:bg-brand-primary-600 text-white"
            : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
        }`}
        onClick={() => onSelect("historique")}
      >
        <Receipt size={32} />
        <span>Historique</span>
      </Button>
    </aside>
  );
};
