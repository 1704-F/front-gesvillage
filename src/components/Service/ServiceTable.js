import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Switch,
  Typography,
  TextField,
  Modal,
  Box,
} from '@mui/material';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;
import AdminAssignModal from './AdminAssignModal'; // Modale pour attribuer un admin

const ServiceTable = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState(null); // Service sélectionné pour le modale
  const [modalOpen, setModalOpen] = useState(false); // État du modale pour attribuer un admin
  const [removeModalOpen, setRemoveModalOpen] = useState(false); // État du modale pour supprimer un admin
  const [adminsToRemove, setAdminsToRemove] = useState([]); // Liste des admins à afficher dans la modale de suppression

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        setServices(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des services :', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/services/${id}/toggle-status`);
      setServices((prevServices) =>
        prevServices.map((service) =>
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
      setServices((prevServices) =>
        prevServices.map((service) => ({
          ...service,
          users: service.users.filter((user) => user.id !== adminId),
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

  const closeRemoveAdminModal = () => {
    setRemoveModalOpen(false);
    setSelectedService(null);
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Services
      </Typography>

      <TextField
        label="Rechercher un service"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        style={{ marginBottom: '20px' }}
        onClick={() => window.location.href = '/services/new'}
      >
        Ajouter un Service
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Compteurs</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>CA Total</TableCell>
              <TableCell>Admins</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.meterCount || 0}</TableCell>
                <TableCell>
                  {service.users && service.users.length > 0 ? (
                    service.users.map((admin) => (
                      <div key={admin.id}>
                        {admin.name} ({admin.phone_number})
                      </div>
                    ))
                  ) : (
                    'Aucun contact'
                  )}
                </TableCell>
                <TableCell>{service.totalCA || 0} FCFA</TableCell>
                <TableCell>
                  <div>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => openAssignModal(service)}
                    >
                      Attribuer Admin
                    </Button>
                    {service.users && service.users.length > 0 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openRemoveAdminModal(service)}
                        style={{ marginLeft: '10px' }}
                      >
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
                    onChange={() => handleToggleStatus(service.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => window.location.href = `/services/${service.id}/edit`}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    style={{ marginLeft: '10px' }}
                    onClick={() => console.log('Suppression non implémentée')}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modale pour attribuer un admin */}
      {modalOpen && (
        <AdminAssignModal
          service={selectedService}
          onClose={closeAssignModal}
          onAdminAssigned={(admin) => {
            setServices((prevServices) =>
              prevServices.map((service) =>
                service.id === selectedService.id
                  ? { ...service, users: [...(service.users || []), admin] }
                  : service
              )
            );
            closeAssignModal();
          }}
        />
      )}

      {/* Modale pour supprimer un admin */}
      {removeModalOpen && (
        <Modal open={true} onClose={closeRemoveAdminModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Supprimer un Admin du Service : {selectedService?.name}
            </Typography>
            {adminsToRemove.map((admin) => (
              <div key={admin.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Typography>{admin.name} ({admin.phone_number})</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveAdmin(admin.id)}
                  style={{ marginLeft: '10px' }}
                >
                  Supprimer
                </Button>
              </div>
            ))}
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={closeRemoveAdminModal}
              style={{ marginTop: '20px' }}
            >
              Annuler
            </Button>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default ServiceTable;
