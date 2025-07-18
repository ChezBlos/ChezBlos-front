import React, { useState } from "react";
import { CaissierHeaderSection } from "./sections/CaissierHeaderSection/CaissierHeaderSection";
import { CaissierOrdersSection } from "./sections/CaissierOrdersSection/CaissierOrdersSection";
import { CaissierHistoriqueSection } from "./sections/CaissierHistoriqueSection/CaissierHistoriqueSection";
import { CaissierSidebar } from "./CaissierSidebar";
import { useOrders, useOrderStats } from "../../hooks/useOrderAPI";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ui/toast-container";

export const CaissierDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<
    "commandes" | "historique"
  >("commandes");

  // Récupération des hooks pour pouvoir rafraîchir les données depuis le header
  const { refetch: refetchOrders } = useOrders();
  const { refetch: refetchStats } = useOrderStats();
  const { toasts, hideToast } = useToast();

  const renderContent = () => {
    switch (selectedSection) {
      case "commandes":
        return <CaissierOrdersSection onRefresh={handleRefresh} />;
      case "historique":
        return <CaissierHistoriqueSection onRefresh={handleRefresh} />;
      default:
        return <CaissierOrdersSection onRefresh={handleRefresh} />;
    }
  };

  // Fonction pour rafraîchir toutes les données
  const handleRefresh = async () => {
    await Promise.all([refetchOrders(), refetchStats()]);
  };

  return (
    <main className="bg-[#EFF1F3] flex flex-row w-full min-h-screen overflow-x-hidden">
      <CaissierSidebar
        selected={selectedSection}
        onSelect={setSelectedSection}
      />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 w-full min-w-0">
        {/* En-tête secondaire avec fonctions de rafraîchissement */}
        <CaissierHeaderSection
          selectedSection={selectedSection}
          onSectionSelect={setSelectedSection}
          onOrdersRefresh={refetchOrders}
          onStatsRefresh={refetchStats}
        />
        {/* Section principale */}
        <div className="w-full min-w-0 pb-20 lg:pb-0">
          <div className="px-3 md:px-6 lg:px-12 xl:px-20 pt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Caissier -{" "}
              {selectedSection === "commandes" ? "Commandes" : "Historique"}
            </h1>
          </div>
          {renderContent()}
        </div>
      </div>

      {/* Container pour les toasts */}
      <ToastContainer toasts={toasts} onToastClose={hideToast} />
    </main>
  );
};
