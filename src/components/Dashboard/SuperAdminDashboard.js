import React, { useState, useEffect } from 'react';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const SuperAdminDashboard = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Nouveaux KPI globaux
  const [globalKPI, setGlobalKPI] = useState({
    totalActiveMeters: 0,
    totalInactiveMeters: 0,
    totalCA: 0,
    totalConsumers: 0,
    totalConsumption: 0, // Nouveau : consommation totale en m³
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboards/superadmin', {
        params: { startDate, endDate },
      });
      setData(response.data);
      prepareChartData(response.data);
      calculateGlobalKPI(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des données du tableau de bord SuperAdmin:', error);
      setError('Impossible de charger les données. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const prepareChartData = (servicesData) => {
    const labels = servicesData.map((service) => service.serviceName);
    const activeMeters = servicesData.map((service) => service.activeMeters);
    const totalConsumers = servicesData.map((service) => service.totalConsumers);
    const totalCA = servicesData.map((service) => service.totalCA);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Compteurs Actifs',
          data: activeMeters,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Consommateurs Totaux',
          data: totalConsumers,
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
        },
        {
          label: 'CA Total (FCFA)',
          data: totalCA,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    });
  };

  const calculateGlobalKPI = (servicesData) => {
    const totalActiveMeters = servicesData.reduce((sum, service) => sum + service.activeMeters, 0);
    const totalInactiveMeters = servicesData.reduce((sum, service) => sum + service.inactiveMeters, 0);
    const totalCA = servicesData.reduce((sum, service) => sum + service.totalCA, 0);
    const totalConsumers = servicesData.reduce((sum, service) => sum + service.totalConsumers, 0);
    const totalConsumption = servicesData.reduce((sum, service) => sum + service.totalConsumption, 0); // Nouveau

    setGlobalKPI({
      totalActiveMeters,
      totalInactiveMeters,
      totalCA,
      totalConsumers,
      totalConsumption, // Nouveau
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate]);

  if (loading) {
    return <div>Chargement des données...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Tableau de bord SuperAdmin</h1>

      {/* KPI globaux */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
        <div>
          <h2>Compteurs Actifs Totaux</h2>
          <p>{globalKPI.totalActiveMeters}</p>
        </div>
        <div>
          <h2>Compteurs Inactifs Totaux</h2>
          <p>{globalKPI.totalInactiveMeters}</p>
        </div>
        <div>
          <h2>CA Total</h2>
          <p>{globalKPI.totalCA} FCFA</p>
        </div>
        <div>
          <h2>Consommateurs Totaux</h2>
          <p>{globalKPI.totalConsumers}</p>
        </div>
        <div>
          <h2>Consommation Totale</h2>
          <p>{globalKPI.totalConsumption} m³</p>
        </div>
      </div>

      {/* Filtrage par période */}
      <div>
        <label>Filtrer par période :</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchDashboardData}>Filtrer</button>
      </div>

      {/* Affichage des graphiques */}
      <div style={{ marginTop: '20px' }}>
        <h2>Graphiques</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
            },
          }}
        />
      </div>

      {/* Détails par service */}
      <div style={{ marginTop: '20px' }}>
        <h2>Détails par service</h2>
        {data.map((service, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h3>{service.serviceName}</h3>
            <p>Compteurs actifs : {service.activeMeters}</p>
            <p>Compteurs inactifs : {service.inactiveMeters}</p>
            <p>CA Total : {service.totalCA} FCFA</p>
            <p>Total des consommateurs : {service.totalConsumers}</p>
            <p>Consommation totale : {service.totalConsumption} m³</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
