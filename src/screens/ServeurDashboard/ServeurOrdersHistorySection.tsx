import React, { useMemo } from "react";
import { useOrders } from "../../hooks/useOrderAPI";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Card } from "../../components/ui/card";
import { PlusIcon } from "lucide-react";

export const ServeurOrdersHistorySection: React.FC = () => {
  const { data: allOrders, loading, error } = useOrders();

  // Filtrer uniquement les commandes des jours passés
  const pastOrders = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allOrders.filter((order) => {
      const orderDate = new Date(order.dateCreation);
      return orderDate < today;
    });
  }, [allOrders]);

  return (
    <div className="my-4 md:my-6 lg:my-8 px-3 md:px-6 lg:px-12 xl:px-20 ">
      <Card className="rounded-3xl overflow-hidden w-full">
        <div className="flex flex-col border-b bg-white border-slate-200">
          <h2 className="font-bold text-2xl text-gray-900 px-6 pt-4 pb-2">
            Historique des commandes
          </h2>
        </div>
        <Table>
          <TableHeader className="bg-gray-5">
            <TableRow>
              <TableHead className="px-6 py-5">Commande</TableHead>
              <TableHead className="px-6 py-5">ID de commande</TableHead>
              <TableHead className="px-6 py-5">Date</TableHead>
              <TableHead className="px-6 py-5">Montant</TableHead>
              <TableHead className="px-6 py-5">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex items-center justify-center text-gray-500">
                    Chargement des commandes...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex items-center justify-center text-red-500">
                    Erreur: {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : pastOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-80 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <PlusIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-lg text-gray-700">
                        Aucune commande passée
                      </h3>
                      <p className="font-normal text-sm text-gray-500">
                        Aucune commande n'a été trouvée pour les jours
                        précédents.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              pastOrders.map((order) => (
                <TableRow
                  key={order._id}
                  className="h-20 border-b bg-white hover:bg-gray-10 border-slate-200"
                >
                  <TableCell className="px-6 py-3">
                    {order.items[0]?.nom || "Commande"}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    #{order.numeroCommande}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    {new Date(order.dateCreation).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    {order.montantTotal.toLocaleString()} XOF
                  </TableCell>
                  <TableCell className="px-6 py-3">{order.statut}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
