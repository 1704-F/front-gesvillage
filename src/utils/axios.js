// utils/axios.js
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gesvillage.com';

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
  
  console.log('URL finale:', config.url); // Pour le débogage
  return config;
});

export { axiosPublic, axiosPrivate };
export default axiosPrivate;