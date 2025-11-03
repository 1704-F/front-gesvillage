// ReadingPageSkeleton.js - Skeleton loader pour la page des relevés
import React from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const ReadingPageSkeleton = () => {
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);
  const shimmerClass = "relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className={`h-8 rounded w-64 ${shimmerClass}`}></div>
        <div className="flex items-center space-x-4">
          <div className={`h-10 rounded w-40 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-40 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-40 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClass}`}></div>
        </div>
      </div>

      {/* Filtre consommateur */}
      <div className="flex items-center space-x-4">
        <div className={`h-10 rounded w-full ${shimmerClass}`}></div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-2">
          <div className={`h-10 rounded w-48 ${shimmerClass}`}></div>
          <div className={`h-10 rounded w-48 ${shimmerClass}`}></div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><div className={`h-4 rounded w-8 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-12 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-32 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-32 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-28 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-28 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-20 ${shimmerClass}`}></div></TableHead>
                <TableHead><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((row) => (
                <TableRow key={row}>
                  <TableCell><div className={`h-4 rounded w-4 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-8 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-20 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-32 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-16 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-16 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-16 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-24 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-28 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-4 rounded w-20 ${shimmerClass}`}></div></TableCell>
                  <TableCell><div className={`h-6 rounded w-20 ${shimmerClass}`}></div></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className={`h-8 w-8 rounded ${shimmerClass}`}></div>
                      <div className={`h-8 w-8 rounded ${shimmerClass}`}></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
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
        </Card>
      </div>
    </div>
  );
};

export default ReadingPageSkeleton;