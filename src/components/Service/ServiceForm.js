import React, { useState, useEffect, useRef } from 'react';
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
import { Search, Plus, Building2, MapPin, Settings2, User2, Phone, Trash2, Pencil, Image, Upload, X } from 'lucide-react';
import { axiosPrivate as api, BASE_URL } from '../../utils/axios';

const ServicePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [arrondissements, setArrondissements] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [zones, setZones] = useState([]);
  const [hierarchyLoaded, setHierarchyLoaded] = useState(false);

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

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          servicesRes,
          regionsRes,
          departementsRes,
          arrondissementsRes,
          communesRes,
          zonesRes
        ] = await Promise.all([
          api.get('/services'),
          api.get('/geo/regions'),
          api.get('/geo/departements'),
          api.get('/geo/arrondissements'),
          api.get('/geo/communes'),
          api.get('/geo/zones')
        ]);

        setServices(servicesRes.data);
        setRegions(regionsRes.data);
        setDepartements(departementsRes.data);
        setArrondissements(arrondissementsRes.data);
        setCommunes(communesRes.data);
        setZones(zonesRes.data);
        setHierarchyLoaded(true);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Effet pour initialiser le formulaire à l'édition
  useEffect(() => {
    if (hierarchyLoaded && editingService) {
      setFormData(prev => ({
        ...prev,
        name: editingService.name || '',
        location: editingService.location || '',
        contact_person: editingService.contact_person || '',
        contact_info: editingService.contact_info || '',
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
    }
  }, [hierarchyLoaded, editingService]);

  // Filtrage des options
  const filteredDepartements = departements.filter(d => d.region_id === parseInt(formData.region_id));
  const filteredArrondissements = arrondissements.filter(a => a.departement_id === parseInt(formData.departement_id));
  const filteredCommunes = communes.filter(c => c.arrondissement_id === parseInt(formData.arrondissement_id));
  const filteredZones = zones.filter(z => z.commune_id === parseInt(formData.commune_id));

  // Ajouter cette fonction dans votre composant ServicePage
const refreshServices = async () => {
  try {
    const response = await api.get('/services');
    setServices(response.data);
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de rafraîchir la liste des services",
      variant: "destructive"
    });
  }
};
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
        // Debug log pour vérifier le logo
        console.log('Logo being sent:', selectedLogo);
      }

      // Log pour vérifier le contenu du FormData
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        } 
      };

      if (editingService) {
        const response = await api.put(`/services/${editingService.id}`, formDataToSend, config);
        console.log('Update response:', response.data);
      } else {
        const response = await api.post('/services', formDataToSend, config);
        console.log('Create response:', response.data);
      }

      setModalOpen(false);
      refreshServices();
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
      setServices(services.filter(s => s.id !== id));
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

  // Ouverture du modal
  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name || '',
        location: service.location || '',
        contact_person: service.contact_person || '',
        contact_info: service.contact_info || '',
        region_id: service.region_id?.toString() || '',
        departement_id: service.departement_id?.toString() || '',
        arrondissement_id: service.arrondissement_id?.toString() || '',
        commune_id: service.commune_id?.toString() || '',
        zone_id: service.zone_id?.toString() || ''
      });
      
      if (service.logo) {
        setPreviewUrl(`${BASE_URL}/uploads/logos/${service.logo}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setEditingService(null);
      setFormData({
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
      setPreviewUrl(null);
      setSelectedLogo(null);
    }
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nom du service</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services
              .filter(service => 
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.location?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((service) => (
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
                    {zones.find(z => z.id === parseInt(service.zone_id))?.name || 'Non défini'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.active ? "success" : "secondary"}>
                      {service.active ? 'Actif' : 'Inactif'}
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
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de formulaire */}
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
                  {/* Select Région */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Région</label>
                    <Select
                      value={formData.region_id}
                      onValueChange={(value) => 
                        setFormData({ 
                          ...formData, 
                          region_id: value,
                          departement_id: '',
                          arrondissement_id: '',
                          commune_id: '',
                          zone_id: ''
                        })
                      }
                    >
                      <SelectTrigger>
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
                        onValueChange={(value) => 
                          setFormData({ 
                            ...formData, 
                            departement_id: value,
                            arrondissement_id: '',
                            commune_id: '',
                            zone_id: ''
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un département" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDepartements.map((departement) => (
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
                        onValueChange={(value) => 
                          setFormData({ 
                            ...formData, 
                            arrondissement_id: value,
                            commune_id: '',
                            zone_id: ''
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un arrondissement" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredArrondissements.map((arrondissement) => (
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
                        onValueChange={(value) => 
                          setFormData({ 
                            ...formData, 
                            commune_id: value,
                            zone_id: ''
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une commune" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCommunes.map((commune) => (
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
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredZones.map((zone) => (
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
              <Button type="submit">
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