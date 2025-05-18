// src/components/schedule/ScheduleForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from 'date-fns';

export const ScheduleForm = ({ 
  isOpen, 
  onClose, 
  editingSchedule, 
  employees, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    employee_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'planned'
  });

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        ...editingSchedule,
        // Formatage des dates
        start_date: format(new Date(editingSchedule.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(editingSchedule.end_date), 'yyyy-MM-dd'),
        // Conversion de l'ID en chaîne
        employee_id: String(editingSchedule.employee_id)
      });
    } else {
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        description: '',
        type: '',
        employee_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        status: 'planned'
      });
    }
  }, [editingSchedule, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Validation : la date de fin ne peut pas être avant la date de début
  const minEndDate = formData.start_date || format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? 'Modifier le planning' : 'Ajouter au planning'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ex: Maintenance mensuelle"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>

              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reading">Relevé</SelectItem>
                </SelectContent>
              </Select>

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Employé assigné</label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>

                <SelectContent>
  {employees && employees.length > 0 ? (
    employees.map((employee) => (
      <SelectItem key={employee.id} value={String(employee.id)}>
        {employee.first_name} {employee.last_name}
      </SelectItem>
    ))
  ) : (
    <SelectItem value="no-employee" disabled>Aucun employé disponible</SelectItem>
  )}
</SelectContent>

               

              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  start_date: e.target.value,
                  // Si la date de début devient après la date de fin, on ajuste la date de fin
                  end_date: e.target.value > formData.end_date ? e.target.value : formData.end_date
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={formData.end_date}
                min={minEndDate}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'activité (optionnelle)"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingSchedule ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;