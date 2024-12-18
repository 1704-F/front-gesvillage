import axios from 'axios';

console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);

const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.gesvillage.com',
});

const axiosPrivate = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.gesvillage.com/api',
});

// Intercepteur pour ajouter automatiquement le token JWT pour axiosPrivate
axiosPrivate.interceptors.request.use((config) => {
  console.log('Request URL:', config.baseURL + config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { axiosPublic, axiosPrivate };
// Default export pour rétrocompatibilité
export default axiosPrivate;