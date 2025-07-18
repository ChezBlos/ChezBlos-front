import React from "react";
import { Badge } from "./badge";
import { getOrderStatusBadge } from "../../utils/orderStatusUtils";

interface OrderStatusBadgeProps {
  statut: string;
  className?: string;
}

/**
 * Composant Badge spécialisé pour afficher le statut d'une commande
 * avec des couleurs cohérentes selon le statut
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  statut,
  className = "",
}) => {
  const statusInfo = getOrderStatusBadge(statut);

  return (
    <Badge
      className={`${statusInfo.color} rounded-full px-3 py-1 font-medium text-xs border shadow-sm flex items-center justify-center whitespace-nowrap ${className}`}
    >
      {statusInfo.label}
    </Badge>
  );
};
