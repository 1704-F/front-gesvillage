import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import api from '../../utils/axios';

const AdminAssignModal = ({ service, onClose, onAdminAssigned }) => {
  const [admins, setAdmins] = useState([]); // Liste des admins disponibles
  const [filteredAdmins, setFilteredAdmins] = useState([]); // Liste filtrée selon la recherche
  const [searchQuery, setSearchQuery] = useState(''); // Recherche d'un admin
  const [selectedAdminId, setSelectedAdminId] = useState(''); // Admin sélectionné
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await api.get('/admins'); // Appel à l'endpoint pour récupérer les admins
        setAdmins(response.data);
        setFilteredAdmins(response.data); // Par défaut, tous les admins sont affichés
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des admins :', error);
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Filtrer les admins en fonction de la recherche
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(query) || // Recherche par nom
        admin.phone_number.includes(query) // Recherche par numéro de téléphone
    );

    setFilteredAdmins(filtered);
  };

  // Gérer l'attribution d'un admin
  const handleAssignAdmin = async () => {
    try {
      console.log(`Assigning Admin: Service ID - ${service.id}, Admin ID - ${selectedAdminId}`);
      const response = await api.patch(`/services/${service.id}/assign-admin`, {
        adminId: selectedAdminId,
      });
      const assignedAdmin = admins.find((admin) => admin.id === selectedAdminId);
      onAdminAssigned(assignedAdmin); // Mise à jour dans le tableau
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de l'attribution de l'admin :", error);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Modal open={true} onClose={onClose}>
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
          Attribuer un Admin au Service : {service.name}
        </Typography>
        <TextField
          label="Rechercher un Admin"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <FormControl fullWidth>
          <InputLabel id="select-admin-label">Sélectionner un Admin</InputLabel>
          <Select
            labelId="select-admin-label"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
          >
            {filteredAdmins.map((admin) => (
              <MenuItem key={admin.id} value={admin.id}>
                {admin.name} ({admin.phone_number})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAssignAdmin}
            disabled={!selectedAdminId}
          >
            Attribuer
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onClose}
            style={{ marginTop: '10px' }}
          >
            Annuler
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AdminAssignModal;
