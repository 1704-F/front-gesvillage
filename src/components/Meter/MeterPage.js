//Meter/MeterPage
import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { Switch } from "../ui/switch";
import { useToast } from "../ui/toast/use-toast";
import { MapPin, Pencil, Trash2, Plus, Search, User, AlertTriangle, History } from 'lucide-react'; 
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
import { axiosPublic, axiosPrivate } from '../../utils/axios';
import MeterPDFDownloadButton from './MeterPDFDownloadButton'; 
import MeterProblemBadge from './MeterProblemBadge';
import MeterProblemDialog from './MeterProblemDialog';
import MeterStatistics from './MeterStatistics';
import MeterPageSkeleton from './MeterPageSkeletonShimmer';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MeterUserHistoryDialog = lazy(() => import('./MeterUserHistoryDialog'));

const api = axiosPrivate; 

const MeterPage = () => {

  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .normalize('NFC')
      .replace(/‚/g, 'é')
      .replace(/\u0083/g, 'é')
      .replace(/\u0082/g, 'é');
  };

  // États

 // États
const [meters, setMeters] = useState([]); // Déplacer en premier
const [loading, setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(50);

const [totalPages, setTotalPages] = useState(0); // ← NOUVEAU
const [totalItems, setTotalItems] = useState(0); // ← NOUVEAU


const [consumers, setConsumers] = useState([]);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedMeter, setSelectedMeter] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [nextMeterNumber, setNextMeterNumber] = useState('');
const [filterStatus, setFilterStatus] = useState('active');
const [statusFilter, setStatusFilter] = useState('active');
const [quartiers, setQuartiers] = useState([]);
const [statistics, setStatistics] = useState(null);
const [isProblemDialogOpen, setIsProblemDialogOpen] = useState(false);
const [problemFilterActive, setProblemFilterActive] = useState(false);
const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

const [isPermanentDeleteDialogOpen, setIsPermanentDeleteDialogOpen] = useState(false);
const [canDelete, setCanDelete] = useState(true); // Si le compteur peut être supprimé

const { toast } = useToast();

const debouncedSearchTerm = useDebounce(searchTerm, 800); 



 

  useEffect(() => {
    const fetchQuartiers = async () => {
      try {
        const response = await api.get('/geo/zones/quartiers'); 
        setQuartiers(response.data.data);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les quartiers",
          variant: "destructive"
        });
      }
    };
    
    fetchQuartiers();
  }, []);

  // Fonctions de récupération des données
 const fetchMeters = useCallback(async () => {
  try {
    // ✅ SUPPRIMER cette ligne : setLoading(true);
    
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm,
      problem_filter: problemFilterActive
    };
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    const response = await api.get('/meters', { params });
    
    setMeters(response.data.data);
    setTotalPages(response.data.pagination.totalPages);
    setTotalItems(response.data.pagination.totalItems);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer les compteurs."
    });
  } finally {
    setLoading(false); // ✅ Garder juste pour le premier chargement
  }
}, [currentPage, itemsPerPage, statusFilter, debouncedSearchTerm, problemFilterActive, toast]);


  const fetchConsumers = useCallback(async () => {
    try {
      const response = await api.get('/consumers/active');
      setConsumers(response.data.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des consommateurs",
        variant: "destructive"
      });
    }
  }, [toast]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/meters/statistics');
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les statistiques."
      });
    }
  }, [toast]);

   // Chargement initial des données
 
useEffect(() => {
  fetchMeters();
}, [fetchMeters]);

// Garder ce useEffect séparé pour le chargement initial :
useEffect(() => {
  Promise.all([
    fetchConsumers(),
    fetchStatistics()
  ]);
}, []);

 
  // Gestionnaires d'événements
  const handleAdd = async () => {
    try {
      const response = await api.get('/meters/next-meter-number');
      setNextMeterNumber(response.data.nextMeterNumber);
      setSelectedMeter(null);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le numéro de compteur",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (meter) => {
    setSelectedMeter(meter);
    setIsModalOpen(true);
  };

  const handleDelete = (meter) => {
    setSelectedMeter(meter);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/meters/${selectedMeter.id}`);
      toast({
        title: "Succès",
        description: "Compteur supprimé avec succès"
      });
      await Promise.all([
            fetchMeters(),
            fetchStatistics()
        ]);
      

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compteur",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMeter(null);
    }
  };

  const handleToggleStatus = async (meter) => {
    try {
      const newStatus = meter.status === 'active' ? 'inactive' : 'active';
      await api.put(`/meters/${meter.id}`, { status: newStatus });
      toast({
        title: "Succès",
        description: `Compteur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`
      });

      await Promise.all([
            fetchMeters(),
            fetchStatistics()
        ]);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedMeter) {
        await api.put(`/meters/${selectedMeter.id}`, data);
        toast({
          title: "Succès",
          description: "Compteur modifié avec succès"
        });
      } else {
        await api.post('/meters', {
          ...data,
          meter_number: nextMeterNumber
        });
        toast({
          title: "Succès",
          description: "Compteur ajouté avec succès"
        });
      }
      setIsModalOpen(false);
      await Promise.all([
            fetchMeters(),
            fetchStatistics()
        ]);

      
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleShowHistory = (meter) => {
    setSelectedMeter(meter);
    setIsHistoryDialogOpen(true);
  };

  // Fonction pour vérifier si un compteur peut être supprimé
const handlePermanentDelete = async (meter) => {
  setSelectedMeter(meter);
  
  try {
    // Vérifier si le compteur a des relevés
    const response = await api.get(`/meters/${meter.id}/can-delete`);
    setCanDelete(response.data.canDelete);
    setIsPermanentDeleteDialogOpen(true);
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de vérifier si le compteur peut être supprimé",
      variant: "destructive"
    });
  }
};

// Fonction pour confirmer la suppression définitive
const handlePermanentDeleteConfirm = async () => {
  try {
    if (!canDelete) {
      setIsPermanentDeleteDialogOpen(false);
      return;
    }
    
    await api.delete(`/meters/${selectedMeter.id}/permanent`);
    toast({
      title: "Succès",
      description: "Compteur supprimé définitivement avec succès"
    });
    await Promise.all([
            fetchMeters(),
            fetchStatistics()
        ]);

  } catch (error) {
    toast({
      title: "Erreur",
      description: error.response?.data?.message || "Impossible de supprimer définitivement le compteur",
      variant: "destructive"
    });
  } finally {
    setIsPermanentDeleteDialogOpen(false);
    setSelectedMeter(null);
  }
};

 

  // Ajoutez cette fonction pour gérer le signalement d'un problème
const handleReportProblem = (meter) => {
  setSelectedMeter(meter);
  setIsProblemDialogOpen(true);
};

// Ajoutez cette fonction pour mettre à jour les compteurs après signalement/résolution d'un problème
const handleProblemSuccess = async (updatedMeter) => {
    // Mettre à jour la liste locale
    setMeters(prev => prev.map(meter => 
        meter.id === updatedMeter.id ? updatedMeter : meter
    ));
    
   
    await fetchStatistics();
};


  // Composant de formulaire modal
  const MeterForm = ({ isOpen, onClose, editMeter }) => {
    const [formData, setFormData] = useState({
      meter_number: editMeter?.meter_number || nextMeterNumber,
      serial_number: editMeter?.serial_number || "",
      user_id: editMeter?.user?.id?.toString() || "", 
      quartier_id: editMeter?.quartier?.id?.toString() || "",
      type: editMeter?.type || "manual",
      location: editMeter?.location || "",
      latitude: editMeter?.latitude || "",
      longitude: editMeter?.longitude || "",
      billing_type: editMeter?.billing_type || "standard",
    });
    const [searchConsumer, setSearchConsumer] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [showChangeReason, setShowChangeReason] = useState(false);

  // Réinitialiser le formulaire quand editMeter change
  useEffect(() => {
    if (editMeter) {
      setFormData({
        meter_number: editMeter.meter_number,
        user_id: editMeter.user?.id?.toString() || "", // Modification ici
        type: editMeter.type,
        location: editMeter.location,
        latitude: editMeter.latitude || "",
        longitude: editMeter.longitude || "",
        quartier_id: editMeter.quartier?.id?.toString() || ""
      });
    }
  }, [editMeter]);

  useEffect(() => {
    // Si l'utilisateur change, afficher le champ de raison
    if (editMeter && formData.user_id && formData.user_id !== editMeter.user?.id?.toString()) {
      setShowChangeReason(true);
    } else {
      setShowChangeReason(false);
    }
  }, [formData.user_id, editMeter]);


    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {editMeter ? "Modifier le compteur" : "Ajouter un compteur"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Colonne gauche */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de compteur</label>
              <Input
                disabled
                value={formData.meter_number}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de série</label>
              <Input 
                placeholder="Entrez le numéro de série du compteur"
                value={formData.serial_number}
                onChange={(e) => handleChange('serial_number', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
          <label className="text-sm font-medium">Consommateur</label>
          <Select
            value={formData.user_id}
            onValueChange={(value) => handleChange('user_id', value)}
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un consommateur" />
            </SelectTrigger>
            <SelectContent>
              <div className="sticky top-0 bg-white p-2 z-50">
                <Input
                  placeholder="Rechercher un consommateur..."
                  value={searchConsumer}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchConsumer(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </div>
              <ScrollArea className="h-72">
                {consumers
                  .filter(consumer => 
                    `${consumer.first_name} ${consumer.last_name} ${consumer.name || ''}`
                    .toLowerCase()
                    .includes(searchConsumer.toLowerCase())
                  )
                  .map((consumer) => (
                    <SelectItem 
                      key={consumer.id} 
                      value={String(consumer.id)}
                    >
                      {`${consumer.first_name} ${consumer.last_name} ${consumer.name ? `(${consumer.name})` : ''}`}
                    </SelectItem>
                  ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {showChangeReason && (
  <div className="space-y-2 mt-4">
    <label className="text-sm font-medium">Raison du changement</label>
    <Textarea
      placeholder="Indiquez la raison du changement de consommateur..."
      value={formData.change_reason || ""}
      onChange={(e) => handleChange('change_reason', e.target.value)}
      rows={3}
    />
  </div>
)}





            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manuel</SelectItem>
                  <SelectItem value="iot">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Emplacement</label>
              <Select
                value={formData.quartier_id}
                onValueChange={(value) => handleChange('quartier_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un quartier" />
                </SelectTrigger>
                <SelectContent>
                  {quartiers.map((quartier) => (
                    <SelectItem key={quartier.id} value={String(quartier.id)}>
                      {quartier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input 
                placeholder="Entrez la latitude"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input 
                placeholder="Entrez la longitude"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
              />
            </div>

            <div className="space-y-2">
  <label className="text-sm font-medium">Type de facturation</label>
  <Select
    value={formData.billing_type}
    onValueChange={(value) => handleChange('billing_type', value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Sélectionner un type de facturation" />
    </SelectTrigger>
    <SelectContent>
      <ScrollArea className="h-40">
        <SelectItem value="standard">Standard</SelectItem>
        <SelectItem value="premium">Premium</SelectItem>
        <SelectItem value="agricole">Agricole</SelectItem>
        <SelectItem value="industriel">Industriel</SelectItem>
        <SelectItem value="autre_tarif">Autre tarif</SelectItem>
        <SelectItem value="free">Gratuit</SelectItem>
      </ScrollArea>
    </SelectContent>
  </Select>
</div>

          

            


          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => handleFormSubmit(formData)}>
            {editMeter ? "Modifier" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    );
  };

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <MeterPageSkeleton />
      ) : (
        <>

      <div className="flex justify-between items-center">
  <h2 className="text-2xl font-bold">Gestion des Compteurs</h2>
  <div className="flex items-center space-x-4">
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Rechercher..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
    </div>

    <Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="Statut" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Tous</SelectItem>
    <SelectItem value="active">Actif</SelectItem>
    <SelectItem value="inactive">Inactif</SelectItem> 
  </SelectContent>
</Select>

<Button
            variant={problemFilterActive ? "default" : "outline"}
            onClick={() => setProblemFilterActive(!problemFilterActive)}
            className="flex items-center space-x-1"
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span>Problèmes</span>
          </Button>


          <MeterPDFDownloadButton 
  meters={meters} 
  quartiers={quartiers} 
  filterStatus={statusFilter}
  problemFilterActive={problemFilterActive}
/>

    
    

    <Button onClick={handleAdd}>
      <Plus className="h-4 w-4 mr-2" />
      Ajouter
    </Button>
  </div>
</div>
{/* Section des statistiques */}
<MeterStatistics statistics={statistics} />
      

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Consommateur</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Facturation</TableHead>
                <TableHead>Problème</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>

            {meters.map(meter => (
                  <TableRow key={meter.id}>
                    <TableCell>
  <div>
    <div className="font-medium">{meter.meter_number}</div>
    <div className="text-xs text-gray-500">
      {meter.serial_number || 'N/A'}
    </div>
  </div>
</TableCell>
                    

                

<TableCell>
  <div>
    <div className="flex items-center space-x-2">
      <User className="h-4 w-4" />
      <span>{meter.user?.first_name} {meter.user?.last_name}</span>
    </div>
    <div className="text-xs text-gray-500 ml-6">
    {meter.user?.name || 'N/A'}  {meter.user?.phone_number || 'N/A'} 
    </div>
  </div>
</TableCell>

                    <TableCell>
  <div className="flex items-center space-x-2">
    <MapPin className="h-4 w-4" />
    <span>{meter.quartier?.name || 'Non spécifié'}</span>
  </div>
</TableCell>

                    <TableCell>
                      <Badge variant={meter.type === 'iot' ? 'default' : 'secondary'}>
                        {meter.type.toUpperCase()}
                      </Badge>
                    </TableCell>

                  <TableCell>
  <Badge 
    variant={
      meter.billing_type === 'premium' ? 'destructive' : 
      meter.billing_type === 'free' ? 'success' : 
      meter.billing_type === 'agricole' ? 'outline' :
      meter.billing_type === 'industriel' ? 'default' :
      meter.billing_type === 'autre_tarif' ? 'secondary' :
      'secondary'
    }
  >
    {meter.billing_type === 'premium' ? 'Premium' : 
     meter.billing_type === 'free' ? 'Gratuit' : 
     meter.billing_type === 'agricole' ? 'Agricole' :
     meter.billing_type === 'industriel' ? 'Industriel' :
     meter.billing_type === 'autre_tarif' ? 'Autre' :
     'Standard'}
  </Badge>
</TableCell>



        <TableCell>
                    <MeterProblemBadge meter={meter} />
                  </TableCell>





                    <TableCell>
                      <Switch
                        checked={meter.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(meter)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(meter)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                        variant={meter.has_problem ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleReportProblem(meter)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>

                       {/* Nouveau bouton pour l'historique des utilisateurs */}
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleShowHistory(meter)}
    >
      <History className="h-4 w-4" />
    </Button>



                      {meter.status === 'inactive' && (
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => handlePermanentDelete(meter)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
                       
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
      {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
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
      disabled={currentPage === totalPages}
    >
      Suivant
    </Button>
  </div>
</div>

         

        </CardContent>
      </Card>

      </>
      )}

      <MeterForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editMeter={selectedMeter}
      />

<MeterProblemDialog 
  isOpen={isProblemDialogOpen}
  onClose={() => setIsProblemDialogOpen(false)}
  meter={selectedMeter}
  onSuccess={handleProblemSuccess}
/>

<Suspense fallback={null}>
  {isHistoryDialogOpen && (
    <MeterUserHistoryDialog 
      isOpen={isHistoryDialogOpen}
      onClose={() => setIsHistoryDialogOpen(false)}
      meterId={selectedMeter?.id}
    />
  )}
</Suspense>


      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le compteur sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ajouter ce dialogue de confirmation pour la suppression définitive */}
<AlertDialog open={isPermanentDeleteDialogOpen} onOpenChange={setIsPermanentDeleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Suppression définitive</AlertDialogTitle>
      <AlertDialogDescription>
        {canDelete 
          ? "Cette action ne peut pas être annulée. Le compteur sera définitivement supprimé de la base de données."
          : "Ce compteur ne peut pas être supprimé car il possède des relevés associés."}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Annuler</AlertDialogCancel>
      {canDelete && (
        <AlertDialogAction onClick={handlePermanentDeleteConfirm} className="bg-red-600 hover:bg-red-700">
          Supprimer définitivement
        </AlertDialogAction>
      )}
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


    </div>
  );
};

export default MeterPage;