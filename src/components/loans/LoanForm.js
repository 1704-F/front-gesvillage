import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LoanForm = ({ isOpen, onClose, editingLoan, employees, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'),
    interest_rate: '0',
    purpose: '',
    lender: '',
    payment_method: 'bank',
    description: '',
    authorized_by_id: '',
    responsibles: []
  });

  const [selectedResponsibles, setSelectedResponsibles] = useState([]);

  useEffect(() => {
    if (editingLoan) {
      // Format dates for input elements
      const formattedLoan = {
        ...editingLoan,
        start_date: format(new Date(editingLoan.start_date), 'yyyy-MM-dd'),
        due_date: format(new Date(editingLoan.due_date), 'yyyy-MM-dd')
      };
      
      setFormData(formattedLoan);
      
      // Set responsibles if available
      if (editingLoan.responsibles && editingLoan.responsibles.length > 0) {
        setSelectedResponsibles(editingLoan.responsibles.map(r => ({
          employee_id: r.id.toString(),
          role: r.LoanResponsible?.role || 'manager',
          name: `${r.first_name} ${r.last_name}`
        })));
      }
    } else {
      resetForm();
    }
  }, [editingLoan]);

  const resetForm = () => {
    setFormData({
      amount: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), 'yyyy-MM-dd'),
      interest_rate: '0',
      purpose: '',
      lender: '',
      payment_method: 'bank',
      description: '',
      authorized_by_id: '',
      responsibles: []
    });
    setSelectedResponsibles([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add responsibles to form data
    const dataToSubmit = {
      ...formData,
      responsibles: selectedResponsibles.map(r => ({
        employee_id: r.employee_id,
        role: r.role
      }))
    };
    
    onSubmit(dataToSubmit);
  };

  const handleAddResponsible = () => {
    if (!formData.responsible_id || !formData.responsible_role) return;
    
    const employee = employees.find(e => e.id.toString() === formData.responsible_id);
    if (!employee) return;
    
    const newResponsible = {
      employee_id: formData.responsible_id,
      role: formData.responsible_role,
      name: `${employee.first_name} ${employee.last_name}`
    };
    
    setSelectedResponsibles([...selectedResponsibles, newResponsible]);
    
    // Reset selection fields
    setFormData({
      ...formData,
      responsible_id: '',
      responsible_role: 'manager'
    });
  };

  const handleRemoveResponsible = (index) => {
    const updatedResponsibles = [...selectedResponsibles];
    updatedResponsibles.splice(index, 1);
    setSelectedResponsibles(updatedResponsibles);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingLoan ? 'Modifier l\'emprunt' : 'Nouvel emprunt'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant (FCFA)</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Prêteur</label>
              <Input
                value={formData.lender}
                onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                placeholder="Banque, institution, personne..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'échéance</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Taux d'intérêt (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode de paiement</label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="bank">Virement bancaire</SelectItem>
                  <SelectItem value="cheque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Motif de l'emprunt</label>
            <Input
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Détails supplémentaires..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Autorisé par</label>
            <Select
              value={formData.authorized_by_id}
              onValueChange={(value) => setFormData({ ...formData, authorized_by_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="border p-4 rounded-md">
            <h4 className="font-medium mb-2">Responsables</h4>
            
            <div className="grid grid-cols-[2fr_1fr_auto] gap-2 mb-2">
              <Select
                value={formData.responsible_id || ''}
                onValueChange={(value) => setFormData({ ...formData, responsible_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={formData.responsible_role || 'manager'}
                onValueChange={(value) => setFormData({ ...formData, responsible_role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Gestionnaire</SelectItem>
                  <SelectItem value="guarantor">Garant</SelectItem>
                  <SelectItem value="processor">Opérateur</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                onClick={handleAddResponsible}
                variant="outline"
              >
                Ajouter
              </Button>
            </div>
            
            {selectedResponsibles.length > 0 ? (
              <div className="space-y-2 mt-4">
                {selectedResponsibles.map((responsible, index) => (
                  <div key={index} className="flex justify-between items-center border rounded-md p-2">
                    <div>
                      <span className="font-medium">{responsible.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {responsible.role === 'manager' ? 'Gestionnaire' : 
                         responsible.role === 'guarantor' ? 'Garant' : 'Opérateur'}
                      </span>
                    </div>
                    <Button 
                      type="button" 
                      onClick={() => handleRemoveResponsible(index)}
                      variant="ghost" 
                      size="sm"
                    >
                      Retirer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Aucun responsable ajouté</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Pièce jointe</label>
            <Input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            />
            <p className="text-xs text-gray-500">
              Formats acceptés: PDF, Word, Excel, images (max 10MB)
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingLoan ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoanForm;