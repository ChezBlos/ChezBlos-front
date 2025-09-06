import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItemResponse } from "../types/menu";
import { CreateOrderRequest, Order } from "../types/order";
import { OrderService } from "../services/orderService";

interface OrderItem {
  id: string; // ID du menu item
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
  notes?: string;
}

interface OrderContextType {
  orderItems: OrderItem[];
  orderNotes: string;
  tableNumber: string;
  loading: boolean;
  error: string | null;
  isEditMode: boolean;
  orderToEdit: Order | null;
  addItem: (item: MenuItemResponse) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemNotes: (id: string, notes: string) => void;
  setOrderNotes: (notes: string) => void;
  setTableNumber: (table: string) => void;
  clearOrder: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  createOrder: () => Promise<Order | null>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: React.ReactNode;
  orderToEdit?: Order | null;
  isEditMode?: boolean;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({
  children,
  orderToEdit = null,
  isEditMode = false,
}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Initialiser les données quand on est en mode édition
  useEffect(() => {
    if (isEditMode && orderToEdit) {
      // Convertir les items de la commande au format OrderItem du contexte
      const convertedItems: OrderItem[] = orderToEdit.items.map((item) => {
        // Extraire l'ID du menuItem - peut être un string ou un objet après populate
        let menuItemId: string;
        if (typeof item.menuItem === "string") {
          menuItemId = item.menuItem;
        } else if (
          item.menuItem &&
          typeof item.menuItem === "object" &&
          "_id" in item.menuItem
        ) {
          // Si menuItem est populé avec l'objet complet
          menuItemId = (item.menuItem as any)._id;
        } else {
          menuItemId = "";
        }

        return {
          id: menuItemId,
          name: item.nom || "Produit",
          description: "",
          price: item.prixUnitaire || 0,
          currency: "XOF",
          image: item.image || "",
          quantity: item.quantite,
          notes: item.notes || "",
        };
      });
      setOrderItems(convertedItems);
      setOrderNotes(orderToEdit.notes || "");
    }
  }, [isEditMode, orderToEdit]);

  const addItem = (item: MenuItemResponse) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((orderItem) => orderItem.id === item._id);
      if (existingItem) {
        return prev.map((orderItem) =>
          orderItem.id === item._id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [
          ...prev,
          {
            id: item._id,
            name: item.nom,
            description: item.description || "",
            price: item.prix,
            currency: "XOF",
            image: item.imageUrl || item.image || "",
            quantity: 1,
            notes: "",
          },
        ];
      }
    });
  };

  const removeItem = (id: string) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prev.filter((item) => item.id !== id);
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setOrderItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const updateItemNotes = (id: string, notes: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };
  const clearOrder = () => {
    setOrderItems([]);
    setOrderNotes("");
    setTableNumber("");
    setError(null);
  };

  const getTotalAmount = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };
  const createOrder = async (): Promise<Order | null> => {
    if (orderItems.length === 0) {
      setError("Aucun article dans la commande");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData: CreateOrderRequest = {
        items: orderItems.map((item) => ({
          menuItem: item.id,
          quantite: item.quantity,
          notes: item.notes || "",
        })),
        notes: orderNotes || undefined,
        modePaiement: "ESPECES", // Mode de paiement par défaut pour le nouveau workflow
      };
      let result: Order;

      if (isEditMode && orderToEdit) {
        // Utiliser updateOrderComplete pour permettre la modification des items
        result = await OrderService.updateOrderComplete(
          orderToEdit._id,
          orderData
        );
      } else {
        result = await OrderService.createOrder(orderData);
      }

      // Réinitialiser la commande après création/modification
      clearOrder();

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de la commande";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  return (
    <OrderContext.Provider
      value={{
        orderItems,
        orderNotes,
        tableNumber,
        loading,
        error,
        isEditMode,
        orderToEdit,
        addItem,
        removeItem,
        updateQuantity,
        updateItemNotes,
        setOrderNotes,
        setTableNumber,
        clearOrder,
        getTotalAmount,
        getTotalItems,
        createOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
