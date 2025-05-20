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
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  FileDown
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';

// Composant pour afficher l'onglet des bons de coupure
const DisconnectionTab = () => {
  const { toast } = useToast();
  
  // État de chargement et gestion des erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [consumers, setConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // États pour les modals
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [executeModal, setExecuteModal] = useState(false);
  
  // États pour le formulaire d'exécution
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [applyPenalty, setApplyPenalty] = useState(false);
  

  const [generateModal, setGenerateModal] = useState(false); 
  const [penaltyAmount, setPenaltyAmount] = useState('');
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    min_invoices: 2,
    min_amount: 0,
    search: ''
  });
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // Débounce pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Effet pour le debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Effet pour appliquer la recherche
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: debouncedSearch
      }));
      // Revenir à la première page lors d'une nouvelle recherche
      setPagination(prev => ({
        ...prev,
        page: 1
      }));
    }
  }, [debouncedSearch]);
  
  // Fonction pour obtenir les consommateurs avec factures impayées (avec pagination)
  const fetchConsumersWithUnpaidInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/consumers/with-unpaid-invoices', {
        params: {
          min_invoices: filters.min_invoices,
          min_amount: filters.min_amount,
          search: filters.search,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setConsumers(response.data.data || []);
      
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      setError(error.response?.data?.message || "Impossible de récupérer les données");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les consommateurs avec des factures impayées"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  // Fonction pour obtenir les détails d'un consommateur spécifique
  const fetchConsumerDetails = async (consumerId) => {
    try {
      const response = await api.get(`/consumers/${consumerId}/unpaid-details`);
      return response.data.data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les détails du consommateur"
      });
      return null;
    }
  };

  // Fonction pour obtenir les employés pour le formulaire d'exécution
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchConsumersWithUnpaidInvoices();
    fetchEmployees();
  }, [fetchConsumersWithUnpaidInvoices]);

  // Fonction pour générer un bon de coupure
 const handleGenerateDisconnection = async () => {
  try {
    if (!selectedConsumer) return;
    
    await api.post(`/consumers/${selectedConsumer.id}/disconnection-notice`, {
      penalty_amount: penaltyAmount || null
    });
    
    toast({
      title: "Succès",
      description: "Bon de coupure généré avec succès"
    });
    
    setGenerateModal(false);
    setPenaltyAmount('');
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
      employee_id: employeeId === 'none' ? null : employeeId,
      notes: notes || undefined
      // Plus de penalty_amount ici
    });
    
    toast({
      title: "Succès",
      description: "Bon de coupure marqué comme exécuté"
    });
    
    setExecuteModal(false);
    setEmployeeId('');
    setNotes('');
    fetchConsumersWithUnpaidInvoices();
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Impossible de mettre à jour le statut"
    });
  }
};

  // Fonction pour télécharger un PDF de bon de coupure individuel
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

  // Fonction pour télécharger le PDF récapitulatif
  const handleDownloadSummaryPDF = async () => {
    try {
      const response = await api.get('/disconnection-notices/summary-pdf', {
        params: {
          min_invoices: filters.min_invoices,
          min_amount: filters.min_amount
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `rapport-avis-coupure-${today}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Succès",
        description: "Téléchargement du rapport PDF en cours"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le rapport PDF"
      });
    }
  };

  // Fonction pour afficher les détails des factures impayées
  const handleViewDetails = async (consumer) => {
    // Si nous avons déjà toutes les informations détaillées
    if (consumer.unpaid_invoices) {
      setSelectedConsumer(consumer);
      setViewDetailModal(true);
      return;
    }
    
    // Sinon, récupérer les détails complets
    const details = await fetchConsumerDetails(consumer.id);
    if (details) {
      setSelectedConsumer(details);
      setViewDetailModal(true);
    }
  };

  const openGenerateModal = (consumer) => {
  setSelectedConsumer(consumer);
  setPenaltyAmount('');
  setGenerateModal(true);
};



  // Fonction pour ouvrir le modal d'exécution
  const handleOpenExecuteModal = (consumer) => {
    setSelectedConsumer(consumer);
    setExecuteModal(true);
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
    // Réinitialiser la pagination à la première page
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    fetchConsumersWithUnpaidInvoices();
  };

  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
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

  // Afficher un message d'erreur si nécessaire
  if (error && !loading && consumers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchConsumersWithUnpaidInvoices}>
          Réessayer
        </Button>
      </div>
    );
  }

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
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[220px]"
            />
          </div>
          
          <Button onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadSummaryPDF}
            disabled={consumers.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Télécharger rapport
          </Button>
        </div>
      </Card>

      {/* Tableau des consommateurs */}
      <Card>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
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
            {consumers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {loading ? "Chargement des données..." : "Aucun consommateur éligible à la coupure"}
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
                    <TableCell>
                      {(() => {
                        const invoicesTotal = Number(consumer.total_unpaid_amount);
                        const penaltyAmount = Number(consumer.disconnection_notice?.penalty_amount || 0);
                        const grandTotal = invoicesTotal + penaltyAmount;
                        
                        return (
                          <>
                            {grandTotal.toLocaleString()} FCFA
                            {penaltyAmount > 0 && (
                              <Badge variant="outline" className="ml-2">
                                +{penaltyAmount.toLocaleString()} pénalité
                              </Badge>
                            )}
                          </>
                        );
                      })()}
                    </TableCell>
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
    onClick={() => openGenerateModal(consumer)}
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
        
        {/* Pagination */}
        {consumers.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Affichage de {pagination.totalItems ? (pagination.page - 1) * pagination.limit + 1 : 0} à {Math.min(pagination.page * pagination.limit, pagination.totalItems)} sur {pagination.totalItems} consommateurs
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Page {pagination.page} sur {pagination.totalPages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Select 
                value={pagination.limit.toString()} 
                onValueChange={(value) => {
                  setPagination(prev => ({
                    ...prev,
                    page: 1,
                    limit: parseInt(value)
                  }));
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Lignes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 lignes</SelectItem>
                  <SelectItem value="25">25 lignes</SelectItem>
                  <SelectItem value="50">50 lignes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
              <span className="ml-2 font-bold">
                {(
                  Number(selectedConsumer?.total_unpaid_amount || 0) + 
                  Number(selectedConsumer?.disconnection_notice?.penalty_amount || 0)
                ).toLocaleString()} FCFA
              </span>
              {selectedConsumer?.disconnection_notice?.penalty_amount > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  (inclut une pénalité de {Number(selectedConsumer.disconnection_notice.penalty_amount).toLocaleString()} FCFA)
                </span>
              )}
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
      openGenerateModal(selectedConsumer);
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

    
     
{/* Modal pour exécuter un bon de coupure - Section pénalité supprimée */}
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

{/* Modal pour générer un bon de coupure avec pénalité */}
<Dialog open={generateModal} onOpenChange={setGenerateModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Générer un bon de coupure</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      {selectedConsumer && (
        <div className="mb-4">
          <h3 className="font-medium">Consommateur: {selectedConsumer.first_name} {selectedConsumer.last_name}</h3>
          <p className="text-sm text-gray-500">Factures impayées: {selectedConsumer.unpaid_invoices_count}</p>
          <p className="text-sm text-gray-500">Montant total: {Number(selectedConsumer.total_unpaid_amount).toLocaleString()} FCFA</p>
        </div>
      )}
      
      {/* Section pour la pénalité de retard */}
      <div className="space-y-2 border p-3 rounded-md">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="applyPenalty"
            checked={penaltyAmount !== ''}
            onChange={(e) => {
              if (!e.target.checked) {
                setPenaltyAmount('');
              } else {
                setPenaltyAmount('0');
              }
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="applyPenalty" className="text-sm font-medium">
            Appliquer une pénalité de retard
          </label>
        </div>
        
        {penaltyAmount !== '' && (
          <div className="mt-2">
            <label className="text-sm font-medium">Montant de la pénalité (FCFA)</label>
            <Input
              type="number"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              placeholder="Montant en FCFA"
              min="0"
            />
          </div>
        )}
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setGenerateModal(false)}>
        Annuler
      </Button>
      <Button onClick={handleGenerateDisconnection}>
        <Scissors className="h-4 w-4 mr-2" />
        Générer le bon de coupure
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      

    </div>
  );
};

export default DisconnectionTab;