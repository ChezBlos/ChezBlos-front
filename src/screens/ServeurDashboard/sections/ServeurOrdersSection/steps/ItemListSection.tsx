import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";
import { ScrollArea } from "../../../../../components/ui/scroll-area";
import { useOrder } from "../../../../../contexts/OrderContext";
import { useMenu } from "../../../../../contexts/MenuContext";

export const ItemListSection = (): JSX.Element => {
  const { addItem, removeItem, orderItems } = useOrder();
  const { getFilteredItems, loading, error } = useMenu();

  const filteredItems = getFilteredItems();
  const getItemQuantity = (id: string): number => {
    const item = orderItems.find((orderItem) => orderItem.id === id);
    return item ? item.quantity : 0;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-gray-500">Chargement du menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }
  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-gray-500">Aucun article trouvé</div>
      </div>
    );
  }

  return (
    <section className="flex-1 bg-[#EFF1F3] min-h-0 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-3 py-4 px-6">
          {filteredItems.map((item) => (
            <Card
              key={item._id}
              className="bg-white shadow-md border border-gray-20 rounded-2xl overflow-hidden"
            >
              {" "}
              <CardContent className="flex items-center gap-3 p-3 w-full">
                <div className="flex items-center gap-3 flex-1">
                  {" "}
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl || item.image || "/img/plat_petit.png"}
                      alt={item.nom}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/img/plat_petit.png";
                      }}
                    />
                  </div>{" "}
                  <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate w-full">
                      {item.nom}
                    </h3>

                    <p className="font-normal text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {item.description || "Délicieux plat de notre chef"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-4 flex-shrink-0">
                  <span className="font-bold text-2xl text-gray-900">
                    {formatPrice(item.prix)}
                  </span>
                  <span className="font-medium text-xl text-gray-400">XOF</span>
                </div>

                {getItemQuantity(item._id) > 0 ? (
                  <div className="flex items-center gap-4 p-2 rounded-[1000px] border border-solid border-slate-200 mr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                      onClick={() => removeItem(item._id)}
                    >
                      <MinusIcon className="h-4 w-4 text-white" />
                    </Button>{" "}
                    <span className="font-semibold text-base text-gray-900 min-w-[2ch] text-center">
                      {getItemQuantity(item._id).toString().padStart(2, "0")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1 bg-brand-primary-400 hover:bg-brand-primary-500 rounded-full h-6 w-6"
                      onClick={() => addItem(item)}
                    >
                      <PlusIcon className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-white mr-4"
                    onClick={() => addItem(item)}
                  >
                    <span className="font-semibold text-sm text-white">
                      Ajouter
                    </span>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};
