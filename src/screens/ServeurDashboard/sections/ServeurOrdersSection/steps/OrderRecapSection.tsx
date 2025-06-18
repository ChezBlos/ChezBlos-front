import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { Textarea } from "../../../../../components/ui/textarea";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { useOrder } from "../../../../../contexts/OrderContext";
import { useTab } from "../../../../../contexts/TabContext";

export const OrderRecapSection = (): JSX.Element => {
  const {
    orderItems,
    orderNotes,
    setOrderNotes,
    tableNumber,
    setTableNumber,
    updateItemNotes,
  } = useOrder();
  const { previousTab, nextTab, canGoPrevious } = useTab();
  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-8 py-5">
          {" "}
          {/* Title */}
          <div className="mb-4 font-extrabold text-2xl text-gray-900">
            Récapitulatif de votre commande
          </div>{" "}
          {/* Items List */}
          <div className="flex flex-col gap-4 mb-6">
            {orderItems.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8">
                <p className="text-gray-500 text-center">
                  Aucun article dans la commande
                </p>
              </div>
            ) : (
              orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 pt-3 pr-4 pb-3 pl-4 w-full rounded-2xl border border-solid border-gray-10"
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start gap-1 flex-1">
                      <div className="font-semibold text-lg text-gray-900">
                        {item.name}
                      </div>
                      <div className="font-medium text-sm text-gray-600">
                        QT: {item.quantity.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <div className="font-bold text-xl text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="font-medium text-lg text-gray-400">
                        XOF
                      </div>
                    </div>
                  </div>
                  {/* Notes pour cet article */}
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor={`notes-${item.id}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Notes pour cet article (optionnel)
                    </Label>
                    <Textarea
                      id={`notes-${item.id}`}
                      placeholder="Ex: Bien cuit, sans oignons, sauce à part..."
                      value={item.notes || ""}
                      onChange={(e) => updateItemNotes(item.id, e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Informations de commande */}
          {orderItems.length > 0 && (
            <div className="flex flex-col gap-4 px-2 mb-6">
              {/* Numéro de table */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="table-number"
                  className="text-sm font-medium text-gray-700"
                >
                  Numéro de table (optionnel)
                </Label>
                <Input
                  id="table-number"
                  placeholder="Ex: Table 5, Terrasse 2..."
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full"
                />
              </div>
              {/* Notes générales pour la commande */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="order-notes"
                  className="text-sm font-medium text-gray-700"
                >
                  Notes générales pour la commande (optionnel)
                </Label>
                <Textarea
                  id="order-notes"
                  placeholder="Ex: Client pressé, allergies, demandes spéciales..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="min-h-[80px] resize-none"
                />{" "}
              </div>{" "}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer - Fixed */}
      <div className="flex flex-col w-full items-start justify-center gap-5 pt-6 px-6 pb-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start gap-2.5 flex-1">
            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <div className="w-3 h-3 rounded-full bg-gray-200" />
            </div>
          </div>

          <div className="inline-flex items-start justify-end gap-2">
            <Button
              onClick={previousTab}
              disabled={!canGoPrevious()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />{" "}
              <span className="font-semibold text-base text-gray-900">
                Retour
              </span>
            </Button>

            <Button
              onClick={nextTab}
              disabled={orderItems.length === 0}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <span className="font-semibold text-base text-white">
                Confirmer
              </span>
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* {orderItems.length > 0 && (
          <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
            <span className="font-text-md-bold text-gray-80">
              Total ({orderItems.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              articles)
            </span>
            <div className="flex items-center gap-1">
              <span className="font-title-t1-semibold text-[#181818]">
                {formatPrice(getTotalAmount())}
              </span>
              <span className="font-title-t1-semibold text-gray-300">XOF</span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
