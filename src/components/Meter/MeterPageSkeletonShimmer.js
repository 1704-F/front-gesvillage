// MeterPageSkeletonShimmer.js - Version avec effet shimmer
import React from 'react';
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const MeterPageSkeletonShimmer = () => {
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  // Classes pour l'effet shimmer
  const shimmerClass = "relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <div className="p-6 space-y-6">
      {/* Header avec barre de recherche et boutons */}
      <div className="flex justify-between items-center">
        <div className={`h-8 rounded w-64 ${shimmerClass}`}></div>
        <div className="flex items-center space-x-4">
          <div className={`h-10 rounded w-48 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-40 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClass}`}></div>
        </div>
      </div>

      {/* Statistiques - 3 cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((card) => (
          <Card key={card} className="p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-4 h-12 w-12 ${shimmerClass}`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-32 ${shimmerClass}`}></div>
                <div className={`h-6 rounded w-20 ${shimmerClass}`}></div>
                <div className={`h-3 rounded w-16 ${shimmerClass}`}></div>
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
                  <div className={`h-4 rounded w-20 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-32 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-28 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-16 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-24 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-24 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-16 ${shimmerClass}`}></div>
                </TableHead>
                <TableHead>
                  <div className={`h-4 rounded w-24 ${shimmerClass}`}></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((row) => (
                <TableRow key={row}>
                  {/* Numéro */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className={`h-4 rounded w-24 ${shimmerClass}`}></div>
                      <div className={`h-3 rounded w-20 ${shimmerClass}`}></div>
                    </div>
                  </TableCell>
                  
                  {/* Consommateur */}
                  <TableCell>
                    <div className="space-y-2">
                      <div className={`h-4 rounded w-32 ${shimmerClass}`}></div>
                      <div className={`h-3 rounded w-28 ${shimmerClass}`}></div>
                    </div>
                  </TableCell>
                  
                  {/* Emplacement */}
                  <TableCell>
                    <div className={`h-4 rounded w-28 ${shimmerClass}`}></div>
                  </TableCell>
                  
                  {/* Type */}
                  <TableCell>
                    <div className={`h-6 rounded w-16 ${shimmerClass}`}></div>
                  </TableCell>
                  
                  {/* Facturation */}
                  <TableCell>
                    <div className={`h-6 rounded w-20 ${shimmerClass}`}></div>
                  </TableCell>
                  
                  {/* Problème */}
                  <TableCell>
                    <div className={`h-6 rounded w-20 ${shimmerClass}`}></div>
                  </TableCell>
                  
                  {/* Statut */}
                  <TableCell>
                    <div className={`h-6 rounded-full w-12 ${shimmerClass}`}></div>
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className={`h-8 w-8 rounded ${shimmerClass}`}></div>
                      <div className={`h-8 w-8 rounded ${shimmerClass}`}></div>
                      <div className={`h-8 w-8 rounded ${shimmerClass}`}></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between mt-4 px-2 pb-4">
            <div className="flex items-center gap-2">
              <div className={`h-4 rounded w-32 ${shimmerClass}`}></div>
              <div className={`h-10 rounded w-16 ${shimmerClass}`}></div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`h-4 rounded w-32 ${shimmerClass}`}></div>
              <div className={`h-10 rounded w-24 ${shimmerClass}`}></div>
              <div className={`h-10 rounded w-24 ${shimmerClass}`}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeterPageSkeletonShimmer;