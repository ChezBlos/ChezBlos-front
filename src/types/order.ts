// Types pour les commandes
export interface OrderItem {
  menuItem:
    | string
    | {
        _id: string;
        nom: string;
        prix: number;
        categorie: string;
        image?: string;
      }; // ID du menu item ou objet populé
  quantite: number;
  notes?: string;
  // Propriétés ajoutées par le backend lors du populate
  nom?: string; // Nom du plat (populé depuis MenuItem)
  prixUnitaire?: number; // Prix unitaire (populé depuis MenuItem)
  image?: string; // Image du plat (populée depuis MenuItem)
}

export interface CreateOrderRequest {
  items: OrderItem[];
  notes?: string;
  modePaiement:
    | "ESPECES"
    | "CARTE_BANCAIRE"
    | "WAVE"
    | "MTN_MONEY"
    | "ORANGE_MONEY"
    | "MOOV_MONEY";
  montantPaye?: number; // Pour les paiements en espèces
}

export interface Order {
  motifAnnulation?: string;
  _id: string;
  numeroCommande: string;
  items: OrderItem[];
  montantTotal: number;
  statut: "TERMINE" | "ANNULE";
  notes?: string;
  modePaiement: string;
  montantPaye?: number; // Montant donné par le client (pour espèces)
  monnaie?: number; // Monnaie à rendre (pour espèces)
  caissier: {
    _id: string;
    nom: string;
    prenom: string;
    photoProfil?: string;
  };
  dateCreation: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  total: number;
  aujourdhui: number;
  hier: number;
  termine: number;
  annule: number;
  chiffreAffairesJour: number;
}

export interface PaginatedOrdersResponse {
  data: Order[];
  message: string;
}

export interface KitchenOrder {
  _id: string;
  numeroCommande: string;
  items: OrderItem[];
  statut: string;
  numeroTable?: number;
  notes?: string;
  dateCreation: string;
  serveur: {
    nom: string;
    prenom: string;
  };
}

// Types pour les paramètres de recherche
export interface OrderSearchParams {
  page?: number;
  limit?: number;
  statut?: string;
  serveur?: string;
  table?: string;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
}
