// src/components/analytics/HistoricalBalanceSheetForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Calendar } from 'lucide-react';
import { useToast } from "../ui/toast/use-toast";
import { axiosPrivate as api } from '../../utils/axios';

const HistoricalBalanceSheetForm = ({ onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
    accounts_receivable: '0',
    cash_and_bank: '0',
    other_assets: '0',
    accounts_payable: '0',
    loans: '0',
    other_liabilities: '0',
    notes: '',
    employee_id: ''
  });
  
  // Charger les données du formulaire (employés)
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await api.get('/historical-balance-sheets/form-data');
        setEmployees(response.data.data.employees);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données du formulaire"
        });
      }
    };
    
    fetchFormData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Recalculer les totaux pour affichage
    calculateTotals(name, value);
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculer les totaux pour affichage
  const [totals, setTotals] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    difference: 0
  });
  
  const calculateTotals = (changedField, newValue) => {
    let updatedFormData = { ...formData };
    if (changedField) {
      updatedFormData[changedField] = newValue;
    }
    
    const accountsReceivable = parseFloat(updatedFormData.accounts_receivable) || 0;
    const cashAndBank = parseFloat(updatedFormData.cash_and_bank) || 0;
    const otherAssets = parseFloat(updatedFormData.other_assets) || 0;
    
    const accountsPayable = parseFloat(updatedFormData.accounts_payable) || 0;
    const loans = parseFloat(updatedFormData.loans) || 0;
    const otherLiabilities = parseFloat(updatedFormData.other_liabilities) || 0;
    
    const totalAssets = accountsReceivable + cashAndBank + otherAssets;
    const totalLiabilities = accountsPayable + loans + otherLiabilities;
    
    setTotals({
      totalAssets,
      totalLiabilities,
      difference: totalAssets - totalLiabilities
    });
  };
  
  useEffect(() => {
    calculateTotals();
  }, []);
  
  const validateForm = () => {
    // Vérifier les champs obligatoires
    if (!formData.period_start || !formData.period_end) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les dates de période sont obligatoires"
      });
      return false;
    }
    
    // Vérifier que la période est antérieure à l'année en cours
    const currentYear = new Date().getFullYear();
    const endYear = new Date(formData.period_end).getFullYear();
    
    if (endYear >= currentYear) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La période doit être antérieure à l'année en cours"
      });
      return false;
    }
    
    // Vérifier que la date de début est antérieure à la date de fin
    if (new Date(formData.period_start) > new Date(formData.period_end)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La date de début doit être antérieure à la date de fin"
      });
      return false;
    }
    
    // Vérifier les montants
    const numericFields = [
      'accounts_receivable',
      'cash_and_bank',
      'other_assets',
      'accounts_payable',
      'loans',
      'other_liabilities'
    ];
    
    for (const field of numericFields) {
      if (isNaN(parseFloat(formData[field]))) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Le champ ${field} doit être un nombre valide`
        });
        return false;
      }
    }
    
    // Vérifier l'équilibre du bilan
    if (Math.abs(totals.difference) > 0.01) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le bilan n'est pas équilibré. Le total des actifs doit être égal au total des passifs."
      });
      return false;
    }
    
    // Vérifier l'employé
    if (!formData.employee_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un employé responsable"
      });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/historical-balance-sheets', formData);
      
      toast({
        title: "Succès",
        description: "Bilan historique ajouté avec succès"
      });
      
      // Réinitialiser le formulaire
      setFormData({
        period_start: '',
        period_end: '',
        accounts_receivable: '0',
        cash_and_bank: '0',
        other_assets: '0',
        accounts_payable: '0',
        loans: '0',
        other_liabilities: '0',
        notes: '',
        employee_id: ''
      });
      
      // Recalculer les totaux
      calculateTotals();
      
      // Notifier le parent pour rafraîchir la liste
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bilan:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de l'ajout du bilan"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Formater les nombres pour l'affichage
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Période */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Début de période</label>
          <div className="relative">
            <Input 
              type="date" 
              className="pl-10" 
              name="period_start"
              value={formData.period_start} 
              onChange={handleChange}
              required
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Fin de période</label>
          <div className="relative">
            <Input 
              type="date" 
              className="pl-10" 
              name="period_end"
              value={formData.period_end} 
              onChange={handleChange}
              required
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Actifs */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Actifs</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Créances clients (FCFA)</label>
            <Input
              type="number"
              name="accounts_receivable"
              value={formData.accounts_receivable}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Factures émises mais non encore encaissées</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Trésorerie (FCFA)</label>
            <Input
              type="number"
              name="cash_and_bank"
              value={formData.cash_and_bank}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Argent disponible en banque et en caisse</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Autres actifs (FCFA)</label>
            <Input
              type="number"
              name="other_assets"
              value={formData.other_assets}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Autres éléments d'actif</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold">Total Actifs:</span>
              <span className={`font-semibold ${Math.abs(totals.difference) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {formatNumber(totals.totalAssets)} FCFA
              </span>
            </div>
          </div>
        </div>
        
        {/* Passifs */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Passifs</h3>
          
          <div>
            <label className="block text-sm font-medium mb-2">Dettes fournisseurs (FCFA)</label>
            <Input
              type="number"
              name="accounts_payable"
              value={formData.accounts_payable}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Factures à régler aux fournisseurs</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Emprunts (FCFA)</label>
            <Input
              type="number"
              name="loans"
              value={formData.loans}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Montant des emprunts en cours</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Autres passifs (FCFA)</label>
            <Input
              type="number"
              name="other_liabilities"
              value={formData.other_liabilities}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Autres éléments de passif</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold">Total Passifs:</span>
              <span className={`font-semibold ${Math.abs(totals.difference) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                {formatNumber(totals.totalLiabilities)} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Différence */}
      <div className={`p-4 rounded-lg ${Math.abs(totals.difference) > 0.01 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Différence:</span>
          <span className={`font-bold ${Math.abs(totals.difference) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
            {formatNumber(totals.difference)} FCFA {Math.abs(totals.difference) <= 0.01 && '✓'}
          </span>
        </div>
        {Math.abs(totals.difference) > 0.01 && (
          <p className="text-sm text-red-600 mt-2">
            Le bilan n'est pas équilibré. Ajustez les montants pour que les actifs soient égaux aux passifs.
          </p>
        )}
      </div>
      
      {/* Employé */}
      <div>
        <label className="block text-sm font-medium mb-2">Employé responsable</label>
        <Select 
          value={formData.employee_id} 
          onValueChange={(value) => handleSelectChange('employee_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un employé" />
          </SelectTrigger>
          <SelectContent>
            {employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id.toString()}>
                {`${employee.first_name} ${employee.last_name} (${employee.job_title})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Notes (optionnel)</label>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Commentaires sur ce bilan"
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading || Math.abs(totals.difference) > 0.01}>
        {loading ? "Enregistrement en cours..." : "Enregistrer le bilan"}
      </Button>
    </form>
  );
};

export default HistoricalBalanceSheetForm;