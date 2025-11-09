// src/components/dashboard/CashRegisterHistory.jsx
import React, { useState, useEffect } from 'react';
import { 
  History,
  Download,
  Eye,
  Calendar,
  Wallet,
  DollarSign,
  FileText,
  Smartphone,
  Building2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from '../ui/toast/use-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CashRegisterHistory = () => {
  const { toast } = useToast();
  
  // États
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: ''
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  // Charger l'historique au montage et quand les filtres changent
  useEffect(() => {
    fetchHistory();
  }, [currentPage, filters]);

  // Récupérer l'historique
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cash-receipts/history', {
        params: {
          page: currentPage,
          limit: 10,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined
        }
      });

      setReceipts(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalItems(response.data.pagination.total);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer l'historique"
      });
    } finally {
      setLoading(false);
    }
  };

  // Voir les détails d'une caisse
  const handleViewDetails = async (receiptId) => {
  try {
    console.log('Chargement des détails pour ID:', receiptId);
    
    if (!receiptId || isNaN(receiptId)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "ID de caisse invalide"
      });
      return;
    }
    
    setDetailsLoading(true);
    setShowDetailsModal(true);
    setSelectedReceiptId(receiptId); // ✅ SAUVEGARDER L'ID

    const response = await api.get(`/cash-receipts/${receiptId}/report`);
    setSelectedReceipt(response.data.data);

  } catch (error) {
    console.error('Erreur chargement détails:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Impossible de récupérer les détails"
    });
    setShowDetailsModal(false);
  } finally {
    setDetailsLoading(false);
  }
};

  // Télécharger le rapport PDF
  const handleDownloadReport = async (receiptId, receiptNumber) => {
    try {
      const response = await api.get(`/cash-receipts/${receiptId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rapport-${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Rapport téléchargé avec succès"
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le rapport"
      });
    }
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  // Formater la durée
  const formatDuration = (opening, closing) => {
    const start = new Date(opening);
    const end = new Date(closing);
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}min`;
  };

  if (loading && receipts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Historique des Caisses
          </h2>
          <p className="text-gray-600">
            {totalItems} caisse{totalItems > 1 ? 's' : ''} clôturée{totalItems > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Date de début
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">
                Date de fin
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>

            <Button onClick={fetchHistory}>
              Rechercher
            </Button>
          </div>
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Bon</TableHead>
              <TableHead>Caissière</TableHead>
              <TableHead>Date ouverture</TableHead>
              <TableHead>Date clôture</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Montant total</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center text-gray-500">
                    <History className="h-12 w-12 mb-2" />
                    <p>Aucune caisse clôturée trouvée</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>
                    <span className="font-mono font-medium">
                      {receipt.receipt_number}
                    </span>
                  </TableCell>

                  <TableCell>
  <div>
    <div className="font-medium">
      {receipt.employee 
        ? `${receipt.employee.first_name} ${receipt.employee.last_name}`
        : `${receipt.cashier.first_name} ${receipt.cashier.last_name}`
      }
    </div>
    {receipt.employee?.job_title && (
      <div className="text-xs text-gray-500">
        {receipt.employee.job_title}
      </div>
    )}
  </div>
</TableCell>

                  <TableCell>
                    {format(new Date(receipt.opening_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(receipt.closing_date), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatDuration(receipt.opening_date, receipt.closing_date)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>À calculer</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold">
                      {parseFloat(receipt.expected_amount).toLocaleString()} FCFA
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(receipt.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(receipt.id, receipt.receipt_number)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} ({totalItems} total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Détails */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la caisse {selectedReceipt?.receipt_number}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedReceipt ? (
            <div className="space-y-6">
              {/* Informations générales */}
              <Card className="bg-gray-50">
                <div className="p-4">
                  <h3 className="font-bold mb-3">Informations générales</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
  <span className="text-gray-600">Caissière :</span>
  <span className="ml-2 font-medium">
    {selectedReceipt.cashier}
    {selectedReceipt.cashier_job_title && (
      <span className="text-gray-500 text-sm ml-1">
        ({selectedReceipt.cashier_job_title})
      </span>
    )}
  </span>
</div>

                    <div>
                      <span className="text-gray-600">Statut :</span>
                      <Badge className="ml-2" variant="success">
                        {selectedReceipt.status === 'closed' ? 'Clôturée' : 'Ouverte'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Date ouverture :</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedReceipt.opening_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date clôture :</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedReceipt.closing_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Résumé des encaissements */}
              <div>
                <h3 className="font-bold mb-3">Résumé des encaissements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Espèces</p>
                        <p className="text-lg font-bold">
                          {parseFloat(selectedReceipt.amounts.cash).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </div>
                      <Wallet className="h-8 w-8 text-purple-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Mobile Money</p>
                        <p className="text-lg font-bold">
                          {parseFloat(selectedReceipt.amounts.mobile_money).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </div>
                      <Smartphone className="h-8 w-8 text-orange-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Chèque</p>
                        <p className="text-lg font-bold">
                          {parseFloat(selectedReceipt.amounts.check).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Virement</p>
                        <p className="text-lg font-bold">
                          {parseFloat(selectedReceipt.amounts.bank_transfer).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">FCFA</p>
                      </div>
                      <Building2 className="h-8 w-8 text-green-500" />
                    </div>
                  </Card>
                </div>

                <Card className="mt-4 bg-blue-50 border-blue-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-medium">TOTAL ENCAISSÉ</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {parseFloat(selectedReceipt.amounts.total).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">FCFA</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Liste des transactions */}
              <div>
                <h3 className="font-bold mb-3">
                  Transactions ({selectedReceipt.total_transactions})
                </h3>
                <Card>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Heure</TableHead>
                          <TableHead>Facture</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReceipt.transactions.map((transaction, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {format(new Date(transaction.time), 'HH:mm', { locale: fr })}
                            </TableCell>
                            <TableCell className="font-mono">
                              {transaction.invoice_number}
                            </TableCell>
                            <TableCell>{transaction.consumer}</TableCell>
                            <TableCell className="font-medium">
                              {parseFloat(transaction.amount).toLocaleString()} FCFA
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.payment_method === 'cash' && 'Espèces'}
                                {transaction.payment_method === 'mobile_money' && 'Mobile Money'}
                                {transaction.payment_method === 'check' && 'Chèque'}
                                {transaction.payment_method === 'bank_transfer' && 'Virement'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>

              {/* Bouton télécharger */}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    handleDownloadReport(selectedReceiptId, selectedReceipt.receipt_number);
                    setShowDetailsModal(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le rapport PDF
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashRegisterHistory;