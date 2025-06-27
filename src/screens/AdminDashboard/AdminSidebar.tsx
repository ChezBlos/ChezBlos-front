import React from "react";
import { Button } from "../../components/ui/button";
import {
  Users,
  ListBullets,
  Package,
  ChartBar,
  Receipt,
  Gear,
} from "@phosphor-icons/react";

interface AdminSidebarProps {
  selected:
    | "dashboard"
    | "staff"
    | "menu"
    | "historique"
    | "stock"
    | "statistiques"
    | "settings";
  onSelect: (
    section:
      | "dashboard"
      | "staff"
      | "menu"
      | "historique"
      | "stock"
      | "statistiques"
      | "settings"
  ) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  selected,
  onSelect,
}) => {
  const menuItems = [
    {
      id: "dashboard" as const,
      label: "Tableau de bord",
      icon: ChartBar,
    },
    {
      id: "staff" as const,
      label: "Gestion Staff",
      icon: Users,
    },
    {
      id: "menu" as const,
      label: "Gestion Menu",
      icon: Receipt,
    },
    {
      id: "historique" as const,
      label: "Historique",
      icon: ListBullets,
    },
    {
      id: "stock" as const,
      label: "Gestion du stock",
      icon: Package,
    },
    {
      id: "statistiques" as const,
      label: "Statistiques",
      icon: ChartBar,
    },
    {
      id: "settings" as const,
      label: "Paramètres",
      icon: Gear,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-200 py-8 px-4 gap-4 fixed left-0 top-0 z-10">
      <img src="/img/logo.png" alt="Logo" className="h-12 mb-8 mx-auto" />

      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={`flex items-center gap-3 px-4 py-6 text-lg font-semibold justify-start rounded-full transition-all duration-200 ${
            selected === item.id
              ? "bg-brand-primary-500 hover:text-white hover:bg-brand-primary-600 text-white"
              : "bg-gray-5 text-gray-80 hover:bg-brand-primary-50"
          }`}
          onClick={() => onSelect(item.id)}
        >
          <item.icon size={32} />
          <span>{item.label}</span>
        </Button>
      ))}
    </aside>
  );
};
