// MeterPageSkeleton.js - Skeleton loader pour la page des compteurs
import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const MeterPageSkeleton = () => {
  // Créer un tableau de 10 lignes de skeleton
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header avec barre de recherche et boutons */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="flex items-center space-x-4">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Statistiques - 3 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((card) => (
          <Card key={card} className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-full mr-4 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table des compteurs */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((row) => (
                <TableRow key={row}>
                  {/* Numéro */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </TableCell>
                  
                  {/* Consommateur */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                    </div>
                  </TableCell>
                  
                  {/* Emplacement */}
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                  </TableCell>
                  
                  {/* Type */}
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </TableCell>
                  
                  {/* Facturation */}
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </TableCell>
                  
                  {/* Problème */}
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </TableCell>
                  
                  {/* Statut */}
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between mt-4 px-2 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-16"></div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterPageSkeleton;