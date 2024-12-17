import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';

const SupervisorDashboard = () => {
  const [data, setData] = useState({
    activeMeters: 0,
    inactiveMeters: 0,
    totalConsumers: 0,
    manualMeters: 0,
    iotMeters: 0,
    consumptionByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/dashboards/superviseur'); // API Superviseur
        setData(response.data); // Assurez-vous que les clés correspondent à la structure attendue
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord Superviseur:', error);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  return (
    <div>
      <h1>Tableau de bord Superviseur</h1>
      <p>Compteurs actifs : {data.activeMeters}</p>
      <p>Compteurs inactifs : {data.inactiveMeters}</p>
      <p>Nombre total de consommateurs : {data.totalConsumers}</p>
      <p>Compteurs manuels : {data.manualMeters}</p>
      <p>Compteurs IoT : {data.iotMeters}</p>

      <h2>Consommation par mois</h2>
      {data.consumptionByMonth && data.consumptionByMonth.length > 0 ? (
        <ul>
          {data.consumptionByMonth.map((monthData, index) => (
            <li key={index}>
              Mois : {new Date(monthData.month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} | 
              Consommation totale : {monthData.totalconsumption} m³
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune donnée de consommation disponible.</p>
      )}
    </div>
  );
};

export default SupervisorDashboard;
