// src/components/Pagination.js
import React from 'react';
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Composant de pagination réutilisable 
 * 
 * @param {Object} pagination - Objet contenant les informations de pagination
 * @param {number} pagination.currentPage - Page actuelle
 * @param {number} pagination.totalPages - Nombre total de pages
 * @param {number} pagination.perPage - Nombre d'éléments par page
 * @param {number} pagination.total - Nombre total d'éléments
 * @param {Function} onPageChange - Fonction à appeler lors du changement de page
 * @returns {JSX.Element}
 */
const Pagination = ({ pagination, onPageChange }) => {
  // Si pas de pagination ou une seule page, ne rien afficher
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  // Fonction pour générer la liste des pages à afficher
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const maxPagesToShow = 5; // Nombre de pages à afficher dans la pagination
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
      <div className="flex-1 flex justify-between sm:hidden">
        {/* Version mobile */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Informations sur les résultats */}
        <div>
          <p className="text-sm text-gray-700">
            Affichage de{' '}
            <span className="font-medium">
              {((pagination.currentPage - 1) * pagination.perPage) + 1}
            </span>
            {' '}à{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
            </span>
            {' '}sur{' '}
            <span className="font-medium">{pagination.total}</span>
            {' '}résultats
          </p>
        </div>
        
        {/* Boutons de pagination */}
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Bouton Précédent */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-l-md"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Pages numériques */}
            {getPageNumbers().map(pageNumber => (
              <Button
                key={pageNumber}
                variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            
            {/* Bouton Suivant */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-r-md"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;