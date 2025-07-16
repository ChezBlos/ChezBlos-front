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
  numeroTable?: number;
  notes?: string;
  modePaiement?:
    | "ESPECES"
    | "CARTE_BANCAIRE"
    | "WAVE"
    | "MTN_MONEY"
    | "ORANGE_MONEY"
    | "MOOV_MONEY";
}

export interface Order {
  motifAnnulation?: string;
  _id: string;
  numeroCommande: string;
  items: OrderItem[];
  montantTotal: number; // Changé de "total" à "montantTotal" pour correspondre au backend
  statut:
    | "EN_ATTENTE"
    | "EN_PREPARATION"
    | "EN_COURS"
    | "PRET"
    | "EN_ATTENTE_PAIEMENT"
    | "TERMINE"
    | "ANNULE";
  numeroTable?: number; // Changé de "table" à "numeroTable"
  notes?: string;
  modePaiement?: string;
  serveur: {
    _id: string;
    nom: string;
    prenom: string;
    photoProfil?: string;
  };
  dateCreation: string;
  dateModification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  total: number;
  aujourdhui: number;
  hier: number;
  enAttente: number;
  enPreparation: number;
  enCours: number;
  pret: number;
  enAttentePaiement: number;
  termine: number;
  annule: number;
  chiffreAffairesJour: number;
  chiffreAffairesMois: number;
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
