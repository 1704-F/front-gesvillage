import React, { useState, useEffect, useRef } from 'react';
import { lazy, Suspense } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../ui/toast/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Users,
  Wrench,
  Calendar, 
  Plus, 
  Pencil, 
  Trash2,
  DollarSign,
  Clock,
  XCircle, 
  Check,
  Download,
  FileText,
  GiftIcon,
  CreditCard
} from 'lucide-react';
import SalaryStatistics from '../../components/salaries/SalaryStatistics';

import { axiosPrivate as api } from '../../utils/axios';
import PlanningCalendarView from '../../components/schedule/PlanningCalendarView';
import { ScheduleForm } from '../../components/schedule/ScheduleForm';

const LoansPage = lazy(() => import('../../pages/LoansPage'));


// Composant pour le formulaire d'employé
const EmployeeForm = ({ isOpen, onClose, editingEmployee, onSubmit }) => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      phone_number: '',
      job_title: '',
      type: 'salary', // salary ou hourly
      salary: '',
      status: 'active'
    });
  
    useEffect(() => {
      if (editingEmployee) {
        setFormData(editingEmployee);
      }
    }, [editingEmployee]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Poste</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de contrat</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salarié</SelectItem>
                    <SelectItem value="hourly">Horaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.type === 'salary' ? 'Salaire mensuel' : 'Taux horaire'}
                </label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const MaintenanceForm = ({ isOpen, onClose, editingMaintenance, employees, onSubmit }) => {
    const [formData, setFormData] = useState({
      description: '',
      type: '',
      employee_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
      equipment: '',
      location: '',
      issue_type: 'new',
      problem_description: '',
      last_intervention: '',
      last_intervention_measures: '',
      diagnosis: '',
      work_description: '',
      failure_cause: '',
      recommendations: '',
      executed_by: '',
      execution_date: format(new Date(), 'yyyy-MM-dd'),
      certified_by_id: '',
      certification_date: format(new Date(), 'yyyy-MM-dd')
    });
    
    useEffect(() => {
      if (editingMaintenance) {
        setFormData({
          ...editingMaintenance,
          date: format(new Date(editingMaintenance.date), 'yyyy-MM-dd'),
          execution_date: editingMaintenance.execution_date 
            ? format(new Date(editingMaintenance.execution_date), 'yyyy-MM-dd') 
            : format(new Date(), 'yyyy-MM-dd'),
          certification_date: editingMaintenance.certification_date 
            ? format(new Date(editingMaintenance.certification_date), 'yyyy-MM-dd') 
            : format(new Date(), 'yyyy-MM-dd'),
        });
      }
    }, [editingMaintenance]);
    
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaintenance ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type d'entretien</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Entretien Préventif</SelectItem>
                    <SelectItem value="corrective">Entretien Curatif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
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
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Équipement à vérifier</label>
                <Input
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Emplacement</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Panne observée</label>
                <Select
                  value={formData.issue_type}
                  onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de panne" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouvelle</SelectItem>
                    <SelectItem value="recurring">Récurrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description du problème constaté</label>
              <Input
                value={formData.problem_description}
                onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Dernière intervention effectuée</label>
              <Input
                value={formData.last_intervention}
                onChange={(e) => setFormData({ ...formData, last_intervention: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mesures et solutions adaptées lors de la dernière intervention</label>
              <Input
                value={formData.last_intervention_measures}
                onChange={(e) => setFormData({ ...formData, last_intervention_measures: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnostic effectué</label>
              <Input
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description du travail effectué</label>
              <Input
                value={formData.work_description}
                onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quelle était la cause de la panne</label>
              <Input
                value={formData.failure_cause}
                onChange={(e) => setFormData({ ...formData, failure_cause: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Recommandations</label>
              <Input
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Travail exécuté par (Nom et fonction)</label>
                <Input
                  value={formData.executed_by}
                  onChange={(e) => setFormData({ ...formData, executed_by: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'exécution</label>
                <Input
                  type="date"
                  value={formData.execution_date}
                  onChange={(e) => setFormData({ ...formData, execution_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Travail certifié par</label>
                <Select
                  value={formData.certified_by_id}
                  onValueChange={(value) => setFormData({ ...formData, certified_by_id: value })}
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de certification</label>
                <Input
                  type="date"
                  value={formData.certification_date}
                  onChange={(e) => setFormData({ ...formData, certification_date: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editingMaintenance ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };


// Composant de pagination
const Pagination = ({ pagination, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-2 py-4 bg-white border-t">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          variant="outline"
        >
          Précédent
        </Button>
        <Button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          variant="outline"
        >
          Suivant
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de {' '}
            <span className="font-medium">
              {((pagination.currentPage - 1) * pagination.perPage) + 1}
            </span>
            {' '} à {' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.perPage, pagination.total)}
            </span>
            {' '} sur {' '}
            <span className="font-medium">{pagination.total}</span>
            {' '} résultats
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Précédent
            </Button>
            {[...Array(pagination.totalPages)].map((_, idx) => (
              <Button
                key={idx + 1}
                variant={pagination.currentPage === idx + 1 ? "default" : "outline"}
                onClick={() => onPageChange(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Suivant
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};

/*

  const ScheduleForm = ({ isOpen, onClose, editingSchedule, employees, onSubmit }) => {
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
        setFormData(editingSchedule);
      }
    }, [editingSchedule]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };
  
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
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={formData.end_date}
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
              />
            </div>
  
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editingSchedule ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
*/


  const DonationForm = ({ isOpen, onClose, editingDonation, onSubmit }) => {
    const [formData, setFormData] = useState({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'don', // don ou subvention
      payment_method: '',
      donor_type: 'individual', // individual, organization, ou group
      donor_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      attachments: []
    });
  
    useEffect(() => {
      if (editingDonation) {
        // Récupérer les informations du premier donateur
        const donor = editingDonation.donors?.[0];
        setFormData({
          ...editingDonation,
          date: format(new Date(editingDonation.date), 'yyyy-MM-dd'),
          // Ajouter les informations du donateur
          donor_type: donor?.type || 'individual',
          donor_name: donor?.name || '',
          contact_person: donor?.contact_person || '',
          email: donor?.email || '',
          phone: donor?.phone || '',
          address: donor?.address || ''
        });
      }
    }, [editingDonation]);


    const handleSubmit = (e) => {
      e.preventDefault();
          
      // Si on est en mode édition, on formate différemment les données
      if (editingDonation) {
        const updateData = {
          amount: formData.amount,
          date: formData.date,
          type: formData.type,
          payment_method: formData.payment_method,
          description: formData.description,
          // Ajouter les informations du donateur
          donors: [{
            id: editingDonation.donors?.[0]?.id, // Important: garder l'ID du donateur existant
            type: formData.donor_type,
            name: formData.donor_name,
            contact_person: formData.contact_person,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }]
        };
    
        onSubmit(updateData);
      } else {
        // Mode création - garder le code existant avec FormData
        const formDataToSend = new FormData();
        
        Object.keys(formData).forEach(key => {
          if (key !== 'attachments') {
            formDataToSend.append(key, formData[key]);
          }
        });
    
        formDataToSend.append('donors', JSON.stringify([{
          type: formData.donor_type,
          name: formData.donor_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          individual_amount: formData.amount
        }]));
    
        if (formData.attachments.length > 0) {
          Array.from(formData.attachments).forEach(file => {
            formDataToSend.append('file', file);
          });
        }
    
        onSubmit(formDataToSend);
      }
    };



  
    
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editingDonation ? 'Modifier le don' : 'Nouveau don'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="don">Don</SelectItem>
                    <SelectItem value="subvention">Subvention</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
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
                <label className="text-sm font-medium">Type de donateur</label>
                <Select
                  value={formData.donor_type}
                  onValueChange={(value) => setFormData({ ...formData, donor_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individuel</SelectItem>
                    <SelectItem value="organization">Organisation</SelectItem>
                    <SelectItem value="group">Groupe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
  
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du donateur</label>
                <Input
                  value={formData.donor_name}
                  onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
  <label className="text-sm font-medium">Téléphone</label>
  <Input
    value={formData.phone}
    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
  />
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">Adresse</label>
  <Input
    value={formData.address}
    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
  />
</div>

  
              {formData.donor_type !== 'individual' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact mail</label>
                  <Input
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
              )}
  
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
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
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
  
            <div className="space-y-2">
              <label className="text-sm font-medium">Pièces jointes</label>
              <Input
                type="file"
                onChange={(e) => setFormData({ ...formData, attachments: e.target.files })}
                multiple
              />
            </div>
  
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {editingDonation ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };



  // Ajout du composant Historique
  const SalaryHistory = ({ employeeId, onClose, salaryHistory, handleExportPayslip }) => {
    console.log("Props received:", { employeeId, salaryHistory });
    const formatPaymentMethod = (method) => {
      const methods = {
        'cash': 'Espèces',
        'bank': 'Virement bancaire',
        'mobile': 'Mobile Money'
      };
      return methods[method] || method;
    };
    
    if (!salaryHistory || !employeeId) {
      return null;
    }
  
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-[900px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Historique des salaires</DialogTitle>
          </DialogHeader>
  
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Heures</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date paiement</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryHistory.map((salary) => ( 
                  <TableRow key={salary.id}>
                    <TableCell>
                      {format(new Date(salary.month), 'MMMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>{salary.base_salary.toLocaleString()} FCFA</TableCell>
                    <TableCell>{salary.hours_worked || "—"}</TableCell>
                    <TableCell>{salary.total_amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      {salary.payment_date ? 
                        format(new Date(salary.payment_date), 'dd/MM/yyyy') : 
                        '—'
                      }
                    </TableCell>
                    <TableCell>{formatPaymentMethod(salary.payment_method) || '—'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPayslip(salary.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
  
          <DialogFooter>
            <Button onClick={onClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const MissingEmployeesModal = ({ isOpen, onClose, month, year, onGenerate }) => {
    const [missingEmployees, setMissingEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
      if (isOpen) {
        fetchMissingEmployees();
      }
    }, [isOpen, month, year]);
    
    const fetchMissingEmployees = async () => {
      try {
        setLoading(true);
        const response = await api.get('/salaries/missing-employees', {
          params: { month, year }
        });
        
        if (response.data.success) {
          setMissingEmployees(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les employés sans salaire",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    const handleSelectAll = (checked) => {
      if (checked) {
        setSelectedEmployees(missingEmployees.map(emp => emp.id));
      } else {
        setSelectedEmployees([]);
      }
    };
    
    const handleSelectEmployee = (checked, empId) => {
      if (checked) {
        setSelectedEmployees(prev => [...prev, empId]);
      } else {
        setSelectedEmployees(prev => prev.filter(id => id !== empId));
      }
    };
    
    const handleGenerate = async () => {
      if (selectedEmployees.length === 0) {
        toast({
          title: "Avertissement",
          description: "Veuillez sélectionner au moins un employé",
          variant: "warning"
        });
        return;
      }
      
      try {
        const response = await api.post('/salaries/generate', {
          month,
          year,
          employee_ids: selectedEmployees
        });
        
        if (response.data.success) {
          toast({
            title: "Succès",
            description: `${response.data.data.generated.length} salaires générés avec succès`
          });
          onGenerate();
          onClose();
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de générer les salaires",
          variant: "destructive"
        });
      }
    };
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Employés sans salaire - {month}/{year}
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : missingEmployees.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Tous les employés ont un salaire généré pour ce mois.
            </div>
          ) : (
            <>
              <div className="pb-4 border-b flex items-center">
                <Checkbox 
                  checked={selectedEmployees.length === missingEmployees.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                  Sélectionner tous ({missingEmployees.length})
                </label>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Salaire de base</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => handleSelectEmployee(checked, employee.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {employee.first_name} {employee.last_name}
                        </TableCell>
                        <TableCell>{employee.job_title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {employee.type === 'salary' ? 'Salarié' : 'Horaire'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {parseFloat(employee.salary).toLocaleString()} FCFA
                          {employee.type === 'hourly' && '/heure'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={selectedEmployees.length === 0}
                >
                  Générer {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  };


  const ManagementPage = () => {
    // États

    const [selectAll, setSelectAll] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);

    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("employees");
    const [loading, setLoading] = useState(true);
    
    // États des données
    const [employees, setEmployees] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const [donations, setDonations] = useState([]);
    const [donationModal, setDonationModal] = useState({ isOpen: false, editing: null });
    
    const [serviceInfo, setServiceInfo] = useState(null);
    const planningViewRef = useRef(null);

    
    // États des modaux
    const [employeeModal, setEmployeeModal] = useState({ isOpen: false, editing: null });
    const [maintenanceModal, setMaintenanceModal] = useState({ isOpen: false, editing: null });
    const [scheduleModal, setScheduleModal] = useState({ isOpen: false, editing: null });

    // Nouveaux états pour les salaires
const [currentMonthSalaries, setCurrentMonthSalaries] = useState([]);
const [selectedSalaries, setSelectedSalaries] = useState([]);
const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
const [paymentModalData, setPaymentModalData] = useState(null);
const [paymentMethod, setPaymentMethod] = useState('');
const [paymentComments, setPaymentComments] = useState('');
const [salaryStats, setSalaryStats] = useState(null);

const [showHistory, setShowHistory] = useState(false);

const [bulkPaymentModal, setBulkPaymentModal] = useState(false);
const [bulkPaymentData, setBulkPaymentData] = useState({
  payment_method: '',
  comments: ''
});

// États pour la pagination
const [pagination, setPagination] = useState({
  employees: {
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0
  },
  maintenances: {
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0
  },
  schedules: {
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0
  },
  salaries: {
    currentPage: 1, 
    totalPages: 1,
    perPage: 10,
    total: 0
  },
  donations: {
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0
  }
});

const [missingEmployeesModalOpen, setMissingEmployeesModalOpen] = useState(false);

    
    // États des filtres
    const [dateRange, setDateRange] = useState([
      (() => {
        const date = new Date('2024-01-01');  // Date fixe au 1er janvier 2024
        date.setHours(0, 0, 0, 0);
        return date;
      })(),
      (() => {
        const date = new Date();  // Date actuelle pour la fin de la période
        date.setHours(23, 59, 59, 999);
        return date;
      })()
    ]);

    // Fonction pour exporter la fiche de paie
const handleExportPayslip = async (salaryId) => {
  try {
    const response = await api.get(`/salaries/${salaryId}/payslip`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fiche-paie.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible d'exporter la fiche de paie",
      variant: "destructive"
    });
  }
};

// Handler pour le traitement du paiement
const handleProcessPayment = async () => {
  try {
    await api.post(`/salaries/${paymentModalData.id}/pay`, {
      payment_method: paymentMethod,
      comments: paymentComments
    });

    toast({
      title: "Succès",
      description: "Paiement effectué avec succès"
    });

    setPaymentModalData(null);
    setPaymentMethod('');
    setPaymentComments('');
    fetchSalaries();
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Erreur lors du paiement",
      variant: "destructive"
    });
  }
};

const fetchServiceInfo = async () => {
  try {
    // Essayer de récupérer les informations du service
    const response = await api.get('/services/current');
    if (response.data && response.data.success) {
      setServiceInfo(response.data.data);
    } else {
      // Si le service n'existe pas, afficher une notification
      toast({
        title: "Attention",
        description: "Impossible de récupérer les informations du service",
        variant: "warning"
      });
      setServiceInfo(null); // Définir à null au lieu de valeurs par défaut
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations du service:', error);
    toast({
      title: "Erreur",
      description: "Impossible de récupérer les informations du service",
      variant: "destructive"
    });
    setServiceInfo(null); // Définir à null au lieu de valeurs par défaut
  }
};

  
    // Chargement initial des données
    useEffect(() => {
        Promise.all([
          fetchEmployees(),
          fetchMaintenances(),
          fetchSchedules(),
          fetchDonations(),
          fetchServiceInfo()
        ]).finally(() => setLoading(false));
      }, [dateRange[0], dateRange[1]]); // Ajout des dépendances
  
    // Fonctions de récupération des données
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees', {
          params: {
            page: pagination.employees.currentPage,
            per_page: pagination.employees.perPage
          }
        });
        setEmployees(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          employees: {
            ...prev.employees,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les employés",
          variant: "destructive",
        });
      }
    };
    
    const fetchMaintenances = async () => {
      try {
        const response = await api.get('/maintenances', {
          params: {
            start_date: format(dateRange[0], 'yyyy-MM-dd'),
            end_date: format(dateRange[1], 'yyyy-MM-dd'),
            page: pagination.maintenances.currentPage,
            per_page: pagination.maintenances.perPage
          },
        });
        setMaintenances(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          maintenances: {
            ...prev.maintenances,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les maintenances",
          variant: "destructive",
        });
      }
    };
    
    const fetchSchedules = async () => {
      try {
        const response = await api.get('/schedules', {
          params: {
            start_date: format(dateRange[0], 'yyyy-MM-dd'),
            end_date: format(dateRange[1], 'yyyy-MM-dd'),
            page: pagination.schedules.currentPage,
            per_page: pagination.schedules.perPage
          },
        });
        setSchedules(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          schedules: {
            ...prev.schedules,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le planning",
          variant: "destructive",
        });
      }
    };
    
    const fetchSalaries = async () => {
      try {
        const response = await api.get('/salaries', {
          params: {
            month: selectedMonth,
            year: selectedYear,
            page: pagination.salaries.currentPage,
            per_page: pagination.salaries.perPage
          }
        });
        setCurrentMonthSalaries(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          salaries: {
            ...prev.salaries,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les salaires",
          variant: "destructive"
        });
      }
    };

    const fetchSalaryStatistics = async () => {
      try {
        const response = await api.get('/salaries/statistics', {
          params: {
            month: selectedMonth,
            year: selectedYear
          }
        });
        
        if (response.data.success) {
          setSalaryStats(response.data.data);
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les statistiques des salaires",
          variant: "destructive"
        });
      }
    };

// Fonction pour récupérer l'historique
const fetchSalaryHistory = async (employeeId) => {
  try {
    const response = await api.get(`/salaries/history/${employeeId}`);
    if (response.data.success) {
      setSalaryHistory(response.data.data);
      // Aussi important de définir l'employé sélectionné
      setSelectedEmployee({ id: employeeId });
    }
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de récupérer l'historique des salaires",
      variant: "destructive"
    });
  }
};

const handlePageChange = (section, page) => {
  // D'abord mettre à jour l'état
  setPagination(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      currentPage: page
    }
  }));

  // Ensuite, appeler les fonctions de récupération avec la page directement
  switch(section) {
    case 'employees':
      api.get('/employees', {
        params: {
          page: page,
          per_page: pagination.employees.perPage
        }
      }).then(response => {
        setEmployees(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          employees: {
            ...prev.employees,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      }).catch(error => {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les employés",
          variant: "destructive",
        });
      });
      break;
      
    case 'maintenances':
      api.get('/maintenances', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          page: page,
          per_page: pagination.maintenances.perPage
        },
      }).then(response => {
        setMaintenances(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          maintenances: {
            ...prev.maintenances,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      }).catch(error => {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les maintenances",
          variant: "destructive",
        });
      });
      break;
      
    case 'schedules':
      api.get('/schedules', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          page: page,
          per_page: pagination.schedules.perPage
        },
      }).then(response => {
        setSchedules(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          schedules: {
            ...prev.schedules,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      }).catch(error => {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le planning",
          variant: "destructive",
        });
      });
      break;
      
    case 'salaries':
      api.get('/salaries', {
        params: {
          month: selectedMonth,
          year: selectedYear,
          page: page,
          per_page: pagination.salaries.perPage
        }
      }).then(response => {
        setCurrentMonthSalaries(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          salaries: {
            ...prev.salaries,
            totalPages: response.data.meta.total_pages,
            total: response.data.meta.total
          }
        }));
      }).catch(error => {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les salaires",
          variant: "destructive"
        });
      });
      break;
      
    case 'donations':
      api.get('/donations', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          page: page,
          per_page: pagination.donations.perPage
        }
      }).then(response => {
        if (response.data && response.data.data) {
          setDonations(response.data.data);
          setPagination(prev => ({
            ...prev,
            donations: {
              ...prev.donations,
              totalPages: response.data.pagination.totalPages,
              total: response.data.pagination.total
            }
          }));
        }
      }).catch(error => {
        console.error('Erreur lors du chargement des dons:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les dons",
          variant: "destructive"
        });
      });
      break;
  }
};



const handleSelectSalary = (checked, salaryId) => {
  if (checked) {
    setSelectedSalaries(prev => [...prev, salaryId]);
  } else {
    setSelectedSalaries(prev => prev.filter(id => id !== salaryId));
  }
};

// Handler pour les heures des employés horaires
const handleHoursChange = async (salaryId, hours) => {
  try {
    await api.patch(`/salaries/${salaryId}/hours`, { hours });
    fetchSalaries(); // Recharger pour avoir le nouveau montant total
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour les heures",
      variant: "destructive"
    });
  }
};

// Handler pour le paiement des salaires
const handlePaySalaries = async () => {
  if (selectedSalaries.length === 0) {
    toast({
      title: "Erreur",
      description: "Veuillez sélectionner au moins un employé",
      variant: "warning"
    });
    return;
  }

  try {
    await api.post('/salaries/bulk-payment', {
      salary_ids: selectedSalaries,
      payment_method: paymentMethod,
      comments: paymentComments
    });

    toast({
      title: "Succès",
      description: "Paiements effectués avec succès"
    });

    setSelectedSalaries([]);
    setPaymentMethod('');
    setPaymentComments('');
    setPaymentModalData(null);
    fetchSalaries();
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Erreur lors du paiement des salaires",
      variant: "destructive"
    });
  }
};

const handleBulkPayment = async () => {
  try {
    await api.post('/salaries/bulk-payment', {
      salary_ids: selectedSalaries,
      payment_method: bulkPaymentData.payment_method,
      comments: bulkPaymentData.comments
    });

    toast({
      title: "Succès",
      description: `${selectedSalaries.length} salaires ont été payés avec succès`
    });

    // Réinitialisation
    setBulkPaymentModal(false);
    setSelectedSalaries([]);
    setBulkPaymentData({ payment_method: '', comments: '' });
    fetchSalaries(); // Rafraîchir les données
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Erreur lors du paiement des salaires",
      variant: "destructive"
    });
  }
};

// Handler pour la sélection de toutes les lignes
const handleSelectAll = (checked) => {
  setSelectAll(checked);
  if (checked) {
    setSelectedSalaries(currentMonthSalaries.map(s => s.id));
  } else {
    setSelectedSalaries([]);
  }
};

const generateMonthlySalaries = async () => {
  try {
    await api.post('/salaries/generate', {
      month: selectedMonth,
      year: selectedYear
    });
    // Après la génération, on récupère les salaires
    fetchSalaries();
    toast({
      title: "Succès",
      description: "Les salaires ont été générés pour le mois"
    });
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de générer les salaires",
      variant: "destructive"
    });
  }
};



// Effect pour charger les salaires quand le mois/année change
useEffect(() => {
  if (activeTab === 'salaries') {
    fetchSalaries();
    fetchSalaryStatistics();
  }
}, [activeTab, selectedMonth, selectedYear]);

useEffect(() => {
  if (activeTab === 'salaries' && !salaryStats) {
    fetchSalaryStatistics();
  }
}, [activeTab]);
      

    // Handlers pour les employés
  const handleEmployeeSubmit = async (data) => {
    try {
      if (employeeModal.editing) {
        await api.put(`/employees/${employeeModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Employé modifié avec succès"
        });
      } else {
        await api.post('/employees', data);
        toast({
          title: "Succès",
          description: "Employé ajouté avec succès"
        });
      }
      setEmployeeModal({ isOpen: false, editing: null });
      fetchEmployees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Handlers pour les maintenances
  const handleMaintenanceSubmit = async (data) => {
    try {
      if (maintenanceModal.editing) {
        await api.put(`/maintenances/${maintenanceModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Maintenance modifiée avec succès"
        });
      } else {
        await api.post('/maintenances', data);
        toast({
          title: "Succès",
          description: "Maintenance ajoutée avec succès"
        });
      }
      setMaintenanceModal({ isOpen: false, editing: null });
      fetchMaintenances();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Handlers pour le planning
  const handleScheduleSubmit = async (data) => {
    try {
      if (scheduleModal.editing) {
        await api.put(`/schedules/${scheduleModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Planning modifié avec succès"
        });
      } else {
        await api.post('/schedules', data);
        toast({
          title: "Succès",
          description: "Événement ajouté au planning avec succès"
        });
      }
      setScheduleModal({ isOpen: false, editing: null });
      fetchSchedules();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Helper pour le statut des employés
  const handleToggleEmployeeStatus = async (employeeId) => {
    try {
      await api.patch(`/employees/${employeeId}/toggle-status`);
      fetchEmployees();
      toast({
        title: "Succès",
        description: "Statut de l'employé modifié avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const handleToggleMaintenanceStatus = async (maintenanceId) => {
    try {
      const response = await api.patch(`/maintenances/${maintenanceId}/toggle-status`);
      
      // Mise à jour de l'état local
      setMaintenances(prevMaintenances => 
        prevMaintenances.map(maintenance => 
          maintenance.id === maintenanceId 
            ? { ...maintenance, status: maintenance.status === 'done' ? 'pending' : 'done' }
            : maintenance
        )
      );
  
      toast({
        title: "Succès",
        description: "Statut de la maintenance modifié avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleScheduleStatus = async (scheduleId) => {
    try {
      await api.patch(`/schedules/${scheduleId}/toggle-status`);
      fetchSchedules();
      toast({
        title: "Succès",
        description: "Statut du planning modifié avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  // Fonctions de gestion des dons
  const fetchDonations = async () => {
    try {
      const response = await api.get('/donations', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          page: pagination.donations.currentPage,
          per_page: pagination.donations.perPage
        }
      });
  
      if (response.data && response.data.data) {
        setDonations(response.data.data);
        setPagination(prev => ({
          ...prev,
          donations: {
            ...prev.donations,
            totalPages: response.data.pagination.totalPages,
            total: response.data.pagination.total
          }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dons:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les dons",
        variant: "destructive"
      });
    }
  };

const handleDonationSubmit = async (formData) => {
  try {
    if (donationModal.editing) {
      await api.put(`/donations/${donationModal.editing.id}`, formData);
      toast({
        title: "Succès",
        description: "Don modifié avec succès"
      });
    } else {
      await api.post('/donations', formData);
      toast({
        title: "Succès",
        description: "Don ajouté avec succès"
      });
    }
    setDonationModal({ isOpen: false, editing: null });
    fetchDonations();
  } catch (error) {
    toast({
      title: "Erreur",
      description: error.response?.data?.message || "Une erreur est survenue",
      variant: "destructive"
    });
  }
};

const handleReceiveDonation = async (id) => {
  try {
    await api.patch(`/donations/${id}/receive`);
    toast({
      title: "Succès",
      description: "Don marqué comme reçu"
    });
    fetchDonations();
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de marquer le don comme reçu",
      variant: "destructive"
    });
  }
};
const handleDownloadAttachment = async (attachment) => {
  try {
    const response = await api.get(`/donations/attachments/${attachment.id}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.file_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Succès",
      description: "Pièce jointe téléchargée avec succès"
    });
  } catch (error) {
    console.error('Erreur de téléchargement:', error);
    toast({
      title: "Erreur",
      description: "Impossible de télécharger la pièce jointe",
      variant: "destructive"
    });
  }
};

const handleDeleteDonation = async (id) => {
  
  
  try {
    await api.delete(`/donations/${id}`);
    toast({
      title: "Succès",
      description: "Don supprimé avec succès"
    });
    fetchDonations(); // Rafraîchir la liste
  } catch (error) {
    toast({
      title: "Erreur",
      description: error.response?.data?.message || "Impossible de supprimer le don",
      variant: "destructive"
    });
  }
};

const handleDownloadMaintenance = async (maintenanceId) => {
  try {
    const response = await api.get(`/maintenances/${maintenanceId}/pdf`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `maintenance-${maintenanceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Succès",
      description: "Fiche de maintenance téléchargée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la fiche de maintenance:', error);
    toast({
      title: "Erreur",
      description: "Impossible de télécharger la fiche de maintenance",
      variant: "destructive"
    });
  }
};





  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion</h1>
        <div className="flex items-center gap-4">
          {/* Sélecteur de dates */}
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={dateRange[0] instanceof Date ? format(dateRange[0], 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange([
                  e.target.value ? new Date(e.target.value) : null,
                  dateRange[1]
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={dateRange[1] instanceof Date ? format(dateRange[1], 'yyyy-MM-dd') : ''}
                onChange={(e) => setDateRange([
                  dateRange[0],
                  e.target.value ? new Date(e.target.value) : null
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Boutons d'ajout selon l'onglet actif */}
          {activeTab === 'employees' && (
            <Button onClick={() => setEmployeeModal({ isOpen: true, editing: null })}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter un employé
            </Button>
          )}
          {activeTab === 'maintenance' && (
            <Button onClick={() => setMaintenanceModal({ isOpen: true, editing: null })}>
              <Plus className="w-4 h-4 mr-2" /> Nouvelle maintenance
            </Button>
          )}
          {activeTab === 'schedule' && (
            <Button onClick={() => setScheduleModal({ isOpen: true, editing: null })}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter au planning
            </Button>
          )},
          {activeTab === 'donations' && (
  <Button onClick={() => setDonationModal({ isOpen: true, editing: null })}>
    <Plus className="w-4 h-4 mr-2" /> Nouveau don
  </Button>
)}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>

          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Personnel ({employees.length})
          </TabsTrigger>

          <TabsTrigger value="maintenance">
            <Wrench className="w-4 h-4 mr-2" />
            Maintenances ({maintenances.length}) 
          </TabsTrigger>

          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Planning ({schedules.length})
          </TabsTrigger>

          <TabsTrigger value="donations">
           <GiftIcon className="w-4 h-4 mr-2" />
           Dons ({donations.length})
          </TabsTrigger>

          <TabsTrigger value="loans">
  <CreditCard className="w-4 h-4 mr-2" />
  Emprunts
</TabsTrigger>



          <TabsTrigger value="salaries">
           <DollarSign className="w-4 h-4 mr-2" />
            Salaires
          </TabsTrigger>

        </TabsList>

        {/* Contenu des onglets */}

        <TabsContent value="employees">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rémunération</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
  {Array.isArray(employees) && employees.length > 0 ? (
    employees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell className="font-medium">
          {employee.first_name} {employee.last_name}
        </TableCell>
        <TableCell>{employee.job_title}</TableCell>
        <TableCell>
          <Badge variant="outline">
            {employee.type === 'salary' ? 'Salarié' : 'Horaire'}
          </Badge>
        </TableCell>
        <TableCell>{employee.phone_number}</TableCell>
        <TableCell>
          {parseFloat(employee.salary).toLocaleString()} FCFA
          {employee.type === 'hourly' && '/heure'}
        </TableCell>
        <TableCell>
          <Badge variant={employee.status === 'active' ? 'success' : 'secondary'}>
            {employee.status === 'active' ? 'Actif' : 'Inactif'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEmployeeModal({ isOpen: true, editing: employee })}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleToggleEmployeeStatus(employee.id)}
            >
              {employee.status === 'active' ? <XCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} className="text-center">
        Aucun employé trouvé.
      </TableCell>
    </TableRow>
  )}
</TableBody>


          </Table>
          <Pagination 
      pagination={pagination.employees}
      onPageChange={(page) => handlePageChange('employees', page)}
    />


        </Card>
        </TabsContent>

        <TabsContent value="maintenance">
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Équipement</TableHead>
          <TableHead>Problème</TableHead>
          <TableHead>Employé assigné</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.isArray(maintenances) && maintenances.length > 0 ? (
          maintenances.map((maintenance) => (
            <TableRow key={maintenance.id}>
              <TableCell>{format(new Date(maintenance.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <Badge variant={
                  maintenance.type === 'preventive' ? 'success' : 'default'
                }>
                  {maintenance.type === 'preventive' ? 'Préventif' : 'Curatif'}
                </Badge>
              </TableCell>
              <TableCell>{maintenance.equipment || "—"}</TableCell>
              <TableCell>{maintenance.problem_description || maintenance.description}</TableCell>
              <TableCell>
                {maintenance.employee?.first_name} {maintenance.employee?.last_name}
              </TableCell>
              <TableCell>
                <Badge variant={maintenance.status === 'done' ? 'success' : 'warning'}>
                  {maintenance.status === 'done' ? 'Terminé' : 'En cours'}
                </Badge>
              </TableCell>

              <TableCell>
  <div className="flex space-x-2">
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => setMaintenanceModal({ isOpen: true, editing: maintenance })}
      disabled={maintenance.status === 'done'} // Désactiver le bouton d'édition si validée
    >
      <Pencil className="h-4 w-4" />
    </Button>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleToggleMaintenanceStatus(maintenance.id)}
      disabled={maintenance.status === 'done'} // Désactiver le bouton de changement de statut si validée
    >
      {maintenance.status === 'done' ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
    </Button>
    
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleDownloadMaintenance(maintenance.id)}
      disabled={maintenance.status !== 'done'} // Activer uniquement si la maintenance est validée
    >
      <Download className="h-4 w-4" />
    </Button>
  </div>
</TableCell>

            
              


            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              Aucune maintenance trouvée.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>

    <Pagination 
      pagination={pagination.maintenances}
      onPageChange={(page) => handlePageChange('maintenances', page)}
    />
  </Card>
</TabsContent>

<TabsContent value="schedule">
  <Card>
   
    {/* Vue calendrier améliorée - intégration du nouveau composant */}
    <div className="p-4">
      <PlanningCalendarView
    ref={planningViewRef}
    schedules={schedules}
    employees={employees.filter(e => e.status === 'active')}
    onExportPDF={async () => {
      try {
        // Maintenant vous pouvez accéder aux filtres via la référence
        const currentFilters = planningViewRef.current?.filters || { employeeId: 'all', type: 'all', status: 'all' };
        
        const response = await api.get('/schedules/export-pdf', {
          params: {
            start_date: format(dateRange[0], 'yyyy-MM-dd'),
            end_date: format(dateRange[1], 'yyyy-MM-dd'),
            employee_id: currentFilters.employeeId !== 'all' ? currentFilters.employeeId : '',
            type: currentFilters.type !== 'all' ? currentFilters.type : '',
            status: currentFilters.status !== 'all' ? currentFilters.status : ''
          },
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `planning_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast({
          title: "Succès",
          description: "PDF généré avec succès"
        });
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        toast({
          title: "Erreur",
          description: "Impossible de générer le PDF",
          variant: "destructive"
        });
      }
    }}
    onEditSchedule={(schedule) => setScheduleModal({ isOpen: true, editing: schedule })}
    onToggleStatus={handleToggleScheduleStatus}
  />
      
      
    </div>
  </Card>

  {/* Conservez votre modal de formulaire existant */}
  <ScheduleForm
    isOpen={scheduleModal.isOpen}
    onClose={() => setScheduleModal({ isOpen: false, editing: null })}
    editingSchedule={scheduleModal.editing}
    employees={employees.filter(e => e.status === 'active')}
    onSubmit={handleScheduleSubmit}
  />
</TabsContent>
       

      

        <TabsContent value="salaries">
        <SalaryStatistics statistics={salaryStats} />
  <Card>
    {/* En-tête avec filtres */}
    <div className="p-4 border-b flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Select 
          value={selectedMonth.toString()} 
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: 1, label: "Janvier" },
              { value: 2, label: "Février" },
              { value: 3, label: "Mars" },
              { value: 4, label: "Avril" },
              { value: 5, label: "Mai" },
              { value: 6, label: "Juin" },
              { value: 7, label: "Juillet" },
              { value: 8, label: "Août" },
              { value: 9, label: "Septembre" },
              { value: 10, label: "Octobre" },
              { value: 11, label: "Novembre" },
              { value: 12, label: "Décembre" }
            ].map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025].map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        {/* Nouveau bouton pour gérer les employés sans salaire */}
        <Button 
          variant="outline"
          onClick={() => setMissingEmployeesModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter salaires manquants
        </Button>
        
        {/* Bouton existant pour le paiement groupé */}
        <Button 
          onClick={() => setBulkPaymentModal(true)}
          disabled={selectedSalaries.length === 0}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Payer les salaires ({selectedSalaries.length})
        </Button>
      </div>

    </div>

    {/* Contenu conditionnel : message ou tableau */}
    {currentMonthSalaries.length === 0 ? (
      <div className="text-center p-8">
        <p className="text-gray-500 mb-4">Aucun salaire généré pour ce mois</p>
        <Button onClick={generateMonthlySalaries}>
          Générer les salaires
        </Button>
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Employé</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Base</TableHead>
            <TableHead>Heures</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentMonthSalaries.map((salary) => (
            <TableRow key={salary.employee_id}>
              <TableCell>
                <Checkbox
                  checked={selectedSalaries.includes(salary.id)}
                  onCheckedChange={(checked) => handleSelectSalary(checked, salary.id)}
                />
              </TableCell>
              <TableCell>{salary.employee.first_name} {salary.employee.last_name}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {salary.employee.type === 'salary' ? 'Salarié' : 'Horaire'}
                </Badge>
              </TableCell>
              <TableCell>{salary.base_salary.toLocaleString()} FCFA</TableCell>
              <TableCell>
                {salary.employee.type === 'hourly' ? (
                  <Input
                    type="number"
                    value={salary.hours_worked || ''}
                    onChange={(e) => handleHoursChange(salary.id, e.target.value)}
                    className="w-20"
                    disabled={salary.status === 'paid'}
                  />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="font-medium">
                {salary.total_amount.toLocaleString()} FCFA
              </TableCell>
              <TableCell>
                <Badge variant={salary.status === 'paid' ? 'success' : 'warning'}>
                  {salary.status === 'paid' ? 'Payé' : 'En attente'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentModalData(salary)}
                    disabled={salary.status === 'paid'}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchSalaryHistory(salary.employee_id);
                      setShowHistory(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        
      </Table>
    )}
    <Pagination 
      pagination={pagination.salaries}
      onPageChange={(page) => handlePageChange('salaries', page)}
    />
    
  </Card>

  <MissingEmployeesModal
    isOpen={missingEmployeesModalOpen}
    onClose={() => setMissingEmployeesModalOpen(false)}
    month={selectedMonth}
    year={selectedYear}
    onGenerate={fetchSalaries} // Pour rafraîchir la liste après génération
  />
  


        </TabsContent>


        <TabsContent value="donations">
  <Card>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Donateur</TableHead>
          <TableHead>Montant (FCFA)</TableHead>
          <TableHead>Mode de paiement</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {donations.map((donation) => (
          <TableRow key={donation.id}>
            <TableCell>
              {format(new Date(donation.date), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {donation.type === 'don' ? 'Don' : 'Subvention'}
              </Badge>
            </TableCell>
            <TableCell>
            <div className="space-y-1">
                <p className="font-medium">{donation.donors[0].name}</p>
                {donation.donors[0].contact_person && (
                  <p className="text-sm text-gray-500">Contact: {donation.donors[0].contact_person}</p>
                )}
                {donation.donors[0].phone && (
                  <p className="text-sm text-gray-500">Tél: {donation.donors[0].phone}</p>
                )}
                {donation.donors[0].address && (
                  <p className="text-sm text-gray-500">Adresse: {donation.donors[0].address}</p>
                )}
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {parseFloat(donation.amount).toLocaleString()}
            </TableCell>
            <TableCell>
              {donation.payment_method === 'cash' ? 'Espèces' :
               donation.payment_method === 'bank' ? 'Virement' :
               donation.payment_method === 'cheque' ? 'Chèque' : '—'}
            </TableCell>
            <TableCell>
              <Badge variant={
                donation.status === 'received' ? 'success' :
                donation.status === 'cancelled' ? 'destructive' :
                'warning'
              }>
                {donation.status === 'received' ? 'Reçu' :
                 donation.status === 'cancelled' ? 'Annulé' :
                 'En attente'}
              </Badge>
            </TableCell>

            <TableCell>
  <div className="flex space-x-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setDonationModal({ isOpen: true, editing: donation })}
      disabled={donation.status === 'received'}
    >
      <Pencil className="h-4 w-4" />
    </Button>
    {donation.attachments?.length > 0 && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownloadAttachment(donation.attachments[0])}
      >
        <Download className="h-4 w-4" />
      </Button>
    )}
    {donation.status === 'pending' && (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReceiveDonation(donation.id)}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteDonation(donation.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </>
    )}
    
  </div>
</TableCell>
            
           
           


          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Pagination 
      pagination={pagination.donations}
      onPageChange={(page) => handlePageChange('donations', page)}
    />
  </Card>
</TabsContent>

<TabsContent value="loans">
  <Suspense fallback={
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  }>
    <LoansPage />
  </Suspense>
</TabsContent>





<Dialog open={bulkPaymentModal} onOpenChange={() => setBulkPaymentModal(false)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Paiement groupé des salaires</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Employés sélectionnés</p>
        <p className="text-gray-600">{selectedSalaries.length} employés</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mode de paiement</label>
        <Select
          value={bulkPaymentData.payment_method}
          onValueChange={(value) => 
            setBulkPaymentData({...bulkPaymentData, payment_method: value})
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Espèces</SelectItem>
            <SelectItem value="bank">Virement bancaire</SelectItem>
            <SelectItem value="mobile">Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Commentaires</label>
        <Input
          value={bulkPaymentData.comments}
          onChange={(e) => 
            setBulkPaymentData({...bulkPaymentData, comments: e.target.value})
          }
          placeholder="Commentaires optionnels..."
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setBulkPaymentModal(false)}>
        Annuler
      </Button>
      <Button 
        onClick={() => handleBulkPayment()}
        disabled={!bulkPaymentData.payment_method || selectedSalaries.length === 0}
      >
        Confirmer le paiement
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Modal de paiement */}
<Dialog open={!!paymentModalData} onOpenChange={() => setPaymentModalData(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Paiement de salaire</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Employé</p>
        <p>{paymentModalData?.employee.first_name} {paymentModalData?.employee.last_name}</p>
      </div>

      <div>
        <p className="text-sm font-medium">Montant</p>
        <p className="text-xl font-bold">{paymentModalData?.total_amount.toLocaleString()} FCFA</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mode de paiement</label>
        <Select
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Espèces</SelectItem>
            <SelectItem value="bank">Virement bancaire</SelectItem>
            <SelectItem value="mobile">Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Commentaires</label>
        <Input
          value={paymentComments}
          onChange={(e) => setPaymentComments(e.target.value)}
          placeholder="Commentaires optionnels..."
        />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setPaymentModalData(null)}>
        Annuler
      </Button>
      <Button onClick={handleProcessPayment}>
        Confirmer le paiement
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      </Tabs>

      {/* Modaux */}
      <EmployeeForm 
        isOpen={employeeModal.isOpen}
        onClose={() => setEmployeeModal({ isOpen: false, editing: null })}
        editingEmployee={employeeModal.editing}
        onSubmit={handleEmployeeSubmit}
      />

      <MaintenanceForm
        isOpen={maintenanceModal.isOpen}
        onClose={() => setMaintenanceModal({ isOpen: false, editing: null })}
        editingMaintenance={maintenanceModal.editing}
        employees={employees.filter(e => e.status === 'active')}
        onSubmit={handleMaintenanceSubmit}
      />

      <ScheduleForm
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, editing: null })}
        editingSchedule={scheduleModal.editing}
        employees={employees.filter(e => e.status === 'active')}
        onSubmit={handleScheduleSubmit}
      />

<DonationForm
  isOpen={donationModal.isOpen}
  onClose={() => setDonationModal({ isOpen: false, editing: null })}
  editingDonation={donationModal.editing}
  onSubmit={handleDonationSubmit}
/>





{showHistory && (
  <SalaryHistory
    employeeId={selectedEmployee?.id}
    salaryHistory={salaryHistory}
    handleExportPayslip={handleExportPayslip}
    onClose={() => {
      setShowHistory(false);
      setSalaryHistory([]);
      setSelectedEmployee(null);
    }}
  />
)}

      
    </div>
  );
};


export default ManagementPage;