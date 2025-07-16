import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";

export const CaisseSection: React.FC = () => {
  return (
    <div className="px-3 md:px-6 lg:px-12 xl:px-20 pt-6 space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion de Caisse</h2>
        <p className="text-gray-600">
          Administration de la caisse et des transactions
        </p>
      </div>

      {/* Contenu principal */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p>Section Caisse en cours de développement...</p>
            <p className="text-sm mt-2">
              Fonctionnalités disponibles prochainement
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
