//ViewPumpingRecordModal
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

import { Badge } from "../ui/badge";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant pour afficher les détails d'un enregistrement de pompage
const ViewPumpingRecordModal = ({ isOpen, onClose, record }) => {
    if (!record) return null;
  
    // Formater la durée en heures et minutes
    const formatDuration = (minutes) => {
      if (!minutes) return 'N/A';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Détails de l'enregistrement de pompage</DialogTitle>
          </DialogHeader>
  
          <div className="space-y-6">
            {/* Section d'en-tête avec informations générales */}
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Source d'eau</p>
                <p className="font-medium">{record.source?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de pompage</p>
                <p className="font-medium">{format(new Date(record.pumping_date), 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsable</p>
                <p className="font-medium">
                  {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <Badge variant={record.status === 'validated' ? 'success' : 'warning'}>
                  {record.status === 'validated' ? 'Validé' : 'En attente'}
                </Badge>
              </div>
            </div>
  
            {/* Détails de pompage */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Informations de pompage</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Heure de début</p>
                  <p className="font-medium">{record.start_time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Heure de fin</p>
                  <p className="font-medium">{record.end_time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compteur début (m³)</p>
                  <p className="font-medium">{record.start_meter_reading || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Compteur fin (m³)</p>
                  <p className="font-medium">{record.end_meter_reading || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Volume pompé (m³)</p>
                  <p className="font-medium">{record.volume_pumped || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durée de pompage</p>
                  <p className="font-medium">{formatDuration(record.pumping_duration)}</p>
                </div>
              </div>
            </div>
  
            {/* Commentaires */}
            {record.comments && (
              <div className="space-y-2">
                <h3 className="text-md font-medium">Commentaires</h3>
                <p className="text-sm">{record.comments}</p>
              </div>
            )}
  
            {/* Informations de validation */}
            {record.status === 'validated' && record.validator && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm text-gray-500">
                  Validé par {record.validator.first_name} {record.validator.last_name} 
                  {record.updatedat && ` le ${format(new Date(record.updatedat), 'dd/MM/yyyy', { locale: fr })}`}
                </p>
              </div>
            )}
          </div>
  
          <DialogFooter>
            <Button onClick={onClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
};

export default ViewPumpingRecordModal;