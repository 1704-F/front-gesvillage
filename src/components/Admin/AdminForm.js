import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    service_id: '',
  });
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Récupérez la liste des services disponibles 
    const fetchServices = async () => {
      try {
        const response = await api.get('/services/available');
        setServices(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des services :', error);
      }
    };

    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/superadmin/admins', formData);
      setMessage('Admin créé avec succès.');
    } catch (error) {
      console.error('Erreur lors de la création de l\'Admin :', error);
      setMessage('Erreur lors de la création de l\'Admin.');
    }
  };

  return (
    <div>
      <h1>Créer un Admin</h1>
      {message && <p style={{ color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom complet :</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Prénom :</label>
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Nom de famille :</label>
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
        </div>
        <div>
          <label>Date de naissance :</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
        </div>
        <div>
          <label>Numéro de téléphone :</label>
          <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
        </div>
        <div>
          <label>Service :</label>
          <select name="service_id" value={formData.service_id} onChange={handleChange} required>
            <option value="">Sélectionner un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Créer l'Admin</button>
      </form>
    </div>
  );
};

export default AdminForm;
