import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import {
  Users,
  Activity,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

// Enregistrement des composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [serviceName, setServiceName] = useState('Chargement...'); // État pour le nom du service
  const [meters, setMeters] = useState([]); // Initialisation de `meters` comme tableau vide
  const [invoices, setInvoices] = useState([]);
  const [consumers, setConsumers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalUnpaid, setTotalUnpaid] = useState(0);

  // Fonction pour récupérer le nom du service
  const fetchServiceName = async () => {
    try {
      const response = await api.get('/services/available');
      if (response.data && response.data.length > 0) {
        setServiceName(response.data[0].name);
      } else {
        setServiceName('Service non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du nom du service:', error);
      setServiceName('Erreur de chargement');
    }
  };

  // Fonction pour récupérer les données du tableau de bord
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboards/admin', { params: { filter } });
      console.log('Réponse complète:', response.data);
  
      // Gestion des consommateurs - filtrer seulement les consommateurs (role_id === 4)
      const consumerCount = response.data.consumersCount;
      setConsumers(consumerCount);
  
      // Gestion des compteurs - utiliser active et inactive arrays
      const metersData = response.data.meters || { active: [], inactive: [] };
      const activeMetersCount = metersData.active?.length || 0;
      const inactiveMetersCount = metersData.inactive?.length || 0;
      setMeters([...(metersData.active || []), ...(metersData.inactive || [])]);
  
      // Gestion des factures
      const invoicesData = response.data.invoices || [];
      setInvoices(invoicesData);
  
      // Calcul des montants des factures
      const paidAmount = invoicesData
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount_due) || 0), 0);
  
      const unpaidAmount = invoicesData
        .filter(invoice => invoice.status === 'pending')
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount_due) || 0), 0);
  
      setTotalPaid(paidAmount);
      setTotalUnpaid(unpaidAmount);
  
      console.log('Statistiques calculées:', {
        consommateurs: consumerCount,
        compteursActifs: activeMetersCount,
        compteursInactifs: inactiveMetersCount,
        facturesPayees: paidAmount,
        facturesImpayees: unpaidAmount
      });
  
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setConsumers(0);
      setMeters([]);
      setInvoices([]);
      setTotalPaid(0);
      setTotalUnpaid(0);
    } finally {
      setLoading(false);
    }
  };
  // Appel des données au montage du composant et à chaque changement de filtre
  useEffect(() => {
    fetchServiceName();
    fetchDashboardData();
  }, [filter]);

  // Composant pour afficher les statistiques sous forme de carte
  const StatCard = ({ icon, title, value, color }) => (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {React.cloneElement(icon, { className: `h-6 w-6 text-${color}-600` })}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </Card>
  );

  // Composant pour les paiements (payés et impayés)
  const PaymentRow = ({ icon, label, amount, color }) => (
    <div className={`flex justify-between items-center p-3 bg-${color}-50 rounded-lg`}>
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`font-semibold text-${color}-600`}>
        {amount.toLocaleString()} FCFA
      </span>
    </div>
  );

  // Filtrage des compteurs (actifs et inactifs) avec vérification du type de `meters`
  const activeMeters = Array.isArray(meters)
    ? meters.filter((meter) => meter.status === 'active').length
    : 0;

  const inactiveMeters = Array.isArray(meters)
    ? meters.filter((meter) => meter.status === 'inactive').length
    : 0;

  const paidInvoices = Array.isArray(invoices)
    ? invoices.filter((invoice) => invoice.status === 'paid').length
    : 0;

  const unpaidInvoices = Array.isArray(invoices)
    ? invoices.filter((invoice) => invoice.status === 'pending').length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2081E2]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec le nom du service */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
        👋Vous êtes admin du service 🎯 - {serviceName}
        </h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semaine</SelectItem>
            <SelectItem value="month">Mois</SelectItem>
            <SelectItem value="year">Année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users />}
          title="Total Consommateurs"
          value={consumers}
          color="blue"
        />
        <StatCard 
          icon={<Activity />}
          title="Compteurs Actifs"
          value={activeMeters}
          color="green"
        />
        <StatCard 
          icon={<AlertCircle />}
          title="Compteurs Inactifs"
          value={inactiveMeters}
          color="red"
        />
        <StatCard 
          icon={<TrendingUp />}
          title="Total Factures"
          value={paidInvoices + unpaidInvoices}
          color="purple"
        />
      </div>

      {/* Graphiques et informations financières */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">État des Paiements</h3>
          <div className="space-y-4">
            <PaymentRow 
              icon={<DollarSign className="text-green-500" />}
              label="Factures Payées"
              amount={totalPaid}
              color="green"
            />
            <PaymentRow 
              icon={<DollarSign className="text-red-500" />}
              label="Factures Impayées"
              amount={totalUnpaid}
              color="red"
            />
          </div>
          <div className="h-48 mt-4">
            <Bar
              data={{
                labels: ['Factures'],
                datasets: [
                  {
                    label: 'Payées',
                    data: [paidInvoices],
                    backgroundColor: '#22C55E',
                  },
                  {
                    label: 'Non Payées',
                    data: [unpaidInvoices],
                    backgroundColor: '#EF4444',
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: { y: { beginAtZero: true } }
              }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Répartition des Compteurs</h3>
          <div className="h-48">
            <Pie
              data={{
                labels: ['Actifs', 'Inactifs'],
                datasets: [
                  {
                    data: [activeMeters, inactiveMeters],
                    backgroundColor: ['#22C55E', '#EF4444'],
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
