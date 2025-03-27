// src/components/inventory/MovementsTab.jsx
import React, { useState } from 'react';
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowDown, 
  ArrowUp,
  Search, 
  Filter
} from 'lucide-react';

const MovementsTab = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Filtrer les mouvements
  const filteredMovements = movements.filter(movement => {
    // Filtre de recherche (sur le nom de l'article et la raison)
    const matchesSearch = 
      movement.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par type
    const matchesType = typeFilter === 'all' || movement.movement_type === typeFilter;
    
    // Filtre par date
    let matchesDate = true;
    if (dateFilter) {
      matchesDate = movement.movement_date === dateFilter;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Formater le type de mouvement
  const formatMovementType = (type) => {
    switch (type) {
      case 'in':
        return <Badge variant="success" className="flex items-center"><ArrowDown className="w-3 h-3 mr-1" /> Entrée</Badge>;
      case 'out':
        return <Badge variant="warning" className="flex items-center"><ArrowUp className="w-3 h-3 mr-1" /> Sortie</Badge>;
      default:
        return type;
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un mouvement..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-auto">
          <select
            className="h-10 px-3 py-2 rounded-md border border-input bg-background"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="in">Entrées</option>
            <option value="out">Sorties</option>
          </select>
        </div>
        
        <div className="w-auto">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Approbateur</TableHead>
              <TableHead>Raison</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Aucun mouvement trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.movement_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{formatMovementType(movement.movement_type)}</TableCell>
                  <TableCell className="font-medium">{movement.item?.name || 'N/A'}</TableCell>
                  <TableCell>{movement.item?.category?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {parseFloat(movement.quantity).toFixed(2)} {movement.item?.unit || ''}
                  </TableCell>
                  <TableCell>
                    {movement.employee ? 
                      `${movement.employee.first_name} ${movement.employee.last_name}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {movement.approver ? 
                      `${movement.approver.first_name} ${movement.approver.last_name}` : 
                      movement.movement_type === 'out' ? 'Non approuvé' : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {movement.reason || 'Aucune raison spécifiée'}
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

export default MovementsTab;