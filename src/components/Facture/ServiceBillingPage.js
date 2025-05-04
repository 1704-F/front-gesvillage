import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Card } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Alert,
  AlertDescription
} from "../ui/alert";


import { 
  Download, FileText, Trash2, Plus, Calendar, Check, AlertCircle 
} from 'lucide-react';
import { useToast } from '../ui/toast/use-toast';
import { axiosPrivate as api } from '../../utils/axios';


// Composant de détails de la facture
const ServiceBillingDetails = ({ billing }) => {
  if (!billing) return null;

  // Recalculer le total pour s'assurer que tous les frais sont inclus
  const calculatedTotal = (
    (billing.base_price || 0) + 
    (billing.mobile_app_fee || 0) - 
    (billing.discount_amount || 0)
  );

  // Utiliser le total calculé ou le total fourni par l'API
  const totalToDisplay = calculatedTotal || billing.total_due;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Détails de la facturation</h3>
        <div className="text-lg font-bold text-blue-700">
          {Math.round(totalToDisplay).toLocaleString()} FCFA
        </div>
      </div>

      <div className="bg-white rounded-md p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Formule</div>
            <div className="font-semibold">{billing.plan_name}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Type</div>
            <div className="font-semibold">
              {billing.plan_type === 'autonomie' ? 'Autonomie' : 'Support Plus'}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="font-medium">Détail du calcul</div>
          <div className="pl-3 mt-2 space-y-2">
            <div className="flex justify-between">
              <span>Forfait de base ({billing.total_meters < 500 ? '0-499' : '500+'} compteurs)</span>
              <span>{Math.round(billing.base_price).toLocaleString()} FCFA</span>
            </div>
            {billing.mobile_app_fee > 0 && (
              <div className="flex justify-between">
                <span>Utilisation de l'application mobile</span>
                <span>{Math.round(billing.mobile_app_fee).toLocaleString()} FCFA</span>
              </div>
            )}
            {billing.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Remise{billing.discount_reason ? ` (${billing.discount_reason})` : ''}</span>
                <span>-{Math.round(billing.discount_amount).toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>{Math.round(totalToDisplay).toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de génération de facture
const GenerateInvoiceDialog = ({ open, onOpenChange, services, onGenerate }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [billingDate, setBillingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [error, setError] = useState(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Générer des factures de service</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 flex-grow overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <Card className="p-4 h-full">
            <div className="max-h-[50vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices(services.map(s => s.id));
                          } else {
                            setSelectedServices([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Formule</TableHead>
                    <TableHead>Compteurs</TableHead>
                    <TableHead>App Mobile</TableHead>
                    <TableHead>Remise</TableHead>
                    <TableHead>Montant estimé</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedServices(prev => [...prev, service.id]);
                            } else {
                              setSelectedServices(prev => prev.filter(id => id !== service.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.plan?.name || 'Non définie'}</TableCell>
                      <TableCell>{service.meters_count || 0}</TableCell>
                      <TableCell>
                        {service.app_authorized ? 
                          <Badge variant="success">Activée</Badge> : 
                          <Badge variant="outline">Non</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {service.discount_amount > 0 ? 
                          `${service.discount_amount.toLocaleString()} FCFA` : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {service.estimated_invoice ? 
                          `${Math.round(service.estimated_invoice).toLocaleString()} FCFA` : 
                          'N/A'
                        }
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
            {selectedServices.length} service(s) sélectionné(s) sur {services.length}
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
              onClick={() => onGenerate(selectedServices, billingDate)}
              disabled={selectedServices.length === 0}
            >
              Générer {selectedServices.length} facture(s)
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Modal de visualisation de facture
const ViewInvoiceDialog = ({ open, onOpenChange, billing }) => {
  if (!billing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Facture : {billing.reference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <div>{billing.service?.name || 'N/A'}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de compteurs</label>
              <div>{billing.total_meters}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <div>
                {format(new Date(billing.billing_period_start), 'dd/MM/yyyy')} au {format(new Date(billing.billing_period_end), 'dd/MM/yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'échéance</label>
              <div>{format(new Date(billing.due_date), 'dd/MM/yyyy')}</div>
            </div>
          </div>

          <ServiceBillingDetails billing={billing} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>

          <Button 
            size="sm"
            onClick={async () => {
              try {
                const response = await api.get(`/service-billing/${billing.id}/pdf`, {
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `facture-${billing.reference}.pdf`);
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
const ServiceBillingPage = () => {
  const { toast } = useToast();
  
  // États
  const [billings, setBillings] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBillings, setSelectedBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // États de la période
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setDate(1);
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
  const [serviceFilter, setServiceFilter] = useState(null);

  // États des modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBilling, setCurrentBilling] = useState(null);

  // États des statistiques
  const [statistics, setStatistics] = useState({
    total_count: 0,
    pending_count: 0,
    paid_count: 0,
    total_amount_due: 0,
    pending_amount: 0,
    paid_amount: 0
  });

  // Chargement des données
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/service-billing/dashboard', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          status: statusFilter !== 'all' ? statusFilter : undefined,
          service_id: serviceFilter?.id,
          page: currentPage,
          limit: itemsPerPage
        }
      });
      
      const data = response.data.data;
      
      setBillings(data.billings);
      setServices(data.services);
      setStatistics(data.statistics);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les données de facturation"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, statusFilter, serviceFilter, currentPage, itemsPerPage]);

  // Handlers
  const handleGenerateInvoices = async (serviceIds, billingDate) => {
    try {
      console.log('Sending service_ids:', serviceIds); // Debug log
      const response = await api.post('/service-billing/generate', {
        service_ids: serviceIds,
        billing_date: billingDate
      });
      
      toast({
        title: "Succès",
        description: `${response.data.data.generated} factures générées avec succès`
      });
      
      fetchDashboardData();
      setIsGenerateModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la génération des factures"
      });
    }
  };

  const handleUpdateStatus = async (billingId, status) => {
    try {
      await api.patch(`/service-billing/${billingId}/status`, { status });
      
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
      await api.delete(`/service-billing/${currentBilling.id}`);
      
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
      setCurrentBilling(null);
    }
  };

  const handleExportPDF = async (billingId) => {
    try {
      const response = await api.get(`/service-billing/${billingId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-service.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du téléchargement de la facture"
      });
    }
  };

  // Interface
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Factures de Services</h1>
        
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
     



      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Factures en attente</div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-2xl font-bold">{statistics.pending_count}</div>
            <div className="text-lg font-semibold text-amber-600">
              {Math.round(statistics.pending_amount).toLocaleString()} FCFA
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Factures payées</div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-2xl font-bold">{statistics.paid_count}</div>
            <div className="text-lg font-semibold text-green-600">
              {Math.round(statistics.paid_amount).toLocaleString()} FCFA
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-500">Total facturé</div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-2xl font-bold">{statistics.total_count}</div>
            <div className="text-lg font-semibold text-blue-600">
              {Math.round(statistics.total_amount_due).toLocaleString()} FCFA
            </div>
          </div>
        </Card>
      </div>

      {/* Tableau des factures */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBillings(billings.map(billing => billing.id));
                    } else {
                      setSelectedBillings([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Référence</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Formule</TableHead>
              <TableHead>Compteurs</TableHead>
              <TableHead>App Mobile</TableHead>
              <TableHead>Remise</TableHead>
              <TableHead>Total (FCFA)</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billings.map((billing) => (
              <TableRow 
                key={billing.id}
                className={billing.status === 'paid' ? 'bg-green-50/50' : ''}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedBillings.includes(billing.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBillings(prev => [...prev, billing.id]);
                      } else {
                        setSelectedBillings(prev => prev.filter(id => id !== billing.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{billing.reference}</TableCell>
                <TableCell>{billing.service?.name || 'N/A'}</TableCell>
                <TableCell>{billing.plan_name || 'N/A'}</TableCell>
                <TableCell>{billing.total_meters}</TableCell>
                <TableCell>
                  {billing.mobile_app_fee > 0 ? 
                    <Badge variant="success">Oui</Badge> : 
                    <Badge variant="outline">Non</Badge>
                  }
                </TableCell>
                <TableCell>
                  {billing.discount_amount > 0 ? 
                    `${Math.round(billing.discount_amount).toLocaleString()} FCFA` : 
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {Math.round(billing.total_due).toLocaleString()}
                </TableCell>

                <TableCell>
                  {`${format(new Date(billing.billing_period_start), 'dd/MM/yy')} au ${format(new Date(billing.billing_period_end), 'dd/MM/yy')}`}
                </TableCell>
                
                <TableCell>
                  {format(new Date(billing.due_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={billing.status === 'paid' ? 'success' : 'warning'}
                  >
                    {billing.status === 'paid' ? 'Payé' : 'Non payé'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Voir les détails */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentBilling(billing);
                        setIsViewModalOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>

                    {/* Télécharger PDF */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportPDF(billing.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {/* Marquer comme payé */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(billing.id, 'paid')}
                      disabled={billing.status === 'paid'}
                    >
                      <Check className="h-4 w-4" />
                    </Button>

                    {/* Supprimer */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setCurrentBilling(billing);
                        setIsDeleteDialogOpen(true);
                      }}
                      disabled={billing.status === 'paid'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Ligne de total 
{billings.length > 0 && (
  <TableRow className="font-bold bg-gray-50">
    <TableCell colSpan={5} className="text-right">Total</TableCell>
    <TableCell>
      {Math.round(
        billings.reduce((sum, billing) => sum + (billing.mobile_app_fee || 0), 0)
      ).toLocaleString()} FCFA
    </TableCell>
    <TableCell>
      {Math.round(
        billings.reduce((sum, billing) => sum + (billing.discount_amount || 0), 0)
      ).toLocaleString()} FCFA
    </TableCell>
    <TableCell>
      {Math.round(
        billings.reduce((sum, billing) => sum + (billing.total_due || 0), 0)
      ).toLocaleString()} FCFA
    </TableCell>
    <TableCell colSpan={4}></TableCell>
  </TableRow>
)}

  */}
            

          </TableBody>
        </Table>

        {/* Pagination */}
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

      {/* Modals */}
      <GenerateInvoiceDialog
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        services={services}
        onGenerate={handleGenerateInvoices}
      />

      <ViewInvoiceDialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        billing={currentBilling}
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceBillingPage;
          