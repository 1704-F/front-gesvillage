import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const ServiceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price_per_m3: 0,
    price_per_m3_above_limit: 0,
    consumption_threshold: 50,
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/services', formData);
      setMessage('Service créé avec succès.');
      navigate('/services'); // Redirige vers la liste des services après la création
    } catch (error) {
      console.error('Erreur lors de la création du service :', error);
      setMessage('Erreur lors de la création du service.');
    }
  };

  return (
    <div>
      <h1>Créer un nouveau service</h1>
      {message && <p style={{ color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom du service :</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Localisation :</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Prix par m³ :</label>
          <input
            type="number"
            name="price_per_m3"
            value={formData.price_per_m3}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Prix par m³ au-delà du seuil :</label>
          <input
            type="number"
            name="price_per_m3_above_limit"
            value={formData.price_per_m3_above_limit}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Seuil de consommation (m³) :</label>
          <input
            type="number"
            name="consumption_threshold"
            value={formData.consumption_threshold}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Créer le service</button>
      </form>
    </div>
  );
};

export default ServiceForm;
