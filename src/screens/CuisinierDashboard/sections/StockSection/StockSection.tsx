import { Package, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { SearchIcon } from "lucide-react";
import { useStockItems, useStockStats } from "../../../../hooks/useStockAPI";
import { StockItem } from "../../../../services/stockService";
import { AdjustStockModal } from "./AdjustStockModal";
import {
  formatUnite,
  formatUniteAbreviation,
} from "../../../../utils/uniteUtils";

export const StockSection = (): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Utilisation des hooks API réels
  const {
    data: stockItems,
    loading: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useStockItems();
  const { loading: statsLoading, error: statsError } = useStockStats();

  // Calcul des statistiques basées sur les vraies données avec protection
  const safeStockItems = Array.isArray(stockItems) ? stockItems : [];
  const totalItems = safeStockItems.length;
  const itemsEnAlerte = safeStockItems.filter(
    (item) => item.quantiteStock <= item.seuilAlerte
  ).length;
  const itemsCritiques = safeStockItems.filter(
    (item) => item.quantiteStock <= item.seuilAlerte * 0.5
  ).length;

  // Summary cards pour les stocks
  const summaryCards = [
    {
      title: "Total articles",
      value: totalItems.toString(),
      subtitle: "Articles en stock",
      subtitleColor: "text-blue-500",
      icon: <Package size={24} className="text-blue-500" />,
    },
    {
      title: "Alertes stock",
      value: itemsEnAlerte.toString(),
      subtitle: "Articles à réapprovisionner",
      subtitleColor: "text-orange-500",
      icon: <AlertTriangle size={24} className="text-orange-500" />,
    },
    {
      title: "Stock critique",
      value: itemsCritiques.toString(),
      subtitle: "Articles urgents",
      subtitleColor: "text-red-500",
      icon: <TrendingUp size={24} className="text-red-500" />,
    },
  ];

  // Fonction pour calculer le statut basé sur la quantité et le seuil
  const getItemStatus = (item: StockItem): "OK" | "FAIBLE" | "CRITIQUE" => {
    if (item.quantiteStock <= item.seuilAlerte * 0.5) return "CRITIQUE";
    if (item.quantiteStock <= item.seuilAlerte) return "FAIBLE";
    return "OK";
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "OK":
        return { label: "Stock OK", color: "bg-success-5 text-success-50" };
      case "FAIBLE":
        return { label: "Stock faible", color: "bg-warning-5 text-warning-50" };
      case "CRITIQUE":
        return {
          label: "Stock critique",
          color: "bg-destructive-5 text-destructive-50",
        };
      default:
        return { label: statut, color: "bg-gray-5 text-gray-20" };
    }
  };
  const filteredStock = safeStockItems.filter(
    (item) =>
      item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.categorie &&
        item.categorie.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdjustStock = (item: StockItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleStockAdjusted = () => {
    refetchItems(); // Recharger les données après ajustement
    handleModalClose();
  };

  if (itemsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500"></div>
      </div>
    );
  }

  if (itemsError || statsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertTriangle size={48} className="mb-4" />
        <p className="text-lg font-medium">Erreur de chargement</p>
        <p className="text-sm">{itemsError || statsError}</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 xl:px-20 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-white rounded-3xl overflow-hidden min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between w-full">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                  {card.title}
                </h3>
                {card.icon}
              </div>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
                  {card.value}
                </span>
                <span
                  className={`font-medium text-xs md:text-sm ${card.subtitleColor} truncate w-full`}
                >
                  {card.subtitle}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Stock List */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12 xl:px-20">
        <Card className="rounded-3xl overflow-hidden w-full">
          {/* Header */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Gestion des stocks
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher un article"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="w-full">
            {filteredStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <Package size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun article trouvé</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Essayez de modifier vos critères de recherche"
                    : "Les articles en stock apparaîtront ici"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    {" "}
                    <TableHeader>
                      <TableRow className="border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Article
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Catégorie
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Quantité
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Seuil d'alerte
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Statut
                        </TableHead>
                        <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>{" "}
                    <TableBody>
                      {filteredStock.map((item) => {
                        const itemStatus = getItemStatus(item);
                        const statusInfo = getStatusBadge(itemStatus);
                        return (
                          <TableRow
                            key={item._id}
                            className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                          >
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {item.nom}
                              </span>
                            </TableCell>{" "}
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-600">
                                {item.categorie || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-700">
                                {item.quantiteStock} {formatUnite(item.unite)}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-600">
                                {item.seuilAlerte} {formatUnite(item.unite)}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <Badge
                                className={`${statusInfo.color} px-2 py-1 rounded-full text-xs font-medium`}
                              >
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-full"
                                onClick={() => handleAdjustStock(item)}
                              >
                                Ajuster
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Cards */}{" "}
                <div className="md:hidden">
                  {filteredStock.map((item) => {
                    const itemStatus = getItemStatus(item);
                    const statusInfo = getStatusBadge(itemStatus);
                    return (
                      <div
                        key={item._id}
                        className="border-b border-slate-100 p-4 bg-white active:bg-gray-10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.nom}
                            </h3>{" "}
                            <p className="text-xs text-gray-500 mb-1">
                              {item.categorie || "N/A"}
                            </p>{" "}
                            <p className="text-sm text-gray-600">
                              {item.quantiteStock}{" "}
                              {formatUniteAbreviation(item.unite)} disponible(s)
                            </p>
                          </div>
                          <Badge
                            className={`${statusInfo.color} px-2 py-1 rounded-full text-xs font-medium`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          {" "}
                          <span>
                            Seuil: {item.seuilAlerte}{" "}
                            {formatUniteAbreviation(item.unite)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 rounded-full text-xs"
                            onClick={() => handleAdjustStock(item)}
                          >
                            Ajuster
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}{" "}
          </div>
        </Card>
      </div>{" "}
      {/* Modal d'ajustement de stock */}
      <AdjustStockModal
        stockItem={selectedItem}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleStockAdjusted}
      />
    </section>
  );
};
