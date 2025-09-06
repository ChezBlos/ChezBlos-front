import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CaissierHeaderSection } from "./sections/CaissierHeaderSection/CaissierHeaderSection";
import { CaissierOrderSection } from "./sections/CaissierOrderSection/CaissierOrderSection";
import { CaissierHistoriqueSection } from "./sections/CaissierHistoriqueSection/CaissierHistoriqueSection";
import { CaissierSidebar } from "./CaissierSidebar";
import { useOrders, useOrderStats } from "../../hooks/useOrderAPI";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ui/toast-container";

// Configuration des logs
const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || "debug";
const ENABLE_LOGS =
  LOG_LEVEL !== "error" &&
  (import.meta.env.DEV || import.meta.env.VITE_DEBUG_DASHBOARD === "true");

/**
 * Fonction de logging conditionnel pour le dashboard
 */
function logDashboard(message: string, ...args: any[]) {
  if (ENABLE_LOGS) {
    console.log(`🏠 [CAISSIER-DASHBOARD] ${message}`, ...args);
  }
}

export const CaissierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Récupération de la section depuis l'URL
  const getSectionFromUrl = (): "commandes" | "historique" => {
    const path = location.pathname;
    logDashboard("Current path:", path);
    if (path.includes("/historique")) {
      logDashboard("Detected historique section");
      return "historique";
    }
    logDashboard("Detected commandes section (default)");
    return "commandes";
  };

  const [selectedSection, setSelectedSection] = useState<
    "commandes" | "historique"
  >(getSectionFromUrl());

  // Récupération des hooks pour pouvoir rafraîchir les données depuis le header
  const { refetch: refetchOrders } = useOrders();
  const { refetch: refetchStats } = useOrderStats();
  const { toasts, hideToast } = useToast();

  // Synchronisation avec l'URL lors du changement de route
  useEffect(() => {
    const currentSection = getSectionFromUrl();
    if (currentSection !== selectedSection) {
      setSelectedSection(currentSection);
    }
  }, [location.pathname, selectedSection]);

  // Fonction pour gérer le changement de section avec mise à jour de l'URL
  const handleSectionChange = (section: "commandes" | "historique") => {
    setSelectedSection(section);

    // Mise à jour de l'URL selon la section
    const newPath =
      section === "historique" ? "/caissier/historique" : "/caissier/dashboard";

    navigate(newPath, { replace: true });
  };

  const renderContent = () => {
    logDashboard("renderContent called, selectedSection:", selectedSection);

    switch (selectedSection) {
      case "commandes":
        logDashboard("Rendering CaissierOrderSection");
        return <CaissierOrderSection onRefresh={handleRefresh} />;
      case "historique":
        logDashboard("Rendering CaissierHistoriqueSection");
        return <CaissierHistoriqueSection onRefresh={handleRefresh} />;
      default:
        logDashboard("Default case, rendering CaissierOrderSection");
        return <CaissierOrderSection onRefresh={handleRefresh} />;
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
        onSelect={handleSectionChange}
      />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 w-full min-w-0">
        {/* En-tête secondaire avec fonctions de rafraîchissement */}
        <CaissierHeaderSection
          selectedSection={selectedSection}
          onSectionSelect={handleSectionChange}
          onOrdersRefresh={refetchOrders}
          onStatsRefresh={refetchStats}
        />
        {/* Section principale */}
        <div className="w-full min-w-0 pb-20 lg:pb-0">
          <div className="px-3 md:px-6 lg:px-12 xl:px-20 pt-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Prise de Commande -{" "}
              {selectedSection === "commandes"
                ? "Nouvelle Commande"
                : "Historique"}
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
