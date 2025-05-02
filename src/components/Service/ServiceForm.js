import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { useToast } from "../ui/toast/use-toast";
import { Checkbox } from "../ui/checkbox";
import { Search, Plus, Building2, MapPin, Settings2, User2, Phone, Trash2, Pencil, Image, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { axiosPrivate as api, BASE_URL } from '../../utils/axios';

const ServicePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [regions, setRegions] = useState([]);
  
  // États pour les données géographiques à charger dynamiquement
  const [departements, setDepartements] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [zones, setZones] = useState([]);
  const [loadingGeoData, setLoadingGeoData] = useState(false);
  const [servicePlans, setServicePlans] = useState([]);

  const [loadingEditData, setLoadingEditData] = useState(false);

  // État pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // États pour la gestion du logo
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // État du modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact_person: '',
    contact_info: '',
    region_id: '',
    departement_id: '',
    arrondissement_id: '',
    commune_id: '',
    zone_id: ''
  });

  // Débouncer la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Chargement des données avec gestion d'erreur et timeout
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ajouter un timeout de 30 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const [servicesResponse, plansResponse] = await Promise.all([
        api.get('/services/dashboard', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: debouncedSearchTerm
          },
          signal: controller.signal
        }),
        api.get('/service-plans') // Nouvelle requête pour récupérer les formules
      ]);
      
      clearTimeout(timeoutId);
      
      const { services, regions, pagination: paginationData } = servicesResponse.data;
      
      setServices(services || []);
      setRegions(regions || []);
      setPagination(paginationData);
      setServicePlans(plansResponse.data || []); // Stocker les formules
      
    } catch (error) {
      // Gestion des erreurs (code existant)
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, toast]);
  // Chargement des données géographiques à la demande
  const fetchGeoData = async (type, parentId) => {
    setLoadingGeoData(true);
    try {
      const response = await api.get('/services/geo-data', {
        params: { type, parentId }
      });
      
      switch(type) {
        case 'departements':
          setDepartements(response.data);
          setArrondissements([]);
          setCommunes([]);
          setZones([]);
          break;
        case 'arrondissements':
          setArrondissements(response.data);
          setCommunes([]);
          setZones([]);
          break;
        case 'communes':
          setCommunes(response.data);
          setZones([]);
          break;
        case 'zones':
          setZones(response.data);
          break;
        default:
          console.error('Type de données géographiques non valide');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données géographiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données géographiques",
        variant: "destructive"
      });
    } finally {
      setLoadingGeoData(false);
    }
  };

  const handleToggleAppAuthorization = async (serviceId) => {
    try {
      await api.patch(`/services/${serviceId}/toggle-app-authorization`);
      fetchDashboardData(); // Recharger les données
      toast({
        title: "Succès",
        description: "Autorisation d'application mise à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'autorisation d'application",
        variant: "destructive"
      });
    }
  };

  // Chargement des données initiales
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Effet pour initialiser le formulaire à l'édition
  useEffect(() => {
    if (editingService) {
      // État de chargement pour les données d'édition
      setLoadingGeoData(true);
      
      // Initialiser les données du formulaire
      setFormData(prev => ({
        ...prev,
        name: editingService.name || '',
        location: editingService.location || '',
        contact_person: editingService.contact_person || '',
        contact_info: editingService.contact_info || '',
  
        // Nouvelles propriétés
        service_plan_id: editingService.service_plan_id?.toString() || '',
        discount_amount: editingService.discount_amount?.toString() || '0',
        discount_reason: editingService.discount_reason || '',
        app_authorized: Boolean(editingService.app_authorized),
        
        region_id: editingService.region_id?.toString() || '',
        departement_id: editingService.departement_id?.toString() || '',
        arrondissement_id: editingService.arrondissement_id?.toString() || '',
        commune_id: editingService.commune_id?.toString() || '',
        zone_id: editingService.zone_id?.toString() || ''
      }));
  
      // Initialiser le logo s'il existe
      if (editingService.logo) {
        setPreviewUrl(`${BASE_URL}/uploads/logos/${editingService.logo}`);
      }
      
      // Charger les données géographiques de manière séquentielle
      const loadGeoData = async () => {
        try {
          if (editingService.region_id) {
            await fetchGeoData('departements', editingService.region_id);
            
            if (editingService.departement_id) {
              await fetchGeoData('arrondissements', editingService.departement_id);
              
              if (editingService.arrondissement_id) {
                await fetchGeoData('communes', editingService.arrondissement_id);
                
                if (editingService.commune_id) {
                  await fetchGeoData('zones', editingService.commune_id);
                }
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données géographiques:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données géographiques",
            variant: "destructive"
          });
        } finally {
          setLoadingGeoData(false);
        }
      };
      
      loadGeoData();
    }
  }, [editingService]);

  // Gestion du logo
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast({
          title: "Erreur",
          description: "Le fichier est trop volumineux. Taille maximum : 5MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData(); 

      // Ajouter tous les champs du formulaire
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter le logo s'il existe
      if (selectedLogo) {
        formDataToSend.append('logo', selectedLogo);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        } 
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, formDataToSend, config);
      } else {
        await api.post('/services', formDataToSend, config);
      }

      setModalOpen(false);
      fetchDashboardData(); // Recharger les données
      toast({
        title: "Succès",
        description: editingService ? "Service mis à jour avec succès" : "Service créé avec succès"
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  // Suppression d'un service
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchDashboardData(); // Recharger les données
      toast({
        title: "Succès",
        description: "Service supprimé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service",
        variant: "destructive"
      });
    }
  };

  // Changement de page de pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Ouverture du modal
  const openModal = (service = null) => {
    // Réinitialiser les données géographiques
    setDepartements([]);
    setArrondissements([]);
    setCommunes([]);
    setZones([]);
    
    if (service) {
      setEditingService(service);
      // Le reste est géré par useEffect qui observe editingService
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        location: '',
        contact_person: '',
        contact_info: '',

        // Nouveaux champs
  service_plan_id: '',
  discount_amount: '',
  discount_reason: '',
  app_authorized: false,

        region_id: '',
        departement_id: '',
        arrondissement_id: '',
        commune_id: '',
        zone_id: ''
      });
      setPreviewUrl(null);
      setSelectedLogo(null);
    }
    setModalOpen(true);
  };

  // Gestion des changements dans le formulaire pour les champs géographiques
  const handleRegionChange = (value) => {
    setFormData({ 
      ...formData, 
      region_id: value,
      departement_id: '',
      arrondissement_id: '',
      commune_id: '',
      zone_id: ''
    });
    
    if (value) {
      fetchGeoData('departements', value);
    } else {
      setDepartements([]);
      setArrondissements([]);
      setCommunes([]);
      setZones([]);
    }
  };

  const handleDepartementChange = (value) => {
    setFormData({ 
      ...formData, 
      departement_id: value,
      arrondissement_id: '',
      commune_id: '',
      zone_id: ''
    });
    
    if (value) {
      fetchGeoData('arrondissements', value);
    } else {
      setArrondissements([]);
      setCommunes([]);
      setZones([]);
    }
  };

  const handleArrondissementChange = (value) => {
    setFormData({ 
      ...formData, 
      arrondissement_id: value,
      commune_id: '',
      zone_id: ''
    });
    
    if (value) {
      fetchGeoData('communes', value);
    } else {
      setCommunes([]);
      setZones([]);
    }
  };

  const handleCommuneChange = (value) => {
    setFormData({ 
      ...formData, 
      commune_id: value,
      zone_id: ''
    });
    
    if (value) {
      fetchGeoData('zones', value);
    } else {
      setZones([]);
    }
  };

  // Fonction pour afficher un état d'erreur
  const renderError = () => (
    <div className="p-6 text-center">
      <div className="mb-4 text-red-500">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-lg font-medium">{error || "Une erreur est survenue"}</p>
      <Button 
        className="mt-4" 
        onClick={fetchDashboardData}
      >
        Réessayer
      </Button>
    </div>
  );

  if (loading && !services.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error && !services.length) {
    return renderError();
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          Gestion des Services
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un service
          </Button>
        </div>
      </div>

      {/* Table des services */}
      <Card>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nom du service</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>App mobile</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    {service.logo ? (
                      <img
                        src={`${BASE_URL}/uploads/logos/${service.logo}`}
                        alt={service.name}
                        className="w-12 h-12 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.location || 'Non défini'}</TableCell>
                  <TableCell>
                    {service.contact_person && (
                      <div className="flex flex-col">
                        <span>{service.contact_person}</span>
                        <span className="text-sm text-gray-500">{service.contact_info}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {service.zoneName || 'Non défini'}
                  </TableCell>

                  <TableCell>
                    <Badge variant={service.active ? "success" : "secondary"}>
                      {service.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
  <Badge 
    variant={service.app_authorized ? "success" : "outline"} 
    className="cursor-pointer"
    onClick={() => handleToggleAppAuthorization(service.id)}
  >
    {service.app_authorized ? 'Autorisé' : 'Non autorisé'}
  </Badge>
</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Aucun service trouvé</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Affichage de {pagination.totalItems ? (pagination.page - 1) * pagination.limit + 1 : 0} à {Math.min(pagination.page * pagination.limit, pagination.totalItems)} sur {pagination.totalItems} services
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
      </Card>

      {/* Modal de formulaire avec layout horizontal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Modifier le service" : "Ajouter un service"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Première colonne */}
                <div className="space-y-4">
                  {/* Section Logo */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logo du service</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {previewUrl ? (
                          <div className="relative w-32 h-32 border rounded">
                            <img
                              src={previewUrl}
                              alt="Logo preview"
                              className="w-full h-full object-contain"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLogoChange}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="w-4 h-4 mr-2" />
          Choisir un logo
        </Button>
        <span className="text-xs text-gray-500">
          Format: PNG, JPG (max 5MB)
        </span>
      </div>
    </div>
  </div>

  {/* Autres champs du formulaire */}
  <div className="space-y-2">
    <label className="text-sm font-medium">Nom du service</label>
    <Input
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      placeholder="Nom du service"
      required
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium">Localisation</label>
    <Input
      value={formData.location}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      placeholder="Localisation"
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium">Personne à contacter</label>
    <Input
      value={formData.contact_person}
      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
      placeholder="Nom du contact"
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium">Informations de contact</label>
    <Input
      value={formData.contact_info}
      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
      placeholder="Numéro de téléphone, email, etc."
    />
  </div>
</div>

{/* Deuxième colonne - Sélection des zones */}
<div className="space-y-4">
  {/* Section Facturation */}
<div className="space-y-2">
  <label className="text-sm font-medium">Formule de service</label>
  <Select
    value={formData.service_plan_id || ""}
    onValueChange={(value) => setFormData({ ...formData, service_plan_id: value === "none" ? null : value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Sélectionner une formule" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">Aucune formule</SelectItem>
      {servicePlans.map((plan) => (
        <SelectItem key={plan.id} value={plan.id.toString()}>
          {plan.name} ({plan.type})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">Remise (FCFA)</label>
  <Input
    type="number"
    value={formData.discount_amount || ""}
    onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
    placeholder="Montant de la remise"
  />
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">Raison de la remise</label>
  <Input
    value={formData.discount_reason || ""}
    onChange={(e) => setFormData({ ...formData, discount_reason: e.target.value })}
    placeholder="Partenariat, programme spécial, etc."
  />
</div>

<div className="flex items-center space-x-2 mt-4">
  <Checkbox 
    id="app_authorized"
    checked={formData.app_authorized}
    onCheckedChange={(checked) => 
      setFormData({ ...formData, app_authorized: checked })
    }
  />
  <label htmlFor="app_authorized" className="text-sm font-medium cursor-pointer">
    Accès à l'application mobile (+ 10 000 FCFA/mois)
  </label>
</div>


  {/* Select Région */}
  <div className="space-y-2">
    <label className="text-sm font-medium">Région</label>
    <Select
      value={formData.region_id}
      onValueChange={handleRegionChange}
    >
      <SelectTrigger className={loadingGeoData ? "opacity-70" : ""}>
        <SelectValue placeholder="Sélectionner une région" />
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.id.toString()}>
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Select Département */}
  {formData.region_id && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Département</label>
      <Select
        value={formData.departement_id}
        onValueChange={handleDepartementChange}
      >
        <SelectTrigger className={loadingGeoData ? "opacity-70" : ""}>
          <SelectValue placeholder="Sélectionner un département" />
        </SelectTrigger>
        <SelectContent>
          {departements.map((departement) => (
            <SelectItem key={departement.id} value={departement.id.toString()}>
              {departement.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Arrondissement */}
  {formData.departement_id && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Arrondissement</label>
      <Select
        value={formData.arrondissement_id}
        onValueChange={handleArrondissementChange}
      >
        <SelectTrigger className={loadingGeoData ? "opacity-70" : ""}>
          <SelectValue placeholder="Sélectionner un arrondissement" />
        </SelectTrigger>
        <SelectContent>
          {arrondissements.map((arrondissement) => (
            <SelectItem key={arrondissement.id} value={arrondissement.id.toString()}>
              {arrondissement.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Commune */}
  {formData.arrondissement_id && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Commune</label>
      <Select
        value={formData.commune_id}
        onValueChange={handleCommuneChange}
      >
        <SelectTrigger className={loadingGeoData ? "opacity-70" : ""}>
          <SelectValue placeholder="Sélectionner une commune" />
        </SelectTrigger>
        <SelectContent>
          {communes.map((commune) => (
            <SelectItem key={commune.id} value={commune.id.toString()}>
              {commune.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Zone */}
  {formData.commune_id && (
    <div className="space-y-2">
      <label className="text-sm font-medium">Zone</label>
      <Select
        value={formData.zone_id}
        onValueChange={(value) => 
          setFormData({ 
            ...formData, 
            zone_id: value
          })
        }
      >
        <SelectTrigger className={loadingGeoData ? "opacity-70" : ""}>
          <SelectValue placeholder="Sélectionner une zone" />
        </SelectTrigger>
        <SelectContent>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id.toString()}>
              {zone.name} {zone.type ? `(${zone.type})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )}
</div>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading || loadingGeoData}>
                {editingService ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicePage;
                              