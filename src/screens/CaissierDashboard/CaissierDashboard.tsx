import React, { useState } from "react";
import { CaissierHeaderSection } from "./sections/CaissierHeaderSection/CaissierHeaderSection";
import { CaissierOrdersSection } from "./sections/CaissierOrdersSection/CaissierOrdersSection";
import { CaissierHistoriqueSection } from "./sections/CaissierHistoriqueSection/CaissierHistoriqueSection";
import { CaissierStatsSection } from "./sections/CaissierStatsSection/CaissierStatsSection";
import { CaissierCaisseSection } from "./sections/CaissierCaisseSection/CaissierCaisseSection";

export const CaissierDashboard: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<
    "commandes" | "caisse" | "historique" | "stats"
  >("caisse");

  const renderContent = () => {
    switch (selectedSection) {
      case "commandes":
        return <CaissierOrdersSection />;
      case "caisse":
        return <CaissierCaisseSection />;
      case "historique":
        return <CaissierHistoriqueSection />;
      case "stats":
        return <CaissierStatsSection />;
      default:
        return <CaissierCaisseSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-5">
      <CaissierHeaderSection
        selectedSection={selectedSection}
        onSectionSelect={setSelectedSection}
      />
      <div className="container mx-auto px-4 py-6">{renderContent()}</div>
    </div>
  );
};
