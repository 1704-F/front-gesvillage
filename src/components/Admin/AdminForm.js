//componens/Admin/AdminForm.js
import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Plus, User2, Trash2, Pencil } from 'lucide-react';
import { useToast } from "../ui/toast/use-toast";
import { axiosPrivate as api } from '../../utils/axios';

const AdminPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState([]);
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null); 

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    service_id: '',
    password: '',
  });

  // Chargement des données
  // Dans useEffect
useEffect(() => {
  const fetchData = async () => {
    try {
      const [adminsRes, servicesRes] = await Promise.all([
        api.get('/admins', {
          params: {
            fields: ['id', 'name', 'first_name', 'last_name', 'date_of_birth', 
                    'phone_number', 'service_id', 'createdAt', 'updatedAt']
          }
        }),
        api.get('/services/available')
      ]);
      console.log('Données administrateurs reçues:', adminsRes.data); // Debug
      setAdmins(adminsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Erreur complète:', error); // Debug
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

  // Gestion du formulaire

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation du mot de passe
      if (!editingAdmin && (!formData.password || formData.password.length < 8)) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit faire au moins 8 caractères",
          variant: "destructive"
        });
        return;
      }
  
      // Créer un objet avec les données à envoyer
      const dataToSend = {
        ...formData,
        // N'inclure le mot de passe que s'il est fourni
        ...(formData.password ? { password: formData.password } : {})
      };
  
      if (editingAdmin) {
        const response = await api.patch(`/admins/${editingAdmin.id}`, dataToSend);
        toast({
          title: "Succès",
          description: "Admin mis à jour avec succès"
        });
      } else {
        const response = await api.post('/admins', dataToSend);
        toast({
          title: "Succès",
          description: "Admin créé avec succès"
        });
      }
      setModalOpen(false);
      // Recharger les admins
      const adminsResponse = await api.get('/admins');
      setAdmins(adminsResponse.data);
    } catch (error) {
      console.error('Erreur complète:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue"
      });
    }
  };
  


  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet admin ?')) return;
    try {
      await api.delete(`/admins/${id}`); // Au lieu de '/superadmin/admins'
      setAdmins(admins.filter(admin => admin.id !== id));
      toast({
        title: "Succès",
        description: "Admin supprimé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'admin",
        variant: "destructive"
      });
    }
  };

  const openModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name || '',
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        date_of_birth: admin.date_of_birth || '',
        phone_number: admin.phone_number || '',
        service_id: admin.service_id?.toString() || '',
        password: '' // Toujours vide en modification
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        service_id: '',
        password: ''
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User2 className="h-6 w-6" />
          Gestion des Admins
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
            Ajouter un admin
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Date de naissance</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
  {admins
    .filter(admin => 
      admin?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin?.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((admin) => (
      <TableRow key={admin.id}>
        <TableCell className="font-medium">{admin.name || 'N/A'}</TableCell>
        <TableCell>{admin.first_name || 'N/A'}</TableCell>
        <TableCell>{admin.last_name || 'N/A'}</TableCell>
        <TableCell>
          {admin.date_of_birth ? new Date(admin.date_of_birth).toLocaleDateString() : 'N/A'}
        </TableCell>
        <TableCell>{admin.phone_number || 'N/A'}</TableCell>
        <TableCell>
          {services.find(s => s.id === admin.service_id)?.name || 'Non assigné'}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal(admin)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(admin.id)}
              className="text-red-600 hover:text-red-700"
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

      {/* Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? "Modifier l'admin" : "Ajouter un admin"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  name="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de famille</label>
                <Input
                  name="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date de naissance</label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Numéro de téléphone</label>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
  <label className="text-sm font-medium">Mot de passe</label>
  <Input
    type="password"
    name="password"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    required={!editingAdmin} // Requis uniquement pour la création
    placeholder={editingAdmin ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
  />
  <p className="text-sm text-gray-500">
    {editingAdmin 
      ? "Laisser vide pour conserver le mot de passe actuel" 
      : "Le mot de passe doit contenir au moins 8 caractères"}
  </p>
</div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingAdmin ? "Modifier" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;