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
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api, BASE_URL } from '../../utils/axios';
import { Button } from "../ui/button";


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

const ServiceInfoPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [service, setService] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Chargement initial
  useEffect(() => {
    loadData();
  }, []);

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
      </Tabs>
    </div>
  );
};

export default ServiceInfoPage;