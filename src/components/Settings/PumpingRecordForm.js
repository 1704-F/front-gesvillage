import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { axiosPrivate as api } from '../../utils/axios';


// Composant pour le formulaire d'ajout/édition d'un enregistrement de pompage
const PumpingRecordForm = ({ isOpen, onClose, editingRecord, sources, employees, onSubmit }) => {
  const [formData, setFormData] = useState({
    source_id: '',
    employee_id: '',
    pumping_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: format(new Date().setHours(8, 0, 0), 'HH:mm'),
    end_time: format(new Date().setHours(17, 0, 0), 'HH:mm'),
    start_meter_reading: '',
    end_meter_reading: '',
    volume_pumped: '',
    pumping_duration: '',
    comments: ''
  });

  // Ajouter ce log pour déboguer
  useEffect(() => {
    console.log("Employés reçus dans le composant:", employees);
  }, [employees]);

  useEffect(() => {
    if (editingRecord) {
      // Formater la date et les heures
      const formattedRecord = {
        ...editingRecord,
        pumping_date: editingRecord.pumping_date ? format(new Date(editingRecord.pumping_date), 'yyyy-MM-dd') : '',
        start_time: editingRecord.start_time || '',
        end_time: editingRecord.end_time || ''
      };
      setFormData(formattedRecord);
    } else if (sources.length > 0) {
      // Par défaut, sélectionner la première source si disponible
      setFormData(prev => ({ ...prev, source_id: String(sources[0].id) }));
    }
  }, [editingRecord, sources]);

  // Calcul automatique du volume pompé et de la durée
  useEffect(() => {
    const start = parseFloat(formData.start_meter_reading) || 0;
    const end = parseFloat(formData.end_meter_reading) || 0;
    
    if (start > 0 && end > 0 && end >= start) {
      // Calculer le volume pompé
      const volume = end - start;
      setFormData(prev => ({ ...prev, volume_pumped: volume.toFixed(2) }));
    }

    // Calculer la durée de pompage
    if (formData.start_time && formData.end_time) {
      try {
        const startDate = new Date(`2000-01-01T${formData.start_time}`);
        const endDate = new Date(`2000-01-01T${formData.end_time}`);
        
        let diffMinutes = (endDate - startDate) / (1000 * 60);
        
        // Si l'heure de fin est avant l'heure de début, on suppose que c'est le jour suivant
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Ajouter 24 heures en minutes
        }
        
        setFormData(prev => ({ ...prev, pumping_duration: Math.round(diffMinutes) }));
      } catch (error) {
        console.error("Erreur lors du calcul de la durée:", error);
      }
    }
  }, [formData.start_meter_reading, formData.end_meter_reading, formData.start_time, formData.end_time]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Formater la durée en heures et minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // S'assurer que employees est un tableau
  const employeesList = Array.isArray(employees) ? employees : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editingRecord ? 'Modifier l\'enregistrement de pompage' : 'Ajouter un enregistrement de pompage'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source d'eau</label>
              <Select
                value={formData.source_id}
                onValueChange={(value) => setFormData({ ...formData, source_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source.id} value={String(source.id)}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employé responsable</label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>

                <SelectContent>
                  {employeesList.length > 0 ? (
                    employeesList.map(employee => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no_employee" disabled>Aucun employé disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de pompage</label>
              <Input
                type="date"
                value={formData.pumping_date}
                onChange={(e) => setFormData({ ...formData, pumping_date: e.target.value })}
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Heure début</label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Heure fin</label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compteur début (m³)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.start_meter_reading}
                onChange={(e) => setFormData({ ...formData, start_meter_reading: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Compteur fin (m³)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.end_meter_reading}
                onChange={(e) => setFormData({ ...formData, end_meter_reading: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Volume pompé (m³)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.volume_pumped}
                onChange={(e) => setFormData({ ...formData, volume_pumped: e.target.value })}
                disabled
              />
              <p className="text-xs text-gray-500">Calculé automatiquement</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Durée de pompage</label>
              <Input
                value={formatDuration(formData.pumping_duration)}
                disabled
              />
              <p className="text-xs text-gray-500">Calculée automatiquement</p>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium">Commentaires</label>
              <Input
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingRecord ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PumpingRecordForm;