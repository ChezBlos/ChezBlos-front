// Types pour l'API Menu côté Frontend
export interface MenuItemResponse {
  _id: string;
  nom: string;
  description?: string;
  prix: number;
  categorie: MenuCategory;
  disponible: boolean;
  image?: string;
  imageUrl?: string; // URL complète formatée par le backend
  dateCreation: string;
  dateModification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuByCategoryResponse {
  _id: MenuCategory;
  items: MenuItemResponse[];
  count: number;
}

export interface PaginatedMenuResponse {
  data: MenuItemResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export enum MenuCategory {
  ENTREE = "ENTREE",
  PLAT_PRINCIPAL = "PLAT_PRINCIPAL",
  DESSERT = "DESSERT",
  BOISSON = "BOISSON",
  ACCOMPAGNEMENT = "ACCOMPAGNEMENT",
}

export interface CreateMenuItemRequest {
  nom: string;
  description?: string;
  prix: number;
  categorie: MenuCategory;
  image?: string;
}

export interface UpdateMenuItemRequest {
  nom?: string;
  description?: string;
  prix?: number;
  categorie?: MenuCategory;
  image?: string;
  disponible?: boolean;
}

export interface MenuSearchParams {
  query?: string;
  categorie?: MenuCategory;
  prixMin?: number;
  prixMax?: number;
  tempsPreparationMax?: number;
  disponible?: boolean;
}

export interface UploadImageResponse {
  imageUrl: string;
  filename: string;
  originalName: string;
  size: number;
}
