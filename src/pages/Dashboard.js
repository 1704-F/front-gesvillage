import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import SuperAdminDashboard from '../components/Dashboard/SuperAdminDashboard';
import SupervisorDashboard from '../components/Dashboard/SupervisorDashboard';
import ConsumerDashboard from '../components/Dashboard/ConsumerDashboard';

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await api.get('/auth/me'); // Endpoint pour récupérer tous les infos utilisateur
        setRole(response.data.role);
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle utilisateur :', error);
        alert('Erreur lors de la récupération du rôle utilisateur.');
        navigate('/login');
      }
    };

    fetchUserRole();
  }, [navigate]);

  if (!role) return <p>Chargement...</p>;

  switch (role) {
    case 'SuperAdmin':
      return <SuperAdminDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    case 'Superviseur':
      return <SupervisorDashboard />;
    case 'Consommateur':
      return <ConsumerDashboard />;
    default:
      return <p>Rôle inconnu. Accès interdit.</p>;
  }
};

export default Dashboard;
