import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
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
import { Switch } from "../ui/switch";
import { useToast } from "../ui/toast/use-toast";
import { MapPin, Pencil, Trash2, Plus, Search, User } from 'lucide-react';
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
import MeterStatistics from './MeterStatistics';
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
const { toast } = useToast();


// Calculer les indices pour la pagination après la déclaration de meters
const totalPages = Math.ceil(meters.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentMeters = meters.slice(startIndex, endIndex);

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchMeters(),
      fetchConsumers(),
      fetchStatistics()
    ]).finally(() => setLoading(false));
  }, [statusFilter]);


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
  const fetchMeters = async () => {
    try {
      const response = await api.get('/meters', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined }
      });
      
      // Tri des compteurs par numéro croissant
      const sortedMeters = response.data.data.sort((a, b) => {
        // Extraire les parties numériques
        const aMatch = a.meter_number.match(/(\D+)-?(\d+)/);
        const bMatch = b.meter_number.match(/(\D+)-?(\d+)/);
        
        if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
          // Si les préfixes sont identiques (ex: MTR-), comparer les numéros
          return parseInt(aMatch[2]) - parseInt(bMatch[2]);
        }
        // Sinon comparer les chaînes entières
        return a.meter_number.localeCompare(b.meter_number);
      });
      
      setMeters(sortedMeters);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les compteurs."
      });
    }
  };

  const fetchConsumers = async () => {
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
  };

  const fetchStatistics = async () => {
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
  };

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
      fetchMeters();
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
      fetchMeters();
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
      fetchMeters();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
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
              <div className="sticky top-0 bg-white p-2">
                <Input
                  placeholder="Rechercher un consommateur..."
                  value={searchConsumer}
                  onChange={(e) => setSearchConsumer(e.target.value)}
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
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium (Tarif élevé)</SelectItem>
                  <SelectItem value="free">Gratuit (Bâtiment public)</SelectItem>
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
    <Select value={filterStatus} onValueChange={setFilterStatus}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous</SelectItem>
        <SelectItem value="active">Actif</SelectItem>
        <SelectItem value="inactive">Inactif</SelectItem>
      </SelectContent>
    </Select>
    <MeterPDFDownloadButton 
      meters={meters} 
      quartiers={quartiers} 
      filterStatus={filterStatus} 
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
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {currentMeters
      .filter(meter => 
        meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${meter.user?.first_name} ${meter.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
                .map(meter => (
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
              'secondary'
            }
          >
            {meter.billing_type === 'premium' ? 'Premium' : 
             meter.billing_type === 'free' ? 'Gratuit' : 
             'Standard'}
          </Badge>
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
        {startIndex + 1}-{Math.min(endIndex, meters.length)} sur {meters.length}
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

      <MeterForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editMeter={selectedMeter}
      />

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
    </div>
  );
};

export default MeterPage;