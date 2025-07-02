import React, { useState, useMemo } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import {
  UserPlus,
  PencilSimple,
  DotsThreeVertical as DotsThreeVerticalIcon,
  Eye as EyeIcon,
  MagnifyingGlass as SearchIcon,
  Download as DownloadIcon,
  Key as KeyIcon,
  UserPlusIcon,
  TrashIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Spinner, SpinnerMedium } from "../../../../components/ui/spinner";
import {
  useUsers,
  useDeleteUser,
  useToggleUserStatus,
} from "../../../../hooks/useUserAPI";
import { UserAvatar } from "../../../../components/UserAvatar";
import { FileSpreadsheet, FileText, UserCheck, UserX } from "lucide-react";
import { AccessCodeModal } from "../../../../components/modals/AccessCodeModal";
import { AddStaffModal } from "../../../../components/modals/AddStaffModal";
import { ConfirmationModal } from "../../../../components/modals/ConfirmationModal";
import { ExportService } from "../../../../services/exportService";
import { useAlert } from "../../../../contexts/AlertContext";

// Interface pour les types utilisateur (utilise StaffUser du service)
interface StaffUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  photoProfil?: string;
  dateCreation: string;
  dateModification?: string;
  codeAcces?: string;
}

export const AdminStaffSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TOUS");
  const [isExporting, setIsExporting] = useState(false);
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [toggleStatusConfirmModalOpen, setToggleStatusConfirmModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [userToToggle, setUserToToggle] = useState<StaffUser | null>(null);

  const { data: users, loading, error, refetch } = useUsers();
  const { deleteUser, loading: deleteLoading } = useDeleteUser();
  const { toggleUserStatus, loading: toggleLoading } = useToggleUserStatus();
  const { showAlert } = useAlert();

  // Fonctions utilitaires pour les dates
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  const getToday = (): Date => {
    return new Date();
  };

  const getYesterday = (): Date => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  };
  // Filtrage des utilisateurs côté frontend
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    let filtered = [...users];

    // Filtrage par statut
    if (selectedStatus !== "TOUS") {
      switch (selectedStatus) {
        case "ACTIFS":
          filtered = filtered.filter((user) => user.actif);
          break;
        case "INACTIFS":
          filtered = filtered.filter((user) => !user.actif);
          break;
        case "ADMIN":
          filtered = filtered.filter((user) => user.role === "ADMIN");
          break;
        case "PERSONNEL":
          filtered = filtered.filter((user) => user.role !== "ADMIN");
          break;
        case "CAISSIERS":
          filtered = filtered.filter((user) => user.isCaissier);
          break;
      }
    }

    // Filtrage par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nom.toLowerCase().includes(searchLower) ||
          user.prenom.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.codeAcces?.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [users, selectedStatus, searchTerm]);

  // Calculs de statistiques
  const stats = useMemo(() => {
    if (!users || !Array.isArray(users))
      return {
        totalPersonnel: 0,
        utilisateursActifs: 0,
        utilisateursInactifs: 0,
        admins: 0,
        nouveauxAujourdhui: 0,
        nouveauxHier: 0,
      };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPersonnel = users.length;
    const utilisateursActifs = users.filter((user) => user.actif).length;
    const utilisateursInactifs = users.filter((user) => !user.actif).length;
    const admins = users.filter((user) => user.role === "ADMIN").length;

    // Nouveaux utilisateurs aujourd'hui
    const nouveauxAujourdhui = users.filter((user) => {
      const userDate = new Date(user.dateCreation);
      return userDate >= today && userDate < tomorrow;
    }).length;

    // Nouveaux utilisateurs hier
    const nouveauxHier = users.filter((user) => {
      const userDate = new Date(user.dateCreation);
      return userDate >= yesterday && userDate < today;
    }).length;

    return {
      totalPersonnel,
      utilisateursActifs,
      utilisateursInactifs,
      admins,
      nouveauxAujourdhui,
      nouveauxHier,
    };
  }, [users]);
  // Summary cards data avec le même style que ServeurOrdersSection
  const summaryCards = [
    {
      title: "Nouveaux utilisateurs hier",
      mobileTitle: "Hier",
      value: loading ? "..." : stats.nouveauxHier.toString(),
      subtitle: formatDate(getYesterday()),
      subtitleColor: "text-orange-500",
    },
    {
      title: "Nouveaux utilisateurs aujourd'hui",
      mobileTitle: "Aujourd'hui",
      value: loading ? "..." : stats.nouveauxAujourdhui.toString(),
      subtitle: formatDate(getToday()),
      subtitleColor: "text-orange-500",
    },
    {
      title: "Total personnel",
      mobileTitle: "Total",
      value: loading ? "..." : stats.totalPersonnel.toString(),
      subtitle: `${stats.utilisateursActifs} actifs`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Administrateurs",
      mobileTitle: "Admins",
      value: loading ? "..." : stats.admins.toString(),
      subtitle: `${stats.totalPersonnel - stats.admins} personnel`,
      subtitleColor: "text-orange-500",
    },
  ]; // Gestionnaire de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  // Gestionnaire de détails utilisateur
  const handleViewUserDetails = (user: StaffUser) => {
    console.log("Voir détails utilisateur:", user);
    // TODO: Implémenter le modal de détails utilisateur
  };
  // Gestionnaire du modal de code d'accès
  const handleViewAccessCode = (user: StaffUser) => {
    setSelectedUser(user);
    setAccessCodeModalOpen(true);
  };

  // Gestionnaire pour ouvrir le modal d'ajout de staff
  const handleAddStaff = () => {
    setAddStaffModalOpen(true);
  };

  // Gestionnaire de succès après ajout d'un utilisateur
  const handleAddStaffSuccess = () => {
    refetch(); // Actualiser la liste des utilisateurs
  };
  // Gestionnaire de suppression d'utilisateur
  const handleDeleteUser = async (user: StaffUser) => {
    setUserToDelete(user);
    setDeleteConfirmModalOpen(true);
  };
  // Confirmation de suppression d'utilisateur
  const confirmDeleteUser = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete._id);
      if (success) {
        await refetch(); // Actualiser la liste
      }
    }
    setDeleteConfirmModalOpen(false);
    setUserToDelete(null);
  };

  // Gestionnaire pour toggle le statut d'un utilisateur
  const handleToggleUserStatus = (user: StaffUser) => {
    setUserToToggle(user);
    setToggleStatusConfirmModalOpen(true);
  };

  // Confirmation du toggle de statut
  const confirmToggleUserStatus = async () => {
    if (userToToggle) {
      const result = await toggleUserStatus(userToToggle._id);
      if (result) {
        await refetch(); // Actualiser la liste
      }
    }
    setToggleStatusConfirmModalOpen(false);
    setUserToToggle(null);
  }; // Gestionnaire d'export Excel
  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      if (!filteredUsers || filteredUsers.length === 0) {
        showAlert(
          "warning",
          "Aucune donnée à exporter. Veuillez d'abord charger ou filtrer les utilisateurs."
        );
        return;
      }

      // Utiliser le nouveau service d'export
      await ExportService.exportUsersToExcel(filteredUsers);

      // Notification de succès
      showAlert(
        "success",
        `Export Excel terminé avec succès ! ${filteredUsers.length} utilisateurs exportés.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      showAlert("error", "Erreur lors de l'export Excel. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  }; // Gestionnaire d'export PDF
  const handleExportToPDF = async () => {
    setIsExporting(true);
    try {
      if (!filteredUsers || filteredUsers.length === 0) {
        showAlert(
          "warning",
          "Aucune donnée à exporter. Veuillez d'abord charger ou filtrer les utilisateurs."
        );
        return;
      }

      // Utiliser le nouveau service d'export
      await ExportService.exportUsersToPDF(filteredUsers);

      // Notification de succès
      showAlert(
        "success",
        `Export PDF terminé avec succès ! ${filteredUsers.length} utilisateurs exportés.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      showAlert("error", "Erreur lors de l'export PDF. Veuillez réessayer.");
    } finally {
      setIsExporting(false);
    }
  }; // Gestionnaire d'export statistiques
  const handleExportStats = async () => {
    setIsExporting(true);
    try {
      if (!users || !Array.isArray(users)) {
        showAlert(
          "warning",
          "Aucune donnée statistique à exporter. Veuillez d'abord charger les utilisateurs."
        );
        return;
      }

      // Utiliser le nouveau service d'export
      await ExportService.exportUserStats(users);

      // Notification de succès
      showAlert(
        "success",
        `Export des statistiques terminé avec succès ! ${users.length} utilisateurs analysés.`
      );
    } catch (error) {
      console.error("Erreur lors de l'export des statistiques:", error);
      showAlert(
        "error",
        "Erreur lors de l'export des statistiques. Veuillez réessayer."
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Fonction pour formater le rôle
  const formatRole = (role: string): string => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "Administrateur";
      case "SERVEUR":
        return "Serveur";
      case "CUISINIER":
        return "Cuisinier";
      case "CAISSIER":
        return "Caissier";
      default:
        return role;
    }
  };

  // Fonction pour formater la date de création
  const formatCreationDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonctions utilitaires pour les badges
  const getUserStatusBadge = (actif: boolean) => {
    if (actif) {
      return (
        <Badge className="bg-green-100 text-green-700 rounded-full px-3 py-1 font-medium text-xs border">
          Actif
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-700 rounded-full px-3 py-1 font-medium text-xs border">
          Inactif
        </Badge>
      );
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: "bg-orange-100 text-orange-700",
      SERVEUR: "bg-blue-100 text-blue-700",
      CUISINIER: "bg-purple-100 text-purple-700",
    };

    const colorClass =
      roleColors[role as keyof typeof roleColors] ||
      "bg-gray-100 text-gray-700";

    return (
      <Badge
        className={`${colorClass} rounded-full px-3 py-1 font-medium text-xs border`}
      >
        {formatRole(role)}
      </Badge>
    );
  };

  const getCashierBadge = () => {
    return (
      <Badge className="bg-yellow-100 text-yellow-700 rounded-full px-2 py-1 font-medium text-xs border ml-1">
        Caissier
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center  h-[70vh]">
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
      {/* Summary Cards - Style ServeurOrdersSection */}
      <div className="mt-4 md:mt-6 lg:mt-8 px-3 md:px-6 lg:px-12 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="shadow bg-white border border-slate-200 rounded-3xl flex-1 min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 md:p-4 lg:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                <span className="hidden sm:inline">{card.title}</span>
                <span className="sm:hidden">{card.mobileTitle}</span>
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {card.value}
                  </span>
                </div>
                <p
                  className={`text-xs md:text-sm font-medium ${card.subtitleColor} truncate`}
                >
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Carte principale avec header style AdminHistoriqueSection */}
      <div className="my-0 md:mb-6 lg:mb-8 px-0 md:px-6 lg:px-12">
        <Card className="rounded-t-2xl border-b-0 rounded-b-none shadow-none md:shadow md:rounded-3xl overflow-hidden w-full">
          {/* Header and Search - Style AdminHistoriqueSection */}
          <div className="flex flex-col border-b bg-white border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
              <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
                Gestion du Personnel
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-80">
                  <Input
                    className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </div>{" "}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStaff}
                  className="flex items-center rounded-full gap-2 h-10 md:h-12 px-3 md:px-4 bg-orange-500 hover:bg-orange-600 text-white hover:text-white border-orange-500"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 flex rounded-full items-center gap-2 h-10 md:h-12 px-3 md:px-4"
                      disabled={
                        isExporting ||
                        !filteredUsers ||
                        filteredUsers.length === 0
                      }
                    >
                      {isExporting ? (
                        <SpinnerMedium />
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
                  </DropdownMenuContent>{" "}
                </DropdownMenu>{" "}
              </div>
            </div>

            {/* Status Tabs - Style AdminHistoriqueSection */}
            <div className="overflow-x-auto scrollbar-hide w-full">
              <Tabs
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                className="w-full"
              >
                <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
                  <TabsTrigger
                    value="TOUS"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Tous
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ACTIFS"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Actifs
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="INACTIFS"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Inactifs
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ADMIN"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Admin
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="PERSONNEL"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Personnel
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="CAISSIERS"
                    className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    <span className="font-semibold text-xs md:text-sm">
                      Caissiers
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-3xl md:rounded-b-3xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun utilisateur trouvé
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Aucun utilisateur ne correspond à votre recherche"
                      : "Aucun utilisateur dans cette catégorie"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-10 border-b border-slate-200">
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Utilisateur
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Email
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Téléphone
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Rôle
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Statut
                        </TableHead>
                        <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Date création
                        </TableHead>
                        <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user._id}
                          className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                        >
                          <TableCell className="py-4 px-4 lg:px-6">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                photo={user.photoProfil}
                                nom={user.nom}
                                prenom={user.prenom}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.nom} {user.prenom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </TableCell>{" "}
                          <TableCell className="px-4 py-3">
                            <span
                              className="text-gray-900 block max-w-[200px] truncate"
                              title={user.email || "N/A"}
                            >
                              {user.email || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span
                              className="text-gray-900 block max-w-[150px] truncate"
                              title={user.telephone || "N/A"}
                            >
                              {user.telephone || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getRoleBadge(user.role)}
                              {user.isCaissier && getCashierBadge()}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {getUserStatusBadge(user.actif)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="text-gray-900">
                              {formatCreationDate(user.dateCreation)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-4 lg:px-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <DotsThreeVerticalIcon
                                    size={24}
                                    className="h-8 w-8"
                                  />
                                </Button>
                              </DropdownMenuTrigger>{" "}
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleViewUserDetails(user)}
                                >
                                  <EyeIcon className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                                {user.role !== "ADMIN" && (
                                  <DropdownMenuItem
                                    onClick={() => handleViewAccessCode(user)}
                                  >
                                    <KeyIcon className="h-4 w-4 mr-2" />
                                    Code d'accès
                                  </DropdownMenuItem>
                                )}{" "}
                                <DropdownMenuItem>
                                  <PencilSimple className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>{" "}
                                <DropdownMenuItem
                                  className={
                                    user.actif
                                      ? "text-orange-600 hover:bg-orange-600 hover:text-white"
                                      : "text-green-600 hover:bg-green-600 hover:text-white"
                                  }
                                  onClick={() => handleToggleUserStatus(user)}
                                  disabled={toggleLoading}
                                >
                                  {user.actif ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Désactiver
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Réactiver
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden bg-gray-10 p-3">
                  {filteredUsers.map((user) => (
                    <Card
                      key={user._id}
                      className="mb-4 overflow-hidden border-none"
                    >
                      <CardContent className="p-6 bg-white">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <UserAvatar
                                photo={user.photoProfil}
                                nom={user.nom}
                                prenom={user.prenom}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <span className="font-bold text-lg text-gray-900 truncate">
                                {user.prenom} {user.nom}
                              </span>
                              {user.isCaissier && getCashierBadge()}
                            </div>
                            <div
                              className="text-sm text-gray-600 mb-2 max-w-[250px] truncate"
                              title={user.email || "Email non défini"}
                            >
                              {user.email || "Email non défini"}
                            </div>
                            <div
                              className="text-sm text-gray-600 mb-2 max-w-[250px] truncate"
                              title={user.telephone || "Téléphone non défini"}
                            >
                              {user.telephone || "Téléphone non défini"}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {getRoleBadge(user.role)}
                              {getUserStatusBadge(user.actif)}
                            </div>
                            {user.codeAcces && (
                              <div className="text-sm text-gray-600 mb-2">
                                Code:{" "}
                                <code className="bg-gray-100 px-1 rounded text-xs">
                                  {user.codeAcces}
                                </code>
                              </div>
                            )}
                            <div className="text-sm text-gray-500">
                              Créé le {formatCreationDate(user.dateCreation)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                            className="flex-1 mr-2"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <DotsThreeVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>{" "}
                            <DropdownMenuContent align="end">
                              {user.role !== "ADMIN" && (
                                <DropdownMenuItem
                                  onClick={() => handleViewAccessCode(user)}
                                >
                                  <KeyIcon className="h-4 w-4 mr-2" />
                                  Code d'accès
                                </DropdownMenuItem>
                              )}{" "}
                              <DropdownMenuItem>
                                <PencilSimple className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={
                                  user.actif
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                                onClick={() => handleToggleUserStatus(user)}
                                disabled={toggleLoading}
                              >
                                {user.actif ? (
                                  <>
                                    <TrashSimpleIcon className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <TrashSimpleIcon className="h-4 w-4 mr-2 transform rotate-180" />
                                    Réactiver
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user)}
                                disabled={deleteLoading}
                              >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Supprimer définitivement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}{" "}
          </div>
        </Card>
      </div>{" "}
      {/* Modal de code d'accès */}
      <AccessCodeModal
        isOpen={accessCodeModalOpen}
        onClose={() => {
          setAccessCodeModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />{" "}
      {/* Modal d'ajout de staff */}
      <AddStaffModal
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
        onSuccess={handleAddStaffSuccess}
      />{" "}
      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        message={
          userToDelete
            ? `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${userToDelete.prenom} ${userToDelete.nom} ? Cette action est irréversible et supprimera toutes ses données.`
            : ""
        }
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        variant="danger"
        isLoading={deleteLoading}
      />
      {/* Modal de confirmation de changement de statut */}
      <ConfirmationModal
        isOpen={toggleStatusConfirmModalOpen}
        onClose={() => {
          setToggleStatusConfirmModalOpen(false);
          setUserToToggle(null);
        }}
        onConfirm={confirmToggleUserStatus}
        title={
          userToToggle?.actif
            ? "Désactiver l'utilisateur"
            : "Réactiver l'utilisateur"
        }
        message={
          userToToggle
            ? userToToggle.actif
              ? `Êtes-vous sûr de vouloir désactiver ${userToToggle.prenom} ${userToToggle.nom} ? Il ne pourra plus se connecter à la plateforme.`
              : `Êtes-vous sûr de vouloir réactiver ${userToToggle.prenom} ${userToToggle.nom} ? Il pourra de nouveau se connecter à la plateforme.`
            : ""
        }
        confirmText={userToToggle?.actif ? "Désactiver" : "Réactiver"}
        cancelText="Annuler"
        variant={userToToggle?.actif ? "warning" : "info"}
        isLoading={toggleLoading}
      />
    </section>
  );
};
