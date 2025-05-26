import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast/use-toast";
import { 
  Info, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Building2,
  Users,
  Gauge,
  Receipt,
  RefreshCw,
  Download,
  Calendar,
  FileText,
  Wallet, // Ajouter cette icône pour la caisse
  Calculator,
  FileCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api, BASE_URL } from '../../utils/axios';
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import { Input } from "../ui/input";
import CashStatementManager from '../Caisse/Cash';

const localCache = {
  get: (key) => {
    try {
      const cachedData = localStorage.getItem(key);
      if (!cachedData) return null;
      
      const { data, expiry } = JSON.parse(cachedData);
      if (expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  },
  
  set: (key, data, ttlHours = 6) => {
    try {
      const cacheData = {
        data,
        expiry: Date.now() + (ttlHours * 60 * 60 * 1000)
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      return false;
    }
  },
  
  invalidate: (key) => {
    localStorage.removeItem(key);
  }
};

// Component de détails de la facture
const ServiceBillingDetails = ({ billing }) => {
  if (!billing) return null;

  // Recalculer le total pour s'assurer que tous les frais sont inclus
  const calculatedTotal = (
    parseFloat(billing.base_price || 0) + 
    parseFloat(billing.mobile_app_fee || 0) - 
    parseFloat(billing.discount_amount || 0)
  );

  // Utiliser le total calculé ou le total fourni par l'API
  const totalToDisplay = calculatedTotal || parseFloat(billing.total_due);

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
              <span>{Math.round(parseFloat(billing.base_price)).toLocaleString()} FCFA</span>
            </div>
            {parseFloat(billing.mobile_app_fee) > 0 && (
              <div className="flex justify-between">
                <span>Utilisation de l'application mobile</span>
                <span>{Math.round(parseFloat(billing.mobile_app_fee)).toLocaleString()} FCFA</span>
              </div>
            )}
            {parseFloat(billing.discount_amount) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Remise{billing.discount_reason ? ` (${billing.discount_reason})` : ''}</span>
                <span>-{Math.round(parseFloat(billing.discount_amount)).toLocaleString()} FCFA</span>
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

const ServiceInfoPage = () => {
  const { toast } = useToast();
  
  // États
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [service, setService] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // États pour la facturation
  const [billings, setBillings] = useState([]);
  const [loadingBillings, setLoadingBillings] = useState(false);
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 3); // 3 derniers mois par défaut
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
  const [currentBilling, setCurrentBilling] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const CACHE_KEY = 'service_info_data';

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Date invalide';
    }
  };

  const loadData = async (skipCache = false) => {
    try {
      // Si skipCache est vrai, on ignore le cache
      if (!skipCache) {
        // 1. Essayer de récupérer les données du cache local
        const cachedData = localCache.get(CACHE_KEY);
        
        if (cachedData) {
          console.log('Données chargées depuis le cache local');
          setService(cachedData.service);
          setPricing(cachedData.pricing);
          setLoading(false);
          return;
        }
      }
      
      // 2. Si pas de cache ou skipCache, faire un appel API optimisé
      const response = await api.get('/services/info-optimized', {
        params: skipCache ? { skipCache: 'true' } : {}
      });
      
      // 3. Extraire et utiliser les données
      const { service, pricing } = response.data.data;
      setService(service);
      setPricing(pricing);
      
      // 4. Mettre en cache les données pour les futurs chargements
      localCache.set(CACHE_KEY, {
        service,
        pricing
      }, 6); // 6 heures
      
      toast({
        title: "Succès",
        description: skipCache ? "Données actualisées avec succès" : "Informations chargées avec succès",
        duration: 3000
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les informations du service"
      });
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour actualiser les données
  const refreshData = async () => {
    setRefreshing(true);
    // Invalider le cache local
    localCache.invalidate(CACHE_KEY);
    
    try {
      // Invalider d'abord le cache côté serveur
      await api.post('/services/info-optimized/clear-cache');
      
      // Puis charger les données fraîches
      await loadData(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'actualiser les données"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Nouvelle fonction pour charger les factures
  const loadBillings = async () => {
    if (!service) return;
    
    setLoadingBillings(true);
    try {
      const response = await api.get('/service-billing', {
        params: {
          service_id: service.id,
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd')
        }
      });
      
      setBillings(response.data.data.billings || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les factures du service"
      });
      console.error('Erreur:', error);
    } finally {
      setLoadingBillings(false);
    }
  };

  // Fonction pour télécharger une facture
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
                <div>{service?.name || 'N/A'}</div>
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
              onClick={() => handleExportPDF(billing.id)}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

  // Chargement des factures quand le service change ou les dates changent
  useEffect(() => {
    if (service && activeTab === "billing") {
      loadBillings();
    }
  }, [service, dateRange, activeTab]);
  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }
  
  if (!service) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Service non trouvé
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header avec logo et bouton d'actualisation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {service.logo && (
            <div className="h-14 w-14 rounded-full overflow-hidden flex items-center justify-center">
             <img 
              src={`${BASE_URL}/uploads/logos/${service.logo}`} 
              alt={`Logo de ${service.name}`} 
              className="h-full w-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholders/service-logo.png';
              }}
            />
            </div>
          )}
          <h1 className="text-2xl font-bold flex items-center gap-2">
            
            Information du service
          </h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>
  
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
        <TabsList>
          <TabsTrigger value="overview">
            <Info className="w-4 h-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="details">
            <Building2 className="w-4 h-4 mr-2" />
            Détails administratifs
          </TabsTrigger>
          <TabsTrigger value="area">
            <MapPin className="w-4 h-4 mr-2" />
            Zone de service
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Receipt className="w-4 h-4 mr-2" />
            Facturation
          </TabsTrigger>

          <TabsTrigger value="cash">
    <Wallet className="w-4 h-4 mr-2" />
    Caisse
  </TabsTrigger>
        </TabsList>
  
        {/* Vue d'ensemble */}
        <TabsContent value="overview">
          {/* Cartes de tarification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="relative shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 bg-yellow-100 rounded-full shadow">
                    <Gauge className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                <div className="text-2xl font-bold mb-2">{pricing?.current?.threshold || 0} m³</div>
                  <div className="text-sm text-gray-500">Seuil de consommation</div>
                </div>
              </CardContent>
            </Card>
  
            <Card className="relative shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 bg-blue-100 rounded-full shadow">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                <div className="text-2xl font-bold mb-2">{pricing?.current?.base_price || 0} FCFA</div>
                  <div className="text-sm text-gray-500">Prix de base par m³</div>
                </div>
              </CardContent>
            </Card>
  
            <Card className="relative shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 bg-red-100 rounded-full shadow">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-8 text-center">
                <div className="text-2xl font-bold mb-2">{pricing?.current?.extra_price || 0} FCFA</div>
                  <div className="text-sm text-gray-500">Prix au-delà du seuil</div>
                </div>
              </CardContent>
            </Card>
          </div>
  
          {/* Informations de base */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Vue d'ensemble du service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Nom du service</h3>
                  <p className="text-lg font-medium">{service.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Localisation
                  </h3>
                  <p className="text-lg">{service.zone?.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  
        {/* Détails administratifs */}
        <TabsContent value="details">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Informations administratives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <User className="h-4 w-4" />
                    <span>Administrateur</span>
                  </div>
                  <p className="font-medium">{service.admin?.name || 'Non assigné'}</p>
                  <p className="text-gray-600">{service.admin?.phone_number || 'Aucun numéro'}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Phone className="h-4 w-4" />
                    <span>Contact Service</span>
                  </div>
                  <p className="font-medium">{service.contact_person || 'Non spécifié'}</p>
                  <p className="text-gray-600">{service.contact_info || 'Aucune information'}</p>
                </div>
              </div>
  
              <div className="mt-6 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Créé le: {formatDate(service.createdAt)}</span>
                  <span>Dernière mise à jour: {formatDate(service.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  
        {/* Zone de service */}
        <TabsContent value="area">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Zone de couverture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations géographiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Région:</span>
                    <p className="font-medium">{service.region}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Département:</span>
                    <p className="font-medium">{service.departement}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Arrondissement:</span>
                    <p className="font-medium">{service.arrondissement}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Commune:</span>
                    <p className="font-medium">{service.commune}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">{service.zone?.type}:</span>
                    <p className="font-medium">{service.zone?.name}</p>
                  </div>
                </div>
              </div>
  
              {/* Liste des quartiers */}
              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-500 flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4" />
                  Quartiers de la zone
                </h3>
  
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {service.zone?.quartiers.map((quartier, index) => {
                    const hue = (index * 137.5) % 360;
                    return (
                      <div
                        key={quartier.id}
                        className="rounded-lg p-6 flex items-center justify-center text-white font-medium shadow-sm hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: `hsl(${hue}, 70%, 35%)`,
                          minHeight: "100px"
                        }}
                      >
                        {quartier.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
  
        {/* Facturation */}
        <TabsContent value="billing">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Factures du service</CardTitle>
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
              </div>
            </CardHeader>
            <CardContent>
              {loadingBillings ? (
                <div className="py-6 text-center text-gray-500">Chargement des factures...</div>
              ) : billings.length === 0 ? (
                <div className="py-6 text-center text-gray-500">Aucune facture trouvée pour ce service dans la période sélectionnée</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Formule</TableHead>
                      <TableHead>Compteurs</TableHead>
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
                        <TableCell>{billing.reference}</TableCell>
                        <TableCell>{billing.plan_name || 'N/A'}</TableCell>
                        <TableCell>{billing.total_meters}</TableCell>
                        <TableCell>
                          {Math.round(parseFloat(billing.total_due)).toLocaleString()}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Caisse */}
<TabsContent value="cash">
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Wallet className="w-5 h-5" />
        Gestion de la Caisse
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <CashStatementManager />
    </CardContent>
  </Card>
</TabsContent>



      </Tabs>
  
      {/* Modal de visualisation */}
      <ViewInvoiceDialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        billing={currentBilling}
      />
    </div>
  );
  };
  
  export default ServiceInfoPage;

