import React, { useState, useMemo } from "react";
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
import {
  Package,
  PlusCircle,
  PencilSimple,
  Trash,
  ArrowClockwise,
  DotsThreeVerticalIcon,
  DownloadIcon,
} from "@phosphor-icons/react";
import { Spinner } from "../../../../components/ui/spinner";
import { useStockItems } from "../../../../hooks/useStockAPI";
import AddStockModal from "../../../../components/modals/AddStockModal";
import EditStockModal from "../../../../components/modals/EditStockModal";
import { StockItem, StockService } from "../../../../services/stockService";
import { MagnifyingGlass } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../../components/ui/dropdown-menu";
import AdjustStockModal from "./AdjustStockModal";
import { ConfirmationModal } from "../../../../components/modals/ConfirmationModal";
import { FileSpreadsheet, FileText } from "lucide-react";
import {
  ExportService,
  ExportableStockItem,
} from "../../../../services/exportService";

export const AdminStockSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null); // Typé correctement
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data: stockItems, loading, error, refetch } = useStockItems();

  // Filtrage basé sur les vraies données
  const filteredItems = useMemo(() => {
    if (!stockItems || !Array.isArray(stockItems)) return [];
    let filtered = stockItems.filter(
      (item) =>
        item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fournisseur?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered;
  }, [stockItems, searchTerm]);

  // Calculs de statistiques
  const stats = useMemo(() => {
    if (!stockItems || !Array.isArray(stockItems))
      return {
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        inStock: 0,
      };
    const totalItems = stockItems.length;
    const lowStock = stockItems.filter(
      (item) => item.quantiteStock <= item.seuilAlerte && item.quantiteStock > 0
    ).length;
    const outOfStock = stockItems.filter(
      (item) => item.quantiteStock === 0
    ).length;
    const inStock = stockItems.filter(
      (item) => item.quantiteStock > item.seuilAlerte
    ).length;
    return { totalItems, lowStock, outOfStock, inStock };
  }, [stockItems]);

  // Extraction dynamique des catégories uniques
  const categories = useMemo(() => {
    if (!stockItems || !Array.isArray(stockItems)) return [];
    const set = new Set<string>();
    stockItems.forEach((item) => {
      if (item.categorie && item.categorie.trim() !== "")
        set.add(item.categorie);
    });
    return Array.from(set).sort();
  }, [stockItems]);

  const getStatusBadge = (quantiteStock: number, seuilAlerte: number) => {
    if (quantiteStock === 0) {
      return {
        color: "bg-red-100 text-red-800",
        label: "Rupture",
      };
    } else if (quantiteStock <= seuilAlerte) {
      return {
        color: "bg-orange-100 text-orange-800",
        label: "Stock faible",
      };
    } else {
      return {
        color: "bg-green-100 text-green-800",
        label: "En stock",
      };
    }
  };

  const handleExportToExcel = async () => {
    if (!filteredItems || filteredItems.length === 0) return;
    setIsExporting(true);
    try {
      await ExportService.exportStockToExcel(
        filteredItems as ExportableStockItem[]
      );
      // Optionnel: afficher une alerte de succès
    } catch (error) {
      alert("Erreur lors de l'export Excel du stock. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportToPDF = async () => {
    if (!filteredItems || filteredItems.length === 0) return;
    setIsExporting(true);
    try {
      await ExportService.exportStockToPDF(
        filteredItems as ExportableStockItem[]
      );
      // Optionnel: afficher une alerte de succès
    } catch (error) {
      alert("Erreur lors de l'export PDF du stock. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportStats = async () => {
    if (!filteredItems || filteredItems.length === 0) return;
    setIsExporting(true);
    try {
      await ExportService.exportStockStats(
        filteredItems as ExportableStockItem[]
      );
      // Optionnel: afficher une alerte de succès
    } catch (error) {
      alert(
        "Erreur lors de l'export des statistiques du stock. Veuillez réessayer."
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Erreur lors du chargement: {error}</p>
      </div>
    );
  }

  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards - inchangées */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        <Card className="flex-1 bg-white rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                Total articles
              </h3>
              {/* <Package className="h-8 w-8 text-blue-500" /> */}
            </div>
            <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
              {stats.totalItems}
            </span>
            <span className="font-medium text-xs md:text-sm text-blue-500 truncate w-full">
              Articles en stock
            </span>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-white rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                En stock
              </h3>
              {/* <CheckCircle className="h-8 w-8 text-green-500" /> */}
            </div>
            <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
              {stats.inStock}
            </span>
            <span className="font-medium text-xs md:text-sm text-green-500 truncate w-full">
              Articles au-dessus du seuil
            </span>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-white rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                Stock faible
              </h3>
              {/* <Warning className="h-8 w-8 text-orange-500" /> */}
            </div>
            <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
              {stats.lowStock}
            </span>
            <span className="font-medium text-xs md:text-sm text-orange-500 truncate w-full">
              Articles à surveiller
            </span>
          </CardContent>
        </Card>
        <Card className="flex-1 bg-white rounded-3xl overflow-hidden min-w-0">
          <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">
                Rupture
              </h3>
              {/* <XCircle className="h-8 w-8 text-red-500" /> */}
            </div>
            <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
              {stats.outOfStock}
            </span>
            <span className="font-medium text-xs md:text-sm text-red-500 truncate w-full">
              Articles à réapprovisionner
            </span>
          </CardContent>
        </Card>
      </div>
      {/* Carte principale */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and Search - Responsive */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Gestion des Stocks
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher un article"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  className="flex items-center rounded-full gap-2 h-10 md:h-12 px-3 md:px-4"
                >
                  <ArrowClockwise className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 flex rounded-full items-center gap-2 h-10 md:h-12 px-3 md:px-4"
                      disabled={
                        isExporting ||
                        !filteredItems ||
                        filteredItems.length === 0
                      }
                    >
                      {isExporting ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Exporter</span>
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleExportToExcel}
                      disabled={isExporting}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exporter en Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportToPDF}
                      disabled={isExporting}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Exporter en PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleExportStats}
                      disabled={isExporting}
                    >
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Statistiques Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 flex rounded-full items-center gap-2 h-10 md:h-12 px-3 md:px-4"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            </div>
          </div>
          {/* Table Content */}
          <div className="w-full">
            {filteredItems.length === 0 ? (
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
                    <TableHeader>
                      <TableRow className="bg-gray-10 border-b border-slate-200">
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
                          Seuil
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Prix
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Statut
                        </TableHead>
                        <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => {
                        const statusBadge = getStatusBadge(
                          item.quantiteStock,
                          item.seuilAlerte
                        );
                        return (
                          <TableRow
                            key={item._id}
                            className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                          >
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="font-medium text-gray-900">
                                {item.nom}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-600">
                                {item.categorie || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-700">
                                {item.quantiteStock} {item.unite}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="text-gray-600">
                                {item.seuilAlerte} {item.unite}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <span className="font-bold text-gray-700">
                                {item.prixAchat ? `${item.prixAchat}` : "-"}{" "}
                                <span className="text-gray-500">XOF</span>
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6">
                              <Badge
                                className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                              >
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-4 lg:px-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full"
                                  >
                                    <DotsThreeVerticalIcon className="h-5 w-5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsAdjustModalOpen(true);
                                    }}
                                  >
                                    Ajuster le stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsEditModalOpen(true);
                                    }}
                                  >
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setItemToDelete(item);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden">
                  {filteredItems.map((item) => {
                    const statusBadge = getStatusBadge(
                      item.quantiteStock,
                      item.seuilAlerte
                    );
                    return (
                      <div
                        key={item._id}
                        className="border-b border-slate-100 p-4 bg-white active:bg-gray-10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.nom}
                            </h3>
                            <p className="text-xs text-gray-500 mb-1">
                              {item.categorie || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantiteStock} {item.unite} disponible(s)
                            </p>
                          </div>
                          <Badge
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                          >
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Seuil: {item.seuilAlerte} {item.unite}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <PencilSimple className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setItemToDelete(item);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                /* TODO: ouvrir modal ajustement */
                              }}
                            >
                              <DotsThreeVerticalIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {item.fournisseur && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            Fournisseur: {item.fournisseur}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      {/* Modals à intégrer ici : AddStockModal, EditStockModal, ConfirmationModal, AdjustStockModal */}
      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (formData) => {
          try {
            await StockService.createStockItem(formData);
            setIsAddModalOpen(false);
            refetch();
          } catch (err: any) {
            alert(err.message || "Erreur lors de l'ajout de l'article");
          }
        }}
        categories={categories}
      />
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (id, formData) => {
          try {
            await StockService.updateStockItem(id, formData);
            setIsEditModalOpen(false);
            refetch();
          } catch (err: any) {
            alert(err.message || "Erreur lors de la modification de l'article");
          }
        }}
        stockItem={selectedItem}
        categories={categories}
      />
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setSelectedItem(null);
        }}
        stockItem={selectedItem}
        onSuccess={() => {
          refetch();
          setIsAdjustModalOpen(false);
          setSelectedItem(null);
        }}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={async () => {
          if (!itemToDelete) return;
          setIsDeleteLoading(true);
          try {
            await StockService.deleteStockItem(itemToDelete._id);
            setIsDeleteLoading(false);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            refetch();
          } catch (err: any) {
            setIsDeleteLoading(false);
            alert(err.message || "Erreur lors de la suppression de l'article");
          }
        }}
        title="Supprimer l'article du stock"
        message={
          itemToDelete
            ? `Êtes-vous sûr de vouloir supprimer définitivement l'article "${itemToDelete.nom}" ? Cette action est irréversible.`
            : ""
        }
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </section>
  );
};
