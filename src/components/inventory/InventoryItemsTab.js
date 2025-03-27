// src/components/inventory/InventoryItemsTab.jsx
import React, { useState } from 'react';
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Pencil, 
  Trash2, 
  ArrowDown, 
  ArrowUp,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const InventoryItemsTab = ({ items, categories, onEdit, onDelete, onAddMovement }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtrer les articles
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  // Trier les articles
  const sortedItems = [...filteredItems].sort((a, b) => {
    let valueA, valueB;
    
    // Déterminer les valeurs à comparer en fonction du critère de tri
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'category':
        valueA = a.category?.name?.toLowerCase() || '';
        valueB = b.category?.name?.toLowerCase() || '';
        break;
      case 'quantity':
        valueA = parseFloat(a.quantity);
        valueB = parseFloat(b.quantity);
        break;
      case 'expiration':
        valueA = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
        valueB = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }

    // Appliquer l'ordre de tri
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Gérer le tri
  const handleSort = (field) => {
    if (sortBy === field) {
      // Inverser l'ordre si on clique sur le même champ
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, tri ascendant par défaut
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Formater la date d'expiration
  const formatExpirationDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const expirationDate = new Date(dateString);
    const today = new Date();
    
    // Calculer la différence en jours
    const diffTime = expirationDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let badgeVariant = 'default';
    if (diffDays < 0) {
      badgeVariant = 'destructive'; // Expiré
    } else if (diffDays < 30) {
      badgeVariant = 'warning';     // Expire bientôt
    }
    
    return (
      <Badge variant={badgeVariant}>
        {format(expirationDate, 'dd/MM/yyyy', { locale: fr })}
        {diffDays < 30 && diffDays >= 0 && ` (${diffDays} jours)`}
        {diffDays < 0 && ' (Expiré)'}
      </Badge>
    );
  };

  // Déterminer le statut du stock
  const getStockStatus = (item) => {
    const quantity = parseFloat(item.quantity);
    const threshold = parseFloat(item.alert_threshold);
    
    if (quantity <= 0) {
      return <Badge variant="destructive">Épuisé</Badge>;
    } else if (quantity <= threshold) {
      return <Badge variant="warning">Bas</Badge>;
    } else {
      return <Badge variant="success">Ok</Badge>;
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-auto">
          <select
            className="h-10 px-3 py-2 rounded-md border border-input bg-background"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Nom
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                Catégorie
                {sortBy === 'category' && (
                  sortOrder === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('quantity')}>
                Quantité
                {sortBy === 'quantity' && (
                  sortOrder === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Emplacement</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('expiration')}>
                Expiration
                {sortBy === 'expiration' && (
                  sortOrder === 'asc' ? <ArrowUp className="inline w-4 h-4 ml-1" /> : <ArrowDown className="inline w-4 h-4 ml-1" />
                )}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              sortedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category?.name || 'N/A'}</TableCell>
                  <TableCell>{parseFloat(item.quantity).toFixed(2)}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{getStockStatus(item)}</TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell>{formatExpirationDate(item.expiration_date)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onAddMovement(item, 'in')}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onAddMovement(item, 'out')}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDelete(item.id)}
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
    </>
  );
};

export default InventoryItemsTab;