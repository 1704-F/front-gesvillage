import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/toast/use-toast";
import { Search, Plus, Map, Building2, Building, MapPin, HomeIcon, Trash2, Pencil } from 'lucide-react';
import { axiosPrivate as api } from '../utils/axios';

const ZonePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("regions");
  const [searchTerm, setSearchTerm] = useState("");

  // États pour toutes les données
  const [data, setData] = useState({
    regions: [],
    departements: [],
    arrondissements: [],
    communes: [],
    zones: [],
    quartiers: []
  });

  // État pour les modaux
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'region', 'departement', etc.
    editing: null
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    region_id: '',
    departement_id: '',
    arrondissement_id: '',
    commune_id: '',
    zone_id: '',
     type: ''
  });

  // Fonctions CRUD pour chaque niveau
  const handleCreate = async () => {
    try {
      const endpoint = `/geo/${modalState.type}s`; // pluriel pour l'endpoint
      
      // Ajout des console.log pour debug
      console.log('Type de modalState:', modalState.type);
      console.log('FormData envoyé:', formData);
      
      const response = await api.post(endpoint, formData);
      console.log('Réponse du serveur:', response.data);
      
      setData(prev => ({
        ...prev,
        [modalState.type + 's']: [...prev[modalState.type + 's'], response.data]
      }));
  
      toast({
        title: "Succès",
        description: "Élément créé avec succès"
      });
  
      handleCloseModal();
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const endpoint = `/geo/${modalState.type}s/${modalState.editing.id}`;
      const response = await api.put(endpoint, formData);
      
      setData(prev => ({
        ...prev,
        [modalState.type + 's']: prev[modalState.type + 's'].map(item => 
          item.id === modalState.editing.id ? response.data : item
        )
      }));

      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès"
      });

      handleCloseModal();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
      await api.delete(`/geo/${type}s/${id}`);
      
      setData(prev => ({
        ...prev,
        [type + 's']: prev[type + 's'].filter(item => item.id !== id)
      }));

      toast({
        title: "Succès",
        description: "Élément supprimé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  // Fonctions utilitaires
  const handleOpenModal = (type, item = null) => {
    setModalState({
      isOpen: true,
      type,
      editing: item
    });
  
    // État initial du formulaire
    const initialFormData = {
      name: '',
      region_id: '',
      departement_id: '',
      arrondissement_id: '',
      commune_id: '',
      zone_id: '',
      type: ''
    };
  
    // Si on édite un élément existant, on remplit le formulaire avec ses données
    if (item) {
      setFormData({
        ...initialFormData,
        name: item.name || '',
        region_id: item.region_id?.toString() || '',
        departement_id: item.departement_id?.toString() || '',
        arrondissement_id: item.arrondissement_id?.toString() || '',
        commune_id: item.commune_id?.toString() || '',
        zone_id: item.zone_id?.toString() || '',
        type: item.type || ''
      });
    } else {
      // Sinon on utilise l'état initial
      setFormData(initialFormData);
    }
  };



  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      editing: null
    });
    setFormData({
      name: '',
      region_id: '',
      departement_id: '',
      arrondissement_id: '',
      commune_id: '',
      zone_id: '',
       type: ''
    });
  };

  const getParentOptions = (type) => {
    switch (type) {
      case 'departement':
        return data.regions;
      case 'arrondissement':
        return data.departements;
      case 'commune':
        return data.arrondissements;
      case 'zone':
        return data.communes;
      case 'quartier':
        return data.zones;
      default:
        return [];
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          regionsRes,
          departementsRes,
          arrondissementsRes,
          communesRes,
          zonesRes,
          quartiersRes
        ] = await Promise.all([
          api.get('/geo/regions'),
          api.get('/geo/departements'),
          api.get('/geo/arrondissements'),
          api.get('/geo/communes'),
          api.get('/geo/zones'),
          api.get('/geo/quartiers')
        ]);

        setData({
          regions: regionsRes.data,
          departements: departementsRes.data,
          arrondissements: arrondissementsRes.data,
          communes: communesRes.data,
          zones: zonesRes.data,
          quartiers: quartiersRes.data
        });
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

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Rendu du formulaire modal
  const renderForm = () => {
    const type = modalState.type;
    if (!type) return null;

    const parentType = {
      departement: 'region',
      arrondissement: 'departement',
      commune: 'arrondissement',
      zone: 'commune',
      quartier: 'zone'
    }[type];

    return (
        <Dialog open={modalState.isOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalState.editing ? `Modifier ${type}` : `Ajouter ${type}`}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            modalState.editing ? handleUpdate() : handleCreate();
          }} 
          className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Nom du ${type}`}
                required
              />
            </div>
      
            {parentType && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {parentType.charAt(0).toUpperCase() + parentType.slice(1)}
                </label>
                <Select
                  value={formData[`${parentType}_id`]}
                  onValueChange={(value) => 
                    setFormData({ ...formData, [`${parentType}_id`]: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Sélectionner ${parentType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getParentOptions(type).map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
      
            {/* Ajout du sélecteur de type pour les zones */}
            {type === 'zone' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type || ''}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ville">Ville</SelectItem>
                    <SelectItem value="Village">Village</SelectItem>
                    <SelectItem value="Hameaux">Hameaux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
      
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit">
                {modalState.editing ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Rendu des tableaux
  const renderTable = (type) => {
    const items = data[type].filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getParentName = (item) => {
      const parentType = {
        departement: 'region',
        arrondissement: 'departement',
        commune: 'arrondissement',
        zone: 'commune',
        quartier: 'zone'
      }[type.slice(0, -1)];

      if (!parentType) return null;

      const parent = data[parentType + 's'].find(
        p => p.id === item[`${parentType}_id`]
      );
      return parent?.name || 'Non défini';
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            {type !== 'regions' && <TableHead>Parent</TableHead>}
            <TableHead>Sous-éléments</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              {type !== 'regions' && (
                <TableCell>{getParentName(item)}</TableCell>
              )}
              <TableCell>
                {/* Afficher le nombre d'éléments enfants */}
                {Object.keys(data).find(key => 
                  data[key].some(child => child[`${type.slice(0, -1)}_id`] === item.id)
                )?.length || 0}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenModal(type.slice(0, -1), item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(type.slice(0, -1), item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={type !== 'regions' ? 4 : 3} 
                className="text-center text-gray-500"
              >
                Aucun élément trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Map className="h-6 w-6" />
          Gestion des Zones
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
          <Button onClick={() => handleOpenModal(activeTab.slice(0, -1))}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="regions">
            <Building2 className="w-4 h-4 mr-2" />
            Régions
          </TabsTrigger>
          <TabsTrigger value="departements">
            <Building className="w-4 h-4 mr-2" />
            Départements
          </TabsTrigger>
          <TabsTrigger value="arrondissements">
            <Building2 className="w-4 h-4 mr-2" />
            Arrondissements
          </TabsTrigger>
          <TabsTrigger value="communes">
            <Building className="w-4 h-4 mr-2" />
            Communes
          </TabsTrigger>
          <TabsTrigger value="zones">
            <MapPin className="w-4 h-4 mr-2" />
            Zones
          </TabsTrigger>
          <TabsTrigger value="quartiers">
            <HomeIcon className="w-4 h-4 mr-2" />
            Quartiers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions">
          <Card>{renderTable('regions')}</Card>
        </TabsContent>
        
        <TabsContent value="departements">
          <Card>{renderTable('departements')}</Card>
        </TabsContent>

        <TabsContent value="arrondissements">
          <Card>{renderTable('arrondissements')}</Card>
        </TabsContent>

        <TabsContent value="communes">
          <Card>{renderTable('communes')}</Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>{renderTable('zones')}</Card>
        </TabsContent>

        <TabsContent value="quartiers">
          <Card>{renderTable('quartiers')}</Card>
        </TabsContent>
      </Tabs>

      {/* Rendu du formulaire modal */}
      {renderForm()}
    </div>
  );
};

export default ZonePage;