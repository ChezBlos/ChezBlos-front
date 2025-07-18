import React from "react";
import { Button } from "../../components/ui/button";
import { Package } from "phosphor-react";
import { CallBellIcon } from "@phosphor-icons/react";

interface SidebarProps {
  selected: "commandes" | "stock";
  onSelect: (section: "commandes" | "stock") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect }) => {
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
        <CallBellIcon size={32} />
        <span>Commandes</span>
      </Button>
      <Button
        variant="ghost"
        className={`flex items-center gap-3 px-4 py-6 text-white text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
          selected === "stock"
            ? "bg-brand-primary-500 hover:text-white hover:bg-brand-primary-600"
            : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
        }`}
        onClick={() => onSelect("stock")}
      >
        <Package size={32} />
        Gestion des stocks
      </Button>
    </aside>
  );
};
