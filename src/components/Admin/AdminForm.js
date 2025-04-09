import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Search, Plus, User2, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from "../ui/toast/use-toast";
import { axiosPrivate as api } from '../../utils/axios';

const AdminPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [admins, setAdmins] = useState([]);
  const [services, setServices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  // État pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

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

  // Débouncer la recherche pour éviter trop d'appels API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fonction pour charger les données avec gestion d'erreur et timeout
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Ajouter un timeout de 30 secondes pour éviter les attentes infinies
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await api.get('/admins/dashboard', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Debug: Afficher la réponse du serveur
      console.log("Réponse du serveur:", response.data);
      
      const { admins, services, pagination: paginationData } = response.data;
      
      // S'assurer que admins est un tableau
      if (admins && Array.isArray(admins)) {
        setAdmins(admins);
        console.log(`Frontend: ${admins.length} admins chargés`);
      } else {
        console.error("Format de données invalide pour admins:", admins);
        setAdmins([]);
      }
      
      // S'assurer que services est un tableau
      if (services && Array.isArray(services)) {
        setServices(services);
      } else {
        console.error("Format de données invalide pour services:", services);
        setServices([]);
      }
      
      // Mettre à jour la pagination
      if (paginationData) {
        setPagination(paginationData);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      
      if (error.name === 'AbortError') {
        setError("La requête a pris trop de temps. Veuillez réessayer.");
      } else {
        setError(error.response?.data?.message || "Une erreur est survenue lors du chargement des données.");
      }
      
      toast({
        title: "Erreur",
        description: error.name === 'AbortError' 
          ? "La requête a pris trop de temps. Veuillez réessayer." 
          : "Impossible de récupérer les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchTerm, toast]);

  // Pour les tests uniquement (à enlever en production)
  useEffect(() => {
    // Essayer avec l'ancien endpoint si le nouveau échoue
    const fallbackToOldEndpoint = async () => {
      try {
        console.log("Utilisation de l'ancien endpoint comme fallback");
        const [adminsRes, servicesRes] = await Promise.all([
          api.get('/admins'),
          api.get('/services/available')
        ]);
        
        setAdmins(adminsRes.data || []);
        setServices(servicesRes.data || []);
        
        console.log(`Fallback: ${adminsRes.data?.length || 0} admins chargés`);
      } catch (err) {
        console.error("Échec du fallback:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Si après 5 secondes nous n'avons toujours pas d'admins, essayer l'ancien endpoint
    if (loading && admins.length === 0) {
      const timer = setTimeout(() => {
        fallbackToOldEndpoint();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, admins.length]);

  // Charger les données initiales et lors des changements de pagination/recherche
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
        await api.patch(`/admins/${editingAdmin.id}`, dataToSend);
        toast({
          title: "Succès",
          description: "Admin mis à jour avec succès"
        });
      } else {
        await api.post('/admins', dataToSend);
        toast({
          title: "Succès",
          description: "Admin créé avec succès"
        });
      }
      setModalOpen(false);
      
      // Recharger les données
      fetchDashboardData();
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
      await api.delete(`/admins/${id}`);
      toast({
        title: "Succès",
        description: "Admin supprimé avec succès"
      });
      
      // Recharger les données
      fetchDashboardData();
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

  // Changement de page de pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
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

  if (loading && !admins.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error && !admins.length) {
    return renderError();
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
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
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
            {admins.length > 0 ? (
              admins.map((admin) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-500">Aucun administrateur trouvé</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Affichage de {pagination.totalItems ? (pagination.page - 1) * pagination.limit + 1 : 0} à {Math.min(pagination.page * pagination.limit, pagination.totalItems)} sur {pagination.totalItems} administrateurs
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

      {/* Modal Form */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className="sm:max-w-[800px]">
    <DialogHeader>
      <DialogTitle>
        {editingAdmin ? "Modifier l'admin" : "Ajouter un admin"}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organisation en 2 colonnes */}
      <div className="grid grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-4">
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
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingAdmin}
              placeholder={editingAdmin ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
            />
            <p className="text-sm text-gray-500">
              {editingAdmin 
                ? "Laisser vide pour conserver le mot de passe actuel" 
                : "Le mot de passe doit contenir au moins 8 caractères"}
            </p>
          </div>
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