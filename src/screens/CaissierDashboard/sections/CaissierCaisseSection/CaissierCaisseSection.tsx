import { useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Tabs, TabsContent } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { TrendDown, Printer, Download, Plus, Package } from "phosphor-react";
import { CaisseMobileBottomNav } from "./CaisseMobileBottomNav";
import { NewSortieModal } from "./NewSortieModal";
import { PaymentsPendingList } from "./PaymentsPendingList";
import { InventoryModal } from "./InventoryModal";
import { CaisseHistoriqueList } from "./CaisseHistoriqueList";
import { ReceiptPrintModal } from "./ReceiptPrintModal";

export const CaissierCaisseSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<
    "paiements" | "sorties" | "inventaire" | "historique"
  >("paiements");

  // États pour les modals
  const [isNewSortieModalOpen, setIsNewSortieModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isReceiptPrintModalOpen, setIsReceiptPrintModalOpen] = useState(false);
  const [selectedOrderForReceipt] = useState<any>(null);

  // Mock data pour la démonstration
  const caisseStats = {
    totalJour: 850000,
    nombreTransactions: 45,
    totalSorties: 25000,
    soldeActuel: 825000,
  };

  // Mock data pour les commandes en attente de paiement
  const mockPendingOrders = [
    {
      _id: "1",
      numeroCommande: "CMD001",
      numeroTable: 5,
      montantTotal: 15500,
      modePaiement: "ESPECES",
      serveur: { prenom: "Jean", nom: "Dupont" },
      items: [
        { nom: "Poulet DG", quantite: 2, prix: 7500 },
        { nom: "Coca Cola", quantite: 1, prix: 500 },
      ],
      dateCreation: new Date().toISOString(),
    },
    {
      _id: "2",
      numeroCommande: "CMD002",
      numeroTable: 3,
      montantTotal: 12000,
      modePaiement: "WAVE",
      serveur: { prenom: "Marie", nom: "Martin" },
      items: [{ nom: "Riz Sauté", quantite: 1, prix: 12000 }],
      dateCreation: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
    },
  ];

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  // Gestionnaires d'événements
  const handleProcessPayment = async (orderId: string) => {
    console.log("Traitement du paiement pour la commande:", orderId);
    // Ici, intégrer l'API pour traiter le paiement
  };

  const handleViewOrderDetails = (order: any) => {
    console.log("Voir détails de la commande:", order);
    // Ici, ouvrir un modal avec les détails
  };

  // Summary cards data
  const summaryCards = [
    {
      title: "Total du jour",
      mobileTitle: "Total jour",
      value: `${formatPrice(caisseStats.totalJour)} XOF`,
      subtitle: "Entrées de caisse aujourd'hui",
      subtitleColor: "text-green-600",
    },
    {
      title: "Transactions",
      mobileTitle: "Transactions",
      value: caisseStats.nombreTransactions,
      subtitle: "Nombre de paiements reçus",
      subtitleColor: "text-blue-600",
    },
    {
      title: "Sorties d'argent",
      mobileTitle: "Sorties",
      value: `${formatPrice(caisseStats.totalSorties)} XOF`,
      subtitle: "Dépenses enregistrées",
      subtitleColor: "text-red-600",
    },
    {
      title: "Solde caisse",
      mobileTitle: "Solde",
      value: `${formatPrice(caisseStats.soldeActuel)} XOF`,
      subtitle: "Montant disponible en caisse",
      subtitleColor: "text-orange-600",
    },
  ];

  return (
    <section className="flex flex-col w-full mb-10 px-3 md:px-6 lg:px-12 gap-4 md:gap-6">
      {/* En-tête de la section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion de la caisse
        </h1>
        <p className="text-gray-600">
          Gérez les encaissements, sorties d'argent et inventaire de caisse
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-4 md:mt-6 lg:mt-8 flex items-start gap-2 sm:gap-3 md:gap-5 w-full min-w-0">
        {summaryCards.map((card, index) => (
          <Card
            key={index}
            className="shadow bg-white border border-slate-200 rounded-3xl flex-1 min-w-0"
          >
            <CardContent className="flex flex-col items-start gap-2 md:gap-3 lg:gap-6 p-3 md:p-4 lg:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate w-full">
                <span className="hidden sm:inline">{card.title}</span>
                <span className="sm:hidden">{card.mobileTitle}</span>
              </h3>
              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {card.value}
                  </span>
                </div>
                <p
                  className={`text-xs md:text-sm font-medium ${card.subtitleColor} truncate`}
                >
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets principaux */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <div className="flex items-center gap-3 mb-6 p-1 bg-gray-200 rounded-full w-fit">
          <button
            onClick={() => setActiveTab("paiements")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "paiements"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Paiements
          </button>
          <button
            onClick={() => setActiveTab("sorties")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "sorties"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sorties
          </button>
          <button
            onClick={() => setActiveTab("inventaire")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "inventaire"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Inventaire
          </button>
          <button
            onClick={() => setActiveTab("historique")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
              activeTab === "historique"
                ? "bg-white text-brand-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Historique
          </button>
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="paiements">
          <div className="shadow-md bg-white rounded-3xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Commandes à encaisser
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsReceiptPrintModalOpen(true)}
                  >
                    <Printer size={16} className="mr-2" />
                    Imprimer reçu
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download size={16} className="mr-2" />
                    Exporter
                  </Button>
                </div>
              </div>

              {/* Liste des commandes en attente de paiement */}
              <PaymentsPendingList
                orders={mockPendingOrders}
                onProcessPayment={handleProcessPayment}
                onViewDetails={handleViewOrderDetails}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sorties">
          <div className="shadow-md bg-white rounded-3xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Sorties d'argent
                </h2>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsNewSortieModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Nouvelle sortie
                </Button>
              </div>

              <div className="text-center py-20 text-gray-500">
                <TrendDown size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">
                  Aucune sortie enregistrée aujourd'hui
                </h3>
                <p className="text-sm">
                  Enregistrez ici les sorties d'argent avec leurs justificatifs.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventaire">
          <div className="shadow-md bg-white rounded-3xl overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Inventaire journalier
                </h2>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsInventoryModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Nouveau comptage
                </Button>
              </div>

              <div className="text-center py-20 text-gray-500">
                <Package size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">
                  Inventaire non effectué aujourd'hui
                </h3>
                <p className="text-sm">
                  Effectuez le comptage journalier du stock et des espèces en
                  caisse.
                </p>
                <Button
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsInventoryModalOpen(true)}
                >
                  <Package size={16} className="mr-2" />
                  Commencer l'inventaire
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="historique">
          <div className="shadow-md bg-white rounded-3xl overflow-hidden">
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Historique des transactions
              </h2>

              <CaisseHistoriqueList />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation mobile en bas */}
      <CaisseMobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal pour nouvelle sortie */}
      <NewSortieModal
        isOpen={isNewSortieModalOpen}
        onClose={() => setIsNewSortieModalOpen(false)}
        onSortieCreated={() => {
          // Actualiser les données
          console.log("Sortie créée, actualisation des données...");
        }}
      />

      {/* Modal pour l'inventaire */}
      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onInventoryCompleted={() => {
          // Actualiser les données
          console.log("Inventaire terminé, actualisation des données...");
        }}
      />

      {/* Modal pour l'impression de reçu */}
      <ReceiptPrintModal
        isOpen={isReceiptPrintModalOpen}
        onClose={() => setIsReceiptPrintModalOpen(false)}
        orderData={selectedOrderForReceipt}
      />
    </section>
  );
};
