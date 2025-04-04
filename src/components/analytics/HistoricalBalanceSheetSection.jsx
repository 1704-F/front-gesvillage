// src/components/analytics/HistoricalBalanceSheetSection.jsx
import React, { useState } from 'react';
import HistoricalBalanceSheetForm from './HistoricalBalanceSheetForm';
import HistoricalBalanceSheetList from './HistoricalBalanceSheetList';
import { Button } from "../ui/button";
import { Plus } from 'lucide-react';

const HistoricalBalanceSheetSection = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  const handleSuccessfulSubmit = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowModal(false); // Fermer la modale après soumission réussie
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bilan antérieur</h2>
        <Button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un Bilan
        </Button>
      </div>
      
      {/* Liste des bilans */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Liste des Bilans Historiques</h3>
          <p className="text-sm text-gray-500 mt-1">
            Consultez et gérez tous les bilans historiques enregistrés
          </p>
        </div>
        <div className="p-6">
          <HistoricalBalanceSheetList onRefresh={refreshTrigger} />
        </div>
      </div>
      
      {/* Modale pour ajouter un bilan */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ajouter un Bilan Historique</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Saisissez des données de bilan antérieures à l'adoption du logiciel
              </p>
            </div>
            <div className="p-6">
              <HistoricalBalanceSheetForm onSuccess={handleSuccessfulSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricalBalanceSheetSection;





