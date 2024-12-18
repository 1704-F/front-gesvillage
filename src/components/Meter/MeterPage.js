import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
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
const api = axiosPrivate; 

const MeterPage = () => {
  // États
  const [meters, setMeters] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextMeterNumber, setNextMeterNumber] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const { toast } = useToast();

  // Chargement initial des données
  useEffect(() => {
    fetchMeters();
    fetchConsumers();
  }, [filterStatus]);

  // Fonctions de récupération des données
  const fetchMeters = async () => {
    try {
      const response = await api.get('/meters', {
        params: { status: filterStatus === 'all' ? '' : filterStatus },
      });
      setMeters(response.data.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les compteurs",
        variant: "destructive"
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
      user_id: editMeter?.user?.id?.toString() || "", 
      type: editMeter?.type || "manual",
      location: editMeter?.location || "",
      latitude: editMeter?.latitude || "",
      longitude: editMeter?.longitude || "",
    });
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
      });
    }
  }, [editMeter]);


    const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editMeter ? "Modifier le compteur" : "Ajouter un compteur"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de compteur</label>
              <Input
                disabled
                value={formData.meter_number}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Consommateur</label>
              <Select
                value={formData.user_id}
                onValueChange={(value) => handleChange('user_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un consommateur" />
                </SelectTrigger>
                <SelectContent>
                  {consumers.map((consumer) => (
                    <SelectItem key={consumer.id} value={String(consumer.id)}>
                      {`${consumer.first_name} ${consumer.last_name} (${consumer.name})`}
                    </SelectItem>
                  ))}
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Emplacement</label>
              <Input 
                placeholder="Entrez l'emplacement"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
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
          </div>

          <DialogFooter>
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
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Consommateur</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meters
                .filter(meter => 
                  meter.meter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  `${meter.user?.first_name} ${meter.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(meter => (
                  <TableRow key={meter.id}>
                    <TableCell>{meter.meter_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{meter.user?.first_name} {meter.user?.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{meter.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meter.type === 'iot' ? 'default' : 'secondary'}>
                        {meter.type.toUpperCase()}
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
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(meter)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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