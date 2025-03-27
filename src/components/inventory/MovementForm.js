// src/components/inventory/MovementForm.js
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from 'date-fns';

const MovementForm = ({ isOpen, onClose, type = 'in', itemId = null, items, employees, onSubmit }) => {
  const [formData, setFormData] = useState({
    inventory_id: '',
    quantity: '',
    movement_date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    employee_id: '',
    approver_id: type === 'out' ? '' : null // Approbateur requis uniquement pour les sorties
  });

  const [selectedItem, setSelectedItem] = useState(null);

  // Si un ID d'article est fourni, le sélectionner par défaut
  useEffect(() => {
    if (itemId && items.length > 0) {
      setFormData({
        ...formData,
        inventory_id: String(itemId)
      });
      
      // Trouver l'article correspondant
      const item = items.find(i => i.id === itemId);
      if (item) {
        setSelectedItem(item);
      }
    } else if (items.length > 0) {
      // Sinon, sélectionner le premier article par défaut
      setFormData(prev => ({ ...prev, inventory_id: String(items[0].id) }));
      setSelectedItem(items[0]);
    }
  }, [itemId, items]);

  // Gérer le changement d'article
  const handleItemChange = (value) => {
    const itemId = parseInt(value);
    const item = items.find(i => i.id === itemId);
    
    setFormData({ 
      ...formData, 
      inventory_id: value 
    });
    
    setSelectedItem(item);
  };

  // Valider que la quantité de sortie ne dépasse pas le stock disponible
  const validateQuantity = () => {
    if (type === 'out' && selectedItem) {
      const requestedQuantity = parseFloat(formData.quantity);
      const availableQuantity = parseFloat(selectedItem.quantity);
      
      return requestedQuantity > 0 && requestedQuantity <= availableQuantity;
    }
    return parseFloat(formData.quantity) > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateQuantity()) {
      alert(type === 'out' 
        ? `La quantité demandée dépasse le stock disponible (${selectedItem?.quantity} ${selectedItem?.unit})` 
        : "La quantité doit être supérieure à zéro"
      );
      return;
    }
    
    // Convertir les valeurs numériques
    const formattedData = {
      ...formData,
      inventory_id: parseInt(formData.inventory_id),
      quantity: parseFloat(formData.quantity),
      employee_id: parseInt(formData.employee_id),
      approver_id: formData.approver_id ? parseInt(formData.approver_id) : null,
      movement_type: type
    };
    
    onSubmit(formattedData);
  };

  const formTitle = type === 'in' ? 'Entrée de stock' : 'Sortie de stock';
  const buttonText = type === 'in' ? 'Enregistrer l\'entrée' : 'Enregistrer la sortie';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Article *</label>
              <Select
                value={formData.inventory_id}
                onValueChange={handleItemChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name} ({parseFloat(item.quantity).toFixed(2)} {item.unit} disponible)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité *</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
                <span className="text-sm text-gray-500 min-w-[50px]">
                  {selectedItem?.unit || ''}
                </span>
              </div>
              {type === 'out' && selectedItem && (
                <p className="text-xs text-gray-500">
                  Stock disponible: {parseFloat(selectedItem.quantity).toFixed(2)} {selectedItem.unit}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={formData.movement_date}
                onChange={(e) => setFormData({ ...formData, movement_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsable *</label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'out' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Approbateur *</label>
                <Select
                  value={formData.approver_id}
                  onValueChange={(value) => setFormData({ ...formData, approver_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un approbateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.id !== parseInt(formData.employee_id)) // Exclure le responsable
                      .map(employee => (
                        <SelectItem key={employee.id} value={String(employee.id)}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Motif</label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="Motif de l'entrée/sortie (optionnel)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {buttonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementForm;