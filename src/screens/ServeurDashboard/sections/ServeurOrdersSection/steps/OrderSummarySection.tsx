import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../components/ui/card";
import { useOrder } from "../../../../../contexts/OrderContext";
import { useTab } from "../../../../../contexts/TabContext";

export const OrderSummarySection = (): JSX.Element => {
  const { getTotalItems, getTotalAmount } = useOrder();
  const { nextTab } = useTab();

  // Data for the order summary
  const orderSummary = {
    itemsCount: getTotalItems().toString().padStart(2, "0"),
    totalAmount: getTotalAmount().toLocaleString(),
    currency: "XOF",
    currentStep: 1,
    totalSteps: 3,
  };

  const handleNext = () => {
    if (getTotalItems() > 0) {
      nextTab();
    }
  };
  return (
    <div className="flex flex-col w-full items-start justify-center gap-4 pt-4 pb-6 px-6 border-t border-slate-200">
      <Card className="w-full bg-gray-10 shadow-none rounded-2xl p-0 border-none">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex items-start gap-1 flex-1">
            <span className="font-gilroy-bold text-gray-80">
              Eléments ajoutés:
            </span>
            <span className="font-gilroy-bold text-orange-500">
              {orderSummary.itemsCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-gilroy-bold text-2xl text-[#181818]">
              {orderSummary.totalAmount}
            </span>
            <span className="font-gilroy-bold text-2xl text-slate-300">
              {orderSummary.currency}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between w-full">
        <div className="flex items-start gap-2">
          {Array.from({ length: orderSummary.totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index + 1 <= orderSummary.currentStep
                  ? "bg-orange-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-300 rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span className="font-title-t5-bold text-[#181818] text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)]">
              Retour
            </span>
          </Button>{" "}
          <Button
            onClick={handleNext}
            disabled={getTotalItems() === 0}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg"
          >
            <span className="font-title-t5-bold text-gray0-white text-[length:var(--title-t5-bold-font-size)] tracking-[var(--title-t5-bold-letter-spacing)] leading-[var(--title-t5-bold-line-height)]">
              {getTotalItems() > 0 ? "Suivant" : "Aucun article"}
            </span>
            <ChevronRightIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
