import axios from 'axios';

// Définir l'URL de base en fonction de l'environnement
export const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'  // URL locale
  : 'https://api.gesvillage.com'; // URL de production

const axiosPublic = axios.create({
  baseURL: BASE_URL
});

const axiosPrivate = axios.create({
  baseURL: BASE_URL
});

// Intercepteur modifié pour gérer automatiquement le préfixe /api 
axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // N'ajoute pas /api pour les routes d'auth
  if (!config.url.startsWith('/auth')) {
    config.url = `/api${config.url}`;
  }
  
  return config;
});

export { axiosPublic, axiosPrivate };
export default axiosPrivate;