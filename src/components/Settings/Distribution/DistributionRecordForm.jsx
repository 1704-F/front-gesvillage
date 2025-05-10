import React, { useState, useEffect } from 'react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import { X } from "lucide-react";
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../../utils/axios';

// Composant pour le formulaire d'ajout/édition d'un enregistrement de distribution
const DistributionRecordForm = ({ isOpen, onClose, editingRecord, sources, employees, onSubmit }) => {
  const [quartiers, setQuartiers] = useState([]);
  const [calculatingBeneficiaries, setCalculatingBeneficiaries] = useState(false);

  const [formData, setFormData] = useState({
    source_id: '',
    employee_id: '',
    distribution_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: format(new Date().setHours(8, 0, 0), 'HH:mm'),
    end_time: format(new Date().setHours(17, 0, 0), 'HH:mm'),
    start_meter_reading: '',
    end_meter_reading: '',
    volume_distributed: '',
    distribution_duration: '',
    quartier_ids: [],
    beneficiaries: 0,
    comments: ''
  });

  useEffect(() => {
    console.log("Employés reçus dans le composant:", employees);
  }, [employees]);

  useEffect(() => {
    if (editingRecord) {
      // Formater la date et les heures
      const formattedRecord = {
        ...editingRecord,
        quartier_ids: editingRecord.quartier_ids || [],
        distribution_date: editingRecord.distribution_date ? format(new Date(editingRecord.distribution_date), 'yyyy-MM-dd') : '',
        start_time: editingRecord.start_time || '',
        end_time: editingRecord.end_time || ''
      };
      setFormData(formattedRecord);
    } else if (sources.length > 0) {
      // Par défaut, sélectionner la première source si disponible
      setFormData(prev => ({ ...prev, source_id: String(sources[0].id) }));
    }
  }, [editingRecord, sources]);

  // Calcul automatique du volume distribué et de la durée
  useEffect(() => {
    const start = parseFloat(formData.start_meter_reading) || 0;
    const end = parseFloat(formData.end_meter_reading) || 0;
    
    if (start > 0 && end > 0 && end >= start) {
      // Calculer le volume distribué
      const volume = end - start;
      setFormData(prev => ({ ...prev, volume_distributed: volume.toFixed(2) }));
    }

    // Calculer la durée de distribution
    if (formData.start_time && formData.end_time) {
      try {
        const startDate = new Date(`2000-01-01T${formData.start_time}`);
        const endDate = new Date(`2000-01-01T${formData.end_time}`);
        
        let diffMinutes = (endDate - startDate) / (1000 * 60);
        
        // Si l'heure de fin est avant l'heure de début, on suppose que c'est le jour suivant
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Ajouter 24 heures en minutes
        }
        
        setFormData(prev => ({ ...prev, distribution_duration: Math.round(diffMinutes) }));
      } catch (error) {
        console.error("Erreur lors du calcul de la durée:", error);
      }
    }
  }, [formData.start_meter_reading, formData.end_meter_reading, formData.start_time, formData.end_time]);

  useEffect(() => {
    fetchQuartiers();
  }, []);

  useEffect(() => {
    if (formData.quartier_ids.length > 0) {
      calculateBeneficiaries(formData.quartier_ids);
    } else {
      setFormData(prev => ({ ...prev, beneficiaries: 0 }));
    }
  }, [formData.quartier_ids]);

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

  const fetchQuartiers = async () => {
    try {
      const response = await api.get('/water-quality/distribution/quartiers');
      setQuartiers(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des quartiers:', error);
    }
  };

  const calculateBeneficiaries = async (quartierIds) => {
    if (!quartierIds || quartierIds.length === 0) return;
    
    try {
      setCalculatingBeneficiaries(true);
      const response = await api.post('/water-quality/distribution/beneficiaries/multiple', {
        quartier_ids: quartierIds
      });
      setFormData(prev => ({
        ...prev,
        beneficiaries: response.data.data.beneficiaries
      }));
    } catch (error) {
      console.error('Erreur lors du calcul des bénéficiaires:', error);
    } finally {
      setCalculatingBeneficiaries(false);
    }
  };

  // S'assurer que employees est un tableau
  const employeesList = Array.isArray(employees) ? employees : [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[800px] h-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2 border-b">
          <DialogTitle className="text-base sm:text-lg">
            {editingRecord ? 'Modifier l\'enregistrement de distribution' : 'Ajouter un enregistrement de distribution'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 p-2 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label className="text-sm font-medium">Date de distribution</label>
                <Input
                  type="date"
                  value={formData.distribution_date}
                  onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
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
                <label className="text-sm font-medium">Volume distribué (m³)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.volume_distributed}
                  onChange={(e) => setFormData({ ...formData, volume_distributed: e.target.value })}
                  disabled
                />
                <p className="text-xs text-gray-500">Calculé automatiquement</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Durée de distribution</label>
                <Input
                  value={formatDuration(formData.distribution_duration)}
                  disabled
                />
                <p className="text-xs text-gray-500">Calculée automatiquement</p>
              </div>

              {/* Section quartiers mise à jour */}
              <div className="space-y-2 col-span-full">
                <label className="text-sm font-medium">Quartiers de distribution</label>
                
                {/* Affichage des quartiers sélectionnés */}
                {formData.quartier_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-background">
                    {quartiers
                      .filter(q => formData.quartier_ids.includes(q.id))
                      .map(quartier => (
                        <Badge key={quartier.id} variant="secondary" className="pr-1">
                          {quartier.name}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                quartier_ids: formData.quartier_ids.filter(id => id !== quartier.id)
                              });
                            }}
                            className="ml-1 text-xs opacity-60 hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    }
                  </div>
                )}
                
                {/* Liste des quartiers disponibles */}
                <div className="border rounded-md max-h-[200px] overflow-y-auto">
                  {quartiers.map(quartier => (
                    <div
                      key={quartier.id}
                      className="flex items-center space-x-2 p-2 hover:bg-secondary cursor-pointer"
                      onClick={() => {
                        const isSelected = formData.quartier_ids.includes(quartier.id);
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            quartier_ids: formData.quartier_ids.filter(id => id !== quartier.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            quartier_ids: [...formData.quartier_ids, quartier.id]
                          });
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.quartier_ids.includes(quartier.id)}
                        onChange={() => {}} // Le onChange est géré par le onClick du div parent
                        className="pointer-events-none"
                      />
                      <span>{quartier.name}</span>
                    </div>
                  ))}
                  {quartiers.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Aucun quartier disponible
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {formData.quartier_ids.length > 0 && (
                    <span>
                      {formData.quartier_ids.length} quartier{formData.quartier_ids.length > 1 ? 's' : ''} sélectionné{formData.quartier_ids.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Nombre de bénéficiaires */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de bénéficiaires</label>
                <Input
                  type="number"
                  value={formData.beneficiaries}
                  disabled
                />
                <p className="text-xs text-gray-500">
                  {calculatingBeneficiaries ? 'Calcul en cours...' : 'Calculé automatiquement'}
                </p>
              </div>

              {/* Commentaires */}
              <div className="col-span-full space-y-2">
                <label className="text-sm font-medium">Commentaires</label>
                <Input
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                />
              </div>
            </div>
          </form>
        </div>
        
        <DialogFooter className="flex-shrink-0 pt-2 border-t bg-background">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {editingRecord ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DistributionRecordForm;