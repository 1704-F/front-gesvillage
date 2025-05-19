import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
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
  FileDown,
  Users,
  XCircle,
  Calendar,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';

// Modal de génération des bons de coupure
const GenerateDisconnectionModal = ({
  open,
  onOpenChange,
  consumers,
  onGenerate,
  loading
}) => {
  const [selectedConsumers, setSelectedConsumers] = useState([]);
  const [error, setError] = useState(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Générer des bons de coupure</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        <div className="space-y-4 flex-grow overflow-hidden">
          <Card className="p-4 h-full">
            <div className="max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedConsumers(consumers.map(c => c.id));
                          } else {
                            setSelectedConsumers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Consommateur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Factures impayées</TableHead>
                    <TableHead>Montant total</TableHead>
                    <TableHead>Plus ancienne facture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {loading ? "Chargement des données..." : "Aucun consommateur éligible à la coupure"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    consumers.map((consumer) => (
                      <TableRow key={consumer.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedConsumers.includes(consumer.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedConsumers(prev => [...prev, consumer.id]);
                              } else {
                                setSelectedConsumers(prev => prev.filter(id => id !== consumer.id));
                              }
                            }}
                          />
                        </TableCell>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2 border-t">
          <div className="text-sm">
            {selectedConsumers.length} consommateur(s) sélectionné(s) sur {consumers.length}
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedConsumers([]);
                setError(null);
                onOpenChange(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => onGenerate(selectedConsumers)}
              disabled={selectedConsumers.length === 0 || loading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Générer {selectedConsumers.length} bon(s) de coupure
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour afficher l'onglet des bons de coupure
const DisconnectionTab = () => {
  const { toast } = useToast();
  
  // État de chargement et gestion des erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les données
  const [consumers, setConsumers] = useState([]);
  const [eligibleConsumers, setEligibleConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState({
    total_count: 0,
    generated_count: 0,
    executed_count: 0,
    total_amount_due: 0
  });
  
  // États pour les modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [executeModal, setExecuteModal] = useState(false);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  
  // États pour le formulaire d'exécution
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [applyPenalty, setApplyPenalty] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  
  // États pour les filtres
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setDate(1);
      return date;
    })(),
    new Date()
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [consumerFilter, setConsumerFilter] = useState(null);
  
  // Débounce pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchingConsumers, setIsSearchingConsumers] = useState(false);
  const [consumerSearchResults, setConsumerSearchResults] = useState([]);
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // État pour les onglets du modal de détails
  const [activeTab, setActiveTab] = useState('new');
  
  // Effet pour le debounce de la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Effet pour la recherche de consommateurs
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchConsumers(searchTerm);
      }
    }, 300);
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);
  
  // Fonction pour rechercher des consommateurs
  const searchConsumers = async (query) => {
    if (!query || query.length < 2) {
      setConsumerSearchResults([]);
      return;
    }
    
    setIsSearchingConsumers(true);
    try {
      const response = await api.get('/consumers/search', {
        params: { query }
      });
      setConsumerSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche des consommateurs:', error);
    } finally {
      setIsSearchingConsumers(false);
    }
  };

  // Fonction pour obtenir les consommateurs avec factures impayées (avec pagination)
  const fetchDisconnectionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/disconnection-notices', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          status: statusFilter,
          consumer_id: consumerFilter?.id,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      setConsumers(response.data.data || []);
      setStatistics(response.data.statistics || {
        total_count: 0,
        generated_count: 0,
        executed_count: 0,
        total_amount_due: 0
      });
      
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
        description: "Impossible de récupérer les données des bons de coupure"
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, statusFilter, consumerFilter, pagination.page, pagination.limit, toast]);

  // Fonction pour obtenir les consommateurs éligibles à un bon de coupure
  const fetchEligibleConsumers = async () => {
    try {
      setGeneratingInvoices(true);
      const response = await api.get('/disconnection-notices/eligible', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          consumer_id: consumerFilter?.id
        }
      });
      setEligibleConsumers(response.data.data || []);
      setIsGenerateModalOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les consommateurs éligibles"
      });
    } finally {
      setGeneratingInvoices(false);
    }
  };

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
    fetchDisconnectionData();
    fetchEmployees();
  }, [fetchDisconnectionData]);

  // Fonction pour générer plusieurs bons de coupure
  const handleGenerateBulkDisconnections = async (consumerIds) => {
    try {
      setGeneratingInvoices(true);
      await api.post('/disconnection-notices/bulk-generate', {
        consumer_ids: consumerIds
      });
      
      toast({
        title: "Succès",
        description: `${consumerIds.length} bon(s) de coupure généré(s) avec succès`
      });
      
      setIsGenerateModalOpen(false);
      fetchDisconnectionData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de générer les bons de coupure"
      });
    } finally {
      setGeneratingInvoices(false);
    }
  };

  // Fonction pour télécharger un PDF de bon de coupure individuel par son ID
const handleDownloadIndividualPDF = async (noticeId) => {
  try {
    const response = await api.get(`/disconnection-notices/${noticeId}/pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bon-coupure-${noticeId}.pdf`);
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

  // Fonction pour générer un bon de coupure individuel
  const handleGenerateDisconnection = async (consumerId, invoiceId = null) => {
  try {
    // Ajout du paramètre invoiceId pour cibler une facture spécifique
    const payload = {};
    if (invoiceId) payload.invoiceId = invoiceId;
    
    await api.post(`/consumers/${consumerId}/disconnection-notice`, payload);
    
    toast({
      title: "Succès",
      description: "Bon(s) de coupure généré(s) avec succès"
    });
    fetchDisconnectionData();
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Impossible de générer le(s) bon(s) de coupure"
    });
  }
};

  // Fonction pour marquer un bon de coupure comme exécuté
  const handleExecuteDisconnection = async () => {
    try {
      if (!selectedConsumer) return;
      
      await api.patch(`/consumers/${selectedConsumer.id}/disconnection-notice/execute`, {
        employee_id: employeeId === 'none' ? null : employeeId,
        notes: notes || undefined,
        penalty_amount: applyPenalty ? penaltyAmount || null : null
      });
      
      toast({
        title: "Succès",
        description: "Bon de coupure marqué comme exécuté"
      });
      
      setExecuteModal(false);
      setEmployeeId('');
      setNotes('');
      setApplyPenalty(false);
      setPenaltyAmount('');
      fetchDisconnectionData();
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
    // Construction des paramètres basés sur les filtres actuels
    const params = {
      // Toujours inclure les dates
      start_date: format(dateRange[0], 'yyyy-MM-dd'),
      end_date: format(dateRange[1], 'yyyy-MM-dd')
    };
    
    // Ajouter le filtre de statut s'il est défini et différent de 'all'
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    // Ajouter le filtre de consommateur s'il est défini
    if (consumerFilter?.id) {
      params.consumer_id = consumerFilter.id;
    }
    
    // Si d'autres filtres existent, les ajouter ici
    
    const response = await api.get('/disconnection-notices/summary-pdf', {
      params,
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
      setActiveTab('new');
      setViewDetailModal(true);
      return;
    }
    
    // Sinon, récupérer les détails complets
    const details = await fetchConsumerDetails(consumer.id);
    if (details) {
      setSelectedConsumer(details);
      setActiveTab('new');
      setViewDetailModal(true);
    }
  };

  // Fonction pour ouvrir le modal d'exécution
  const handleOpenExecuteModal = (consumer) => {
    setSelectedConsumer(consumer);
    setExecuteModal(true);
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
    } else if (consumer.disconnection_notice.status === 'obsolete') {
      return { label: "Obsolète", variant: "secondary" };
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
        <Button onClick={fetchDisconnectionData}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et filtres principaux */}
      <div className="flex justify-between items-center">
    
        
        <div className="flex items-center space-x-4">
          {/* Filtres de date */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={format(dateRange[0], 'yyyy-MM-dd')}
                onChange={(e) => setDateRange([new Date(e.target.value), dateRange[1]])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg"
                value={format(dateRange[1], 'yyyy-MM-dd')}
                onChange={(e) => setDateRange([dateRange[0], new Date(e.target.value)])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {/* Filtre de statut */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">À générer</SelectItem>
              <SelectItem value="generated">Généré</SelectItem>
              <SelectItem value="executed">Exécuté</SelectItem>
              <SelectItem value="obsolete">Obsolète</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Bouton Générer */}
          <Button
            onClick={fetchEligibleConsumers}
            disabled={generatingInvoices}
          >
            {generatingInvoices ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                Chargement...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Générer
              </>
            )}
          </Button>
          
          {/* Bouton Télécharger rapport */}
          <Button 
            variant="outline" 
            onClick={handleDownloadSummaryPDF}
            disabled={consumers.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Télécharger rapport
          </Button>
        </div>
      </div>
      
      {/* Recherche de consommateur */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {consumerFilter ? consumerFilter.name : "Rechercher un consommateur..."}
                </div>
                <Search className="h-4 w-4 ml-2 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="p-2">
                <Input 
                  placeholder="Rechercher un consommateur..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                
                {isSearchingConsumers && (
                  <div className="flex justify-center my-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
                
                <div className="mt-2 max-h-60 overflow-y-auto">
                  {consumerSearchResults.length > 0 ? (
                    consumerSearchResults.map((consumer) => (
                      <div
                        key={consumer.id}
                        className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer rounded"
                        onClick={() => {
                          setConsumerFilter(consumer);
                          setSearchTerm("");
                          setIsSearchOpen(false);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{consumer.name}</span>
                        {consumer.nickname && (
                          <span className="ml-1 text-sm text-gray-600">
                            ({consumer.nickname})
                          </span>
                        )}
                        <span className="ml-2 text-sm text-gray-500">
                          {consumer.meter_number}
                        </span>
                      </div>
                    ))
                  ) : searchTerm.length > 1 ? (
                    <div className="text-center py-2 text-gray-500">
                      Aucun consommateur trouvé
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      Saisissez au moins 2 caractères
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Affichage du filtre actif */}
        {consumerFilter && (
          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
            <span className="mr-2 text-sm font-medium">
              Filtré par: {consumerFilter.name}
            </span>
            <button
              onClick={() => setConsumerFilter(null)}
              className="text-gray-400 hover:text-red-500"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Carte des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50">
          <h3 className="text-sm font-medium text-blue-600 mb-1">Total des bons</h3>
          <div className="text-2xl font-bold">{statistics.total_count}</div>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <h3 className="text-sm font-medium text-yellow-600 mb-1">Bons générés</h3>
          <div className="text-2xl font-bold">{statistics.generated_count}</div>
        </Card>
        <Card className="p-4 bg-red-50">
          <h3 className="text-sm font-medium text-red-600 mb-1">Bons exécutés</h3>
          <div className="text-2xl font-bold">{statistics.executed_count}</div>
        </Card>
        <Card className="p-4 bg-emerald-50">
          <h3 className="text-sm font-medium text-emerald-600 mb-1">Montant total impayé</h3>
          <div className="text-2xl font-bold">{statistics.total_amount_due?.toLocaleString()} FCFA</div>
        </Card>
      </div>

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
              <TableHead>N° Bon</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {loading ? "Chargement des données..." : "Aucun consommateur correspondant aux critères"}
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
                      {consumer.disconnection_notice ? consumer.disconnection_notice.notice_number : "-"}
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
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleOpenExecuteModal(consumer)}
      >
        <Check className="h-4 w-4 mr-1" />
        Exécuter
      </Button>
    )}
    
    {/* Supprimer le bouton de téléchargement ici
    {consumer.disconnection_notice && (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleDownloadPDF(consumer.id)}
      >
        <Download className="h-4 w-4 mr-1" />
        PDF
      </Button>
    )}
    */}
    
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

      {/* Modal de génération des bons de coupure */}
      <GenerateDisconnectionModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        consumers={eligibleConsumers}
        onGenerate={handleGenerateBulkDisconnections}
        loading={generatingInvoices}
      />

      {/* Modal détails des factures impayées */}
      <Dialog open={viewDetailModal} onOpenChange={setViewDetailModal}>
        <DialogContent className="max-w-[900px]">
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
                <TableHead>Actions</TableHead>
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
        <TableCell>
          {!invoice.disconnection_notice && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setViewDetailModal(false);
                handleGenerateDisconnection(selectedConsumer.id, invoice.id);
              }}
            >
              <Scissors className="h-4 w-4 mr-2" />
              Générer bon
            </Button>
          )}
          {invoice.disconnection_notice && (
            <div className="flex space-x-2 items-center">
              <Badge variant={invoice.disconnection_notice.executed ? "destructive" : "default"}>
                {invoice.disconnection_notice.notice_number}
              </Badge>
              {/* Ajouter le bouton de téléchargement individuel */}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleDownloadIndividualPDF(invoice.disconnection_notice.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  })}
  
  {/* Message quand aucune facture */}
  {!selectedConsumer?.unpaid_invoices?.length && (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
        Aucune facture impayée à afficher
      </TableCell>
    </TableRow>
  )}
</TableBody>
           
            

          </Table>

          <div className="flex justify-between mt-4">
  <div>
    <span className="text-sm text-gray-500">Total dû:</span>
    <span className="ml-2 font-bold">
      {(() => {
        // Recalculer le total correctement à partir des factures
        const totalInvoices = selectedConsumer?.unpaid_invoices?.reduce(
          (sum, invoice) => sum + Number(invoice.amount_due), 
          0
        ) || 0;
        
        // Ajouter les pénalités de chaque facture si elles existent
        const totalPenalties = selectedConsumer?.unpaid_invoices?.reduce(
          (sum, invoice) => {
            if (invoice.disconnection_notice?.penalty_amount) {
              return sum + Number(invoice.disconnection_notice.penalty_amount);
            }
            return sum;
          }, 
          0
        ) || 0;
        
        const grandTotal = totalInvoices + totalPenalties;
        return grandTotal.toLocaleString();
      })()} FCFA
    </span>
    {/* Afficher le détail des pénalités si nécessaire */}
    {selectedConsumer?.unpaid_invoices?.some(inv => inv.disconnection_notice?.penalty_amount > 0) && (
      <span className="text-xs text-gray-500 ml-2">
        (inclut les pénalités)
      </span>
    )}
  </div>
  
  <div>
    <span className="text-sm text-gray-500">Factures impayées:</span>
    <span className="ml-2 font-bold">{selectedConsumer?.unpaid_invoices?.length || 0}</span>
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
            
            {selectedConsumer && selectedConsumer.disconnection_notice && !selectedConsumer.disconnection_notice.executed && (
              <Button
                onClick={() => {
                  setViewDetailModal(false);
                  handleOpenExecuteModal(selectedConsumer);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Exécuter le bon
              </Button>
            )}
            
            {selectedConsumer && selectedConsumer.disconnection_notice && (
              <Button
                onClick={() => {
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
            
            {/* Section pour la pénalité de retard */}
            <div className="space-y-2 border p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="applyPenalty"
                  checked={applyPenalty}
                  onChange={(e) => setApplyPenalty(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="applyPenalty" className="text-sm font-medium">
                  Appliquer une pénalité de retard
                </label>
              </div>
              
              {applyPenalty && (
                <div className="mt-2">
                  <label className="text-sm font-medium">Montant de la pénalité (FCFA)</label>
                  <Input
                    type="number"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    placeholder="Montant en FCFA"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour une pénalité sans montant fixe
                  </p>
                </div>
              )}
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