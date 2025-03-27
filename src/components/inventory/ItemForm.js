// src/components/inventory/ItemForm.js
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

const ItemForm = ({ isOpen, onClose, editingItem, categories, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    quantity: '0',
    unit: 'pièce',
    alert_threshold: '0',
    unit_price: '',
    location: '',
    expiration_date: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        category_id: String(editingItem.category_id),
        // Convertir la date d'expiration au format YYYY-MM-DD pour l'input date
        expiration_date: editingItem.expiration_date ? 
          format(new Date(editingItem.expiration_date), 'yyyy-MM-dd') : '',
      });
    } else if (categories.length > 0) {
      // Par défaut, sélectionner la première catégorie si disponible
      setFormData(prev => ({ ...prev, category_id: String(categories[0].id) }));
    }
  }, [editingItem, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir les valeurs numériques
    const formattedData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      alert_threshold: parseFloat(formData.alert_threshold),
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      // Assurer que les ID sont des nombres
      category_id: parseInt(formData.category_id),
    };
    
    onSubmit(formattedData);
  };

  // Options d'unités communes
  const unitOptions = [
    'pièce', 'unité', 'kg', 'g', 'litre', 'ml', 'carton', 'boîte', 'mètre', 'cm', 'pack'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l'article *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie *</label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité initiale *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                disabled={editingItem} // Ne pas permettre de modifier directement la quantité d'un article existant
              />
              {editingItem && (
                <p className="text-xs text-gray-500">
                  Pour ajuster le stock, utilisez les entrées/sorties
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Unité *</label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Seuil d'alerte *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.alert_threshold}
                onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Quantité minimale avant notification
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prix unitaire</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Emplacement</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Étagère A, Compartiment 3"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'expiration</label>
              <Input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemForm;