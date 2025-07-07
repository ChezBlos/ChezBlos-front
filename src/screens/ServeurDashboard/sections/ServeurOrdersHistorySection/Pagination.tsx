import React from "react";
import { Button } from "../../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5; // Nombre maximum de pages à afficher

    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Ajuster si on est proche du début
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Affichage de {startItem} à {endItem} sur {totalItems} commandes
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Bouton Précédent */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-1">
          {/* Première page si nécessaire */}
          {getPageNumbers()[0] > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="w-8 h-8 p-0"
              >
                1
              </Button>
              {getPageNumbers()[0] > 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {/* Pages principales */}
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 p-0 ${
                page === currentPage
                  ? "bg-orange-500 hover:bg-orange-600 text-white"
                  : ""
              }`}
            >
              {page}
            </Button>
          ))}

          {/* Dernière page si nécessaire */}
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
            <>
              {getPageNumbers()[getPageNumbers().length - 1] <
                totalPages - 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Bouton Suivant */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          Suivant
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
