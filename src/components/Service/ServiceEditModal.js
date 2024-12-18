import React, { useState } from 'react';
import { Box, Modal, TextField, Button } from '@mui/material';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const ServiceEditModal = ({ service, open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: service.name,
    location: service.location,
    price_per_m3: service.price_per_m3,
    price_per_m3_above_limit: service.price_per_m3_above_limit,
    consumption_threshold: service.consumption_threshold,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/services/${service.id}`, formData);
      onSave();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service :', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2>Modifier le service</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom du service"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Localisation"
            name="location"
            value={formData.location}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prix par m³"
            name="price_per_m3"
            type="number"
            value={formData.price_per_m3}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prix par m³ au-delà du seuil"
            name="price_per_m3_above_limit"
            type="number"
            value={formData.price_per_m3_above_limit}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Seuil de consommation (m³)"
            name="consumption_threshold"
            type="number"
            value={formData.consumption_threshold}
            onChange={handleChange}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Sauvegarder
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            style={{ marginLeft: '10px' }}
          >
            Annuler
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default ServiceEditModal;
