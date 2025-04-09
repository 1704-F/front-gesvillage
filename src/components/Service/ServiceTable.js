import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { 
  Search, 
  Plus, 
  Building2, 
  User2, 
  Trash2, 
  Pencil, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useToast } from "../ui/toast/use-toast";
import { axiosPrivate as api } from '../../utils/axios';

const RoleAssignmentPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [services, setServices] = useState([]);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  
  // État pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Débouncer la recherche
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
      // Ajouter un timeout de 30 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await api.get('/roles/dashboard', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const { services, availableAdmins, pagination: paginationData } = response.data;
      
      setServices(services || []);
      setAvailableAdmins(availableAdmins || []);
      setPagination(paginationData);
      
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

  // Chargement des données initiales
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Assigner un admin à un service
  const handleAssignAdmin = async () => {
    if (!selectedService || !selectedAdmin) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un service et un admin",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await api.post('/roles/assign-admin', {
        serviceId: selectedService.id,
        adminId: selectedAdmin
      });
      
      // Mettre à jour l'état local pour refléter le changement
      const { admin } = response.data;
      
      // Mettre à jour les services
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === selectedService.id
            ? {
                ...service,
                contact_person: admin.first_name + ' ' + admin.last_name,
                contact_info: admin.phone_number,
                users: [...(service.users || []), admin]
              }
            : service
        )
      );
      
      // Retirer l'admin de la liste des admins disponibles
      setAvailableAdmins(prevAdmins => 
        prevAdmins.filter(a => a.id !== parseInt(selectedAdmin))
      );
      
      toast({
        title: "Succès",
        description: "Admin assigné avec succès"
      });
      
      // Fermer le modal et réinitialiser la sélection
      setAssignModalOpen(false);
      setSelectedAdmin('');
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'admin:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible d'assigner l'admin",
        variant: "destructive"
      });
    }
  };

  // Retirer un admin d'un service
  const handleRemoveAdmin = async (adminId) => {
    if (!adminId) return;
    
    try {
      const response = await api.post('/roles/remove-admin', { adminId });
      
      // Mettre à jour l'état local pour refléter le changement
      const { admin } = response.data;
      
      // Mettre à jour les services
      setServices(prevServices => 
        prevServices.map(service => ({
          ...service,
          users: (service.users || []).filter(user => user.id !== adminId)
        }))
      );
      
      // Ajouter l'admin à la liste des admins disponibles
      const removedAdmin = selectedService?.users?.find(user => user.id === adminId);
      if (removedAdmin) {
        setAvailableAdmins(prevAdmins => [...prevAdmins, removedAdmin]);
      }
      
      toast({
        title: "Succès",
        description: "Admin retiré avec succès"
      });
      
      // Si c'était le dernier admin du service, fermer le modal
      const updatedService = services.find(s => s.id === selectedService?.id);
      const remainingAdmins = (updatedService?.users || []).filter(user => user.id !== adminId);
      
      if (remainingAdmins.length === 0) {
        setRemoveModalOpen(false);
      }
      
    } catch (error) {
      console.error('Erreur lors du retrait de l\'admin:', error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de retirer l'admin",
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Attribution des rôles
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>
      </div>

      <Card>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Admins</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    {service.contact_person ? (
                      <div className="flex flex-col">
                        <span>{service.contact_person}</span>
                        <span className="text-sm text-gray-500">{service.contact_info}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucun contact</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      {service.users && service.users.length > 0 ? (
                        service.users.map((admin) => (
                          <div key={admin.id} className="flex items-center justify-between gap-2 border-b pb-2">
                            <div className="flex items-center gap-2">
                              <User2 className="h-4 w-4 text-gray-500" />
                              <span>{admin.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedService(service);
                                handleRemoveAdmin(admin.id);
                              }}
                              className="text-red-600 hover:text-red-700 p-1 h-auto"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">Aucun admin assigné</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedService(service);
                          setAssignModalOpen(true);
                        }}
                        disabled={availableAdmins.length === 0}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Attribuer Admin
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : 'N/A'}
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
                        onClick={() => window.location.href = `/services/${service.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
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

      {/* Modal pour attribuer un admin */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Attribuer un Admin au Service : {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Administrateur</label>
                <Select
                  value={selectedAdmin}
                  onValueChange={setSelectedAdmin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un administrateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdmins.length > 0 ? (
                      availableAdmins.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id.toString()}>
                          {admin.name} - {admin.phone_number}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Aucun administrateur disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {availableAdmins.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    Tous les administrateurs sont déjà assignés à des services. 
                    Veuillez créer un nouvel administrateur pour continuer.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignModalOpen(false);
                setSelectedAdmin('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAssignAdmin}
              disabled={!selectedAdmin || availableAdmins.length === 0}
            >
              Attribuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleAssignmentPage;