import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  PencilSimple,
  Trash,
  MagnifyingGlass,
  Eye,
  EyeSlash,
  ArrowClockwise,
  ForkKnife,
  DotsThreeVertical,
} from "@phosphor-icons/react";
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
import { Spinner } from "../../../../components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { MenuPagination } from "../../../../components/ui/MenuPagination";
import { useMenuWithPagination } from "../../../../hooks/useMenuWithPagination";
import { MenuItemResponse } from "../../../../types/menu";
import { MenuService } from "../../../../services/menuService";
import { useAlert } from "../../../../contexts/AlertContext";
import { ConfirmationModal } from "../../../../components/modals/ConfirmationModal";
import { AddMenuItemModal } from "../../../../components/modals/AddMenuItemModal";
import { EditMenuItemModal } from "../../../../components/modals/EditMenuItemModal";

interface AdminMenuSectionProps {
  onSectionSelect?: (
    section:
      | "dashboard"
      | "staff"
      | "menu"
      | "historique"
      | "stock"
      | "statistiques"
      | "export"
      | "caisse"
      | "settings"
  ) => void;
}

export const AdminMenuSection: React.FC<AdminMenuSectionProps> = ({}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemResponse | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // État pour conserver le total global d'éléments (sans filtre)
  const [totalItemsGlobal, setTotalItemsGlobal] = useState(0);
  // États pour les statistiques globales (indépendantes du filtrage)
  const [globalStats, setGlobalStats] = useState({
    availableItems: 0,
    unavailableItems: 0,
    categories: {
      PLAT_PRINCIPAL: 0,
      ENTREE: 0,
      DESSERT: 0,
      BOISSON: 0,
      ACCOMPAGNEMENT: 0,
    },
  });

  const {
    menuItems,
    loading,
    error,
    pagination,
    refreshMenu,
    setPage,
    setSearch,
    setCategorie,
    setDisponible,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  } = useMenuWithPagination({ limit: 20 });

  const { showAlert } = useAlert();

  // Fonction pour formater les catégories
  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      PLAT_PRINCIPAL: "Plat principal",
      ENTREE: "Entrée",
      DESSERT: "Dessert",
      BOISSON: "Boisson",
      ACCOMPAGNEMENT: "Accompagnement",
    };
    return categoryMap[category] || category;
  };

  // Gestion de la recherche avec debounce
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchTerm);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, setSearch]);

  // Gestion du filtrage par tab
  React.useEffect(() => {
    if (activeTab === "all") {
      setCategorie("");
      setDisponible(undefined);
    } else if (activeTab === "available") {
      setCategorie("");
      setDisponible(true);
    } else if (activeTab === "unavailable") {
      setCategorie("");
      setDisponible(false);
    } else {
      // C'est une catégorie spécifique
      setCategorie(activeTab);
      setDisponible(undefined);
    }
  }, [activeTab, setCategorie, setDisponible]);

  // Log des changements d'état
  React.useEffect(() => {
    console.log("📊 [ADMIN MENU] État:", {
      loading,
      error,
      menuItemsCount: menuItems?.length || 0,
      pagination,
    });
  }, [loading, error, menuItems, pagination]);

  // Sauvegarder le total global quand on est sur l'onglet "all" (sans filtres)
  React.useEffect(() => {
    if (activeTab === "all" && !loading && pagination.totalItems > 0) {
      setTotalItemsGlobal(pagination.totalItems);
      console.log(
        "💾 [ADMIN MENU] Total global sauvegardé:",
        pagination.totalItems
      );
    }
  }, [activeTab, loading, pagination.totalItems]);

  // Fonction pour récupérer les statistiques globales
  const fetchGlobalStats = React.useCallback(async () => {
    try {
      console.log("📈 [ADMIN MENU] Récupération des statistiques globales...");

      // Récupérer tous les articles sans filtres pour les statistiques
      const allItemsResponse = await MenuService.getMenuItems({
        limit: 1000, // Grande limite pour récupérer tous les éléments
      });

      const allItems = allItemsResponse.data;

      // Calculer les statistiques globales
      const stats = {
        availableItems: allItems.filter((item) => item.disponible).length,
        unavailableItems: allItems.filter((item) => !item.disponible).length,
        categories: {
          PLAT_PRINCIPAL: allItems.filter(
            (item) => item.categorie === "PLAT_PRINCIPAL"
          ).length,
          ENTREE: allItems.filter((item) => item.categorie === "ENTREE").length,
          DESSERT: allItems.filter((item) => item.categorie === "DESSERT")
            .length,
          BOISSON: allItems.filter((item) => item.categorie === "BOISSON")
            .length,
          ACCOMPAGNEMENT: allItems.filter(
            (item) => item.categorie === "ACCOMPAGNEMENT"
          ).length,
        },
      };

      setGlobalStats(stats);
      setTotalItemsGlobal(allItems.length);

      console.log("✅ [ADMIN MENU] Statistiques globales récupérées:", stats);
    } catch (error) {
      console.error(
        "❌ [ADMIN MENU] Erreur lors de la récupération des statistiques:",
        error
      );
    }
  }, []);

  // Récupérer les statistiques globales au chargement initial
  React.useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  // Obtenir les catégories uniques depuis le backend
  const categories = useMemo(() => {
    // Pour l'instant, utilisons les catégories prédéfinies
    // Plus tard, on pourrait récupérer les catégories dynamiquement depuis l'API
    return ["PLAT_PRINCIPAL", "ENTREE", "DESSERT", "BOISSON", "ACCOMPAGNEMENT"];
  }, []);

  // Calculs de statistiques à partir des données paginées
  const stats = useMemo(() => {
    console.log("📊 [ADMIN MENU] Calcul des stats avec pagination:", {
      totalItems: pagination.totalItems,
      currentPageItems: menuItems?.length || 0,
    });

    // Les stats sont maintenant basées sur le total global, pas seulement la page actuelle
    return {
      totalItems: totalItemsGlobal || pagination.totalItems || 0,
      availableItems: menuItems?.filter((item) => item.disponible).length || 0,
      unavailableItems:
        menuItems?.filter((item) => !item.disponible).length || 0,
      totalRevenue:
        menuItems?.reduce((sum, item) => sum + (item.prix || 0), 0) || 0,
    };
  }, [menuItems, pagination.totalItems, totalItemsGlobal]);
  const tabs = [
    {
      id: "all",
      label: "Tous",
      count: totalItemsGlobal || 0,
    },
    {
      id: "available",
      label: "Disponibles",
      count: globalStats.availableItems || 0,
    },
    {
      id: "unavailable",
      label: "Indisponibles",
      count: globalStats.unavailableItems || 0,
    },
    ...categories.map((cat) => ({
      id: cat,
      label: formatCategory(cat),
      count:
        globalStats.categories[cat as keyof typeof globalStats.categories] || 0,
    })),
  ];

  const handleCreateMenuItem = async (formData: FormData) => {
    setIsCreating(true);
    try {
      console.log("➕ [ADMIN MENU] Début de la création via nouveau modal");

      const newItem = await createMenuItem(formData);
      console.log("✅ [ADMIN MENU] Article créé:", newItem);

      setIsCreateModalOpen(false);
      await refreshMenu();
      await fetchGlobalStats(); // Rafraîchir les statistiques globales
      showAlert("success", `Article "${newItem.nom}" créé avec succès !`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("❌ [ADMIN MENU] Erreur création:", errorMessage);
      showAlert("error", `Erreur lors de la création: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditMenuItem = async (id: string, formData: FormData) => {
    setIsEditing(true);
    try {
      console.log(
        "✏️ [ADMIN MENU] Début de la modification via nouveau modal:",
        id
      );

      const updatedItem = await updateMenuItem(id, formData);
      console.log("✅ [ADMIN MENU] Article modifié:", updatedItem);

      setIsEditModalOpen(false);
      setSelectedItem(null);
      await refreshMenu();
      await fetchGlobalStats(); // Rafraîchir les statistiques globales
      showAlert(
        "success",
        `Article "${updatedItem.nom}" modifié avec succès !`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("❌ [ADMIN MENU] Erreur modification:", errorMessage);
      showAlert("error", `Erreur lors de la modification: ${errorMessage}`);
    } finally {
      setIsEditing(false);
    }
  };

  // Gestion de la suppression d'un article avec ConfirmationModal
  const handleDeleteItem = (id: string, itemName: string) => {
    setItemToDelete({ id, name: itemName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMenuItem(itemToDelete.id);
      await refreshMenu();
      await fetchGlobalStats(); // Rafraîchir les statistiques globales
      showAlert(
        "success",
        `Article "${itemToDelete.name}" supprimé avec succès !`
      );
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      showAlert("error", `Erreur lors de la suppression: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteItem = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };
  const handleToggleAvailability = async (id: string, itemName?: string) => {
    try {
      const updatedItem = await toggleItemAvailability(id);
      // Rafraîchir la liste pour avoir les dernières données du serveur
      await refreshMenu();
      await fetchGlobalStats(); // Rafraîchir les statistiques globales
      const statusText = updatedItem.disponible ? "disponible" : "indisponible";
      showAlert(
        "success",
        `Article ${
          itemName ? `"${itemName}"` : ""
        } marqué comme ${statusText} !`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      showAlert(
        "error",
        `Erreur lors du changement de disponibilité: ${errorMessage}`
      );
    }
  };
  const openEditModal = (item: MenuItemResponse) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // Utiliser useAlert pour afficher les erreurs de chargement
  React.useEffect(() => {
    if (error) {
      showAlert("error", `Problème de connexion: ${error}`);
    }
  }, [error, showAlert]);

  // Summary cards data adaptées pour la section menu
  const summaryCards = [
    {
      title: "Total articles",
      mobileTitle: "Total",
      value: loading
        ? "..."
        : (totalItemsGlobal || pagination.totalItems || 0).toString(),
      subtitle: "Articles au menu",
      subtitleColor: "text-blue-500",
    },
    {
      title: "Disponibles",
      mobileTitle: "Dispo",
      value: loading ? "..." : (globalStats.availableItems || 0).toString(),
      subtitle: `${
        totalItemsGlobal && totalItemsGlobal > 0
          ? Math.round(
              ((globalStats.availableItems || 0) / totalItemsGlobal) * 100
            )
          : 0
      }% du total`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Indisponibles",
      mobileTitle: "Indispo",
      value: loading ? "..." : (globalStats.unavailableItems || 0).toString(),
      subtitle: `${
        totalItemsGlobal && totalItemsGlobal > 0
          ? Math.round(
              ((globalStats.unavailableItems || 0) / totalItemsGlobal) * 100
            )
          : 0
      }% du total`,
      subtitleColor: "text-red-500",
    },
    {
      title: "Valeur totale",
      mobileTitle: "Valeur",
      value: loading
        ? "..."
        : new Intl.NumberFormat("fr-FR").format(stats.totalRevenue || 0),
      currency: loading ? "" : "XOF",
      subtitle: `Prix cumulé`,
      subtitleColor: "text-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center  h-[70vh]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500 text-center max-w-md">
          <strong>Erreur lors du chargement du menu:</strong>
          <br />
          {error}
        </p>
        <Button onClick={refreshMenu} variant="outline" className="gap-2">
          <ArrowClockwise className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }
  return (
    <section className="flex flex-col w-full gap-4 md:gap-6">
      {/* Summary Cards - Horizontal Flex Layout */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                <span className="hidden md:block">{card.title}</span>
                <span className="block md:hidden">
                  {card.mobileTitle || card.title}
                </span>
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <div className="flex items-start gap-1 w-full min-w-0">
                  <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
                    {card.value}
                  </span>{" "}
                  {card.currency && (
                    <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-600 flex-shrink-0">
                      {card.currency}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-1 w-full min-w-0">
                  <span
                    className={`font-medium text-xs md:text-sm ${card.subtitleColor} truncate w-full`}
                  >
                    {card.subtitle}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Carte principale avec header style harmonisé */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header - Style harmonisé avec AdminStaffSection */}
          <div className="flex flex-col bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              {" "}
              <div className="flex-shrink-0">
                <h2 className="font-bold text-3xl md:text-xl lg:text-2xl text-gray-900 truncate">
                  Gestion du Menu
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher par nom ou description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <MagnifyingGlass className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2 bg-brand-primary-500 hover:bg-brand-primary-600 text-white rounded-full px-4 py-2 h-10 md:h-12"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
              </div>
            </div>
          </div>
          {/* Tabs - Structure harmonisée avec AdminHistoriqueSection */}
          <div className="overflow-x-auto scrollbar-hide w-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm truncate">
                      {tab.label}
                    </span>
                    <Badge className="bg-brand-primary-500 text-white text-xs ml-1 px-2 py-1 rounded-full">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>{" "}
            </Tabs>
          </div>{" "}
          {/* Table Content */}
          <div className="w-full">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Spinner className="h-8 w-8" />
              </div>
            ) : menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <ForkKnife size={48} className="mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun article trouvé</p>
                <p className="text-sm">
                  {searchTerm
                    ? "Essayez de modifier vos critères de recherche"
                    : "Commencez par ajouter des articles au menu"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    {" "}
                    <TableHeader>
                      <TableRow className="bg-gray-10 border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Article
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Catégorie
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
                      {menuItems.map((item: MenuItemResponse) => (
                        <TableRow
                          key={item._id}
                          className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                        >
                          {" "}
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.nom}
                                    className="w-12 h-12 object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                ) : null}
                                <ForkKnife
                                  className={`h-5 w-5 text-gray-600 ${
                                    item.imageUrl ? "hidden" : ""
                                  }`}
                                />
                              </div>{" "}
                              <div className="flex flex-col min-w-0">
                                <div className="font-semibold text-base text-gray-900 truncate">
                                  {item.nom}
                                </div>
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  {item.description || "Aucune description"}
                                </div>
                              </div>
                            </div>
                          </TableCell>{" "}
                          <TableCell className="py-4 px-4 lg:px-6">
                            <span className="font-semibold text-base truncate">
                              {formatCategory(item.categorie)}
                            </span>
                          </TableCell>{" "}
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="font-semibold text-base truncate max-w-[100px]">
                              <span className="text-gray-900">{item.prix}</span>
                              <span className="text-gray-400"> XOF</span>
                            </div>
                          </TableCell>{" "}
                          <TableCell className="py-4 px-4 lg:px-6">
                            <Badge
                              variant={
                                item.disponible ? "default" : "secondary"
                              }
                              className={
                                item.disponible
                                  ? "bg-green-100 rounded-full py-1 text-green-800 border-green-300"
                                  : "bg-red-100 rounded-full py-1 text-red-800 border-red-300"
                              }
                            >
                              {item.disponible ? "Disponible" : "Indisponible"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <DotsThreeVertical
                                      size={24}
                                      className="h-8 w-8"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {" "}
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleAvailability(
                                        item._id,
                                        item.nom
                                      )
                                    }
                                  >
                                    {item.disponible ? (
                                      <EyeSlash className="h-4 w-4 mr-2" />
                                    ) : (
                                      <Eye className="h-4 w-4 mr-2" />
                                    )}
                                    {item.disponible
                                      ? "Marquer indisponible"
                                      : "Marquer disponible"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openEditModal(item)}
                                  >
                                    <PencilSimple className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteItem(item._id, item.nom)
                                    }
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>{" "}
                {/* Mobile Cards */}
                <div className="md:hidden">
                  {menuItems.map((item: MenuItemResponse) => (
                    <Card
                      key={item._id}
                      className="mb-4 overflow-hidden border-none"
                    >
                      <CardContent className="p-0">
                        {" "}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          {/* Header avec image */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-16 h-16 bg-gray-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.nom}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <ForkKnife
                                className={`h-6 w-6 text-gray-600 ${
                                  item.imageUrl ? "hidden" : ""
                                }`}
                              />
                            </div>{" "}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-bold text-lg text-gray-900 leading-tight truncate">
                                  {item.nom}
                                </span>
                                <Badge
                                  variant={
                                    item.disponible ? "default" : "secondary"
                                  }
                                  className={`text-xs flex-shrink-0 truncate max-w-[80px] ${
                                    item.disponible
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-red-100 text-red-800 border-red-300"
                                  }`}
                                >
                                  {item.disponible
                                    ? "Disponible"
                                    : "Indisponible"}
                                </Badge>
                              </div>
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs mb-2 truncate max-w-[120px]"
                              >
                                {formatCategory(item.categorie)}
                              </Badge>{" "}
                              {item.description && (
                                <div
                                  className="text-sm text-gray-600 mb-3 overflow-hidden"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {item.description}
                                </div>
                              )}{" "}
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-600 truncate">
                                  Prix:{" "}
                                </span>
                                <span className="font-semibold text-lg text-orange-600 truncate">
                                  {item.prix}{" "}
                                  <span className="text-sm font-normal text-gray-500">
                                    XOF
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Action Buttons */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleToggleAvailability(item._id, item.nom)
                                }
                                className="flex-1 flex items-center justify-center gap-2"
                              >
                                {item.disponible ? (
                                  <EyeSlash className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                                {item.disponible ? "Masquer" : "Afficher"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(item)}
                                className="flex-1 flex items-center justify-center gap-2"
                              >
                                <PencilSimple className="h-4 w-4" />
                                Modifier
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteItem(item._id, item.nom)
                                }
                                className="flex-1 flex items-center justify-center gap-2"
                              >
                                <Trash className="h-4 w-4" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {!loading && menuItems.length > 0 && (
              <MenuPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </div>
        </Card>{" "}
      </div>
      {/* Nouveaux modaux améliorés */}
      <AddMenuItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMenuItem}
        isLoading={isCreating}
      />
      <EditMenuItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={handleEditMenuItem}
        isLoading={isEditing}
        menuItem={selectedItem}
      />{" "}
      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteItem}
        onConfirm={confirmDeleteItem}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer l'article "${itemToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        isLoading={isDeleting}
      />
    </section>
  );
};
