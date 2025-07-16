import { useState } from "react";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Calendar,
  Download,
  MagnifyingGlass,
  Receipt,
  TrendDown,
  TrendUp,
  Money,
  Package,
} from "phosphor-react";

interface Transaction {
  id: string;
  type: "paiement" | "sortie" | "inventaire";
  description: string;
  montant: number;
  date: string;
  heure: string;
  reference?: string;
  statut: "validé" | "en_attente" | "refusé";
  caissier: string;
  justificatif?: string;
}

export const CaisseHistoriqueList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("tous");
  const [filterDate, setFilterDate] = useState("");

  // Mock data pour l'historique
  const transactions: Transaction[] = [
    {
      id: "TXN001",
      type: "paiement",
      description: "Commande #CMD-2024-001",
      montant: 15000,
      date: "2024-01-15",
      heure: "14:30",
      reference: "CMD-2024-001",
      statut: "validé",
      caissier: "Marie Kouakou",
    },
    {
      id: "TXN002",
      type: "sortie",
      description: "Achat de provisions",
      montant: -5000,
      date: "2024-01-15",
      heure: "11:45",
      statut: "validé",
      caissier: "Marie Kouakou",
      justificatif: "facture_provisions.pdf",
    },
    {
      id: "TXN003",
      type: "paiement",
      description: "Commande #CMD-2024-002",
      montant: 8500,
      date: "2024-01-15",
      heure: "13:15",
      reference: "CMD-2024-002",
      statut: "validé",
      caissier: "Jean Diabaté",
    },
    {
      id: "TXN004",
      type: "inventaire",
      description: "Inventaire journalier",
      montant: 125000,
      date: "2024-01-14",
      heure: "18:00",
      statut: "validé",
      caissier: "Marie Kouakou",
    },
    {
      id: "TXN005",
      type: "sortie",
      description: "Carburant livraison",
      montant: -3000,
      date: "2024-01-14",
      heure: "16:20",
      statut: "en_attente",
      caissier: "Jean Diabaté",
      justificatif: "recu_carburant.jpg",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "paiement":
        return <TrendUp size={16} className="text-green-600" />;
      case "sortie":
        return <TrendDown size={16} className="text-red-600" />;
      case "inventaire":
        return <Package size={16} className="text-blue-600" />;
      default:
        return <Money size={16} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "paiement":
        return "Paiement";
      case "sortie":
        return "Sortie";
      case "inventaire":
        return "Inventaire";
      default:
        return type;
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "validé":
        return <Badge className="bg-green-100 text-green-700">Validé</Badge>;
      case "en_attente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>
        );
      case "refusé":
        return <Badge className="bg-red-100 text-red-700">Refusé</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.caissier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "tous" || transaction.type === filterType;
    const matchesDate = !filterDate || transaction.date === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const handleExportHistory = () => {
    // Ici, vous implémenterez l'export de l'historique
    console.log("Export de l'historique des transactions");
  };

  const formatMontant = (montant: number) => {
    const formatted = Math.abs(montant).toLocaleString("fr-FR");
    return montant >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Filtres de recherche
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative mt-2">
              <Input
                id="search"
                type="text"
                placeholder="Commande, caissier, référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type-filter">Type de transaction</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="paiement">Paiements</SelectItem>
                <SelectItem value="sortie">Sorties</SelectItem>
                <SelectItem value="inventaire">Inventaires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="date-filter">Date</Label>
            <div className="relative mt-2">
              <Input
                id="date-filter"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10"
              />
              <Calendar
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={handleExportHistory}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exporter l'historique
          </Button>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Historique des transactions ({filteredTransactions.length})
          </h3>
        </div>

        <div className="divide-y">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Receipt size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Aucune transaction trouvée</p>
              <p className="text-sm">
                Modifiez vos filtres pour voir plus de résultats
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-sm font-medium text-gray-600">
                        {getTypeLabel(transaction.type)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>
                          {transaction.date} à {transaction.heure}
                        </span>
                        <span>•</span>
                        <span>Par {transaction.caissier}</span>
                        {transaction.reference && (
                          <>
                            <span>•</span>
                            <span>Réf: {transaction.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${
                          transaction.montant >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatMontant(transaction.montant)} XOF
                      </div>
                      {transaction.justificatif && (
                        <div className="text-xs text-blue-600 mt-1">
                          Justificatif joint
                        </div>
                      )}
                    </div>

                    {getStatutBadge(transaction.statut)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
