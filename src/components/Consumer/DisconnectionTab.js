import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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
  FileDown,
  Trash2,
  Power,
  Zap,
  ZapOff
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
  const [disconnectedConsumers, setDisconnectedConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // États pour les modals
  const [viewDetailModal, setViewDetailModal] = useState(false);
  const [executeModal, setExecuteModal] = useState(false);
  const [generateModal, setGenerateModal] = useState(false); 
  const [reconnectModal, setReconnectModal] = useState(false);
  
  // États pour les formulaires
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [reconnectEmployeeId, setReconnectEmployeeId] = useState('');
  const [penaltyPaid, setPenaltyPaid] = useState(false);
  
  // États pour les filtres (MODIFIÉ - ajout du statut)
  const [filters, setFilters] = useState({
    min_invoices: 2,
    min_amount: 0,
    search: '',
    status: 'all' // NOUVEAU FILTRE
  });
  
  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  const [disconnectedPagination, setDisconnectedPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  
  // Débounce pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [historyFilters, setHistoryFilters] = useState({
    penalty_status: 'all',
    search: '',
    date_from: '',
    date_to: ''
  });
  
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
      setPagination(prev => ({
        ...prev,
        page: 1
      }));
    }
  }, [debouncedSearch]);
  
  // Fonction pour obtenir les consommateurs avec factures impayées
  const fetchConsumersWithUnpaidInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/consumers/with-unpaid-invoices', {
        params: {
          min_invoices: filters.min_invoices,
          min_amount: filters.min_amount,
          search: filters.search,
          status: filters.status, // NOUVEAU PARAMÈTRE
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

  // NOUVELLE FONCTION : Récupérer les consommateurs coupés
  const fetchDisconnectedConsumers = useCallback(async () => {
    try {
      const response = await api.get('/consumers/disconnected', {
        params: {
          page: disconnectedPagination.page,
          limit: disconnectedPagination.limit,
          search: filters.search
        }
      });
      
      setDisconnectedConsumers(response.data.data || []);
      
      if (response.data.pagination) {
        setDisconnectedPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les consommateurs coupés"
      });
    }
  }, [disconnectedPagination.page, disconnectedPagination.limit, filters.search, toast]);

  const fetchNoticesHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get('/disconnection-notices/history', {
        params: {
          page: historyPagination.page,
          limit: historyPagination.limit,
          search: historyFilters.search,
          penalty_status: historyFilters.penalty_status,
          date_from: historyFilters.date_from,
          date_to: historyFilters.date_to
        }
      });
      
      setHistoryData(response.data.data || []);
      
      if (response.data.pagination) {
        setHistoryPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer l'historique des bons"
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPagination.page, historyPagination.limit, historyFilters, toast]);

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

  // Fonction pour obtenir les employés
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
    fetchDisconnectedConsumers();
    fetchNoticesHistory();
    fetchEmployees();
  }, [fetchConsumersWithUnpaidInvoices, fetchDisconnectedConsumers]);

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

  // NOUVELLE FONCTION : Supprimer un bon de coupure non exécuté
  const handleDeleteDisconnection = async (consumerId) => {
    try {
      await api.delete(`/consumers/${consumerId}/disconnection-notice`);
      
      toast({
        title: "Succès",
        description: "Bon de coupure supprimé avec succès"
      });
      
      fetchConsumersWithUnpaidInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer le bon de coupure"
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
      });
      
      toast({
        title: "Succès",
        description: "Bon de coupure marqué comme exécuté et consommateur coupé"
      });
      
      setExecuteModal(false);
      setEmployeeId('');
      setNotes('');
      fetchConsumersWithUnpaidInvoices();
      fetchDisconnectedConsumers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de mettre à jour le statut"
      });
    }
  };

  // NOUVELLE FONCTION : Remettre en service un consommateur
  const handleReconnectConsumer = async () => {
    try {
      if (!selectedConsumer) return;
      
      await api.patch(`/consumers/${selectedConsumer.id}/reconnect`, {
        employee_id: reconnectEmployeeId === 'none' ? null : reconnectEmployeeId,
        penalty_paid: penaltyPaid
      });
      
      toast({
        title: "Succès",
        description: "Consommateur remis en service avec succès"
      });
      
      setReconnectModal(false);
      setReconnectEmployeeId('');
      setPenaltyPaid(false);
      fetchDisconnectedConsumers();
      fetchConsumersWithUnpaidInvoices();
    } catch (error) {
      // NOUVELLE GESTION D'ERREUR DÉTAILLÉE
      const errorResponse = error.response?.data;
      
      if (errorResponse?.details?.unpaid_count) {
        // Cas spécifique : factures non payées
        toast({
          variant: "destructive",
          title: "Remise en service impossible",
          description: (
            <div className="space-y-2">
              <p className="font-medium">{errorResponse.message}</p>
              <div className="text-sm">
                <p><strong>Bon concerné :</strong> {errorResponse.details.notice_number}</p>
                <p><strong>Factures impayées :</strong></p>
                <p className="text-xs bg-red-50 text-black  p-2 rounded mt-1">
                  {errorResponse.details.unpaid_invoices}
                </p>
              </div>
              <p className="text-sm font-medium text-white mt-2">
                ⚠ Veuillez d'abord marquer ces factures comme payées dans le module de facturation.
              </p>
            </div>
          ),
          duration: 8000 // Toast plus long pour laisser le temps de lire
        });
      } else {
        // Autres erreurs
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorResponse?.message || "Impossible de remettre en service"
        });
      }
    }
  };

  const handleUpdatePenaltyStatus = async (noticeId, penaltyPaid) => {
    try {
      await api.patch(`/disconnection-notices/${noticeId}/penalty-status`, {
        penalty_paid: penaltyPaid
      });
      
      toast({
        title: "Succès",
        description: "Statut de la pénalité mis à jour"
      });
      
      fetchNoticesHistory();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la pénalité"
      });
    }
  };

  // Fonction pour télécharger un PDF de bon de coupure individuel
  const handleDownloadPDF = async (consumerId, noticeId = null) => {
    try {
      let url;
      if (noticeId) {
        // Utiliser la nouvelle route avec l'ID du bon spécifique
        url = `/disconnection-notices/${noticeId}/pdf`;
      } else {
        // Fallback vers l'ancienne route
        url = `/consumers/${consumerId}/disconnection-notice/pdf`;
      }
      
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
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

  // FONCTION AMÉLIORÉE : Télécharger le PDF récapitulatif pour l'onglet Factures impayées
  const handleDownloadUnpaidSummaryPDF = async () => {
    try {
      const response = await api.get('/disconnection-notices/summary-pdf', {
        params: {
          min_invoices: filters.min_invoices,
          min_amount: filters.min_amount,
          status: filters.status // NOUVEAU PARAMÈTRE
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      const statusSuffix = filters.status !== 'all' ? `-${filters.status}` : '';
      link.setAttribute('download', `rapport-factures-impayees${statusSuffix}-${today}.pdf`);
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

  // NOUVELLE FONCTION : Télécharger le PDF pour l'onglet Consommateurs coupés
  const handleDownloadDisconnectedSummaryPDF = async () => {
    try {
      const response = await api.get('/disconnection-notices/disconnected-summary-pdf', {
        params: {
          search: filters.search
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `rapport-consommateurs-coupes-${today}.pdf`);
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

  // NOUVELLE FONCTION : Télécharger le PDF pour l'onglet Historique
  const handleDownloadHistorySummaryPDF = async () => {
    try {
      const response = await api.get('/disconnection-notices/history-summary-pdf', {
        params: {
          search: historyFilters.search,
          penalty_status: historyFilters.penalty_status,
          date_from: historyFilters.date_from,
          date_to: historyFilters.date_to
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `rapport-historique-bons-${today}.pdf`);
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
    if (consumer.unpaid_invoices) {
      setSelectedConsumer(consumer);
      setViewDetailModal(true);
      return;
    }
    
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

  const handleOpenExecuteModal = (consumer) => {
    setSelectedConsumer(consumer);
    setExecuteModal(true);
  };

  // NOUVELLE FONCTION : Ouvrir le modal de remise en service
  const handleOpenReconnectModal = (consumer) => {
    setSelectedConsumer(consumer);
    setReconnectEmployeeId('');
    setPenaltyPaid(false);
    setReconnectModal(true);
  };

  // Fonction pour appliquer les filtres
  const handleApplyFilters = () => {
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

  const handleDisconnectedPageChange = (newPage) => {
    setDisconnectedPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleHistoryPageChange = (newPage) => {
    setHistoryPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Statut du bon de coupure
  const getDisconnectionStatus = (consumer) => {
    if (consumer.water_supply_status === 'disconnected') {
      return { label: "Coupé", variant: "destructive" };
    }
    
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
      <Tabs defaultValue="unpaid" className="w-full">

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unpaid" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Factures impayées
          </TabsTrigger>
          <TabsTrigger value="disconnected" className="flex items-center gap-2">
            <ZapOff className="h-4 w-4" />
            Consommateurs coupés
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Historique des bons
          </TabsTrigger>
        </TabsList>

        {/* ONGLET 1: FACTURES IMPAYÉES (MODIFIÉ - ajout du filtre statut) */}
        <TabsContent value="unpaid" className="space-y-6">
          {/* Section filtres AMÉLIORÉE */}
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
              {/*
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

               NOUVEAU FILTRE STATUT */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut bon de coupure</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="to_generate">À générer</SelectItem>
                    <SelectItem value="generated">Généré</SelectItem>
                    <SelectItem value="executed">Exécuté</SelectItem>
                  </SelectContent>
                </Select>
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
              
              {/* BOUTON AMÉLIORÉ avec info du statut */}
              <Button 
                variant="outline" 
                onClick={handleDownloadUnpaidSummaryPDF}
                disabled={consumers.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger rapport
                {filters.status !== 'all' && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    {filters.status === 'to_generate' ? 'À générer' : 
                     filters.status === 'generated' ? 'Généré' : 'Exécuté'}
                  </span>
                )}
              </Button>
            </div>
          </Card>

          {/* Tableau des consommateurs avec factures impayées (reste identique) */}
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
                    const isDisconnected = consumer.water_supply_status === 'disconnected';
                    
                    return (
                      <TableRow key={consumer.id}>
                        <TableCell>
                          <div className="font-medium">{consumer.first_name} {consumer.last_name}</div>
                          <div className="text-sm text-gray-500">{consumer.name}</div>
                          {isDisconnected && (
                            <Badge variant="destructive" className="text-xs">
                              Coupé
                            </Badge>
                          )}
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
                            {/* Génération impossible si coupé */}
                            {!isDisconnected && !consumer.disconnection_notice && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openGenerateModal(consumer)}
                              >
                                <Scissors className="h-4 w-4 mr-1" />
                                Générer
                              </Button>
                            )}
                            
                            {/* Message si coupé */}
                            {isDisconnected && (
                              <span className="text-sm text-red-600">
                                Actuellement coupé
                              </span>
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
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteDisconnection(consumer.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Supprimer
                                </Button>
                              </>
                            )}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(
                                consumer.id, 
                                consumer.disconnection_notice?.id  // Passer l'ID du bon
                              )}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>

                            
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
            
            {/* Pagination pour factures impayées */}
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
        </TabsContent>

        {/* ONGLET 2: CONSOMMATEURS COUPÉS (MODIFIÉ - ajout du bouton rapport) */}
        <TabsContent value="disconnected" className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Consommateurs actuellement coupés</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={fetchDisconnectedConsumers}
                  variant="outline"
                  size="sm"
                >
                  Actualiser
                </Button>
                {/* NOUVEAU BOUTON RAPPORT */}
                <Button 
                  variant="outline" 
                  onClick={handleDownloadDisconnectedSummaryPDF}
                  disabled={disconnectedConsumers.length === 0}
                  size="sm"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Télécharger rapport
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consommateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date de coupure</TableHead>
                  <TableHead>Montant dû</TableHead>
                  <TableHead>Pénalité</TableHead>
                  <TableHead>Statut pénalité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disconnectedConsumers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Aucun consommateur actuellement coupé
                    </TableCell>
                  </TableRow>
                ) : (
                  disconnectedConsumers.map((consumer) => (
                    <TableRow key={consumer.id}>
                      <TableCell>
                        <div className="font-medium">{consumer.first_name} {consumer.last_name}</div>
                        <div className="text-sm text-gray-500">{consumer.name}</div>
                      </TableCell>
                      <TableCell>{consumer.phone_number}</TableCell>
                      <TableCell>
                        {consumer.last_disconnection?.execution_date ? 
                          format(new Date(consumer.last_disconnection.execution_date), 'dd/MM/yyyy') : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {consumer.last_disconnection?.total_amount_due ? 
                          `${Number(consumer.last_disconnection.total_amount_due).toLocaleString()} FCFA` : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {consumer.last_disconnection?.penalty_amount ? 
                          `${Number(consumer.last_disconnection.penalty_amount).toLocaleString()} FCFA` : 
                          'Aucune'}
                      </TableCell>
                      <TableCell>
                        {consumer.last_disconnection?.penalty_amount > 0 && (
                          <Badge 
                            variant={consumer.last_disconnection.penalty_paid === true ? "success" : "destructive"}
                          >
                            {consumer.last_disconnection.penalty_paid === true ? "Payée" : 
                             consumer.last_disconnection.penalty_paid === false ? "Impayée" : "Non défini"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenReconnectModal(consumer)}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Remettre en service
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(
                              consumer.id, 
                              consumer.last_disconnection?.id  // Passer l'ID du bon
                            )}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination pour consommateurs coupés */}
            {disconnectedConsumers.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Affichage de {disconnectedPagination.totalItems ? (disconnectedPagination.page - 1) * disconnectedPagination.limit + 1 : 0} à {Math.min(disconnectedPagination.page * disconnectedPagination.limit, disconnectedPagination.totalItems)} sur {disconnectedPagination.totalItems} consommateurs
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectedPageChange(disconnectedPagination.page - 1)}
                    disabled={disconnectedPagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    Page {disconnectedPagination.page} sur {disconnectedPagination.totalPages || 1}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectedPageChange(disconnectedPagination.page + 1)}
                    disabled={disconnectedPagination.page >= disconnectedPagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ONGLET 3: HISTORIQUE (MODIFIÉ - ajout du bouton rapport) */}
        <TabsContent value="history" className="space-y-6">
          {/* Section filtres historique AMÉLIORÉE */}
          <Card className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut pénalité</label>
                <Select 
                  value={historyFilters.penalty_status} 
                  onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, penalty_status: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="paid">Payées</SelectItem>
                    <SelectItem value="unpaid">Impayées</SelectItem>
                    <SelectItem value="undefined">Non définies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de début</label>
                <Input
                  type="date"
                  value={historyFilters.date_from}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, date_from: e.target.value }))}
                  className="w-[150px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={historyFilters.date_to}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, date_to: e.target.value }))}
                  className="w-[150px]"
                />
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher consommateur..."
                  value={historyFilters.search}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-[220px]"
                />
              </div>
              
              <Button onClick={fetchNoticesHistory}>
                <Filter className="h-4 w-4 mr-2" />
                Appliquer
              </Button>

              {/* NOUVEAU BOUTON RAPPORT HISTORIQUE */}
              <Button 
                variant="outline" 
                onClick={handleDownloadHistorySummaryPDF}
                disabled={historyData.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger rapport
              </Button>
            </div>
          </Card>

          {/* Tableau historique */}
          <Card>
            {historyLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Bon</TableHead>
                  <TableHead>Consommateur</TableHead>
                  <TableHead>Date d'exécution</TableHead>
                  <TableHead>Montant dû</TableHead>
                  <TableHead>Pénalité</TableHead>
                  <TableHead>Statut pénalité</TableHead>
                  <TableHead>Remise en service</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {historyLoading ? "Chargement de l'historique..." : "Aucun bon de coupure dans l'historique"}
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        <div className="font-medium">{notice.notice_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{notice.consumer_name}</div>
                        <div className="text-sm text-gray-500">{notice.consumer_nickname}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(notice.execution_date), 'dd/MM/yyyy')}
                        <div className="text-xs text-gray-500">
                          par {notice.executor_name || 'Non spécifié'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Number(notice.total_amount_due).toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        {notice.penalty_amount > 0 ? 
                          `${Number(notice.penalty_amount).toLocaleString()} FCFA` : 
                          'Aucune'}
                      </TableCell>
                      <TableCell>
                        {notice.penalty_amount > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                notice.penalty_paid === true ? "success" : 
                                notice.penalty_paid === false ? "destructive" : "secondary"
                              }
                            >
                              {notice.penalty_paid === true ? "Payée" : 
                               notice.penalty_paid === false ? "Impayée" : "Non définie"}
                            </Badge>
                            
                            {/* Boutons pour modifier le statut */}
                            {notice.penalty_paid !== true && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdatePenaltyStatus(notice.id, true)}
                                className="h-6 px-2 text-xs"
                              >
                                Marquer payée
                              </Button>
                            )}
                            {notice.penalty_paid !== false && notice.penalty_amount > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdatePenaltyStatus(notice.id, false)}
                                className="h-6 px-2 text-xs"
                              >
                                Marquer impayée
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {notice.reconnection_date ? (
                          <div>
                            <div className="text-sm">{format(new Date(notice.reconnection_date), 'dd/MM/yyyy')}</div>
                            <div className="text-xs text-gray-500">
                              par {notice.reconnector_name || 'Non spécifié'}
                            </div>
                            <Badge variant="success" className="mt-1">Remis en service</Badge>
                          </div>
                        ) : (
                          <Badge variant="destructive">Toujours coupé</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(
                              notice.consumer_id, 
                              notice.id  // Passer l'ID du bon
                            )}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination historique */}
            {historyData.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-500">
                  Affichage de {historyPagination.totalItems ? (historyPagination.page - 1) * historyPagination.limit + 1 : 0} à {Math.min(historyPagination.page * historyPagination.limit, historyPagination.totalItems)} sur {historyPagination.totalItems} bons
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHistoryPageChange(historyPagination.page - 1)}
                    disabled={historyPagination.page === 1 || historyLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm">
                    Page {historyPagination.page} sur {historyPagination.totalPages || 1}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleHistoryPageChange(historyPagination.page + 1)}
                    disabled={historyPagination.page >= historyPagination.totalPages || historyLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Select 
                    value={historyPagination.limit.toString()} 
                    onValueChange={(value) => {
                      setHistoryPagination(prev => ({
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
        </TabsContent>
      </Tabs>

      {/* MODALS EXISTANTS (identiques) */}

      {/* Modal détails des factures impayées */}
      <Dialog open={viewDetailModal} onOpenChange={setViewDetailModal}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Détails des factures impayées - {selectedConsumer?.first_name} {selectedConsumer?.last_name}
              {selectedConsumer?.water_supply_status === 'disconnected' && (
                <Badge variant="destructive" className="ml-2">Coupé</Badge>
              )}
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

            {selectedConsumer && !selectedConsumer.disconnection_notice && selectedConsumer?.water_supply_status !== 'disconnected' && (
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

      {/* NOUVEAU MODAL : Remise en service */}
      <Dialog open={reconnectModal} onOpenChange={setReconnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remettre en service</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedConsumer && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h3 className="font-medium text-red-800">
                  Consommateur: {selectedConsumer.first_name} {selectedConsumer.last_name}
                </h3>
                <p className="text-sm text-red-600">
                  Actuellement coupé depuis le {selectedConsumer.last_disconnection?.execution_date ? 
                    format(new Date(selectedConsumer.last_disconnection.execution_date), 'dd/MM/yyyy') : 'N/A'}
                </p>
                {selectedConsumer.last_disconnection?.penalty_amount > 0 && (
                  <p className="text-sm text-red-600">
                    Pénalité appliquée: {Number(selectedConsumer.last_disconnection.penalty_amount).toLocaleString()} FCFA
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Employé effectuant la remise en service</label>
              <Select value={reconnectEmployeeId} onValueChange={setReconnectEmployeeId}>
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
            
            {selectedConsumer?.last_disconnection?.penalty_amount > 0 && (
              <div className="space-y-2 border p-3 rounded-md bg-yellow-50">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="penaltyPaid"
                    checked={penaltyPaid}
                    onChange={(e) => setPenaltyPaid(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="penaltyPaid" className="text-sm font-medium">
                    La pénalité de {Number(selectedConsumer.last_disconnection.penalty_amount).toLocaleString()} FCFA a-t-elle été payée ?
                  </label>
                </div>
                
                {penaltyPaid ? (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ La pénalité sera marquée comme payée
                  </p>
                ) : (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠ La pénalité restera marquée comme impayée
                  </p>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReconnectModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleReconnectConsumer}>
              <Zap className="h-4 w-4 mr-2" />
              Confirmer la remise en service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default DisconnectionTab;