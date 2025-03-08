import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
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
import { useToast } from "../ui/toast/use-toast";
import { 
  FileText, 
  Scissors, 
  AlertTriangle, 
  Filter, 
  Download,
  Check,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';

// Composant pour afficher l'onglet des bons de coupure
const DisconnectionTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consumers, setConsumers] = useState([]);
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [executeModal, setExecuteModal] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [employees, setEmployees] = useState([]);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    min_invoices: 2,
    min_amount: 0,
  });
  
  // Fonction pour obtenir les consommateurs avec factures impayées
  const fetchConsumersWithUnpaidInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/consumers/with-unpaid-invoices', {
        params: {
          min_invoices: filters.min_invoices,
          min_amount: filters.min_amount
        }
      });
      setConsumers(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les consommateurs avec des factures impayées"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Fonction pour obtenir les employés pour le formulaire d'exécution
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
    }
  };

  useEffect(() => {
    fetchConsumersWithUnpaidInvoices();
    fetchEmployees();
  }, [fetchConsumersWithUnpaidInvoices]);

  // Fonction pour générer un bon de coupure
  const handleGenerateDisconnection = async (consumerId) => {
    try {
      await api.post(`/consumers/${consumerId}/disconnection-notice`);
      toast({
        title: "Succès",
        description: "Bon de coupure généré avec succès"
      });
      fetchConsumersWithUnpaidInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de générer le bon de coupure"
      });
    }
  };

  // Fonction pour marquer un bon de coupure comme exécuté
  const handleExecuteDisconnection = async () => {
    try {
      if (!selectedConsumer) return;
      
      await api.patch(`/consumers/${selectedConsumer.id}/disconnection-notice/execute`, {
        // Si employeeId est 'none', envoyez null ou undefined à la place
        employee_id: employeeId === 'none' ? null : employeeId,
        notes: notes || undefined
      });
      
      toast({
        title: "Succès",
        description: "Bon de coupure marqué comme exécuté"
      });
      
      setExecuteModal(false);
      setEmployeeId(''); // Réinitialiser à une chaîne vide est OK pour l'état, mais pas pour la valeur du SelectItem
      setNotes('');
      fetchConsumersWithUnpaidInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut"
      });
    }
  };

  // Fonction pour télécharger un PDF de bon de coupure
  const handleDownloadPDF = async (consumerId) => {
    try {
      const response = await api.get(`/consumers/${consumerId}/disconnection-notice/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bon-coupure-${consumerId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le PDF"
      });
    }
  };

  // Fonction pour afficher les détails des factures impayées
  const handleViewDetails = (consumer) => {
    setSelectedConsumer(consumer);
    setViewDetailModal(true);
  };

  // Fonction pour ouvrir le modal d'exécution
  const handleOpenExecuteModal = (consumer) => {
    setSelectedConsumer(consumer);
    setExecuteModal(true);
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
    fetchConsumersWithUnpaidInvoices();
  };

  // Statut du bon de coupure
  const getDisconnectionStatus = (consumer) => {
    if (!consumer.disconnection_notice) {
      return { label: "À générer", variant: "warning" };
    } else if (consumer.disconnection_notice.executed) {
      return { label: "Exécuté", variant: "destructive" };
    } else {
      return { label: "Généré", variant: "default" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Section filtres */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre min. de factures</label>
            <Input
              type="number"
              value={filters.min_invoices}
              onChange={(e) => setFilters({ ...filters, min_invoices: e.target.value })}
              className="w-[150px]"
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant min. (FCFA)</label>
            <Input
              type="number"
              value={filters.min_amount}
              onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
              className="w-[150px]"
              min="0"
            />
          </div>
          
          <Button onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </Card>

      {/* Tableau des consommateurs */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Consommateur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Factures impayées</TableHead>
              <TableHead>Montant total</TableHead>
              <TableHead>Plus ancienne facture</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : consumers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Aucun consommateur éligible à la coupure
                </TableCell>
              </TableRow>
            ) : (
              consumers.map((consumer) => {
                const status = getDisconnectionStatus(consumer);
                return (
                  <TableRow key={consumer.id}>
                    <TableCell>
                      <div className="font-medium">{consumer.first_name} {consumer.last_name}</div>
                      <div className="text-sm text-gray-500">{consumer.name}</div>
                    </TableCell>
                    <TableCell>{consumer.phone_number}</TableCell>
                    <TableCell>{consumer.unpaid_invoices_count}</TableCell>
                    <TableCell>{Number(consumer.total_unpaid_amount).toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      {consumer.oldest_unpaid_invoice ? 
                        format(new Date(consumer.oldest_unpaid_invoice.due_date), 'dd/MM/yyyy') : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!consumer.disconnection_notice && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGenerateDisconnection(consumer.id)}
                          >
                            <Scissors className="h-4 w-4 mr-1" />
                            Générer
                          </Button>
                        )}
                        
                        {consumer.disconnection_notice && !consumer.disconnection_notice.executed && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenExecuteModal(consumer)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Exécuter
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(consumer.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </>
                        )}
                        
                        {consumer.disconnection_notice && consumer.disconnection_notice.executed && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(consumer.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(consumer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal détails des factures impayées */}
      <Dialog open={viewDetailModal} onOpenChange={setViewDetailModal}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Détails des factures impayées - {selectedConsumer?.first_name} {selectedConsumer?.last_name}
            </DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Retard</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedConsumer?.unpaid_invoices?.map(invoice => {
                const dueDate = new Date(invoice.due_date);
                const today = new Date();
                const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.start_date), 'dd/MM/yyyy')} - {format(new Date(invoice.end_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{Number(invoice.amount_due).toLocaleString()} FCFA</TableCell>
                    <TableCell>{format(dueDate, 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={daysDiff > 30 ? "destructive" : "warning"}>
                        {daysDiff} jours
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex justify-between mt-4">
            <div>
              <span className="text-sm text-gray-500">Total dû:</span>
              <span className="ml-2 font-bold">{Number(selectedConsumer?.total_unpaid_amount).toLocaleString()} FCFA</span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Factures impayées:</span>
              <span className="ml-2 font-bold">{selectedConsumer?.unpaid_invoices_count}</span>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setViewDetailModal(false)}
            >
              Fermer
            </Button>
            {selectedConsumer && !selectedConsumer.disconnection_notice && (
              <Button
                onClick={() => {
                  setViewDetailModal(false);
                  handleGenerateDisconnection(selectedConsumer.id);
                }}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Générer un bon de coupure
              </Button>
            )}
            {selectedConsumer && selectedConsumer.disconnection_notice && (
              <Button
                onClick={() => {
                  setViewDetailModal(false);
                  handleDownloadPDF(selectedConsumer.id);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour exécuter un bon de coupure */}
      <Dialog open={executeModal} onOpenChange={setExecuteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exécuter le bon de coupure</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employé ayant effectué la coupure</label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="none">Non spécifié</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} ({employee.job_title})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes concernant l'exécution"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExecuteModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleExecuteDisconnection}>
              <Check className="h-4 w-4 mr-2" />
              Confirmer l'exécution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisconnectionTab;