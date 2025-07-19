import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminHeaderSection } from "./sections/AdminHeaderSection/AdminHeaderSection";
import { AdminSidebar } from "./AdminSidebar";
import { AdminDashboardSection } from "./sections/AdminDashboardSection/AdminDashboardSection";
import { AdminStaffSection } from "./sections/AdminStaffSection/AdminStaffSection";
import { AdminHistoriqueSection } from "./sections/AdminHistoriqueSection/AdminHistoriqueSection";
import { AdminStockSection } from "./sections/AdminStockSection/AdminStockSection";
import { AdminStatistiquesSection } from "./sections/AdminStatistiquesSection/AdminStatistiquesSection";
import { AdminMenuSection } from "./sections/AdminMenuSection/AdminMenuSection";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extraire la section de l'URL, par défaut "dashboard"
  const getSectionFromPath = (pathname: string): string => {
    const match = pathname.match(/\/admin\/dashboard\/(.+)/);
    return match ? match[1] : "dashboard";
  };

  const [selectedSection, setSelectedSection] = useState<
    | "dashboard"
    | "staff"
    | "menu"
    | "historique"
    | "stock"
    | "statistiques"
    | "settings"
  >(getSectionFromPath(location.pathname) as any);

  // Synchroniser l'état avec l'URL lors du changement d'URL
  useEffect(() => {
    const newSection = getSectionFromPath(location.pathname);
    setSelectedSection(newSection as any);
  }, [location.pathname]);

  // Fonction pour changer de section et mettre à jour l'URL
  const handleSectionChange = (section: string) => {
    setSelectedSection(section as any);
    navigate(`/admin/dashboard/${section}`, { replace: true });
  };
  const renderSelectedSection = () => {
    switch (selectedSection) {
      case "dashboard":
        return <AdminDashboardSection onSectionSelect={handleSectionChange} />;
      case "staff":
        return <AdminStaffSection />;
      case "menu":
        return <AdminMenuSection onSectionSelect={handleSectionChange} />;
      case "historique":
        return <AdminHistoriqueSection />;
      case "stock":
        return <AdminStockSection />;
      case "statistiques":
        return <AdminStatistiquesSection />;
      case "settings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
            <p className="text-gray-600">
              Section en cours de développement...
            </p>
          </div>
        );
      default:
        return <AdminDashboardSection onSectionSelect={handleSectionChange} />;
    }
  };
  return (
    <main className="bg-white flex flex-row w-full min-h-screen overflow-x-hidden">
      <AdminSidebar selected={selectedSection} onSelect={handleSectionChange} />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 w-full min-w-0">
        {/* En-tête */}
        <AdminHeaderSection
          selectedSection={selectedSection}
          onSectionSelect={handleSectionChange}
        />

        {/* Section principale */}
        <div className="w-full min-w-0 pb-5 lg:pb-0">
          {renderSelectedSection()}
        </div>
      </div>
    </main>
  );
};
