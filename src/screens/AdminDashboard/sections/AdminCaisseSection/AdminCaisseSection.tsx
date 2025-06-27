import React, { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  CreditCard,
  Banknote,
  PiggyBank,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { useAlert } from "../../../../contexts/AlertContext";

interface AdminCaisseSectionProps {
  onSectionSelect?: (section: string) => void;
}

interface CashierData {
  totalSales: number;
  totalOrders: number;
  paymentMethods: {
    cash: number;
    card: number;
    other: number;
  };
  expectedCash: number;
  actualCash: number;
  difference: number;
  status: "open" | "closed" | "pending";
  lastClosure?: string;
}

export const AdminCaisseSection: React.FC<AdminCaisseSectionProps> = () => {
  const [actualCash, setActualCash] = useState<string>("");
  const [cashierData, setCashierData] = useState<CashierData>({
    totalSales: 0,
    totalOrders: 0,
    paymentMethods: {
      cash: 0,
      card: 0,
      other: 0,
    },
    expectedCash: 0,
    actualCash: 0,
    difference: 0,
    status: "open",
  });
  const [isClosing, setIsClosing] = useState(false);
  const [notes, setNotes] = useState("");
  const { showAlert } = useAlert();

  // Charger les données de la caisse
  useEffect(() => {
    fetchCashierData();
  }, []);

  const fetchCashierData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/daily-report", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCashierData({
          totalSales: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          paymentMethods: {
            cash: data.paymentMethods?.cash || 0,
            card: data.paymentMethods?.card || 0,
            other: data.paymentMethods?.other || 0,
          },
          expectedCash: data.paymentMethods?.cash || 0,
          actualCash: 0,
          difference: 0,
          status: data.status || "open",
          lastClosure: data.lastClosure,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de caisse:", error);
    }
  };

  // Calculer la différence
  useEffect(() => {
    const actual = parseFloat(actualCash) || 0;
    const difference = actual - cashierData.expectedCash;
    setCashierData((prev) => ({
      ...prev,
      actualCash: actual,
      difference,
    }));
  }, [actualCash, cashierData.expectedCash]);
  const handleCloseCashier = async () => {
    if (!actualCash) {
      showAlert("warning", "Veuillez saisir le montant en caisse");
      return;
    }

    setIsClosing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/close-cashier", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actualCash: parseFloat(actualCash),
          notes,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setCashierData((prev) => ({ ...prev, status: "closed" }));
        showAlert("success", "Caisse clôturée avec succès !");
        // Optionnel: génerer un rapport PDF
        await generateClosureReport();
      } else {
        showAlert("error", "Erreur lors de la clôture de caisse");
      }
    } catch (error) {
      console.error("Erreur lors de la clôture:", error);
      showAlert("error", "Erreur lors de la clôture de caisse");
    } finally {
      setIsClosing(false);
    }
  };

  const generateClosureReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/closure-report", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cloture_caisse_${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du rapport:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Clôture de Caisse
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Calendar size={16} />
            {currentDate}
          </p>
        </div>
        <Badge
          variant={cashierData.status === "closed" ? "default" : "secondary"}
          className={`px-3 py-1 ${
            cashierData.status === "closed"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {cashierData.status === "closed" ? "Caisse fermée" : "Caisse ouverte"}
        </Badge>
      </div>
      {/* Résumé des ventes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(cashierData.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des ventes aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cashierData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Commandes traitées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket moyen</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                cashierData.totalOrders > 0
                  ? cashierData.totalSales / cashierData.totalOrders
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Montant moyen par commande
            </p>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Répartition par mode de paiement */}
      <Card className="rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle>Répartition des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mode de paiement</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Pourcentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <Banknote size={16} className="text-green-600" />
                  Espèces
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(cashierData.paymentMethods.cash)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {cashierData.totalSales > 0
                      ? (
                          (cashierData.paymentMethods.cash /
                            cashierData.totalSales) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-600" />
                  Carte
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(cashierData.paymentMethods.card)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {cashierData.totalSales > 0
                      ? (
                          (cashierData.paymentMethods.card /
                            cashierData.totalSales) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <DollarSign size={16} className="text-purple-600" />
                  Autres
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(cashierData.paymentMethods.other)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {cashierData.totalSales > 0
                      ? (
                          (cashierData.paymentMethods.other /
                            cashierData.totalSales) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>{" "}
      {/* Vérification de caisse */}
      {cashierData.status !== "closed" && (
        <Card className="rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank size={20} />
              Vérification de caisse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Espèces attendues
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold">
                    {formatCurrency(cashierData.expectedCash)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Espèces en caisse
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Différence
                </label>
                <div
                  className={`p-3 rounded-lg ${
                    Math.abs(cashierData.difference) < 0.01
                      ? "bg-green-50 text-green-700"
                      : cashierData.difference > 0
                      ? "bg-blue-50 text-blue-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span className="text-lg font-semibold flex items-center gap-1">
                    {cashierData.difference > 0 ? "+" : ""}
                    {formatCurrency(cashierData.difference)}
                    {Math.abs(cashierData.difference) < 0.01 && (
                      <CheckCircle size={16} />
                    )}
                    {Math.abs(cashierData.difference) >= 0.01 && (
                      <AlertCircle size={16} />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Commentaires sur la clôture de caisse..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCloseCashier}
                disabled={isClosing || !actualCash}
                className="flex items-center gap-2"
              >
                {isClosing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Clôture en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Clôturer la caisse
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={generateClosureReport}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Générer un rapport
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Informations de clôture (si fermée) */}
      {cashierData.status === "closed" && cashierData.lastClosure && (
        <Card className="rounded-3xl overflow-hidden bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <h3 className="font-semibold text-green-800">Caisse clôturée</h3>
            </div>
            <p className="text-sm text-green-700">
              Dernière clôture:{" "}
              {new Date(cashierData.lastClosure).toLocaleString("fr-FR")}
            </p>
          </CardContent>
        </Card>
      )}
      {/* Informations d'aide */}{" "}
      <Card className="rounded-3xl overflow-hidden bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Comptez les espèces présentes dans la caisse</li>
            <li>
              • Saisissez le montant exact dans le champ "Espèces en caisse"
            </li>
            <li>
              • Vérifiez que la différence est acceptable (généralement &lt; 5€)
            </li>
            <li>• Ajoutez des notes si nécessaire pour expliquer les écarts</li>
            <li>
              • Une fois clôturée, un rapport PDF sera généré automatiquement
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
