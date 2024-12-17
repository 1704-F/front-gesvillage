import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from 'lucide-react';
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
import { Badge } from "../ui/badge";
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
import { 
  Plus, 
  FileText, 
  Pencil, 
  Trash2,
  Calculator
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../utils/axios';

// Composant pour les détails de calcul
const ConsumptionDetails = ({ consumption, servicePricing }) => {
  if (!consumption || !servicePricing) return null;

  const { threshold, base_price, extra_price } = servicePricing;
  const baseConsumption = Math.min(consumption, threshold);
  const extraConsumption = Math.max(0, consumption - threshold);
  const baseAmount = baseConsumption * base_price;
  const extraAmount = extraConsumption * extra_price;
  const totalAmount = baseAmount + extraAmount;

  return (
    <div className="mt-4 bg-blue-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Détails de la consommation
        </h3>
        <div className="text-lg font-bold text-blue-700">
          {Math.round(totalAmount).toLocaleString()} FCFA
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 space-y-4">
        <div className="pb-3 border-b">
          <span className="text-sm text-gray-500">Consommation totale</span>
          <div className="text-2xl font-semibold">{consumption.toFixed(2)} m³</div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-medium">Première tranche (0 - {threshold} m³)</div>
            <div className="ml-4 text-gray-600">
              <div>{baseConsumption.toFixed(2)} m³ × {base_price} FCFA/m³</div>
              <div className="font-medium text-black">
                = {Math.round(baseAmount).toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {extraConsumption > 0 && (
            <div>
              <div className="font-medium">Deuxième tranche ({threshold}+ m³)</div>
              <div className="ml-4 text-gray-600">
                <div>{extraConsumption.toFixed(2)} m³ × {extra_price} FCFA/m³</div>
                <div className="font-medium text-black">
                  = {Math.round(extraAmount).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant modal de génération de facture
const GenerateInvoiceDialog = ({ 
  open, 
  onOpenChange, 
  meters, 
  onGenerate,
  servicePricing 
}) => {
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [error, setError] = useState(null); // Nouvel état pour l'erreur

  const handleGenerate = async (meterId) => {
    try {
      setError(null); // Réinitialiser l'erreur
      await onGenerate(meterId);
      onOpenChange(false);
    } catch (error) {
      console.log('Erreur reçue:', error.response?.data); // Pour debug


       // Si c'est une erreur de facture existante
    if (error.response?.data?.details?.existingInvoice) {
      const details = error.response.data.details.existingInvoice;
      setError(
        <div className="space-y-2">
          <p className="font-medium text-red-700">Une facture existe déjà pour ce compteur sur cette période :</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>N° Facture : {details.invoice_number}</li>
            <li>Période : {details.period}</li>
            <li>Consommateur : {details.consumer}</li>
            <li>Statut : {details.status === 'paid' ? 'Payée' : 'Non payée'}</li>
          </ul>
        </div>
      );
    } else {
      setError(error.response?.data?.message || "Une erreur est survenue lors de la génération de la facture.");
    }
  }
};

  const getConsumption = (meter) => {
    if (!meter?.lastReading) return null;
    return parseFloat(meter.lastReading.reading_value) - parseFloat(meter.lastReading.last_reading_value);
  };

  const selectedMeterData = meters.find(m => m.id === selectedMeter);
  const consumption = selectedMeterData ? getConsumption(selectedMeterData) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Générer une facture</DialogTitle>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}



        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sélectionner un compteur</label>
            <Select value={selectedMeter} onValueChange={setSelectedMeter}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un compteur" />
              </SelectTrigger>
              <SelectContent>
                {meters.map((meter) => {
                  const reading = meter.lastReading;
                  if (!reading) return null;
                  
                  return (
                    <SelectItem key={meter.id} value={meter.id}>
                      <div className="flex flex-col">
                        <span>
                          {meter.meter_number} - {meter.user?.first_name} {meter.user?.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          Dernier relevé: {reading.reading_value} m³ ({format(new Date(reading.reading_date), 'dd/MM/yyyy')})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedMeter && consumption && (
            <ConsumptionDetails
              consumption={consumption}
              servicePricing={servicePricing}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setError(null); // Réinitialiser l'erreur à la fermeture
              onOpenChange(false);
            }}

          >
            Annuler
          </Button>
          <Button 
             onClick={() => handleGenerate(selectedMeter)}
             disabled={!selectedMeter}
          >
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Composant modal de modification de facture
const EditInvoiceDialog = ({ 
  open, 
  onOpenChange, 
  invoice, 
  onSubmit 
}) => {
  const [status, setStatus] = useState(invoice?.status || 'pending');
  const [description, setDescription] = useState(invoice?.description || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="pending">Non payé</SelectItem>
              
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              onSubmit({ status, description });
              onOpenChange(false);
            }}
          >
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Composant principal de la page
const InvoicePage = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [servicePricing, setServicePricing] = useState(null);

  // États pour les modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // ... suite du composant InvoicePage

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined
        }
      });
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

  const fetchMeters = async () => {
    try {
      const response = await api.get('/readings/meters/active/validated');
      const metersWithValidatedReadings = response.data.data.map(meter => ({
        ...meter,
        lastReading: meter.readings[meter.readings.length - 1]
      }));
      setMeters(metersWithValidatedReadings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les compteurs"
      });
    }
  };

  const handleGenerateInvoice = async (meterId) => {
    try {
      const response = await api.post(`/invoices/generate/${meterId}`);
      toast({
        title: "Succès",
        description: "Facture générée avec succès"
      });
      fetchInvoices();
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw error; // Renvoyer l'erreur pour que le dialog puisse l'afficher
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la génération de la facture"
        });
      }
    }
  };

  const handleGenerateAllInvoices = async () => {
    try {
      const response = await api.post('/invoices/generate/service');
      
      if (response.data.data?.length > 0) {
        toast({
          title: "Succès",
          description: `${response.data.data.length} factures ont été générées`
        });
      } else {
        toast({
          variant: "warning",
          title: "Attention",
          description: "Aucune facture n'a été générée"
        });
      }
      
      fetchInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la génération des factures"
      });
    }
  };

  const handleUpdateInvoice = async (data) => {
    try {
      await api.patch(`/invoices/${currentInvoice.id}/status`, data);
      toast({
        title: "Succès",
        description: "Facture mise à jour avec succès"
      });
      fetchInvoices();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la facture"
      });
    }
  };

  const handleDeleteInvoice = async () => {
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
        description: "Erreur lors de la suppression de la facture"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCurrentInvoice(null);
    }
  };

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

// Modifiez la fonction handleViewInvoice
const handleViewInvoice = (invoice) => {
  setCurrentInvoice(invoice);
  setIsViewModalOpen(true);
};

  
// Ajoutez ce composant pour la visualisation
const ViewInvoiceDialog = ({ open, onOpenChange, invoice }) => {
  if (!invoice) return null;
  
  const reading = invoice.meter?.readings?.[0];
  const consumption = reading ? parseFloat(reading.consumption) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Facture {invoice.invoice_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Compteur:</span> {invoice.meter?.meter_number}
            </div>
            <div>
              <span className="font-medium">Consommateur:</span> {
                invoice.meter?.user ? 
                `${invoice.meter.user.first_name} ${invoice.meter.user.last_name}` : 
                'N/A'
              }
            </div>
            <div>
              <span className="font-medium">Période:</span> {
                `${format(new Date(invoice.start_date), 'dd/MM/yyyy')} au ${format(new Date(invoice.end_date), 'dd/MM/yyyy')}`
              }
            </div>
            <div>
              <span className="font-medium">Date d'échéance:</span> {
                format(new Date(invoice.due_date), 'dd/MM/yyyy')
              }
            </div>
          </div>

          <ConsumptionDetails
            consumption={consumption}
            servicePricing={servicePricing}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const pricingResponse = await api.get('/service-pricing/current');
        setServicePricing(pricingResponse.data.data);
      } catch (error) {
        console.error('Erreur lors du chargement de la tarification:', error);
      }
    };

    fetchInitialData();
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="unpaid">Non payé</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                fetchMeters();
                setIsGenerateModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Générer une facture
            </Button>

            <Button variant="secondary" onClick={handleGenerateAllInvoices}>
              <FileText className="h-4 w-4 mr-2" />
              Générer toutes
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Compteur</TableHead>
              <TableHead>Consommateur</TableHead>
              <TableHead>Ancien Index</TableHead>
              <TableHead>Nouvel Index</TableHead>
              <TableHead>Consommation (m³)</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>

                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.meter?.meter_number}</TableCell>
                <TableCell>
                  {invoice.meter?.user ? 
                    `${invoice.meter.user.first_name} ${invoice.meter.user.last_name}` : 
                    'N/A'}
                </TableCell>
                <TableCell>
  {invoice.meter?.readings?.[0]?.last_reading_value ? 
    parseFloat(invoice.meter.readings[0].last_reading_value).toFixed(2) : 
    'N/A'}
</TableCell>
<TableCell>
  {invoice.meter?.readings?.[0]?.reading_value ? 
    parseFloat(invoice.meter.readings[0].reading_value).toFixed(2) : 
    'N/A'}
</TableCell>
<TableCell>
  {invoice.meter?.readings?.[0]?.consumption ? 
    parseFloat(invoice.meter.readings[0].consumption).toFixed(2) : 
    'N/A'}
</TableCell>
                <TableCell>
                  {Math.round(invoice.amount_due).toLocaleString()}
                </TableCell>
                <TableCell>
                  {`${format(new Date(invoice.start_date), 'dd/MM/yy')} au ${format(new Date(invoice.end_date), 'dd/MM/yy')}`}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      invoice.status === 'paid' ? 'success' : 
                      invoice.status === 'pending' ? 'warning' : 
                      'destructive'
                    }
                  >
                    {invoice.status === 'paid' ? 'Payé' : 
                     invoice.status === 'pending' ? 'Non payé' : 
                     ''}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentInvoice(invoice);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCurrentInvoice(invoice);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <GenerateInvoiceDialog
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        meters={meters}
        onGenerate={handleGenerateInvoice}
        servicePricing={servicePricing}
      />

      <EditInvoiceDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        invoice={currentInvoice}
        onSubmit={handleUpdateInvoice}
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
            <AlertDialogAction onClick={handleDeleteInvoice}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InvoicePage;