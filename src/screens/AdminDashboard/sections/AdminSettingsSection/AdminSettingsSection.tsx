import React, { useState, useEffect } from "react";
import {
  Trash,
  ArrowClockwise,
  Warning,
  MagnifyingGlass,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useAlert } from "../../../../contexts/AlertContext";
import {
  SettingsService,
  ValidatedOrder,
  RevenueStats,
} from "../../../../services/SettingsService";

export const AdminSettingsSection: React.FC = () => {
  const { showAlert } = useAlert();

  // États pour les commandes validées
  const [orders, setOrders] = useState<ValidatedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // États pour les statistiques de chiffre d'affaires
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // États pour les modales
  const [deleteOrderModal, setDeleteOrderModal] = useState<{
    open: boolean;
    order: ValidatedOrder | null;
  }>({ open: false, order: null });
  const [deleteMotif, setDeleteMotif] = useState("");
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [resetRevenueModal, setResetRevenueModal] = useState(false);
  const [resetType, setResetType] = useState<
    "today" | "week" | "month" | "all"
  >("today");
  const [resetMotif, setResetMotif] = useState("");
  const [resettingRevenue, setResettingRevenue] = useState(false);

  // Charger les commandes validées
  const fetchValidatedOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await SettingsService.getValidatedOrders({
        page: currentPage,
        limit: 20,
        search: searchTerm,
      });
      setOrders(data.orders);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      showAlert(
        "error",
        error.response?.data?.message ||
          "Erreur lors du chargement des commandes"
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  // Charger les statistiques
  const fetchRevenueStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await SettingsService.getRevenueStats();
      setRevenueStats(stats);
    } catch (error: any) {
      showAlert(
        "error",
        error.response?.data?.message ||
          "Erreur lors du chargement des statistiques"
      );
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchValidatedOrders();
    fetchRevenueStats();
  }, [currentPage, searchTerm]);

  // Supprimer une commande
  const handleDeleteOrder = async () => {
    if (!deleteOrderModal.order || !deleteMotif.trim()) {
      showAlert("error", "Veuillez indiquer un motif de suppression");
      return;
    }

    try {
      setDeletingOrder(true);
      await SettingsService.deleteValidatedOrder(
        deleteOrderModal.order._id,
        deleteMotif
      );
      showAlert("success", "Commande supprimée avec succès");
      setDeleteOrderModal({ open: false, order: null });
      setDeleteMotif("");
      fetchValidatedOrders();
      fetchRevenueStats();

      // Déclencher un événement global pour rafraîchir toutes les statistiques
      window.dispatchEvent(new CustomEvent("refreshStats"));
    } catch (error: any) {
      showAlert(
        "error",
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    } finally {
      setDeletingOrder(false);
    }
  };

  // Réinitialiser le chiffre d'affaires
  const handleResetRevenue = async () => {
    if (!resetMotif.trim()) {
      showAlert("error", "Veuillez indiquer un motif de réinitialisation");
      return;
    }

    try {
      setResettingRevenue(true);
      const result = await SettingsService.resetRevenue({
        type: resetType,
        motif: resetMotif,
      });
      showAlert(
        "success",
        `${
          result.statistiques.commandesSupprimees
        } commandes supprimées, ${formatPrice(
          result.statistiques.chiffreAffairesPerdu
        )} XOF réinitialisés`
      );
      setResetRevenueModal(false);
      setResetMotif("");
      fetchValidatedOrders();
      fetchRevenueStats();

      // Déclencher un événement global pour rafraîchir toutes les statistiques
      window.dispatchEvent(new CustomEvent("refreshStats"));
    } catch (error: any) {
      showAlert(
        "error",
        error.response?.data?.message || "Erreur lors de la réinitialisation"
      );
    } finally {
      setResettingRevenue(false);
    }
  };

  // Formater les prix
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  // Formater les dates
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paramètres système
        </h2>
        <p className="text-gray-600">
          Gestion avancée des commandes et du chiffre d'affaires
        </p>
      </div>

      {/* Section Réinitialisation du chiffre d'affaires */}
      <div className="mb-8">
        <Card className="rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Réinitialisation du chiffre d'affaires
                </h3>
                <p className="text-sm text-gray-600">
                  Supprimez les commandes terminées selon une période définie
                </p>
              </div>
              <Button
                onClick={() => setResetRevenueModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ArrowClockwise className="mr-2" size={20} />
                Réinitialiser
              </Button>
            </div>

            {loadingStats ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(revenueStats?.today.chiffreAffaires || 0)}{" "}
                      XOF
                    </p>
                    <p className="text-xs text-gray-500">
                      {revenueStats?.today.nombreCommandes || 0} commandes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Cette semaine</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(revenueStats?.week.chiffreAffaires || 0)} XOF
                    </p>
                    <p className="text-xs text-gray-500">
                      {revenueStats?.week.nombreCommandes || 0} commandes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Ce mois</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(revenueStats?.month.chiffreAffaires || 0)}{" "}
                      XOF
                    </p>
                    <p className="text-xs text-gray-500">
                      {revenueStats?.month.nombreCommandes || 0} commandes
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(revenueStats?.all.chiffreAffaires || 0)} XOF
                    </p>
                    <p className="text-xs text-gray-500">
                      {revenueStats?.all.nombreCommandes || 0} commandes
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Suppression des commandes validées */}
      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Commandes validées et payées
              </h3>
              <p className="text-sm text-gray-600">
                Supprimez des commandes individuelles si nécessaire
              </p>
            </div>
            <div className="relative w-80">
              <Input
                type="text"
                placeholder="Rechercher par N° commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune commande validée trouvée</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Caissier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order.numeroCommande}
                      </TableCell>
                      <TableCell>{formatDate(order.dateCreation)}</TableCell>
                      <TableCell>
                        {order.caissier
                          ? `${order.caissier.prenom} ${order.caissier.nom}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{order.items.length} plat(s)</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.modePaiement || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(order.montantTotal)} XOF
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteOrderModal({ open: true, order })
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de suppression de commande */}
      <Dialog
        open={deleteOrderModal.open}
        onOpenChange={(open) => setDeleteOrderModal({ open, order: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Warning size={24} />
              Supprimer la commande
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de supprimer la commande{" "}
              <span className="font-semibold">
                {deleteOrderModal.order?.numeroCommande}
              </span>{" "}
              d'un montant de{" "}
              <span className="font-semibold">
                {formatPrice(deleteOrderModal.order?.montantTotal || 0)} XOF
              </span>
              . Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de suppression *
              </label>
              <Input
                type="text"
                placeholder="Ex: Erreur de saisie, annulation client..."
                value={deleteMotif}
                onChange={(e) => setDeleteMotif(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOrderModal({ open: false, order: null });
                setDeleteMotif("");
              }}
              disabled={deletingOrder}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteOrder}
              disabled={deletingOrder || !deleteMotif.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingOrder ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de réinitialisation du chiffre d'affaires */}
      <Dialog open={resetRevenueModal} onOpenChange={setResetRevenueModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Warning size={24} />
              Réinitialiser le chiffre d'affaires
            </DialogTitle>
            <DialogDescription>
              Cette action supprimera définitivement les commandes terminées de
              la période sélectionnée. Cette opération est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période à réinitialiser
              </label>
              <Select
                value={resetType}
                onValueChange={(value: any) => setResetType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui uniquement</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="all">
                    Tout le chiffre d'affaires
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de réinitialisation *
              </label>
              <Input
                type="text"
                placeholder="Ex: Changement d'exercice, correction comptable..."
                value={resetMotif}
                onChange={(e) => setResetMotif(e.target.value)}
              />
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Attention :</strong> Cette action supprimera{" "}
                {resetType === "today"
                  ? revenueStats?.today.nombreCommandes || 0
                  : resetType === "week"
                  ? revenueStats?.week.nombreCommandes || 0
                  : resetType === "month"
                  ? revenueStats?.month.nombreCommandes || 0
                  : revenueStats?.all.nombreCommandes || 0}{" "}
                commande(s) pour un montant de{" "}
                {formatPrice(
                  resetType === "today"
                    ? revenueStats?.today.chiffreAffaires || 0
                    : resetType === "week"
                    ? revenueStats?.week.chiffreAffaires || 0
                    : resetType === "month"
                    ? revenueStats?.month.chiffreAffaires || 0
                    : revenueStats?.all.chiffreAffaires || 0
                )}{" "}
                XOF.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetRevenueModal(false);
                setResetMotif("");
              }}
              disabled={resettingRevenue}
            >
              Annuler
            </Button>
            <Button
              onClick={handleResetRevenue}
              disabled={resettingRevenue || !resetMotif.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {resettingRevenue
                ? "Réinitialisation..."
                : "Confirmer la réinitialisation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
