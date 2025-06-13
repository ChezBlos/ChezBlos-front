import React, { createContext, useContext, useState, useEffect } from "react";
import { MenuItemResponse, MenuCategory } from "../types/menu";
import { useMenuByCategory } from "../hooks/useMenuAPI";

type CategoryType = "all" | "menus" | "boissons" | "desserts";

interface MenuContextType {
  searchTerm: string;
  selectedCategory: CategoryType;
  menuItems: MenuItemResponse[];
  loading: boolean;
  error: string | null;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: CategoryType) => void;
  getFilteredItems: () => MenuItemResponse[];
  refetchMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Fonction pour mapper les catégories frontend vers backend
const mapCategoryToBackend = (category: CategoryType): MenuCategory | null => {
  switch (category) {
    case "menus":
      return MenuCategory.PLAT_PRINCIPAL;
    case "boissons":
      return MenuCategory.BOISSON;
    case "desserts":
      return MenuCategory.DESSERT;
    default:
      return null;
  }
};

// Fonction pour mapper les catégories backend vers frontend
const mapCategoryToFrontend = (category: MenuCategory): CategoryType => {
  switch (category) {
    case MenuCategory.PLAT_PRINCIPAL:
    case MenuCategory.ENTREE:
    case MenuCategory.ACCOMPAGNEMENT:
      return "menus";
    case MenuCategory.BOISSON:
      return "boissons";
    case MenuCategory.DESSERT:
      return "desserts";
    default:
      return "menus";
  }
};

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const { data: menuByCategory, loading, error, refetch } = useMenuByCategory();

  // Transformer les données de l'API en liste plate d'items
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);

  useEffect(() => {
    if (menuByCategory) {
      const allItems = menuByCategory.flatMap((category) => category.items);
      setMenuItems(allItems);
    }
  }, [menuByCategory]);

  const getFilteredItems = () => {
    let filtered = menuItems.filter((item) => item.disponible);

    // Filtrer par catégorie
    if (selectedCategory !== "all") {
      const backendCategory = mapCategoryToBackend(selectedCategory);
      if (backendCategory) {
        filtered = filtered.filter(
          (item) => item.categorie === backendCategory
        );
      }
    }

    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nom.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  };

  return (
    <MenuContext.Provider
      value={{
        searchTerm,
        selectedCategory,
        menuItems,
        loading,
        error,
        setSearchTerm,
        setSelectedCategory,
        getFilteredItems,
        refetchMenu: refetch,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
