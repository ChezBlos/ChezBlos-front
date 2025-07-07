import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./button";
import { MobileBottomSheet, BottomSheetAction } from "./mobile-bottom-sheet";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Input } from "./input";
import { Order } from "../../types/order";
import { useMenu } from "../../contexts/MenuContext";
import { useOrder } from "../../contexts/OrderContext";
import { useToast } from "../../hooks/useToast";
import { logger } from "../../utils/logger";

type MobileOrderStep =
  | "categories"
  | "items"
  | "cart"
  | "confirmation"
  | "success";

interface MobileOrderFlowProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
  isEditMode?: boolean;
  onOrderCreated?: () => void;
}

export const MobileOrderFlow: React.FC<MobileOrderFlowProps> = ({
  isOpen,
  onClose,
  isEditMode,
  onOrderCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<MobileOrderStep>("categories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();
  const { getFilteredItems, searchTerm, setSearchTerm } = useMenu();
  const {
    orderItems,
    addItem,
    removeItem,
    getTotalAmount,
    getTotalItems,
    createOrder,
    loading: contextLoading,
    error: contextError,
  } = useOrder();

  // Réinitialiser les erreurs lors du changement d'étape
  useEffect(() => {
    setOrderError(null);
  }, [currentStep]);

  // Menu categories
  const categories = [
    { id: "all", label: "Tous", emoji: "🍽️" },
    { id: "menus", label: "Menus", emoji: "🍽️" },
    { id: "boissons", label: "Boissons", emoji: "🥤" },
    { id: "desserts", label: "Desserts", emoji: "🍰" },
  ];

  const filteredItems = getFilteredItems();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep("items");
  };

  const handleBackToCategories = () => {
    setCurrentStep("categories");
  };

  const handleGoToCart = () => {
    setCurrentStep("cart");
  };

  const handleBackToItems = () => {
    setCurrentStep("items");
  };

  const getItemQuantity = (itemId: string) => {
    const item = orderItems.find((order) => order.id === itemId);
    return item ? item.quantity : 0;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  // Rendu selon l'étape actuelle
  const renderContent = () => {
    switch (currentStep) {
      case "categories":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isEditMode ? "Modifier la commande" : "Nouvelle commande"}
              </h3>
              <p className="text-sm text-gray-600">
                Sélectionnez une catégorie pour commencer
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <BottomSheetAction
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  icon={<span className="text-2xl">{category.emoji}</span>}
                  title={category.label}
                  variant="default"
                />
              ))}
            </div>
          </div>
        );

      case "items":
        const categoryItems =
          selectedCategory === "all"
            ? filteredItems
            : filteredItems.filter(
                (item) => item.categorie === selectedCategory
              );

        return (
          <div className="space-y-4">
            {/* Header avec recherche et retour */}
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToCategories}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>{" "}
            {/* Liste des items */}
            <div className="space-y-3 max-h-64 overflow-y-auto bg-[#EFF1F3] rounded-xl p-3">
              {categoryItems.map((item) => (
                <Card
                  key={item._id}
                  className="bg-white shadow-md border border-gray-20 rounded-2xl overflow-hidden"
                >
                  <CardContent className="flex items-center gap-3 p-3 w-full">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                        <img
                          src={
                            item.imageUrl || item.image || "/img/plat_petit.png"
                          }
                          alt={item.nom}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/img/plat_petit.png";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate w-full">
                          {item.nom}
                        </h3>
                        <p className="font-normal text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {item.description || "Délicieux plat de notre chef"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-4 flex-shrink-0">
                      <span className="font-bold text-2xl text-gray-900">
                        {formatPrice(item.prix)}
                      </span>
                      <span className="font-medium text-xl text-gray-400">
                        XOF
                      </span>
                    </div>

                    {/* Actions */}
                    {getItemQuantity(item._id) > 0 ? (
                      <div className="flex items-center gap-4 p-2 rounded-[1000px] border border-solid border-slate-200 mr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                          onClick={() => removeItem(item._id)}
                        >
                          <Minus className="h-4 w-4 text-white" />
                        </Button>
                        <span className="font-semibold text-base text-gray-900 min-w-[2ch] text-center">
                          {getItemQuantity(item._id)
                            .toString()
                            .padStart(2, "0")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                          onClick={() => addItem(item)}
                        >
                          <Plus className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white mr-4"
                        onClick={() => addItem(item)}
                      >
                        <span className="font-semibold text-sm text-white">
                          Ajouter
                        </span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>{" "}
            {/* Footer avec panier */}
            {orderItems.length > 0 && (
              <div className="border-t pt-4 mt-4">
                {" "}
                <Button
                  onClick={handleGoToCart}
                  className="w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white py-3 flex items-center justify-between"
                  disabled={isCreatingOrder || contextLoading}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>Voir le panier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white text-brand-primary-500">
                      {getTotalItems()}
                    </Badge>
                    <span>{formatPrice(getTotalAmount())} XOF</span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        );

      case "cart":
        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToItems}
                className="flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Votre panier
                </h3>
                <p className="text-sm text-gray-600">
                  {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""}
                </p>
              </div>
            </div>{" "}
            {/* Items du panier */}
            <div className="space-y-3 max-h-64 overflow-y-auto bg-[#EFF1F3] rounded-xl p-3">
              {orderItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white shadow-md border border-gray-20 rounded-2xl overflow-hidden"
                >
                  <CardContent className="flex items-center gap-3 p-3 w-full">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image || "/img/plat_petit.png"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate w-full">
                          {item.name}
                        </h3>
                        <p className="font-normal text-sm text-gray-600">
                          {formatPrice(item.price)} XOF × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-4 flex-shrink-0">
                      <span className="font-bold text-2xl text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <span className="font-medium text-xl text-gray-400">
                        XOF
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 p-2 rounded-[1000px] border border-solid border-slate-200 mr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                        onClick={() => removeItem(item.id)}
                      >
                        <Minus className="h-4 w-4 text-white" />
                      </Button>
                      <span className="font-semibold text-base text-gray-900 min-w-[2ch] text-center">
                        {item.quantity.toString().padStart(2, "0")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                        onClick={() =>
                          addItem({
                            _id: item.id,
                            nom: item.name,
                            prix: item.price,
                            categorie: "menus" as any, // Fallback temporaire
                            imageUrl: item.image,
                            disponible: false,
                            dateCreation: "",
                            createdAt: "",
                            updatedAt: "",
                          })
                        }
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Total et validation */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>{" "}
                <span className="text-lg font-bold text-brand-primary-500">
                  {formatPrice(getTotalAmount())} XOF
                </span>
              </div>{" "}
              <div className="space-y-2">
                <Button
                  onClick={() => setCurrentStep("confirmation")}
                  className="w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white py-3"
                  disabled={
                    orderItems.length === 0 || isCreatingOrder || contextLoading
                  }
                >
                  Confirmer la commande
                </Button>

                <Button
                  onClick={() => setCurrentStep("items")}
                  variant="outline"
                  className="w-full"
                  disabled={isCreatingOrder || contextLoading}
                >
                  Ajouter d'autres articles
                </Button>
              </div>
            </div>
          </div>
        );
      case "confirmation":
        const handleCreateOrder = async () => {
          // Validation préalable
          if (orderItems.length === 0) {
            setOrderError("Aucun article dans la commande");
            showError("Commande vide", "Veuillez ajouter au moins un article");
            return;
          }

          // Validation des données d'articles
          const invalidItems = orderItems.filter(
            (item) => !item.id || item.quantity <= 0
          );
          if (invalidItems.length > 0) {
            setOrderError("Données invalides dans la commande");
            showError(
              "Données invalides",
              "Certains articles ont des données incorrectes"
            );
            return;
          }

          try {
            setIsCreatingOrder(true);
            setOrderError(null);

            logger.debug("🎯 Début création commande mobile - Données:", {
              nombreArticles: orderItems.length,
              montantTotal: getTotalAmount(),
              articles: orderItems.map((item) => ({
                id: item.id,
                nom: item.name,
                quantite: item.quantity,
                prix: item.price,
              })),
            });

            // Utiliser la méthode createOrder du contexte
            const createdOrder = await createOrder();
            if (createdOrder) {
              logger.debug("✅ Commande créée avec succès:", createdOrder);

              // Feedback haptic sur mobile (si supporté)
              if ("vibrate" in navigator) {
                navigator.vibrate([100, 50, 100]); // Pattern de vibration de succès
              }

              showSuccess(
                "Commande créée !",
                `Commande ${createdOrder.numeroCommande} créée avec succès`
              );
              setCurrentStep("success");
              // Callback pour notifier le parent que la commande a été créée
              if (onOrderCreated) {
                onOrderCreated();
              }
            } else {
              const errorMsg = "Erreur lors de la création de la commande";
              setOrderError(errorMsg);
              showError("Échec de création", errorMsg);

              // Feedback haptic d'erreur sur mobile
              if ("vibrate" in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]); // Pattern de vibration d'erreur
              }
            }
          } catch (error) {
            logger.error("❌ Erreur lors de la création de commande:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Erreur inconnue lors de la création de la commande";

            setOrderError(errorMessage);
            showError("Échec de création", errorMessage);

            // Feedback haptic d'erreur sur mobile
            if ("vibrate" in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
          } finally {
            setIsCreatingOrder(false);
          }
        };

        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmer votre commande
              </h3>
              <p className="text-sm text-gray-600">
                Vérifiez les détails avant de valider
              </p>
            </div>{" "}
            {/* Résumé de la commande */}
            <div className="bg-gray-5 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(getTotalAmount())} XOF
                </span>
              </div>
            </div>
            {/* Affichage des erreurs */}
            {(orderError || contextError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  {orderError || contextError}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {" "}
              <Button
                onClick={handleCreateOrder}
                className="w-full bg-brand-primary-500 hover:bg-brand-primary-600 text-white py-3"
                disabled={
                  orderItems.length === 0 || isCreatingOrder || contextLoading
                }
              >
                {isCreatingOrder || contextLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
              <Button
                onClick={() => setCurrentStep("cart")}
                variant="outline"
                className="w-full"
                disabled={isCreatingOrder || contextLoading}
              >
                Retour au panier
              </Button>
            </div>
          </div>
        );
      case "success":
        const handleNewOrder = () => {
          // Réinitialiser l'état du flux mobile mais garder le contexte pour une nouvelle commande
          setCurrentStep("categories");
          setSelectedCategory("all");
          setIsCreatingOrder(false);
          setOrderError(null);
        };

        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Commande créée !
              </h3>
              <p className="text-sm text-gray-600">
                Votre commande a été enregistrée avec succès
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  onClose();
                  if (onOrderCreated) onOrderCreated();
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
              >
                Terminer
              </Button>

              <Button
                onClick={handleNewOrder}
                variant="outline"
                className="w-full"
              >
                Nouvelle commande
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case "categories":
        return "Choisir une catégorie";
      case "items":
        return (
          categories.find((c) => c.id === selectedCategory)?.label || "Articles"
        );
      case "cart":
        return "Panier";
      case "confirmation":
        return "Confirmation";
      default:
        return "Nouvelle commande";
    }
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      maxHeight="80vh"
      showHandle={true}
    >
      {renderContent()}
    </MobileBottomSheet>
  );
};
