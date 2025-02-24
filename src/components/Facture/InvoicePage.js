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

// Modal de génération de facture
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

// Composant principal
const InvoicePage = () => {
  const { toast } = useToast();
  
  // États
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [validatedReadings, setValidatedReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  

  // États de la période
  // Dans InvoicePage
const [dateRange, setDateRange] = useState([
  (() => {
    const date = new Date('2024-01-01');
    //const date = new Date();
    //date.setMonth(date.getMonth() - 1); // Mois dernier
    //date.setDate(1); // Premier jour du mois
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

  // Chargement des données
  const fetchInvoices = async () => {
    
    try {
      setLoading(true);
      const response = await api.get('/invoices', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
        
      });
      console.log('khaly Données des factures récupérées :', response.data.data);
     
      setInvoices(response.data.data);


    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les factures"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchValidatedReadings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/readings/validated-not-invoiced');
      setValidatedReadings(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les relevés disponibles"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [dateRange, statusFilter]);

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
      fetchInvoices();
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
      fetchInvoices();
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
      fetchInvoices();
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

  // Interface
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
        
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

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                fetchValidatedReadings();
                setIsGenerateModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Générer
            </Button>

           

          </div>
        </div>
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
              {/*<TableHead>Ancien Index</TableHead>*/}
              {/*<TableHead>Nouvel Index</TableHead>*/}
              <TableHead>Consommation (m³)</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Échéance</TableHead>
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

              {/*<TableHead>Ancien Index</TableHead>
                <TableCell>
                  {invoice.reading?.last_reading_value ? 
                    parseFloat(invoice.reading.last_reading_value).toFixed(2) : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {invoice.reading?.reading_value ? 
                    parseFloat(invoice.reading.reading_value).toFixed(2) : 
                    'N/A'}
                </TableCell>

                */}

                <TableCell>
                  {invoice.reading?.consumption ? 
                    parseFloat(invoice.reading.consumption).toFixed(2) : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {invoice.amount_due ? 
                    Math.round(invoice.amount_due).toLocaleString() : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {`${format(new Date(invoice.start_date), 'dd/MM/yy')} au ${format(new Date(invoice.end_date), 'dd/MM/yy')}`}
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={invoice.status === 'paid' ? 'success' : 'warning'}
                  >
                    {invoice.status === 'paid' ? 'Payé' : 'Non payé'}
                  </Badge>
                </TableCell>

                <TableCell>
  <div className="flex space-x-2">
    
    {/* Voir les détails */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setCurrentInvoice(invoice);
        console.log('Current invoice:', invoice);
        setIsViewModalOpen(true);
      }}
    >
      <FileText className="h-4 w-4" />
    </Button>



{/* Télécharger PDF - Changé l'icône et l'action */}

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


    {/* Marquer comme payé - Nouvelle action */}
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
        {Math.round(
          invoices.reduce((sum, invoice) => 
            sum + (invoice.amount_due || 0), 0)
        ).toLocaleString()} FCFA
      </TableCell>
      <TableCell colSpan={2}></TableCell>
    </TableRow>
  )}

          </TableBody>
        </Table>
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