import { useState, useEffect } from "react";
import { usePersonnelStats } from "../../../../hooks/useAdvancedStats";

// Composant de debug pour diagnostiquer le problème du PersonnelStatsSection
const PersonnelDebugComponent = () => {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [manualDateRange, setManualDateRange] = useState({
    dateDebut: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
  });

  // Test du hook usePersonnelStats
  const {
    data: personnelStats,
    loading: personnelLoading,
    error: personnelError,
    refetch: refetchPersonnelStats,
    lastUpdate,
  } = usePersonnelStats(
    manualDateRange.dateDebut,
    manualDateRange.dateFin,
    false, // Pas de polling pour le debug
    30000
  );

  // Collecte des informations de debug
  useEffect(() => {
    setDebugInfo({
      timestamp: new Date().toISOString(),
      hook: {
        personnelStats,
        personnelLoading,
        personnelError,
        lastUpdate,
      },
      localStorage: {
        token: localStorage.getItem("token") ? "Présent" : "Absent",
        userInfo: localStorage.getItem("userInfo") ? "Présent" : "Absent",
      },
      network: {
        host: window.location.host,
        origin: window.location.origin,
        pathname: window.location.pathname,
      },
      dateRange: manualDateRange,
    });
  }, [
    personnelStats,
    personnelLoading,
    personnelError,
    lastUpdate,
    manualDateRange,
  ]);

  // Test API manuel
  const testAPIManually = async () => {
    try {
      const token = localStorage.getItem("token");
      const baseURL = window.location.origin.includes("localhost:3000")
        ? "http://localhost:5000"
        : window.location.origin;

      const url = `${baseURL}/api/stats/performance-complete?periode=30days`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("🔍 Test API manuel:", { response: response.status, data });

      setDebugInfo((prev: Record<string, any>) => ({
        ...prev,
        manualAPITest: {
          status: response.status,
          ok: response.ok,
          dataReceived: !!data,
          employeeCount: data?.data?.detailsPersonnel?.length || 0,
          globalStats: data?.data?.statsGlobales || null,
        },
      }));
    } catch (error: unknown) {
      console.error("❌ Erreur test API manuel:", error);
      setDebugInfo((prev: Record<string, any>) => ({
        ...prev,
        manualAPITest: {
          error: error instanceof Error ? error.message : "Erreur inconnue",
        },
      }));
    }
  };

  const getStatusColor = () => {
    if (personnelLoading) return "text-blue-600";
    if (personnelError) return "text-red-600";
    if (personnelStats) return "text-green-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (personnelLoading) return "Chargement...";
    if (personnelError) return `Erreur: ${personnelError}`;
    if (personnelStats) {
      const employeeCount = personnelStats?.data?.detailsPersonnel?.length || 0;
      return `Données reçues (${employeeCount} employés)`;
    }
    return "Aucune donnée";
  };

  return (
    <div className="p-6 bg-gray-5 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        🔍 Debug Personnel Stats Component
      </h3>

      {/* Status général */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-semibold mb-2">Status général</h4>
        <p className={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
        {lastUpdate && (
          <p className="text-sm text-gray-500">
            Dernière mise à jour: {lastUpdate.toLocaleString()}
          </p>
        )}
      </div>

      {/* Contrôles */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-semibold mb-2">Contrôles</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={refetchPersonnelStats}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Recharger via Hook
          </button>
          <button
            onClick={testAPIManually}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Test API Manuel
          </button>
        </div>

        <div className="mt-2 flex gap-2 items-center">
          <label className="text-sm">Dates:</label>
          <input
            type="date"
            value={manualDateRange.dateDebut}
            onChange={(e) =>
              setManualDateRange((prev) => ({
                ...prev,
                dateDebut: e.target.value,
              }))
            }
            className="px-2 py-1 border rounded text-sm"
          />
          <span>à</span>
          <input
            type="date"
            value={manualDateRange.dateFin}
            onChange={(e) =>
              setManualDateRange((prev) => ({
                ...prev,
                dateFin: e.target.value,
              }))
            }
            className="px-2 py-1 border rounded text-sm"
          />
        </div>
      </div>

      {/* Données reçues */}
      {personnelStats && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-semibold mb-2">Données reçues</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>Succès:</strong> {personnelStats.success ? "Oui" : "Non"}
            </p>
            <p>
              <strong>Total personnel:</strong>{" "}
              {personnelStats.data?.statsGlobales?.totalPersonnel || 0}
            </p>
            <p>
              <strong>Personnel actif:</strong>{" "}
              {personnelStats.data?.statsGlobales?.personnelActif || 0}
            </p>
            <p>
              <strong>Détails personnel:</strong>{" "}
              {personnelStats.data?.detailsPersonnel?.length || 0} entrées
            </p>

            {personnelStats.data?.detailsPersonnel?.length > 0 && (
              <div className="mt-2">
                <p>
                  <strong>Premier employé:</strong>
                </p>
                <pre className="text-xs bg-gray-10 p-2 rounded overflow-x-auto">
                  {JSON.stringify(
                    personnelStats.data.detailsPersonnel[0],
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug complet */}
      <div className="p-3 bg-white rounded border">
        <h4 className="font-semibold mb-2">Informations complètes</h4>
        <pre className="text-xs bg-gray-10 p-2 rounded overflow-auto max-h-60">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default PersonnelDebugComponent;
