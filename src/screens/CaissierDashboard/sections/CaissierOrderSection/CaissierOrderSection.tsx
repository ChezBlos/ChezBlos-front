import React, { useState } from "react";
import {
  Search,
  Calculator,
  Plus,
  Minus,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { useMenuByCategory } from "../../../../hooks/useMenuAPI";
import { useAlert } from "../../../../contexts/AlertContext";
import { OrderService } from "../../../../services/orderService";
import { MenuItemResponse } from "../../../../types/menu";
import { Order } from "../../../../types/order";
import {
  getMenuImageUrl,
  handleImageError,
} from "../../../../services/imageService";
import { PrintReceiptModal } from "../../../../components/modals/PrintReceiptModal";
import { logger } from "../../../../utils/logger";
import { TrashSimple } from "phosphor-react";

interface CartItem {
  menuItem: MenuItemResponse;
  quantite: number;
}

interface CaissierOrderSectionProps {
  onRefresh?: () => Promise<void>;
}

export const CaissierOrderSection: React.FC<CaissierOrderSectionProps> = ({
  onRefresh,
}) => {
  // Mapping lisible des catégories si nécessaire
  const formatCategory = (raw: string) => {
    if (!raw) return "";
    // Normaliser
    const upper = raw.toUpperCase();
    const map: Record<string, string> = {
      PLAT_PRINCIPAL: "Plat principal",
      DESSERT: "Dessert",
      BOISSON: "Boisson",
      ENTREE: "Entrée",
      ACCOMPAGNEMENT: "Accompagnement",
      SAUCE: "Sauce",
    };
    if (map[upper]) return map[upper];
    // Fallback: transformer ABC_DEF -> Abc def
    return upper
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  };
  // État pour le panier
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Panneau actif: panier ou paiement
  const [activePanel, setActivePanel] = useState<"cart" | "payment">("cart");
  const [modePaiement, setModePaiement] = useState<
    | "ESPECES"
    | "CARTE_BANCAIRE"
    | "WAVE"
    | "MTN_MONEY"
    | "ORANGE_MONEY"
    | "MOOV_MONEY"
    | ""
  >("");
  const [montantRecu, setMontantRecu] = useState<string>("");

  // État pour l'impression du reçu
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  // Hooks
  const { data: menuData } = useMenuByCategory();
  const { showAlert } = useAlert();

  // Liste des moyens de paiement
  const paymentMethods = [
    {
      id: "CARTE_BANCAIRE",
      label: "Carte de crédit",
      icon: <CreditCard size={24} className="text-orange-600" />,
      isImage: false,
    },
    {
      id: "ORANGE_MONEY",
      label: "Orange Money",
      imageSrc: "/img/orange_money.jpg",
      isImage: true,
    },
    {
      id: "MTN_MONEY",
      label: "MTN Money",
      imageSrc: "/img/mtn_money.jpg",
      isImage: true,
    },
    {
      id: "MOOV_MONEY",
      label: "Moov Money",
      imageSrc: "/img/moov_money.jpg",
      isImage: true,
    },
    {
      id: "WAVE",
      label: "Wave",
      imageSrc: "/img/wave.jpg",
      isImage: true,
    },
    {
      id: "ESPECES",
      label: "Espèces",
      icon: <Banknote size={24} className="text-orange-600" />,
      isImage: false,
    },
  ];

  // Transformer les données du menu pour faciliter l'utilisation
  const menuItems = menuData.flatMap((category) => category.items);
  const categories = menuData.map((category) => category._id);

  // Calculer le total du panier
  const totalPanier = cart.reduce(
    (total, item) => total + item.menuItem.prix * item.quantite,
    0
  );

  // Filtrer les articles du menu
  const filteredMenuItems = menuItems.filter((item: MenuItemResponse) => {
    const matchesSearch = item.nom
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Ajouter un article au panier
  const addToCart = (menuItem: MenuItemResponse) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.menuItem._id === menuItem._id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.menuItem._id === menuItem._id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      } else {
        return [...prevCart, { menuItem, quantite: 1 }];
      }
    });
  };

  // Modifier la quantité d'un article
  const updateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) =>
        prevCart.filter((item) => item.menuItem._id !== menuItemId)
      );
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.menuItem._id === menuItemId
            ? { ...item, quantite: newQuantity }
            : item
        )
      );
    }
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setActivePanel("cart");
    setMontantRecu("");
    setModePaiement("");
  };

  // Calculer la monnaie
  const montantRecuNumber = parseFloat(montantRecu) || 0;
  const monnaie = montantRecuNumber - totalPanier;

  // Traiter la commande
  const handleProcessOrder = async () => {
    logger.debug(
      "🛒 [CaissierOrderSection] Début du traitement de la commande"
    );
    logger.debug("📦 Panier:", cart);
    logger.debug("💳 Mode de paiement:", modePaiement);
    logger.debug("💰 Montant reçu:", montantRecu);
    logger.debug("💯 Total panier:", totalPanier);

    if (cart.length === 0) {
      logger.warn("❌ Panier vide lors de la validation");
      showAlert("error", "Le panier est vide");
      return;
    }

    if (!modePaiement) {
      logger.warn("❌ Aucun mode de paiement sélectionné");
      showAlert("error", "Veuillez sélectionner un mode de paiement");
      return;
    }

    if (modePaiement === "ESPECES" && montantRecuNumber < totalPanier) {
      logger.warn("❌ Montant insuffisant pour paiement en espèces");
      showAlert("error", "Le montant reçu est insuffisant");
      return;
    }

    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItem: item.menuItem._id,
          quantite: item.quantite,
          notes: "", // Optionnel, peut être ajouté plus tard
        })),
        modePaiement,
        // Envoyer le montant payé pour tous les modes de paiement
        montantPaye: montantRecuNumber > 0 ? montantRecuNumber : totalPanier,
        notes: "", // Notes générales de la commande
      };

      logger.debug("📝 Données de commande à envoyer:", orderData);
      logger.debug("🚀 Appel de OrderService.createOrder...");

      const createdOrder = await OrderService.createOrder(orderData);

      logger.debug("✅ Commande créée avec succès:", createdOrder);
      showAlert("success", "Commande créée avec succès");

      // Lancer automatiquement l'impression du reçu
      setOrderToPrint(createdOrder);
      setShowPrintModal(true);

      clearCart();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      logger.error("❌ Erreur lors de la création de la commande:", error);
      logger.error("📋 Détails de l'erreur:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      showAlert(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la création de la commande"
      );
    }
  };

  // Fonctions pour la gestion du modal d'impression
  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setOrderToPrint(null);
  };

  const handleConfirmPrint = () => {
    // Le PrintReceiptModal gère déjà l'impression
    handleClosePrintModal();
  };

  return (
    <div className="px-3 w-full md:px-6 lg:px-10 xl:px-16 py-6 lg:h-screen">
      <div className="flex flex-col lg:flex-row items-start gap-6 h-full">
        {/* Section Menu produits scrollable à gauche */}
        <div className="w-full lg:flex-1 min-w-0 order-2 lg:order-1 h-full">
          <Card className="rounded-3xl h-full flex flex-col">
            <CardContent className="p-6 rounded-3xl flex flex-col h-full">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Barre de recherche */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-full"
                  />
                </div>
              </div>

              {/* Filtres par catégorie */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-4 p-1 bg-gray-10 rounded-full w-fit max-w-full overflow-x-auto overflow-hidden">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === "all"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((category: string) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs transition-all duration-200 whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-white text-orange-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {formatCategory(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grille des plats scrollable */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMenuItems.map((item: MenuItemResponse) => (
                    <Card
                      key={item._id}
                      className="cursor-pointer hover:shadow-md transition-shadow rounded-3xl"
                    >
                      <CardContent
                        className="p-4"
                        onClick={() => addToCart(item)}
                      >
                        <div className="aspect-square mb-3 bg-gray-10 rounded-lg overflow-hidden">
                          <img
                            src={getMenuImageUrl(item.image)}
                            alt={item.nom}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                          />
                        </div>
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {item.nom}
                        </h3>
                        <p className="text-lg font-bold text-orange-600">
                          {item.prix} FCFA
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-2 text-xs px-4 py-2 rounded-full "
                        >
                          {formatCategory(item.categorie)}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Panier / Paiement animés */}
        <div className="w-full h-full lg:w-[340px] xl:w-[360px] order-1 lg:order-2 shrink-0 relative">
          <Card className="sticky top-6 rounded-3xl h-full overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <div
                className="absolute inset-0 flex w-[200%] transition-transform duration-300 ease-in-out"
                style={{
                  transform:
                    activePanel === "cart"
                      ? "translateX(0%)"
                      : "translateX(-50%)",
                }}
              >
                {/* Panel Panier */}
                <div className="w-1/2 p-6 flex flex-col">
                  <div className="relative flex items-center justify-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Panier</h2>
                    {cart.length > 0 && activePanel === "cart" && (
                      <Button
                        variant="ghost"
                        onClick={clearCart}
                        className="absolute right-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                      >
                        <TrashSimple size={20} />
                      </Button>
                    )}
                  </div>
                  {cart.length === 0 ? (
                    <div className="flex flex-col justify-center text-center py-8 text-gray-500 flex-1">
                      <p className="pb-3">PANIER VIDE</p>
                      <p className="text-sm">
                        Cliquez sur un plat pour l'ajouter
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map((item) => (
                          <div
                            key={item.menuItem._id}
                            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm"
                          >
                            <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0">
                              <img
                                src={getMenuImageUrl(item.menuItem.image)}
                                alt={item.menuItem.nom}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate text-gray-900">
                                {item.menuItem.nom}
                              </p>
                              <p className="text-sm font-medium text-orange-600">
                                {item.menuItem.prix} FCFA
                              </p>
                            </div>
                            <div className="flex items-center gap-4 p-2 rounded-[1000px] border border-solid border-slate-200">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-1 bg-orange-400 hover:bg-orange-500 rounded-full h-6 w-6"
                                onClick={() =>
                                  updateQuantity(
                                    item.menuItem._id,
                                    item.quantite - 1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4 text-white" />
                              </Button>
                              <span className="font-semibold text-base text-gray-900 min-w-[2ch] text-center">
                                {item.quantite.toString().padStart(2, "0")}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="p-1 bg-orange-400 hover:bg-orange-500 rounded-full h-6 w-6"
                                onClick={() =>
                                  updateQuantity(
                                    item.menuItem._id,
                                    item.quantite + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4 text-white" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-4 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-700">
                            Total:
                          </span>
                          <span className="text-2xl font-bold text-orange-600">
                            {totalPanier} FCFA
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActivePanel("payment")}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-colors"
                        size="lg"
                        disabled={cart.length === 0}
                      >
                        <Calculator className="w-5 h-5 mr-2" /> Procéder au
                        paiement
                      </Button>
                    </>
                  )}
                </div>
                {/* Panel Paiement */}
                <div className="w-1/2 p-6 flex flex-col border-l border-gray-10">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivePanel("cart")}
                      className="rounded-full px-4"
                    >
                      Retour
                    </Button>
                    <h2 className="text-lg font-semibold">Paiement</h2>
                    <div className="w-16" />
                  </div>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-900">
                        Mode de paiement
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            onClick={() => setModePaiement(method.id as any)}
                            className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                              modePaiement === method.id
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                {method.isImage ? (
                                  <img
                                    src={method.imageSrc}
                                    alt={method.label}
                                    className="w-10 h-10 object-cover"
                                  />
                                ) : (
                                  method.icon
                                )}
                              </div>
                              <span className="font-medium text-gray-900 text-sm">
                                {method.label}
                              </span>
                            </div>
                            {modePaiement === method.id && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {modePaiement && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-900">
                            {modePaiement === "ESPECES"
                              ? "Montant reçu"
                              : "Montant payé"}
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setMontantRecu(totalPanier.toString())
                            }
                            className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-2 py-1"
                          >
                            Montant exact
                          </Button>
                        </div>
                        <Input
                          type="number"
                          placeholder="Montant en FCFA"
                          value={montantRecu}
                          onChange={(e) => setMontantRecu(e.target.value)}
                          className="rounded-xl border-gray-300 "
                        />
                        {modePaiement === "ESPECES" &&
                          montantRecuNumber > 0 &&
                          monnaie >= 0 && (
                            <p className="text-sm text-green-600 mt-2">
                              Monnaie à rendre: {monnaie} FCFA
                            </p>
                          )}
                        {modePaiement === "ESPECES" &&
                          montantRecuNumber > 0 &&
                          monnaie < 0 && (
                            <p className="text-sm text-red-600 mt-2">
                              Montant insuffisant: {Math.abs(monnaie)} FCFA
                              manquants
                            </p>
                          )}
                        {modePaiement !== "ESPECES" &&
                          montantRecuNumber > 0 &&
                          montantRecuNumber !== totalPanier && (
                            <p className="text-sm text-blue-600 mt-2">
                              Différence:{" "}
                              {montantRecuNumber > totalPanier ? "+" : ""}
                              {montantRecuNumber - totalPanier} FCFA
                            </p>
                          )}
                        {montantRecuNumber === 0 && (
                          <p className="text-sm text-gray-500 mt-2">
                            Montant dû: {totalPanier} FCFA
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setActivePanel("cart")}
                      className="flex-1 py-2.5 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-5"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={handleProcessOrder}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
                      disabled={
                        !modePaiement ||
                        (modePaiement === "ESPECES" &&
                          montantRecuNumber < totalPanier)
                      }
                    >
                      Valider
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal d'impression du reçu */}
      <PrintReceiptModal
        isOpen={showPrintModal}
        onClose={handleClosePrintModal}
        order={orderToPrint}
        onConfirmPrint={handleConfirmPrint}
      />
    </div>
  );
};
