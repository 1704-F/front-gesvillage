import React, { useState, useEffect } from 'react';
import AdminAssignModal from './AdminAssignModal';
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Search, Plus, Building2, User2, Trash2, Pencil } from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';

const ServiceTable = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [adminsToRemove, setAdminsToRemove] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des services :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/services/${id}/toggle-status`);
      setServices(prevServices =>
        prevServices.map(service =>
          service.id === id ? { ...service, active: !service.active } : service
        )
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut :', error);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      await api.patch(`/services/remove-admin`, { adminId });
      setServices(prevServices =>
        prevServices.map(service => ({
          ...service,
          users: service.users.filter(user => user.id !== adminId)
        }))
      );
      setRemoveModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'admin :', error);
    }
  };

  const openAssignModal = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
    setSelectedService(null);
  };

  const openRemoveAdminModal = (service) => {
    setSelectedService(service);
    setAdminsToRemove(service.users || []);
    setRemoveModalOpen(true);
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
          <Building2 className="h-6 w-6" />
          Attribution des rôles
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
          <Button onClick={() => window.location.href = '/services/new'}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un service
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Compteurs</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>CA Total</TableHead>
              <TableHead>Admins</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services
              .filter(service => 
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.meterCount || 0}</TableCell>
                  <TableCell>
                    {service.users && service.users.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {service.users.map((admin) => (
                          <div key={admin.id} className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-gray-500" />
                            <span>{admin.name}</span>
                            <span className="text-sm text-gray-500">({admin.phone_number})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">Aucun contact</span>
                    )}
                  </TableCell>
                  <TableCell>{service.totalCA || 0} FCFA</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignModal(service)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Attribuer Admin
                      </Button>
                      {service.users && service.users.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRemoveAdminModal(service)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(service.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={service.active}
                      onCheckedChange={() => handleToggleStatus(service.id)}
                    />
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => console.log('Suppression non implémentée')}
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

      {/* Modal pour attribuer un admin */}
      {modalOpen && (
        <AdminAssignModal
          service={selectedService}
          onClose={closeAssignModal}
          onAdminAssigned={(admin) => {
            setServices(prevServices =>
              prevServices.map(service =>
                service.id === selectedService.id
                  ? { ...service, users: [...(service.users || []), admin] }
                  : service
              )
            );
            closeAssignModal();
          }}
        />
      )}

      {/* Modal pour supprimer un admin */}
      <Dialog open={removeModalOpen} onOpenChange={() => setRemoveModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Supprimer un Admin du Service : {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {adminsToRemove.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-gray-500" />
                  <span>{admin.name}</span>
                  <span className="text-sm text-gray-500">({admin.phone_number})</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveAdmin(admin.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveModalOpen(false)}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceTable;