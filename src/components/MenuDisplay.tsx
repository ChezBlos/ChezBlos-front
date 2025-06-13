import React from "react";
import { useMenuByCategory } from "../hooks/useMenuAPI";
import { MenuCategory } from "../types/menu";
import MenuItemImage from "./MenuItemImage";
import { SpinnerSmall } from "./ui/spinner";

const MenuDisplay: React.FC = () => {
  const { data: menuByCategory, loading, error } = useMenuByCategory();
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <SpinnerSmall />
        <span className="ml-2 text-gray-600">Chargement du menu...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur : {error}
        </div>
      </div>
    );
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case MenuCategory.ENTREE:
        return "Entrées";
      case MenuCategory.PLAT_PRINCIPAL:
        return "Plats Principaux";
      case MenuCategory.DESSERT:
        return "Desserts";
      case MenuCategory.BOISSON:
        return "Boissons";
      case MenuCategory.ACCOMPAGNEMENT:
        return "Accompagnements";
      default:
        return category;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="heading-lg text-gray-900 mb-8 text-center">Notre Menu</h1>

      {menuByCategory.map((category) => (
        <div key={category._id} className="mb-12">
          <h2 className="heading-md text-gray-800 mb-6 border-b-2 border-orange-500 pb-2">
            {getCategoryDisplayName(category._id)} ({category.count} plats)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {" "}
                {/* Image du plat */}
                <div className="relative h-48">
                  <MenuItemImage
                    src={item.imageUrl || item.image}
                    alt={item.nom}
                    className="h-48"
                  />

                  {/* Badge de disponibilité */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.disponible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.disponible ? "Disponible" : "Indisponible"}
                    </span>
                  </div>
                </div>
                {/* Contenu de la carte */}
                <div className="p-4">
                  <h3 className="font-gilroy-bold text-lg text-gray-900 mb-2">
                    {item.nom}
                  </h3>

                  {item.description && (
                    <p className="body-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="font-gilroy-bold text-xl text-orange-500">
                      {item.prix.toLocaleString()} XOF
                    </span>

                    <button
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        item.disponible
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={!item.disponible}
                    >
                      {item.disponible ? "Ajouter" : "Indisponible"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {menuByCategory.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="heading-sm text-gray-600 mb-2">
            Aucun plat disponible
          </h3>
          <p className="body-md text-gray-500">
            Le menu sera bientôt disponible.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuDisplay;
