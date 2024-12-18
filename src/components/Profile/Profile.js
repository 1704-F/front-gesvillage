import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import pour la redirection
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    profile_image: '',
    role: '',
  });
  const [newImage, setNewImage] = useState(null); // Pour stocker la nouvelle image
  const [previewImage, setPreviewImage] = useState(''); // Aperçu de l'image
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Pour rediriger l'utilisateur

  // Récupérer les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        setProfile(response.data);
        setPreviewImage(`http://localhost:5000${response.data.profile_image}`); // Utilise l'URL de l'image téléchargée
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
        if (error.response && error.response.status === 401) {
          // Redirige vers la page de connexion si le token a expiré
          navigate('/');
          localStorage.removeItem('token'); // Supprimez le token expiré
        } else {
          setMessage('Impossible de charger les informations du profil.');
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('first_name', profile.first_name);
    formData.append('last_name', profile.last_name);
    formData.append('date_of_birth', profile.date_of_birth);
    formData.append('address', profile.address);
    if (newImage) formData.append('profile_image', newImage);

    try {
      await api.patch('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Profil mis à jour avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      if (error.response && error.response.status === 401) {
        // Redirige vers la page de connexion si le token a expiré
        navigate('/');
        localStorage.removeItem('token'); // Supprimez le token expiré
      } else {
        setMessage('Erreur lors de la mise à jour du profil.');
      }
    }
  };

  // Gérer le changement des valeurs des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Gérer l'upload de l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Aperçu temporaire
    } else {
      setNewImage(null);
      setPreviewImage(''); // Supprime l'aperçu si aucun fichier n'est sélectionné
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1>Mon Profil</h1>
      {message && <p style={{ color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom complet :</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Prénom :</label>
          <input
            type="text"
            name="first_name"
            value={profile.first_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Nom :</label>
          <input
            type="text"
            name="last_name"
            value={profile.last_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Date de naissance :</label>
          <input
            type="date"
            name="date_of_birth"
            value={profile.date_of_birth}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Numéro de téléphone :</label>
          <input
            type="text"
            name="phone_number"
            value={profile.phone_number}
            disabled
          />
        </div>
        <div>
          <label>Adresse :</label>
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Rôle :</label>
          <input type="text" value={profile.role} disabled />
        </div>
        <div>
          <label>Photo de profil :</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewImage && (
            <div>
              <img
                src={previewImage}
                alt="Aperçu"
                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
};

export default Profile;
