import React, { useState, useMemo } from "react";
import { useOrders } from "../../hooks/useOrderAPI";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { SpinnerMedium } from "../../components/ui/spinner";
import { OrderStatusBadge } from "../../components/ui/order-status-badge";
import { CreditCard, Money } from "phosphor-react";
import { SearchIcon, EyeIcon } from "lucide-react";
// import { getMenuImageUrl } from "../../utils/menuImageUtils";
// import MenuItemImage from "../../components/MenuItemImage";

export const ServeurOrdersHistorySection: React.FC = () => {
  const { data: allOrders, loading } = useOrders();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("TOUTES");

  // Filtrer uniquement les commandes des jours passés ET du serveur connecté
  const pastOrders = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders) || !user) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allOrders.filter((order) => {
      const orderDate = new Date(order.dateCreation);
      // Correction typage serveurId
      const serveurId = order.serveur?._id;
      return (
        orderDate < today &&
        serveurId &&
        (serveurId === user._id || serveurId === user.id)
      );
    });
  }, [allOrders, user]);

  // Recherche et filtre par statut
  const filteredOrders = useMemo(() => {
    let filtered = pastOrders;
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.numeroCommande
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.numeroTable?.toString().includes(searchTerm) ||
          order.items.some((item) => {
            // Correction typage menuItem
            const menuItem =
              typeof item.menuItem === "object" && item.menuItem !== null
                ? item.menuItem
                : undefined;
            return (menuItem?.nom || item.nom || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          })
      );
    }
    if (selectedStatus !== "TOUTES") {
      filtered = filtered.filter((order) => order.statut === selectedStatus);
    }
    return filtered;
  }, [pastOrders, searchTerm, selectedStatus]);

  // Statistiques summary cards
  const stats = useMemo(() => {
    if (!pastOrders.length)
      return {
        totalCommandes: 0,
        commandesTerminees: 0,
        commandesAnnulees: 0,
        chiffreAffaires: 0,
      };
    const totalCommandes = pastOrders.length;
    const commandesTerminees = pastOrders.filter(
      (o) => o.statut === "TERMINE"
    ).length;
    const commandesAnnulees = pastOrders.filter(
      (o) => o.statut === "ANNULE"
    ).length;
    const chiffreAffaires = pastOrders
      .filter((o) => o.statut === "TERMINE")
      .reduce((total, o) => total + (o.montantTotal || 0), 0);
    return {
      totalCommandes,
      commandesTerminees,
      commandesAnnulees,
      chiffreAffaires,
    };
  }, [pastOrders]);

  // Formatters
  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("fr-FR").format(price);
  const formatDateTime = (dateString: string): string =>
    new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const getPaymentIcon = (modePaiement: string, size: "sm" | "md" = "md") => {
    const iconProps = {
      size: size === "sm" ? 16 : 20,
      strokeweigh: "1.5",
      color: "#F97316" as const,
    };
    const containerSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";
    const imageSize = size === "sm" ? "w-6 h-6" : "w-10 h-10";
    switch ((modePaiement || "").toLowerCase()) {
      case "especes":
        return (
          <div
            className={`flex ${containerSize} text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0`}
          >
            <Money {...iconProps} />
          </div>
        );
      case "carte_bancaire":
      case "carte":
        return (
          <div
            className={`flex ${containerSize} text-brand-primary-500 items-center justify-center rounded-full flex-shrink-0`}
          >
            <CreditCard {...iconProps} />
          </div>
        );
      case "wave":
        return (
          <img
            src="/img/wave.jpg"
            alt="Wave"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "mtn_money":
        return (
          <img
            src="/img/mtn_money.jpg"
            alt="MTN Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "orange_money":
        return (
          <img
            src="/img/orange_money.jpg"
            alt="Orange Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      case "moov_money":
        return (
          <img
            src="/img/moov_money.jpg"
            alt="Moov Money"
            className={`${imageSize} rounded-full object-cover`}
          />
        );
      default:
        return (
          <div
            className={`flex ${containerSize} items-center justify-center px-2 py-2 bg-orange-100 rounded-full flex-shrink-0`}
          >
            <Money {...iconProps} />
          </div>
        );
    }
  };
  const formatPaymentMethodName = (
    modePaiement: string | undefined
  ): string => {
    if (!modePaiement) return "Non défini";
    switch (modePaiement.toUpperCase()) {
      case "ESPECES":
        return "Espèces";
      case "CARTE_BANCAIRE":
      case "CARTE":
        return "Carte bancaire";
      case "WAVE":
        return "Wave";
      case "MTN_MONEY":
        return "MTN Money";
      case "ORANGE_MONEY":
        return "Orange Money";
      case "MOOV_MONEY":
        return "Moov Money";
      default:
        return modePaiement;
    }
  };

  // UI
  const summaryCards = [
    {
      title: "Total commandes",
      value: loading ? "..." : stats.totalCommandes.toString(),
      subtitle: "Toutes périodes confondues",
      subtitleColor: "text-orange-500",
    },
    {
      title: "Commandes terminées",
      value: loading ? "..." : stats.commandesTerminees.toString(),
      subtitle: `${
        Math.round(
          (stats.commandesTerminees / (stats.totalCommandes || 1)) * 100
        ) || 0
      }% du total`,
      subtitleColor: "text-green-500",
    },
    {
      title: "Commandes annulées",
      value: loading ? "..." : stats.commandesAnnulees.toString(),
      subtitle: `${
        Math.round(
          (stats.commandesAnnulees / (stats.totalCommandes || 1)) * 100
        ) || 0
      }% du total`,
      subtitleColor: "text-red-500",
    },
    {
      title: "Chiffre d'affaires total",
      value: loading ? "..." : formatPrice(stats.chiffreAffaires),
      currency: loading ? "" : "XOF",
      subtitle: `Recettes validées`,
      subtitleColor: "text-orange-500",
    },
  ];

  return (
    <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="flex-1 bg-white rounded-2xl md:rounded-3xl overflow-hidden min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 sm:p-4 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                {card.title}
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <div className="flex items-start gap-1 w-full min-w-0">
                  <span className="font-bold text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">
                    {card.value}
                  </span>
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
      <div className="shadow-md bg-white rounded-3xl overflow-hidden">
        {/* Header, Search, Tabs */}
        <div className="flex flex-col rounded-t-3xl border-b bg-white rounded border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-3 md:px-4 lg:px-6 pt-4 pb-3 gap-3 lg:gap-4">
            <h2 className="font-bold text-lg md:text-xl lg:text-2xl text-gray-900 flex-shrink-0">
              Historique de mes commandes
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-80">
                <Input
                  className="pl-4 pr-10 py-2.5 md:py-3 h-10 md:h-12 rounded-[123px] border border-[#eff1f3] text-sm md:text-base w-full"
                  placeholder="Rechercher une commande"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <Tabs
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            className="w-fit"
          >
            <TabsList className="flex justify-start h-auto bg-transparent pl-3 md:pl-4 lg:pl-6 py-0 w-fit min-w-full">
              <TabsTrigger
                value="TOUTES"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">Toutes</span>
              </TabsTrigger>
              <TabsTrigger
                value="EN_ATTENTE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  En attente
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="EN_PREPARATION"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  En préparation
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="TERMINE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">Prête</span>
              </TabsTrigger>
              <TabsTrigger
                value="ANNULE"
                className="flex items-center justify-start gap-2 px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5 rounded-none data-[state=active]:border-b-4 data-[state=active]:border-orange-500 data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-semibold text-xs md:text-sm">
                  Annulée
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Table Content */}
        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <SpinnerMedium />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <SearchIcon size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Aucune commande trouvée</p>
              <p className="text-sm">
                {searchTerm
                  ? "Essayez de modifier vos critères de recherche"
                  : "L'historique des commandes apparaîtra ici"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-10 border-b border-slate-200">
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      N° Commande
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Table
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Articles
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Montant
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Statut
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Paiement
                    </TableHead>
                    <TableHead className="text-left py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Date
                    </TableHead>
                    <TableHead className="text-right py-4 px-4 lg:px-6 font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order._id}
                      className="border-b bg-white border-slate-100 hover:bg-gray-10 transition-colors"
                    >
                      <TableCell className="py-4 px-4 lg:px-6">
                        <span className="font-medium text-gray-900">
                          {order.numeroCommande}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4 lg:px-6">
                        <span className="font-semibold text-lg text-gray-900">
                          {order.numeroTable || "Non définie"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="flex flex-col items-left gap-2 flex-wrap">
                          {order.items.slice(0, 1).map((item, idx) => {
                            const menuItem =
                              typeof item.menuItem === "object" &&
                              item.menuItem !== null
                                ? item.menuItem
                                : undefined;
                            const nomPlat = menuItem?.nom || item.nom || "Plat";
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-1"
                              >
                                <span className="text-gray-900 text-sm font-medium">
                                  {nomPlat} x{item.quantite}
                                </span>
                              </div>
                            );
                          })}
                          {order.items.length > 2 && (
                            <span className="text-gray-500 text-xs">
                              +{order.items.length - 2} autres...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-semibold text-base">
                          <span className="text-gray-900">
                            {formatPrice(order.montantTotal)}{" "}
                          </span>
                          <span className="text-gray-400">XOF</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 lg:px-6">
                        <OrderStatusBadge statut={order.statut as any} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {getPaymentIcon(order.modePaiement || "especes")}
                          <div className="font-semibold text-base text-gray-900 truncate">
                            {formatPaymentMethodName(order.modePaiement)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 lg:px-6">
                        <div className="text-sm text-gray-600">
                          {formatDateTime(order.dateCreation)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 lg:px-6 text-right">
                        <button className="flex items-center gap-1 text-orange-600 hover:underline text-sm font-medium">
                          <EyeIcon className="h-4 w-4" /> Voir détails
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
