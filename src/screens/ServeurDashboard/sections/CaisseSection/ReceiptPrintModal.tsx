import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import { Printer, Download, Eye } from "phosphor-react";

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData?: {
    numero: string;
    client: string;
    items: Array<{
      nom: string;
      quantite: number;
      prix: number;
    }>;
    total: number;
    methodePaiement: string;
    date: string;
    heure: string;
  };
}

export const ReceiptPrintModal = ({
  isOpen,
  onClose,
  orderData,
}: ReceiptPrintModalProps) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [receiptHeader, setReceiptHeader] = useState("CHEZ BLOS");
  const [receiptFooter, setReceiptFooter] = useState("Merci de votre visite !");
  const [showPreview, setShowPreview] = useState(false);

  const defaultOrderData = {
    numero: "CMD-2024-001",
    client: "Client anonyme",
    items: [
      { nom: "Riz au gras", quantite: 2, prix: 7500 },
      { nom: "Coca Cola", quantite: 1, prix: 1000 },
    ],
    total: 16000,
    methodePaiement: "Espèces",
    date: new Date().toLocaleDateString("fr-FR"),
    heure: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  const order = orderData || defaultOrderData;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleDownloadPDF = () => {
    // Ici, vous intégrerez une bibliothèque comme jsPDF pour générer un PDF
    console.log("Génération du PDF...");
  };

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu - ${order.numero}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
          }
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
          }
          .order-info {
            margin: 10px 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
          }
          .items {
            margin: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .total {
            border-top: 1px dashed #000;
            padding-top: 5px;
            font-weight: bold;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            font-style: italic;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${receiptHeader}
        </div>
        
        <div class="order-info">
          <div>Commande: ${order.numero}</div>
          <div>Client: ${order.client}</div>
          <div>Date: ${order.date} à ${order.heure}</div>
          <div>Paiement: ${order.methodePaiement}</div>
        </div>
        
        <div class="items">
          ${order.items
            .map(
              (item) => `
            <div class="item">
              <span>${item.nom} x${item.quantite}</span>
              <span>${(item.prix * item.quantite).toLocaleString()} XOF</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div class="total">
          TOTAL: ${order.total.toLocaleString()} XOF
        </div>
        
        <div class="footer">
          ${receiptFooter}
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Impression de reçu - {order.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Options de personnalisation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Options d'impression
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCustomizing(!isCustomizing)}
              >
                {isCustomizing ? "Masquer" : "Personnaliser"}
              </Button>
            </div>

            {isCustomizing && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="header">En-tête du reçu</Label>
                  <Input
                    id="header"
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="footer">Pied de page</Label>
                  <Textarea
                    id="footer"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    rows={2}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Aperçu du reçu */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Aperçu du reçu
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} className="mr-2" />
                {showPreview ? "Masquer" : "Voir l'aperçu"}
              </Button>
            </div>

            {showPreview && (
              <div className="border rounded-lg p-4 bg-white max-w-sm mx-auto font-mono text-sm">
                <div className="text-center font-bold text-base mb-2 border-b border-dashed border-gray-400 pb-2">
                  {receiptHeader}
                </div>

                <div className="mb-3 border-b border-dashed border-gray-400 pb-2">
                  <div>Commande: {order.numero}</div>
                  <div>Client: {order.client}</div>
                  <div>
                    Date: {order.date} à {order.heure}
                  </div>
                  <div>Paiement: {order.methodePaiement}</div>
                </div>

                <div className="mb-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between mb-1">
                      <span>
                        {item.nom} x{item.quantite}
                      </span>
                      <span>
                        {(item.prix * item.quantite).toLocaleString()} XOF
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-400 pt-2 font-bold text-right">
                  TOTAL: {order.total.toLocaleString()} XOF
                </div>

                <div className="text-center mt-3 italic text-sm">
                  {receiptFooter}
                </div>
              </div>
            )}
          </div>

          {/* Informations de la commande */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              Détails de la commande
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-800">Numéro:</span>
                <Badge variant="outline">{order.numero}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Client:</span>
                <span className="font-medium">{order.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Total:</span>
                <span className="font-bold text-lg">
                  {order.total.toLocaleString()} XOF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Méthode de paiement:</span>
                <span className="font-medium">{order.methodePaiement}</span>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>

            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1"
            >
              <Download size={16} className="mr-2" />
              Télécharger PDF
            </Button>

            <Button
              onClick={handlePrint}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <Printer size={16} className="mr-2" />
              Imprimer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
