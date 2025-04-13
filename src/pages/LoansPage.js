import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/toast/use-toast";
import { axiosPrivate as api } from '../utils/axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Plus,
  DollarSign,
  FileText,
  AlertCircle,
  Download,
  Search,
  RefreshCcw
} from 'lucide-react';

// Import des composants personnalisés
import LoanForm from '../components/loans/LoanForm';
import RepaymentForm from '../components/loans/RepaymentForm';
import LoanDetails from '../components/loans/LoanDetails';
import LoanDefaultForm from '../components/loans/LoanDefaultForm';
import LoanStatistics from '../components/loans/LoanStatistics';
import Pagination from '../components/Pagination'; // Supposé que vous avez un composant de pagination commun

const LoansPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // États pour le filtre et la pagination
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateRange: [
      format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'), // 1er janvier de l'année en cours
      format(new Date(), 'yyyy-MM-dd') // Aujourd'hui
    ],
    sort_by: 'start_date',
    sort_order: 'DESC'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    perPage: 10,
    total: 0
  });

  // États pour les modaux
  const [loanModal, setLoanModal] = useState({ isOpen: false, editing: null });
  const [repaymentModal, setRepaymentModal] = useState({ isOpen: false, loan: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, loan: null });
  const [defaultModal, setDefaultModal] = useState({ isOpen: false, loan: null });

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchLoans(),
      fetchEmployees(),
      fetchStatistics()
    ]).finally(() => setLoading(false));
  }, []);

  // Effet pour recharger les emprunts lors du changement de filtre ou de page
  useEffect(() => {
    fetchLoans();
  }, [filters, pagination.currentPage]);

  // Fonctions de récupération des données
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage,
          status: filters.status !== 'all' ? filters.status : undefined,
          search: filters.search || undefined,
          start_date: filters.dateRange[0],
          end_date: filters.dateRange[1],
          sort_by: filters.sort_by,
          sort_order: filters.sort_order
        }
      });

      setLoans(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.meta.total_pages,
        total: response.data.meta.total
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les emprunts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees', {
        params: { status: 'active' }
      });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
    }
  };

  const fetchLoanDetails = async (id) => {
    try {
      const response = await api.get(`/loans/${id}`);
      return response.data.data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'emprunt",
        variant: "destructive"
      });
      return null;
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/loans/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  // Handlers pour les actions
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Retour à la première page lors d'un changement de filtre
    }));
  };

  const handleDateRangeChange = (index, date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: [
        index === 0 ? date : prev.dateRange[0],
        index === 1 ? date : prev.dateRange[1]
      ]
    }));
  };

  const handleLoanSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Ajouter les champs de base
      Object.keys(data).forEach(key => {
        if (key !== 'file' && key !== 'responsibles') {
          formData.append(key, data[key]);
        }
      });
      
      // Ajouter les responsables
      if (data.responsibles && data.responsibles.length > 0) {
        formData.append('responsibles', JSON.stringify(data.responsibles));
      }
      
      // Ajouter le fichier s'il existe
      if (data.file) {
        formData.append('file', data.file);
      }
      
      if (loanModal.editing) {
        await api.put(`/loans/${loanModal.editing.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Succès",
          description: "Emprunt modifié avec succès"
        });
      } else {
        await api.post('/loans', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Succès",
          description: "Emprunt créé avec succès"
        });
      }
      
      setLoanModal({ isOpen: false, editing: null });
      fetchLoans();
      fetchStatistics();
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'emprunt:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleRepaymentSubmit = async (data) => {
    try {
      await api.post(`/loans/${repaymentModal.loan.id}/repayments`, data);
      
      toast({
        title: "Succès",
        description: "Remboursement ajouté avec succès"
      });
      
      setRepaymentModal({ isOpen: false, loan: null });
      fetchLoans();
      fetchStatistics();
      
      // Si un emprunt était ouvert dans le modal de détails, rafraîchir ces détails
      if (detailsModal.isOpen && detailsModal.loan) {
        const updatedLoan = await fetchLoanDetails(detailsModal.loan.id);
        if (updatedLoan) {
          setDetailsModal({ isOpen: true, loan: updatedLoan });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du remboursement:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsDefaulted = async (reason) => {
    try {
      await api.patch(`/loans/${defaultModal.loan.id}/default`, { reason });
      
      toast({
        title: "Information",
        description: "Emprunt marqué comme défaillant"
      });
      
      setDefaultModal({ isOpen: false, loan: null });
      
      // Rafraîchir les données
      fetchLoans();
      fetchStatistics();
      
      // Fermer le modal de détails s'il était ouvert
      setDetailsModal({ isOpen: false, loan: null });
    } catch (error) {
      console.error('Erreur lors du marquage comme défaillant:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleViewLoanDetails = async (id) => {
    const loan = await fetchLoanDetails(id);
    if (loan) {
      setDetailsModal({ isOpen: true, loan });
    }
  };

  const handleOpenRepaymentModal = (loan) => {
    setRepaymentModal({ isOpen: true, loan });
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const response = await api.get(`/loans/attachments/${attachmentId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attachment-${attachmentId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la pièce jointe",
        variant: "destructive"
      });
    }
  };

  // Helper pour formatter les données
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const getStatusBadge = (status) => {
    const variants = {
      'pending': 'warning',
      'active': 'default',
      'completed': 'success',
      'defaulted': 'destructive'
    };
    
    const labels = {
      'pending': 'En attente',
      'active': 'En cours',
      'completed': 'Terminé',
      'defaulted': 'Défaillant'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading && loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Emprunts</h1>
        <Button onClick={() => setLoanModal({ isOpen: true, editing: null })}>
          <Plus className="w-4 h-4 mr-2" /> Nouvel emprunt
        </Button>
      </div>

      {/* Statistiques */}
      <LoanStatistics statistics={statistics} />

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="completed">Terminés</SelectItem>
                <SelectItem value="defaulted">Défaillants</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Période</label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateRange[0]}
                onChange={(e) => handleDateRangeChange(0, e.target.value)}
                className="w-full"
              />
              <Input
                type="date"
                value={filters.dateRange[1]}
                onChange={(e) => handleDateRangeChange(1, e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className="pl-8"
                placeholder="Prêteur, montant..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                fetchLoans();
                fetchStatistics();
              }}
              className="w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Actualiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Liste des emprunts */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prêteur</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Restant</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{loan.lender}</div>
                      <div className="text-sm text-gray-500">{loan.purpose}</div>
                    </div>
                  </TableCell>
                  <TableCell>{parseFloat(loan.amount).toLocaleString()} FCFA</TableCell>
                  <TableCell>{parseFloat(loan.remaining_amount).toLocaleString()} FCFA</TableCell>
                  <TableCell>{formatDate(loan.start_date)}</TableCell>
                  <TableCell>{formatDate(loan.due_date)}</TableCell>
                  <TableCell>{getStatusBadge(loan.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* Voir les détails */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLoanDetails(loan.id)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      
                      {/* Ajouter un remboursement (si l'emprunt est actif ou en attente) */}
                      {(loan.status === 'active' || loan.status === 'pending') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRepaymentModal(loan)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Marquer comme défaillant (si l'emprunt est actif ou en attente) */}
                      {(loan.status === 'active' || loan.status === 'pending') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDefaultModal({ isOpen: true, loan })}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucun emprunt trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {/* Modaux */}
      <LoanForm
        isOpen={loanModal.isOpen}
        onClose={() => setLoanModal({ isOpen: false, editing: null })}
        editingLoan={loanModal.editing}
        employees={employees}
        onSubmit={handleLoanSubmit}
      />

      <RepaymentForm
        isOpen={repaymentModal.isOpen}
        onClose={() => setRepaymentModal({ isOpen: false, loan: null })}
        loan={repaymentModal.loan}
        employees={employees}
        onSubmit={handleRepaymentSubmit}
      />

      <LoanDetails
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, loan: null })}
        loan={detailsModal.loan}
        onAddRepayment={() => {
          setRepaymentModal({ isOpen: true, loan: detailsModal.loan });
        }}
        onDownloadAttachment={handleDownloadAttachment}
        onMarkAsDefaulted={() => {
          setDefaultModal({ isOpen: true, loan: detailsModal.loan });
        }}
      />

      <LoanDefaultForm
        isOpen={defaultModal.isOpen}
        onClose={() => setDefaultModal({ isOpen: false, loan: null })}
        loan={defaultModal.loan}
        onSubmit={handleMarkAsDefaulted}
      />
    </div>
  );
};

export default LoansPage;