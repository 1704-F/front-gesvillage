import React from 'react';
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";

import { Badge } from "../../ui/badge";

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant pour afficher les détails d'un enregistrement de distribution
const ViewDistributionRecordModal = ({ isOpen, onClose, record }) => {
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
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[650px] h-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-2 border-b">
          <DialogTitle className="text-base sm:text-lg">
            Détails de l'enregistrement de distribution
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-2 sm:p-4">
          <div className="space-y-6">
            {/* Section d'en-tête avec informations générales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">Source d'eau</p>
                <p className="font-medium">{record.source?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date de distribution</p>
                <p className="font-medium">{format(new Date(record.distribution_date), 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Responsable</p>
                <p className="font-medium break-words">
                  {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <Badge variant={record.status === 'validated' ? 'success' : 'warning'} className="inline-block">
                  {record.status === 'validated' ? 'Validé' : 'En attente'}
                </Badge>
              </div>
            </div>

            {/* Détails de distribution */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Informations de distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <p className="text-sm text-gray-500">Volume distribué (m³)</p>
                  <p className="font-medium">{record.volume_distributed || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Durée de distribution</p>
                  <p className="font-medium">{formatDuration(record.distribution_duration)}</p>
                </div>
              </div>
            </div>

            {/* Zone de distribution et bénéficiaires */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Zone et bénéficiaires</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Zones de distribution</p>
                  <div className="space-y-1">
                    {record.quartiers && record.quartiers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {record.quartiers.map((quartier, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {quartier.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="font-medium">N/A</p>
                    )}
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-sm text-gray-500">Nombre de bénéficiaires</p>
                  <p className="font-medium">{record.beneficiaries > 0 ? record.beneficiaries : 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            {/* Commentaires */}
            {record.comments && (
              <div className="space-y-2">
                <h3 className="text-md font-medium">Commentaires</h3>
                <p className="text-sm break-words">{record.comments}</p>
              </div>
            )}

            {/* Informations de validation */}
            {record.status === 'validated' && record.validator && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm text-gray-500 break-words">
                  Validé par {record.validator.first_name} {record.validator.last_name} 
                  {record.updatedat && ` le ${format(new Date(record.updatedat), 'dd/MM/yyyy', { locale: fr })}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-2 border-t bg-background">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDistributionRecordModal;