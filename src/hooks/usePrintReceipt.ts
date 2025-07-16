import { useState } from "react";
import { Order } from "../types/order";

export const usePrintReceipt = () => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedOrderToPrint, setSelectedOrderToPrint] =
    useState<Order | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const openPrintModal = (order: Order) => {
    setSelectedOrderToPrint(order);
    setIsPrintModalOpen(true);
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedOrderToPrint(null);
    setIsPrinting(false);
  };

  const handlePrintStart = () => {
    setIsPrinting(true);
  };

  const handlePrintComplete = () => {
    setIsPrinting(false);
    closePrintModal();
  };

  return {
    isPrintModalOpen,
    selectedOrderToPrint,
    isPrinting,
    openPrintModal,
    closePrintModal,
    handlePrintStart,
    handlePrintComplete,
  };
};
