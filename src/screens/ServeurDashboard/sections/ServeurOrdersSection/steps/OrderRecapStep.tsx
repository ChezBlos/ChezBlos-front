import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Separator } from "../../../../../components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "menus" | "boissons" | "desserts";
}

interface OrderRecapStepProps {
  orderItems: OrderItem[];
  addItem: (item: Omit<OrderItem, "quantity">) => void;
  removeItem: (itemId: string) => void;
  removeAllItems: (itemId: string) => void;
  onNext: () => void;
  onBack: () => void;
  totalAmount: number;
}

export const OrderRecapStep: React.FC<OrderRecapStepProps> = ({
  orderItems,
  addItem,
  removeItem,
  removeAllItems,
  onNext,
  totalAmount,
}) => {
  // Formatage du prix
  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} XOF`;
  };
  // Fonction pour obtenir le label d'une catégorie
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      menus: "Menu",
      boissons: "Boisson",
      desserts: "Dessert",
    };
    return labels[category] || category;
  };

  // Gérer la suppression complète d'un article
  const handleRemoveCompleteItem = (itemId: string) => {
    if (removeAllItems) {
      removeAllItems(itemId);
    } else {
      // Fallback: utiliser removeItem en boucle
      const item = orderItems.find((orderItem) => orderItem.id === itemId);
      if (item) {
        for (let i = 0; i < item.quantity; i++) {
          removeItem(itemId);
        }
      }
    }
  };

  // Grouper les articles par catégorie
  const groupedItems = orderItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, OrderItem[]>);

  const categoryOrder = ["menus", "boissons", "desserts"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Récapitulatif de votre commande
        </h3>
        <p className="text-sm text-gray-600">
          Vérifiez les articles et modifiez les quantités si nécessaire
        </p>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto px-6">
        {orderItems.length > 0 ? (
          <div className="space-y-6">
            {categoryOrder.map((category) => {
              const categoryItems = groupedItems[category];
              if (!categoryItems || categoryItems.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-gray-700">
                      {getCategoryLabel(category)}s
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-5 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full"
                              >
                                <Minus size={14} />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                onClick={() =>
                                  addItem({
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    category: item.category,
                                  })
                                }
                                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600"
                              >
                                <Plus size={14} />
                              </Button>
                            </div>{" "}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCompleteItem(item.id)}
                              className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </Button>
                            <div className="text-right min-w-[80px]">
                              <span className="font-medium text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Votre panier est vide</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Retour à la sélection
            </Button>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="p-6 pt-4 border-t border-gray-200 bg-white">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">
                    {formatPrice(totalAmount)}
                  </span>
                </div>{" "}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes (0%)</span>
                  <span className="text-gray-900">0 XOF</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-500">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {orderItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              article(s)
            </div>
            <Button
              onClick={onNext}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
            >
              Valider la commande
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
