import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AlertCircle } from 'lucide-react';

const LoanDefaultForm = ({ isOpen, onClose, loan, onSubmit }) => {
  const [reason, setReason] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
    setReason('');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            Marquer l'emprunt comme défaillant
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm">
            <p>
              Vous êtes sur le point de marquer cet emprunt comme défaillant. 
              Cette action ne peut pas être annulée.
            </p>
          </div>
          
          {loan && (
            <div className="mb-4">
              <p><strong>Emprunt :</strong> {loan.lender}</p>
              <p><strong>Montant :</strong> {parseFloat(loan.amount).toLocaleString()} FCFA</p>
              <p><strong>Montant restant :</strong> {parseFloat(loan.remaining_amount).toLocaleString()} FCFA</p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Raison de la défaillance</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez pourquoi cet emprunt est défaillant..."
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="destructive" type="submit">
              Confirmer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDefaultForm;