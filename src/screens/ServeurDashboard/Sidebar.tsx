import React from "react";
import { Button } from "../../components/ui/button";
import { ListBullets, Users, CreditCard } from "phosphor-react";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  selected: "commandes" | "historique" | "caisse";
  onSelect: (section: "commandes" | "historique" | "caisse") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect }) => {
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-200 py-8 px-4 gap-4 fixed left-0 top-0 z-10">
      <img src="/img/logo.png" alt="Logo" className="h-12 mb-8 mx-auto" />
      <Button
        variant="ghost"
        className={`flex items-center gap-3 px-4 py-6 text-white text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
          selected === "commandes"
            ? "bg-brand-primary-500 hover:text-white hover:bg-brand-primary-600"
            : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
        }`}
        onClick={() => onSelect("commandes")}
      >
        <ListBullets size={32} />
        <span>Commandes</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex items-center gap-3 px-4 py-6 text-white text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
          selected === "historique"
            ? "bg-brand-primary-500 hover:bg-brand-primary-600"
            : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
        }`}
        onClick={() => onSelect("historique")}
      >
        <Users size={32} />
        <span>Historique</span>
      </Button>

      {/* Section Caisse - visible uniquement pour les caissiers */}
      {user?.isCaissier && (
        <Button
          variant="ghost"
          className={`flex items-center gap-3 px-4 py-6 text-white text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
            selected === "caisse"
              ? "bg-brand-primary-500 hover:bg-brand-primary-600"
              : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
          }`}
          onClick={() => onSelect("caisse")}
        >
          <CreditCard size={32} />
          <span>Caisse</span>
        </Button>
      )}
    </aside>
  );
};
