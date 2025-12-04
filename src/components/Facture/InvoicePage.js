import React, { useState, useEffect } from 'react';
import { cn } from "../lib/utils";
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../ui/toast/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Plus, FileText, Download, Pencil, Trash2, FileSpreadsheet, AlertCircle, Calculator, Calendar,Check } from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';
import InvoicePDF from '../Service/InvoicePDF';

import { Users, XCircle, Search } from 'lucide-react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    orientation: 'landscape',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  dateRange: {
    marginBottom: 10,
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});

const formatNumber = (num, decimals = 0) => {
  if (isNaN(num) || num === null || num === undefined) return '0';

  const number = typeof num === 'string' ? parseFloat(num) : num;

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  }).format(number)
    .replace(/\//g, ' ')     // Remplacer toutes les barres par des espaces
    .replace(/\s+/g, ' ');   // Normaliser les espaces multiples
};

// Helper pour afficher le nom du consommateur (gère les deux formats: name ou first_name/last_name)
const getConsumerDisplayName = (consumer) => {
  if (!consumer) return '';
  // Si le champ name existe et n'est pas vide, l'utiliser
  if (consumer.name && consumer.name.trim()) {
    return consumer.name;
  }
  // Sinon utiliser first_name et last_name
  const firstName = consumer.first_name || '';
  const lastName = consumer.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Consommateur inconnu';
};

// Composant ConsumptionDetails
const ConsumptionDetails = ({ reading, amount }) => {
  if (!reading) return null;

  const consumption = reading.consumption ? parseFloat(reading.consumption) : 0;
  const lastReadingValue = reading.last_reading_value ? parseFloat(reading.last_reading_value) : 0;
  const readingValue = reading.reading_value ? parseFloat(reading.reading_value) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Détails
        </h3>
        <div className="text-lg font-bold text-blue-700">
          {Math.round(amount).toLocaleString()} FCFA
        </div>
      </div>

      <div className="bg-white rounded-md p-4 space-y-4">
        <div className="pb-3 border-b">
          <div className="text-sm font-medium text-gray-500">Consommation totale</div>
          <div className="text-2xl font-semibold">{consumption.toFixed(2)} m³</div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="font-medium">Relevé</div>
            <div className="pl-3 text-sm text-gray-600">
              <div>Ancien index : {lastReadingValue.toFixed(2)} m³</div>
              <div>Nouvel index : {readingValue.toFixed(2)} m³</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de génération de facture avec scroll
const GenerateInvoiceDialog = ({
  open,
  onOpenChange,
  readings,
  onGenerate
}) => {
  const [selectedReadings, setSelectedReadings] = useState([]);
  const [error, setError] = useState(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Générer des factures</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                            setSelectedReadings(readings.map(r => r.id));
                          } else {
                            setSelectedReadings([]); 
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Compteur</TableHead>
                    <TableHead>Consommateur</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Consommation (m³)</TableHead>
                    <TableHead>Montant (FCFA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedReadings.includes(reading.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReadings(prev => [...prev, reading.id]);
                            } else {
                              setSelectedReadings(prev => prev.filter(id => id !== reading.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{reading.meter.meter_number}</TableCell>
                      <TableCell>
                        {reading.meter.user.first_name} {reading.meter.user.last_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(reading.start_date), 'dd/MM/yy')} au {format(new Date(reading.end_date), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell>
                        {parseFloat(reading.consumption).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {parseFloat(reading.amount).toLocaleString()} 
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-4 pt-2 border-t">
          <div className="text-sm">
            {selectedReadings.length} relevé(s) sélectionné(s) sur {readings.length}
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                onOpenChange(false);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => onGenerate(selectedReadings)}
              disabled={selectedReadings.length === 0}
            >
              Générer {selectedReadings.length} facture(s)
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};


// Modal de visualisation de facture
const ViewInvoiceDialog = ({ open, onOpenChange, invoice }) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Facture :  {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compteur</label>
              <div>{invoice.meter.meter_number}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">N° Série</label>
              <div>{invoice.meter.serial_number || 'Pas de Numéro'}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Consommateur</label>
              <div>{invoice.meter.user.first_name} {invoice.meter.user.last_name}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <div>
                {format(new Date(invoice.start_date), 'dd/MM/yyyy')} au {format(new Date(invoice.end_date), 'dd/MM/yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'échéance</label>
              <div>{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</div>
            </div>
          </div>

          <ConsumptionDetails
            reading={invoice.reading}
            amount={invoice.amount_due}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>

          


          <Button 
  
  size="sm"
  onClick={async () => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error:', error);
    }
  }}
>
  <Download className="w-4 h-4 mr-2" />
  Télécharger
</Button>




        </DialogFooter>
      </DialogContent> 
    </Dialog>
  );
};

const InvoiceListPDF = ({ invoices, dateRange, statusFilter, consumerFilter }) => {
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!a.meter || !b.meter) return 0;
    return a.meter.meter_number.localeCompare(b.meter.meter_number);
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>Liste des Factures</Text>
        
        <Text style={styles.dateRange}>
          Période du {format(dateRange[0], 'dd/MM/yyyy')} au {format(dateRange[1], 'dd/MM/yyyy')}
        </Text>

        {statusFilter !== 'all' && (
          <Text style={styles.dateRange}>
            Statut: {statusFilter === 'paid' ? 'Payé' : 'Non payé'}
          </Text>
        )}
        
        {consumerFilter && (
          <Text style={styles.dateRange}>
            Consommateur: {getConsumerDisplayName(consumerFilter)}
          </Text>
        )}

        <View style={styles.table}>
          {/* En-têtes MODIFIÉS - Ajout de la date de paiement */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>N°</Text>
            <Text style={styles.tableCell}>N° Facture</Text>
            <Text style={styles.tableCell}>Compteur</Text>
            <Text style={styles.tableCell}>Consommateur</Text>
            <Text style={styles.tableCell}>Consommation (m³)</Text>
            <Text style={styles.tableCell}>Montant (FCFA)</Text>
            <Text style={styles.tableCell}>Période</Text>
            <Text style={styles.tableCell}>Échéance</Text>
            <Text style={styles.tableCell}>Date de paiement</Text>
            <Text style={styles.tableCell}>Statut</Text>
          </View>

          {/* Données MODIFIÉES - Ajout de la date de paiement */}
          {sortedInvoices.map((invoice, index) => (
            <View key={invoice.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text>
              <Text style={styles.tableCell}>{invoice.invoice_number}</Text>
              <Text style={styles.tableCell}>{invoice.meter?.meter_number}</Text>
              <Text style={styles.tableCell}>
                {invoice.meter?.user ? 
                  `${invoice.meter.user.first_name} ${invoice.meter.user.last_name}` : 
                  'N/A'}
              </Text>
              <Text style={styles.tableCell}>
                {invoice.reading?.consumption ? 
                  parseFloat(invoice.reading.consumption).toFixed(2) : 
                  'N/A'}
              </Text>
              <Text style={styles.tableCell}>
                {invoice.amount_due ? 
                  formatNumber(Math.round(invoice.amount_due)) : 
                  'N/A'}
              </Text>
              <Text style={styles.tableCell}>
                {`${format(new Date(invoice.start_date), 'dd/MM/yy')} au ${format(new Date(invoice.end_date), 'dd/MM/yy')}`}
              </Text>
              <Text style={styles.tableCell}>
                {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
              </Text>
              {/* NOUVELLE COLONNE - Date de paiement */}
              <Text style={styles.tableCell}>
                {invoice.payment_date ? 
                  format(new Date(invoice.payment_date), 'dd/MM/yyyy') : 
                  '-'}
              </Text>
              <Text style={styles.tableCell}>
                {invoice.status === 'paid' ? 'Payé' : 'Non payé'}
              </Text>
            </View>
          ))}
        </View>

        {/* Résumé inchangé */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
            Résumé: {sortedInvoices.length} facture(s)
          </Text>
          <Text style={{ fontSize: 10 }}>
            Total consommation: {sortedInvoices.reduce((sum, inv) => 
              sum + parseFloat(inv.reading?.consumption || 0), 0).toFixed(2)} m³
          </Text>
          <Text style={{ fontSize: 10 }}>
            Total montant: {formatNumber(Math.round(sortedInvoices.reduce((sum, inv) => 
              sum + (inv.amount_due || 0), 0)))} FCFA
          </Text>
        </View>
      </Page>
    </Document>
  );
};



// Composant principal
const InvoicePage = () => {
  const { toast } = useToast();
  
  // États
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [validatedReadings, setValidatedReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);



   // Ajouter ces états à votre composant InvoicePage
const [consumerFilter, setConsumerFilter] = useState(null);
const [consumerSearchQuery, setConsumerSearchQuery] = useState("");
const [consumerSearchResults, setConsumerSearchResults] = useState([]);
const [isSearchingConsumers, setIsSearchingConsumers] = useState(false);
const [isSearchOpen, setIsSearchOpen] = useState(false);

const [statistics, setStatistics] = useState({
  total_count: 0,
  pending_count: 0,
  paid_count: 0,
  total_amount_due: 0,
  pending_amount: 0,
  paid_amount: 0
});

const [totalItems, setTotalItems] = useState(0);
const [totalPages, setTotalPages] = useState(1);

  

  // États de la période
  // Dans InvoicePage
const [dateRange, setDateRange] = useState([
  (() => {
    
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Mois dernier 
    date.setDate(1); // Premier jour du mois
    date.setHours(0, 0, 0, 0);
    return date;
  })(),
  (() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  })()
]);
  // États des filtres
  const [statusFilter, setStatusFilter] = useState('all');

  // États des modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const [exportLoading, setExportLoading] = useState(false);

  // Chargement des données
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invoices/dashboard', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          status: statusFilter !== 'all' ? statusFilter : undefined,
          consumer_id: consumerFilter?.id,
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      const data = response.data.data;
     
      
      // Mettre à jour tous les états avec les données
      setInvoices(data.invoices);
      setValidatedReadings(data.validatedReadings);
      setStatistics(data.statistics);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les données du tableau de bord"
      });
    } finally {
      setLoading(false);
    }
  };
 

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchConsumers(consumerSearchQuery);
    }, 300);
  
    return () => clearTimeout(delayDebounceFn);
  }, [consumerSearchQuery]);


  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, statusFilter, consumerFilter, currentPage, itemsPerPage]);
  
 

  // Handlers
  const handleGenerateInvoices = async (readingIds) => {
    try {
      console.log('Reading IDs:', readingIds); // Pour debug
      const response = await api.post('/invoices/generate', {
        reading_ids: readingIds // Assurez-vous que c'est un tableau
      });
      toast({
        title: "Succès",
        description: "Factures générées avec succès"
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la génération des factures"
      });
    }
  };

  const handleUpdateStatus = async (invoiceId, status) => {
    try {
      await api.patch(`/invoices/${invoiceId}/status`, { status });
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès"
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${currentInvoice.id}`);
      toast({
        title: "Succès",
        description: "Facture supprimée avec succès" 
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la facture"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentInvoice(null);
    }
  };

  const handleBulkExport = async () => {
    try {
      const link = `${api.defaults.baseURL}/invoices/bulk-pdf`;
      const response = await api.post(link, {
        invoice_ids: selectedInvoices
      }, {
        responseType: 'blob'  // Important pour recevoir le PDF
      });
  
      // Créer un blob et le télécharger
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'factures.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'export des factures"
      });
    }
  };

  const handleExportPeriodInvoices = async () => {
    try {
      // Vérifier si des dates sont sélectionnées
      if (!dateRange[0] || !dateRange[1]) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Veuillez sélectionner une période pour l'export"
        });
        return;
      }
  
      setExportLoading(true);
  
      // Formater les dates
      const startDate = format(dateRange[0], 'yyyy-MM-dd');
      const endDate = format(dateRange[1], 'yyyy-MM-dd');
      
      // Approche alternative avec la responseType blob
      try {
        const response = await api.get(`/invoices/export-period`, {
          params: {
            start_date: startDate,
            end_date: endDate
          },
          responseType: 'blob'
        });
        
        // Déterminer le type de contenu et le nom du fichier en fonction du Content-Type
        const contentType = response.headers['content-type'];
        let fileName, fileType;
        
        if (contentType === 'application/zip') {
          fileName = `Factures_${startDate}_${endDate}.zip`;
          fileType = 'application/zip';
        } else {
          // Par défaut, on considère que c'est un PDF
          fileName = `Factures_${startDate}_${endDate}.pdf`;
          fileType = 'application/pdf';
        }
        
        console.log('Téléchargement du fichier:', fileName, 'type:', fileType);
        
        // Créer un lien de téléchargement avec le type et le nom corrects
        const blob = new Blob([response.data], { type: fileType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Succès",
          description: "Export des factures terminé"
        });
      } catch (error) {
        console.error("Erreur lors de l'export:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'exporter les factures pour cette période"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des factures:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'exporter les factures pour cette période"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const searchConsumers = async (query) => {
    if (!query || query.length < 2) {
      setConsumerSearchResults([]);
      return;
    }

    setIsSearchingConsumers(true);
    try {
      // Le backend gère maintenant la recherche multi-mots
      const response = await api.get('/invoices/search-consumers', {
        params: { query }
      });
      setConsumerSearchResults(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche des consommateurs:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de rechercher les consommateurs"
      });
    } finally {
      setIsSearchingConsumers(false);
    }
  };
  


  // Interface
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
      </div>

      <div className="flex items-center justify-between mt-4 mb-4">
  {/* Filtres à gauche */}
  <div className="flex items-center space-x-4">
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

    <Select 
      value={statusFilter} 
      onValueChange={setStatusFilter}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous</SelectItem>
        <SelectItem value="paid">Payé</SelectItem>
        <SelectItem value="pending">Non payé</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Boutons à droite */}
  <div className="flex items-center space-x-2">
    {/* NOUVEAU : Bouton PDF de la liste */}
    <PDFDownloadLink
      document={
        <InvoiceListPDF 
          invoices={invoices} 
          dateRange={dateRange}
          statusFilter={statusFilter}
          consumerFilter={consumerFilter}
        />
      }
      fileName={`liste-factures-${format(dateRange[0], 'dd-MM-yyyy')}-au-${format(dateRange[1], 'dd-MM-yyyy')}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Génération...' : 'Exporter la liste'}
        </Button>
      )}
    </PDFDownloadLink>

    

    <Button 
      variant="outline"
      onClick={handleExportPeriodInvoices}
      disabled={exportLoading}
    >
      {exportLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
          Export...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Exporter Facture
        </>
      )}
    </Button>

    <Button
      onClick={() => {
        fetchDashboardData().then(() => {
          setIsGenerateModalOpen(true);
        });
      }}
    >
      <Plus className="h-4 w-4 mr-2" />
      Générer
    </Button>

  </div>
</div>
        
      
      

      <div className="flex items-center space-x-4 mt-2 pb-4 w-full">
  <div className="flex-1 relative">
    <div className="relative">

  
<Popover open={isSearchOpen || (consumerSearchQuery.length > 1 && consumerSearchResults.length > 0)} onOpenChange={setIsSearchOpen}>
  <PopoverTrigger asChild>
    <Button 
      variant="outline" 
      role="combobox" 
      className="w-full justify-between"
      onClick={() => setIsSearchOpen(true)}
    >
      <div className="flex items-center">
        <Users className="h-4 w-4 mr-2" />
        {consumerFilter ? getConsumerDisplayName(consumerFilter) : "Rechercher un consommateur..."}
      </div>
      <Search className="h-4 w-4 ml-2 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[400px] p-0" align="start">
    <div className="p-2">
      <Input 
        placeholder="Rechercher un consommateur..." 
        value={consumerSearchQuery}
        onChange={(e) => setConsumerSearchQuery(e.target.value)}
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
    setConsumerSearchQuery("");
    setIsSearchOpen(false);
  }}
>
  <Users className="h-4 w-4 mr-2 text-blue-500" />
  <span>{getConsumerDisplayName(consumer)}</span>
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
        ) : consumerSearchQuery.length > 1 ? (
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
  </div>

  {/* Affichage du filtre actif */}
  {consumerFilter && (
    <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
      <span className="mr-2 text-sm font-medium">
        Filtré par: {getConsumerDisplayName(consumerFilter)}
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

     



      <Card>
        <Table>

          <TableHeader>
  <TableRow>
    <TableHead className="w-12">
      <Checkbox 
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedInvoices(invoices.map(invoice => invoice.id));
          } else {
            setSelectedInvoices([]);
          }
        }}
      />
    </TableHead>
    <TableHead>N° Facture</TableHead>
    <TableHead>Compteur</TableHead>
    <TableHead>Consommateur</TableHead>
    <TableHead>Consommation (m³)</TableHead>
    <TableHead>Montant (FCFA)</TableHead>
    <TableHead>Période</TableHead>
    <TableHead>Échéance</TableHead>
    <TableHead>Date de paiement</TableHead> {/* NOUVELLE COLONNE */}
    <TableHead>Statut</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>

          

          <TableBody>

          {invoices.map((invoice) => (
  <TableRow 
    key={invoice.id}
    className={invoice.status === 'paid' ? 'bg-green-50/50' : ''}
  >
    <TableCell>
      <Checkbox 
        checked={selectedInvoices.includes(invoice.id)}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedInvoices(prev => [...prev, invoice.id]);
          } else {
            setSelectedInvoices(prev => prev.filter(id => id !== invoice.id));
          }
        }}
      />
    </TableCell>
    <TableCell>{invoice.invoice_number}</TableCell>
    <TableCell>{invoice.meter?.meter_number}</TableCell>
    <TableCell>
      {invoice.meter?.user ? 
        `${invoice.meter.user.first_name} ${invoice.meter.user.last_name}` : 
        'N/A'}
    </TableCell>
    <TableCell>
      {invoice.reading?.consumption ? 
        parseFloat(invoice.reading.consumption).toFixed(2) : 
        'N/A'}
    </TableCell>
    <TableCell>
      {invoice.amount_due ? 
        formatNumber(Math.round(invoice.amount_due)) : 
        'N/A'}
    </TableCell>
    <TableCell>
      {`${format(new Date(invoice.start_date), 'dd/MM/yy')} au ${format(new Date(invoice.end_date), 'dd/MM/yy')}`}
    </TableCell>
    <TableCell>
      {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
    </TableCell>
    {/* NOUVELLE CELLULE - Date de paiement */}
    <TableCell>
      {invoice.payment_date ? (
        <span className="text-green-600 font-medium">
          {format(new Date(invoice.payment_date), 'dd/MM/yyyy')}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      )}
    </TableCell>
    <TableCell>
      <Badge 
        variant={invoice.status === 'paid' ? 'success' : 'warning'}
      >
        {invoice.status === 'paid' ? 'Payé' : 'Non payé'}
      </Badge>
    </TableCell>
    <TableCell>
      {/* Actions inchangées */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentInvoice(invoice);
            setIsViewModalOpen(true);
          }}
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={async () => {
            try {
              const response = await api.get(`/invoices/${invoice.id}/pdf`, {
                responseType: 'blob'
              });
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `facture-${invoice.invoice_number}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (error) {
              console.error('Error:', error);
            }
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUpdateStatus(invoice.id, 'paid')}
          disabled={invoice.status === 'paid'}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setCurrentInvoice(invoice);
            setIsDeleteDialogOpen(true);
          }}
          disabled={invoice.status === 'paid'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
))}

  {/* Nouvelle ligne de total avec correction */}
  {invoices.length > 0 && (
  <TableRow className="font-bold bg-gray-50">
    <TableCell colSpan={4} className="text-right">Total</TableCell>
    <TableCell>
      {parseFloat(
        invoices.reduce((sum, invoice) => 
          sum + parseFloat(invoice.reading?.consumption || 0), 0)
      ).toFixed(2)} m³
    </TableCell>
    <TableCell>
      {formatNumber(Math.round(
        invoices.reduce((sum, invoice) => 
          sum + (invoice.amount_due || 0), 0)
      ))} FCFA
    </TableCell>
    <TableCell colSpan={4}></TableCell> {/* Augmenté de 3 à 4 pour inclure la nouvelle colonne */}
  </TableRow>
)}

          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 px-2">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Lignes par page:</span>
    <Select
      value={String(itemsPerPage)}
      onValueChange={(value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-[70px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value="100">100</SelectItem>
        <SelectItem value="500">500</SelectItem>
        <SelectItem value="1000">1000</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex items-center gap-2">
  <span className="text-sm text-gray-600">
    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
  </span>
   
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Précédent
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages || totalPages === 0}
    >
      Suivant
    </Button>
  </div>


</div>


      </Card>

      <GenerateInvoiceDialog
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        readings={validatedReadings}
        onGenerate={handleGenerateInvoices}
      />

      <ViewInvoiceDialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        invoice={currentInvoice}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoicePage;