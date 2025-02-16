//service/serviceForm.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
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
import { Search, Plus, Building2, MapPin, Settings2, User2, Phone, Trash2, Pencil } from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';

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

  // Chargement des services et des zones
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

  // Effet pour initialiser le formulaire quand les données sont chargées
  useEffect(() => {
    if (hierarchyLoaded && editingService) {
      setFormData(prev => ({
        ...prev,
        name: editingService.name || '',
        location: editingService.location || '',
        contact_person: editingService.contact_person || '',
        contact_info: editingService.contact_info || ''
      }));
    }
  }, [hierarchyLoaded, editingService]);

  // Filtrage des options en fonction des sélections
  const filteredDepartements = departements.filter(d => d.region_id === formData.region_id);
  const filteredArrondissements = arrondissements.filter(a => a.departement_id === formData.departement_id);
  const filteredCommunes = communes.filter(c => c.arrondissement_id === formData.arrondissement_id);
  const filteredZones = zones.filter(z => z.commune_id === formData.commune_id);

  // Gestion du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        toast({
          title: "Succès",
          description: "Service mis à jour avec succès"
        });
      } else {
        await api.post('/services', formData);
        toast({
          title: "Succès",
          description: "Service créé avec succès"
        });
      }
      setModalOpen(false);
      // Recharger les services
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

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

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
  
      // D'abord on définit les ID
      const region_id = service.region_id?.toString();
      const departement_id = service.departement_id?.toString();
      const arrondissement_id = service.arrondissement_id?.toString();
      const commune_id = service.commune_id?.toString();
      const zone_id = service.zone_id?.toString();
  
      // On met à jour le formData immédiatement avec toutes les valeurs
      setFormData({
        name: service.name || '',
        location: service.location || '',
        contact_person: service.contact_person || '',
        contact_info: service.contact_info || '',
        region_id,
        departement_id,
        arrondissement_id,
        commune_id,
        zone_id
      });
  
      // Les valeurs sont déjà disponibles dans les state correspondants
      // grâce au chargement initial, donc pas besoin de les recharger
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
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
                  {zones.find(z => z.id === parseInt(service.zone_id))?.name || 'Non défini'}
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
       {/* Première colonne - Informations du service */}
       <div className="space-y-4">
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

       {/* Partie des selects dans le formulaire */}
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

  {/* Select Département - visible si région sélectionnée */}
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
          {departements
            .filter(d => d.region_id === parseInt(formData.region_id))
            .map((departement) => (
              <SelectItem key={departement.id} value={departement.id.toString()}>
                {departement.name}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Arrondissement - visible si département sélectionné */}
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
          {arrondissements
            .filter(a => a.departement_id === parseInt(formData.departement_id))
            .map((arrondissement) => (
              <SelectItem key={arrondissement.id} value={arrondissement.id.toString()}>
                {arrondissement.name}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Commune - visible si arrondissement sélectionné */}
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
          {communes
            .filter(c => c.arrondissement_id === parseInt(formData.arrondissement_id))
            .map((commune) => (
              <SelectItem key={commune.id} value={commune.id.toString()}>
                {commune.name}
              </SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  )}

  {/* Select Zone - visible si commune sélectionnée */}
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
          {zones
            .filter(z => z.commune_id === parseInt(formData.commune_id))
            .map((zone) => (
              <SelectItem key={zone.id} value={zone.id.toString()}>
                {zone.name} {zone.type ? `(${zone.type})` : ''}
              </SelectItem>
            ))
          }
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