// src/components/inventory/CategoriesTab.jsx
import React from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Pencil, Trash2, Package } from 'lucide-react';

const CategoriesTab = ({ categories, onEdit, onDelete }) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Nombre d'articles</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Aucune catégorie trouvée
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="max-w-md truncate">
                    {category.description || 'Aucune description'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    {category.items?.length || category.itemCount || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDelete(category.id)}
                      disabled={category.items?.length > 0 || category.itemCount > 0}
                      title={category.items?.length > 0 ? "Cette catégorie contient des articles et ne peut pas être supprimée" : ""}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CategoriesTab;