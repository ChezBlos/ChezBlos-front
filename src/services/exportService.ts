import * as XLSX from "xlsx";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { LOGO_BASE64, LOGO_CONFIG } from "../utils/logoBase64";

// Configuration des polices pour pdfMake
try {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

  // Définir les polices disponibles
  (pdfMake as any).fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
} catch (error) {
  console.warn("Erreur lors du chargement des polices pdfMake:", error);
}

export interface ExportableOrder {
  _id: string;
  numeroCommande: string;
  serveur?: {
    nom?: string;
    prenom?: string;
  };
  numeroTable?: number;
  items: Array<{
    nom?: string;
    quantite: number;
    menuItem?: {
      nom?: string;
    };
  }>;
  montantTotal: number;
  statut: string;
  modePaiement?: string;
  dateCreation: string;
}

// Interface pour les utilisateurs exportables
export interface ExportableUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  dateCreation: string;
}

// Interface pour les utilisateurs exportables
export interface ExportableUser {
  _id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: "ADMIN" | "SERVEUR" | "CUISINIER";
  isCaissier: boolean;
  actif: boolean;
  dateCreation: string;
}

export interface ExportableStockItem {
  _id: string;
  nom: string;
  categorie?: string;
  quantiteStock: number;
  unite: string;
  seuilAlerte: number;
  prixAchat?: number;
  fournisseur?: string;
  datePeremption?: string;
  dateCreation: string;
  dateModification: string;
}

export class ExportService {
  /**
   * Formate les données des commandes pour l'export
   */
  private static formatOrdersForExport(orders: ExportableOrder[]) {
    return orders.map((order) => ({
      "N° Commande": order.numeroCommande,
      Serveur: order.serveur
        ? `${order.serveur.prenom || ""} ${order.serveur.nom || ""}`.trim()
        : "Non défini",
      "N° Table": order.numeroTable || "Non définie",
      Articles: order.items
        .map((item) => {
          const nom =
            typeof item.menuItem === "object" && item.menuItem !== null
              ? item.menuItem.nom
              : item.nom || "Article";
          return `${nom} x${item.quantite}`;
        })
        .join(", "),
      "Montant (XOF)": order.montantTotal,
      Statut: order.statut,
      "Mode de paiement": order.modePaiement || "Non défini",
      "Date/Heure": new Date(order.dateCreation).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  }

  /**
   * Exporte les commandes en Excel
   */
  static exportToExcel(orders: ExportableOrder[], filename?: string) {
    try {
      const formattedData = this.formatOrdersForExport(orders);

      // Créer un nouveau classeur
      const workbook = XLSX.utils.book_new();

      // Créer une feuille de calcul
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 15 }, // N° Commande
        { wch: 20 }, // Serveur
        { wch: 10 }, // N° Table
        { wch: 40 }, // Articles
        { wch: 15 }, // Montant
        { wch: 15 }, // Statut
        { wch: 20 }, // Mode de paiement
        { wch: 20 }, // Date/Heure
      ];
      worksheet["!cols"] = colWidths;

      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(workbook, worksheet, "Historique Commandes");

      // Générer le nom de fichier
      const defaultFilename = `historique_commandes_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Télécharger le fichier
      XLSX.writeFile(workbook, filename || defaultFilename);

      return true;
    } catch (error) {
      console.error("Erreur lors de l'export Excel:", error);
      throw new Error("Erreur lors de l'export Excel");
    }
  }
  /**
   * Exporte les commandes en PDF avec pdfMake
   */
  static exportToPDF(orders: ExportableOrder[], filename?: string) {
    try {
      const formattedData = this.formatOrdersForExport(orders);

      // Statistiques rapides
      const totalCommandes = orders.length;
      const totalCA = orders.reduce(
        (sum, order) => sum + order.montantTotal,
        0
      );
      const commandesTerminees = orders.filter(
        (order) => order.statut === "TERMINE"
      ).length;

      // Préparer les données pour le tableau
      const tableBody = [
        // En-tête du tableau
        [
          { text: "N° Commande", style: "tableHeader" },
          { text: "Serveur", style: "tableHeader" },
          { text: "Table", style: "tableHeader" },
          { text: "Articles", style: "tableHeader" },
          { text: "Montant (XOF)", style: "tableHeader" },
          { text: "Statut", style: "tableHeader" },
          { text: "Paiement", style: "tableHeader" },
          { text: "Date/Heure", style: "tableHeader" },
        ],
        // Données
        ...formattedData.map((row) => [
          { text: row["N° Commande"], style: "tableCell" },
          { text: row["Serveur"], style: "tableCell" },
          { text: row["N° Table"], style: "tableCell" },
          {
            text:
              row["Articles"].length > 40
                ? row["Articles"].substring(0, 40) + "..."
                : row["Articles"],
            style: "tableCell",
          },
          {
            text:
              typeof row["Montant (XOF)"] === "number"
                ? row["Montant (XOF)"].toLocaleString("fr-FR")
                : parseFloat(row["Montant (XOF)"])
                ? Number(row["Montant (XOF)"]).toLocaleString("fr-FR")
                : "-",
            style: "tableCell",
            alignment: "right",
          },
          { text: row["Statut"], style: "tableCell" },
          { text: row["Mode de paiement"], style: "tableCell" },
          { text: row["Date/Heure"], style: "tableCell" },
        ]),
      ];

      // Définition du document PDF
      const documentDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [40, 60, 40, 60],

        // En-tête avec logo
        header: {
          columns: [
            {
              image: LOGO_BASE64,
              width: LOGO_CONFIG.width,
              height: LOGO_CONFIG.height,
              margin: [40, 20, 0, 0],
            },
            {
              text: [
                { text: "CHEZ BLOS\n", style: "companyName" },
                { text: "Restaurant & Café", style: "companySubtitle" },
              ],
              margin: [20, 25, 0, 0],
            },
            {
              text: `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
              style: "dateGeneration",
              alignment: "right",
              margin: [0, 30, 40, 0],
            },
          ],
        },

        // Contenu principal
        content: [
          // Titre principal
          {
            text: "HISTORIQUE DES COMMANDES",
            style: "title",
            alignment: "center",
            margin: [0, 20, 0, 20],
          },

          // Statistiques
          {
            columns: [
              {
                text: [
                  { text: "Total Commandes: ", style: "statLabel" },
                  { text: totalCommandes.toString(), style: "statValue" },
                ],
              },
              {
                text: [
                  { text: "CA Total: ", style: "statLabel" },
                  {
                    text: `${totalCA.toLocaleString()} XOF`,
                    style: "statValue",
                  },
                ],
              },
              {
                text: [
                  { text: "Terminées: ", style: "statLabel" },
                  { text: commandesTerminees.toString(), style: "statValue" },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },

          // Tableau des commandes
          {
            table: {
              headerRows: 1,
              widths: [
                "auto",
                "auto",
                "auto",
                "*",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => {
                if (rowIndex === 0) return "#F97316"; // Orange pour l'en-tête
                return rowIndex % 2 === 0 ? "#F9FAFB" : null; // Alternance de couleurs
              },
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#E5E7EB",
              vLineColor: () => "#E5E7EB",
            },
          },
        ],

        // Pied de page
        footer: (currentPage: number, pageCount: number) => ({
          text: `Page ${currentPage} sur ${pageCount} - Chez Blos © ${new Date().getFullYear()}`,
          alignment: "center",
          style: "footer",
          margin: [0, 10, 0, 0],
        }),

        // Styles
        styles: {
          companyName: {
            fontSize: 18,
            bold: true,
            color: "#F97316",
          },
          companySubtitle: {
            fontSize: 12,
            color: "#6B7280",
            italics: true,
          },
          dateGeneration: {
            fontSize: 10,
            color: "#6B7280",
          },
          title: {
            fontSize: 20,
            bold: true,
            color: "#1F2937",
          },
          statLabel: {
            fontSize: 11,
            color: "#374151",
            bold: true,
          },
          statValue: {
            fontSize: 11,
            color: "#F97316",
            bold: true,
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: "#FFFFFF",
            alignment: "center",
          },
          tableCell: {
            fontSize: 9,
            color: "#374151",
          },
          footer: {
            fontSize: 8,
            color: "#9CA3AF",
          },
        },

        // Polices par défaut
        defaultStyle: {
          font: "Roboto",
        },
      };

      // Générer et télécharger le PDF
      const defaultFilename = `historique_commandes_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      pdfMake
        .createPdf(documentDefinition)
        .download(filename || defaultFilename);

      return true;
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      throw new Error("Erreur lors de l'export PDF");
    }
  }

  /**
   * Exporte les statistiques de commandes
   */
  static exportStats(
    orders: ExportableOrder[],
    format: "excel" | "pdf" = "excel"
  ) {
    try {
      // Calculer les statistiques
      const stats = {
        totalCommandes: orders.length,
        commandesTerminees: orders.filter((o) => o.statut === "TERMINE").length,
        commandesAnnulees: orders.filter((o) => o.statut === "ANNULE").length,
        chiffreAffaires: orders
          .filter((o) => o.statut === "TERMINE")
          .reduce((sum, o) => sum + o.montantTotal, 0),
        // Statistiques par serveur
        parServeur: orders.reduce((acc: any, order) => {
          const serveurNom = order.serveur
            ? `${order.serveur.prenom || ""} ${order.serveur.nom || ""}`.trim()
            : "Non défini";

          if (!acc[serveurNom]) {
            acc[serveurNom] = { count: 0, chiffre: 0 };
          }
          acc[serveurNom].count++;
          if (order.statut === "TERMINE") {
            acc[serveurNom].chiffre += order.montantTotal;
          }
          return acc;
        }, {}),
        // Statistiques par mode de paiement
        parPaiement: orders.reduce((acc: any, order) => {
          const paiement = order.modePaiement || "Non défini";
          if (!acc[paiement]) {
            acc[paiement] = { count: 0, chiffre: 0 };
          }
          acc[paiement].count++;
          if (order.statut === "TERMINE") {
            acc[paiement].chiffre += order.montantTotal;
          }
          return acc;
        }, {}),
      };

      if (format === "excel") {
        const workbook = XLSX.utils.book_new();

        // Feuille des statistiques générales
        const generalStats = [
          ["Statistique", "Valeur"],
          ["Total commandes", stats.totalCommandes],
          ["Commandes terminées", stats.commandesTerminees],
          ["Commandes annulées", stats.commandesAnnulees],
          ["Chiffre d'affaires (XOF)", stats.chiffreAffaires],
        ];

        const wsGeneral = XLSX.utils.aoa_to_sheet(generalStats);
        XLSX.utils.book_append_sheet(
          workbook,
          wsGeneral,
          "Statistiques Générales"
        );

        // Feuille par serveur
        const serveurData = [
          ["Serveur", "Commandes", "Chiffre d'affaires (XOF)"],
          ...Object.entries(stats.parServeur).map(
            ([nom, data]: [string, any]) => [nom, data.count, data.chiffre]
          ),
        ];

        const wsServeur = XLSX.utils.aoa_to_sheet(serveurData);
        XLSX.utils.book_append_sheet(workbook, wsServeur, "Par Serveur");

        // Feuille par mode de paiement
        const paiementData = [
          ["Mode de paiement", "Commandes", "Chiffre d'affaires (XOF)"],
          ...Object.entries(stats.parPaiement).map(
            ([mode, data]: [string, any]) => [mode, data.count, data.chiffre]
          ),
        ];

        const wsPaiement = XLSX.utils.aoa_to_sheet(paiementData);
        XLSX.utils.book_append_sheet(
          workbook,
          wsPaiement,
          "Par Mode de Paiement"
        );

        XLSX.writeFile(
          workbook,
          `statistiques_commandes_${
            new Date().toISOString().split("T")[0]
          }.xlsx`
        );
      }

      return true;
    } catch (error) {
      console.error("Erreur lors de l'export des statistiques:", error);
      throw new Error("Erreur lors de l'export des statistiques");
    }
  }

  /**
   * Formate les données des utilisateurs pour l'export
   */
  private static formatUsersForExport(users: ExportableUser[]) {
    return users.map((user, index) => ({
      "N°": index + 1,
      Nom: user.nom,
      Prénom: user.prenom,
      Email: user.email || "N/A",
      Téléphone: user.telephone || "N/A",
      Rôle: this.formatRole(user.role),
      Caissier: user.isCaissier ? "Oui" : "Non",
      Statut: user.actif ? "Actif" : "Inactif",
      "Date de création": new Date(user.dateCreation).toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      ID: user._id,
    }));
  }

  /**
   * Formate le rôle utilisateur
   */
  private static formatRole(role: string): string {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "Administrateur";
      case "SERVEUR":
        return "Serveur";
      case "CUISINIER":
        return "Cuisinier";
      default:
        return role;
    }
  }

  /**
   * Exporte les utilisateurs en Excel
   */
  static exportUsersToExcel(users: ExportableUser[], filename?: string) {
    try {
      const formattedData = this.formatUsersForExport(users);

      // Créer un workbook et une worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 5 }, // N°
        { wch: 15 }, // Nom
        { wch: 15 }, // Prénom
        { wch: 25 }, // Email
        { wch: 15 }, // Téléphone
        { wch: 12 }, // Rôle
        { wch: 8 }, // Caissier
        { wch: 10 }, // Statut
        { wch: 18 }, // Date création
        { wch: 10 }, // ID
      ];
      worksheet["!cols"] = colWidths;

      // Ajouter la worksheet au workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Personnel");

      // Créer une feuille de statistiques
      const stats = this.calculateUserStats(users);
      const statsData = [
        { Métrique: "Total personnel", Valeur: stats.total },
        { Métrique: "Utilisateurs actifs", Valeur: stats.actifs },
        { Métrique: "Utilisateurs inactifs", Valeur: stats.inactifs },
        { Métrique: "Administrateurs", Valeur: stats.admins },
        { Métrique: "Serveurs", Valeur: stats.serveurs },
        { Métrique: "Cuisiniers", Valeur: stats.cuisiniers },
        { Métrique: "Avec accès caisse", Valeur: stats.caissiers },
      ];
      const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
      statsWorksheet["!cols"] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Statistiques");

      // Générer le fichier
      const defaultFilename = `personnel_chez_blos_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, filename || defaultFilename);

      return true;
    } catch (error) {
      console.error("Erreur lors de l'export Excel des utilisateurs:", error);
      throw new Error("Erreur lors de l'export Excel des utilisateurs");
    }
  }

  /**
   * Exporte les utilisateurs en PDF avec pdfMake
   */
  static exportUsersToPDF(users: ExportableUser[], filename?: string) {
    try {
      const formattedData = this.formatUsersForExport(users);
      const stats = this.calculateUserStats(users);

      // Préparer les données pour le tableau
      const tableBody = [
        // En-tête du tableau
        [
          { text: "N°", style: "tableHeader" },
          { text: "Nom complet", style: "tableHeader" },
          { text: "Email", style: "tableHeader" },
          { text: "Téléphone", style: "tableHeader" },
          { text: "Rôle", style: "tableHeader" },
          { text: "Caissier", style: "tableHeader" },
          { text: "Statut", style: "tableHeader" },
          { text: "Date création", style: "tableHeader" },
        ],
        // Données
        ...formattedData.map((row) => [
          { text: row["N°"], style: "tableCell", alignment: "center" },
          { text: `${row["Nom"]} ${row["Prénom"]}`, style: "tableCell" },
          { text: row["Email"], style: "tableCell" },
          { text: row["Téléphone"], style: "tableCell" },
          { text: row["Rôle"], style: "tableCell" },
          { text: row["Caissier"], style: "tableCell", alignment: "center" },
          { text: row["Statut"], style: "tableCell", alignment: "center" },
          { text: row["Date de création"], style: "tableCell" },
        ]),
      ];

      // Définition du document PDF
      const documentDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [40, 60, 40, 60],

        // En-tête avec logo
        header: {
          columns: [
            {
              image: LOGO_BASE64,
              width: LOGO_CONFIG.width,
              height: LOGO_CONFIG.height,
              margin: [40, 20, 0, 0],
            },
            {
              text: `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
              style: "dateGeneration",
              alignment: "right",
              margin: [0, 30, 40, 0],
            },
          ],
        },

        // Contenu principal
        content: [
          // Titre principal
          {
            text: "LISTE DU PERSONNEL",
            style: "title",
            alignment: "center",
            margin: [0, 20, 0, 20],
          },

          // Statistiques
          {
            columns: [
              {
                text: [
                  { text: "Total Personnel: ", style: "statLabel" },
                  { text: stats.total.toString(), style: "statValue" },
                ],
              },
              {
                text: [
                  { text: "Actifs: ", style: "statLabel" },
                  { text: stats.actifs.toString(), style: "statValue" },
                ],
              },
              {
                text: [
                  { text: "Admins: ", style: "statLabel" },
                  { text: stats.admins.toString(), style: "statValue" },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },

          // Tableau du personnel
          {
            table: {
              headerRows: 1,
              widths: [
                "auto",
                "*",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => {
                if (rowIndex === 0) return "#F97316"; // Orange pour l'en-tête
                return rowIndex % 2 === 0 ? "#F9FAFB" : null; // Alternance de couleurs
              },
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#E5E7EB",
              vLineColor: () => "#E5E7EB",
            },
          },
        ],

        // Pied de page
        footer: (currentPage: number, pageCount: number) => ({
          text: `Page ${currentPage} sur ${pageCount} - Chez Blos © ${new Date().getFullYear()}`,
          alignment: "center",
          style: "footer",
          margin: [0, 10, 0, 0],
        }),

        // Styles
        styles: {
          companyName: {
            fontSize: 18,
            bold: true,
            color: "#F97316",
          },
          companySubtitle: {
            fontSize: 12,
            color: "#6B7280",
            italics: true,
          },
          dateGeneration: {
            fontSize: 10,
            color: "#6B7280",
          },
          title: {
            fontSize: 20,
            bold: true,
            color: "#1F2937",
          },
          statLabel: {
            fontSize: 11,
            color: "#374151",
            bold: true,
          },
          statValue: {
            fontSize: 11,
            color: "#F97316",
            bold: true,
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: "#FFFFFF",
            alignment: "center",
          },
          tableCell: {
            fontSize: 9,
            color: "#374151",
          },
          footer: {
            fontSize: 8,
            color: "#9CA3AF",
          },
        },

        // Polices par défaut
        defaultStyle: {
          font: "Roboto",
        },
      };

      // Générer et télécharger le PDF
      const defaultFilename = `personnel_chez_blos_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      pdfMake
        .createPdf(documentDefinition)
        .download(filename || defaultFilename);

      return true;
    } catch (error) {
      console.error("Erreur lors de l'export PDF des utilisateurs:", error);
      throw new Error("Erreur lors de l'export PDF des utilisateurs");
    }
  }

  /**
   * Exporte les statistiques des utilisateurs
   */
  static exportUserStats(
    users: ExportableUser[],
    format: "excel" | "pdf" = "excel"
  ) {
    try {
      const stats = this.calculateUserStats(users);

      if (format === "excel") {
        const workbook = XLSX.utils.book_new();

        // Feuille des statistiques générales
        const generalStats = [
          ["Statistique", "Valeur"],
          ["Total personnel", stats.total],
          ["Utilisateurs actifs", stats.actifs],
          ["Utilisateurs inactifs", stats.inactifs],
          ["Administrateurs", stats.admins],
          ["Serveurs", stats.serveurs],
          ["Cuisiniers", stats.cuisiniers],
          ["Avec accès caisse", stats.caissiers],
        ];

        const wsGeneral = XLSX.utils.aoa_to_sheet(generalStats);
        XLSX.utils.book_append_sheet(
          workbook,
          wsGeneral,
          "Statistiques Générales"
        );

        // Répartition par rôle
        const roleData = [
          ["Rôle", "Nombre", "Pourcentage"],
          [
            "Administrateurs",
            stats.admins,
            `${((stats.admins / stats.total) * 100).toFixed(1)}%`,
          ],
          [
            "Serveurs",
            stats.serveurs,
            `${((stats.serveurs / stats.total) * 100).toFixed(1)}%`,
          ],
          [
            "Cuisiniers",
            stats.cuisiniers,
            `${((stats.cuisiniers / stats.total) * 100).toFixed(1)}%`,
          ],
        ];

        const wsRole = XLSX.utils.aoa_to_sheet(roleData);
        XLSX.utils.book_append_sheet(workbook, wsRole, "Répartition par Rôle");

        // Activité et accès
        const accessData = [
          ["Type", "Nombre", "Pourcentage"],
          [
            "Utilisateurs actifs",
            stats.actifs,
            `${((stats.actifs / stats.total) * 100).toFixed(1)}%`,
          ],
          [
            "Utilisateurs inactifs",
            stats.inactifs,
            `${((stats.inactifs / stats.total) * 100).toFixed(1)}%`,
          ],
          [
            "Avec accès caisse",
            stats.caissiers,
            `${((stats.caissiers / stats.total) * 100).toFixed(1)}%`,
          ],
          [
            "Sans accès caisse",
            stats.total - stats.caissiers,
            `${(((stats.total - stats.caissiers) / stats.total) * 100).toFixed(
              1
            )}%`,
          ],
        ];

        const wsAccess = XLSX.utils.aoa_to_sheet(accessData);
        XLSX.utils.book_append_sheet(workbook, wsAccess, "Accès et Activité");

        XLSX.writeFile(
          workbook,
          `statistiques_personnel_${
            new Date().toISOString().split("T")[0]
          }.xlsx`
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Erreur lors de l'export des statistiques utilisateurs:",
        error
      );
      throw new Error("Erreur lors de l'export des statistiques utilisateurs");
    }
  }

  /**
   * Calcule les statistiques des utilisateurs
   */
  private static calculateUserStats(users: ExportableUser[]) {
    return {
      total: users.length,
      actifs: users.filter((u) => u.actif).length,
      inactifs: users.filter((u) => !u.actif).length,
      admins: users.filter((u) => u.role === "ADMIN").length,
      serveurs: users.filter((u) => u.role === "SERVEUR").length,
      cuisiniers: users.filter((u) => u.role === "CUISINIER").length,
      caissiers: users.filter((u) => u.isCaissier).length,
    };
  }

  /**
   * Formate les données du stock pour l'export
   */
  private static formatStockForExport(stockItems: ExportableStockItem[]) {
    return stockItems.map((item) => ({
      Article: item.nom,
      Catégorie: item.categorie || "N/A",
      Quantité: `${item.quantiteStock} ${item.unite}`,
      "Seuil d'alerte": `${item.seuilAlerte} ${item.unite}`,
      "Prix d'achat (XOF)": item.prixAchat ?? "-",
      Fournisseur: item.fournisseur || "N/A",
      "Date péremption": item.datePeremption
        ? new Date(item.datePeremption).toLocaleDateString("fr-FR")
        : "-",
      "Date création": new Date(item.dateCreation).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Date modification": new Date(item.dateModification).toLocaleString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    }));
  }

  /**
   * Exporte les articles de stock en Excel
   */
  static exportStockToExcel(
    stockItems: ExportableStockItem[],
    filename?: string
  ) {
    try {
      const formattedData = this.formatStockForExport(stockItems);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const colWidths = [
        { wch: 20 }, // Article
        { wch: 18 }, // Catégorie
        { wch: 12 }, // Quantité
        { wch: 15 }, // Seuil
        { wch: 15 }, // Prix
        { wch: 20 }, // Fournisseur
        { wch: 15 }, // Date péremption
        { wch: 20 }, // Date création
        { wch: 20 }, // Date modification
      ];
      worksheet["!cols"] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");
      const defaultFilename = `stock_chez_blos_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, filename || defaultFilename);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'export Excel du stock:", error);
      throw new Error("Erreur lors de l'export Excel du stock");
    }
  }

  /**
   * Exporte les articles de stock en PDF
   */
  static exportStockToPDF(
    stockItems: ExportableStockItem[],
    filename?: string
  ) {
    try {
      const formattedData = this.formatStockForExport(stockItems);
      const tableBody = [
        [
          { text: "Article", style: "tableHeader" },
          { text: "Catégorie", style: "tableHeader" },
          { text: "Quantité", style: "tableHeader" },
          { text: "Seuil", style: "tableHeader" },
          { text: "Prix (XOF)", style: "tableHeader" },
          { text: "Fournisseur", style: "tableHeader" },
          { text: "Date péremption", style: "tableHeader" },
          { text: "Date création", style: "tableHeader" },
          { text: "Date modification", style: "tableHeader" },
        ],
        ...formattedData.map((row) => [
          { text: row["Article"], style: "tableCell" },
          { text: row["Catégorie"], style: "tableCell" },
          { text: row["Quantité"], style: "tableCell" },
          { text: row["Seuil d'alerte"], style: "tableCell" },
          {
            text:
              typeof row["Prix d'achat (XOF)"] === "number"
                ? row["Prix d'achat (XOF)"].toLocaleString("fr-FR")
                : parseFloat(row["Prix d'achat (XOF)"])
                ? Number(row["Prix d'achat (XOF)"]).toLocaleString("fr-FR")
                : "-",
            style: "tableCell",
            alignment: "right",
          },
          { text: row["Fournisseur"], style: "tableCell" },
          { text: row["Date péremption"], style: "tableCell" },
          { text: row["Date création"], style: "tableCell" },
          { text: row["Date modification"], style: "tableCell" },
        ]),
      ];
      const documentDefinition: any = {
        pageSize: "A4",
        pageOrientation: "landscape",
        pageMargins: [40, 60, 40, 60],
        header: {
          columns: [
            {
              image: LOGO_BASE64,
              width: LOGO_CONFIG.width,
              height: LOGO_CONFIG.height,
              margin: [40, 20, 0, 0],
            },
            {
              text: `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
              style: "dateGeneration",
              alignment: "right",
              margin: [0, 30, 40, 0],
            },
          ],
        },
        content: [
          {
            text: "INVENTAIRE DU STOCK",
            style: "title",
            alignment: "center",
            margin: [0, 20, 0, 20],
          },
          {
            columns: [
              {
                text: [
                  { text: "Total articles: ", style: "statLabel" },
                  { text: stockItems.length.toString(), style: "statValue" },
                ],
              },
              {
                text: [
                  { text: "Articles en rupture: ", style: "statLabel" },
                  {
                    text: stockItems
                      .filter((i) => i.quantiteStock === 0)
                      .length.toString(),
                    style: "statValue",
                  },
                ],
              },
              {
                text: [
                  { text: "Stock faible: ", style: "statLabel" },
                  {
                    text: stockItems
                      .filter(
                        (i) =>
                          i.quantiteStock > 0 &&
                          i.quantiteStock <= i.seuilAlerte
                      )
                      .length.toString(),
                    style: "statValue",
                  },
                ],
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            table: {
              headerRows: 1,
              widths: [
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
                "auto",
              ],
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => {
                if (rowIndex === 0) return "#F97316";
                return rowIndex % 2 === 0 ? "#F9FAFB" : null;
              },
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#E5E7EB",
              vLineColor: () => "#E5E7EB",
            },
          },
        ],
        footer: (currentPage: number, pageCount: number) => ({
          text: `Page ${currentPage} sur ${pageCount} - Chez Blos © ${new Date().getFullYear()}`,
          alignment: "center",
          style: "footer",
          margin: [0, 10, 0, 0],
        }),
        styles: {
          companyName: {
            fontSize: 18,
            bold: true,
            color: "#F97316",
          },
          companySubtitle: {
            fontSize: 12,
            color: "#6B7280",
            italics: true,
          },
          dateGeneration: {
            fontSize: 10,
            color: "#6B7280",
          },
          title: {
            fontSize: 20,
            bold: true,
            color: "#1F2937",
          },
          statLabel: {
            fontSize: 11,
            color: "#374151",
            bold: true,
          },
          statValue: {
            fontSize: 11,
            color: "#F97316",
            bold: true,
          },
          tableHeader: {
            fontSize: 10,
            bold: true,
            color: "#FFFFFF",
            alignment: "center",
          },
          tableCell: {
            fontSize: 9,
            color: "#374151",
          },
          footer: {
            fontSize: 8,
            color: "#9CA3AF",
          },
        },
        defaultStyle: {
          font: "Roboto",
        },
      };
      const defaultFilename = `stock_chez_blos_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdfMake
        .createPdf(documentDefinition)
        .download(filename || defaultFilename);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'export PDF du stock:", error);
      throw new Error("Erreur lors de l'export PDF du stock");
    }
  }

  /**
   * Exporte les statistiques du stock en Excel
   */
  static exportStockStats(
    stockItems: ExportableStockItem[],
    filename?: string
  ) {
    try {
      const total = stockItems.length;
      const outOfStock = stockItems.filter((i) => i.quantiteStock === 0).length;
      const lowStock = stockItems.filter(
        (i) => i.quantiteStock > 0 && i.quantiteStock <= i.seuilAlerte
      ).length;
      const inStock = stockItems.filter(
        (i) => i.quantiteStock > i.seuilAlerte
      ).length;
      const totalValue = stockItems.reduce(
        (sum, i) => sum + (i.prixAchat || 0) * i.quantiteStock,
        0
      );
      // Statistiques par catégorie
      const byCategory: Record<string, { count: number; value: number }> = {};
      stockItems.forEach((item) => {
        const cat = item.categorie || "N/A";
        if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
        byCategory[cat].count++;
        byCategory[cat].value += (item.prixAchat || 0) * item.quantiteStock;
      });
      const workbook = XLSX.utils.book_new();
      // Feuille stats générales
      const generalStats = [
        ["Statistique", "Valeur"],
        ["Total articles", total],
        ["En stock", inStock],
        ["Stock faible", lowStock],
        ["Rupture", outOfStock],
        ["Valeur totale (XOF)", totalValue],
      ];
      const wsGeneral = XLSX.utils.aoa_to_sheet(generalStats);
      XLSX.utils.book_append_sheet(
        workbook,
        wsGeneral,
        "Statistiques Générales"
      );
      // Feuille par catégorie
      const catData = [
        ["Catégorie", "Articles", "Valeur (XOF)"],
        ...Object.entries(byCategory).map(([cat, data]) => [
          cat,
          data.count,
          data.value,
        ]),
      ];
      const wsCat = XLSX.utils.aoa_to_sheet(catData);
      XLSX.utils.book_append_sheet(workbook, wsCat, "Par Catégorie");
      XLSX.writeFile(
        workbook,
        filename ||
          `statistiques_stock_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      return true;
    } catch (error) {
      console.error(
        "Erreur lors de l'export des statistiques du stock:",
        error
      );
      throw new Error("Erreur lors de l'export des statistiques du stock");
    }
  }
}
