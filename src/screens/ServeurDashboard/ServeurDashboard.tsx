import React from "react";
import { useOrders, useOrderStats } from "../../hooks/useOrderAPI";
import { useToast } from "../../hooks/useToast";
import { Sidebar } from "./Sidebar";
import { ServeurHeaderSection } from "./sections/ServeurHeaderSection";
import { ServeurOrdersSection } from "./sections/ServeurOrdersSection";
import { ServeurOrdersHistorySection } from "./sections/ServeurOrdersHistorySection/ServeurOrdersHistorySection";
import ToastContainer from "../../components/ui/toast-container";

export const ServeurDashboard: React.FC = () => {
  const [section, setSection] = React.useState<"commandes" | "historique">(
    "commandes"
  );

  // Récupération des hooks pour pouvoir rafraîchir les données depuis le header
  const { refetch: refetchOrders } = useOrders();
  const { refetch: refetchStats } = useOrderStats();
  const { toasts, hideToast } = useToast();
  return (
    <main className="bg-[#EFF1F3] flex flex-row w-full min-h-screen overflow-x-hidden">
      <Sidebar selected={section} onSelect={setSection} />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 w-full min-w-0">
        {/* En-tête secondaire avec fonctions de rafraîchissement */}
        <ServeurHeaderSection
          onOrdersRefresh={refetchOrders}
          onStatsRefresh={refetchStats}
          selectedSection={section}
          onSectionSelect={setSection}
        />{" "}
        {/* Section principale */}
        <div className="w-full min-w-0 pb-20 lg:pb-0">
          <div className=" px-3 md:px-6 lg:px-12 xl:px-20 pt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Serveur -{" "}
              {section === "commandes" ? "Commandes" : "Historique"}
            </h1>
          </div>
          {section === "commandes" ? (
            <ServeurOrdersSection />
          ) : (
            <ServeurOrdersHistorySection />
          )}{" "}
        </div>
      </div>

      {/* Container pour les toasts */}
      <ToastContainer toasts={toasts} onToastClose={hideToast} />
    </main>
  );
};
