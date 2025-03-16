//dashbord
import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Users,
  Activity,
  AlertCircle,
  TrendingUp,
  Download,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate; 

const AdminDashboard = () => {
  const [serviceName, setServiceName] = useState('Chargement...');
  const [dashboardData, setDashboardData] = useState({
    meters: { active: [], inactive: [] },
    invoices: [],
    consumers: 0,
    totalPaid: 0,
    totalUnpaid: 0,
    monthlyInvoices: [],
    monthlyConsumption: [] 
  });

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

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date('2024-01-01');
      //const date = new Date();
      //date.setMonth(date.getMonth() - 1);
      //date.setDate(1);
      return date;
    })(),
    new Date()
  ]);

  // Composant StatCard amélioré
  const StatCard = ({ icon: Icon, title, value, amount, color }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {amount && (
            <p className="text-sm text-gray-500">{amount.toLocaleString()} FCFA</p>
          )}
        </div>
      </div>
    </Card>
  );

  // Composant DateRangePicker
  const DateRangePicker = ({ value, onChange }) => {
    const [startDate, endDate] = value;
    
    return (
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'dd/MM/yyyy') : 'Date début'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={(date) => onChange([date, endDate])}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'dd/MM/yyyy') : 'Date fin'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={endDate}
              onSelect={(date) => onChange([startDate, date])}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboards/admin', {
        params: {
          startDate: dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : undefined,
          endDate: dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : undefined
        }
      });
  
      setDashboardData({
        meters: response.data.meters,
        invoices: response.data.invoices,
        consumers: response.data.consumersCount,
        totalPaid: response.data.totalPaid,
        totalUnpaid: response.data.totalUnpaid,
        monthlyInvoices: response.data.monthlyInvoices,
        monthlyConsumption: response.data.monthlyConsumption
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/dashboards/export-pdf', {
        responseType: 'blob',
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd')
        }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dashboard.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export PDF:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchServiceName();
  }, [filter, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
           {serviceName}
        </h1>

        <div className="flex items-center gap-4">
   <div className="relative">
     <input
       type="date"
       className="pl-10 pr-3 py-2 border rounded-lg"
       value={dateRange[0] instanceof Date ? format(dateRange[0], 'yyyy-MM-dd') : ''}
       onChange={(e) => setDateRange([
         e.target.value ? new Date(e.target.value) : null,
         dateRange[1]
       ])}
     />
     <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
   </div>

   <div className="relative">
     <input
       type="date"
       className="pl-10 pr-3 py-2 border rounded-lg"
       value={dateRange[1] instanceof Date ? format(dateRange[1], 'yyyy-MM-dd') : ''} 
       onChange={(e) => setDateRange([
         dateRange[0],
         e.target.value ? new Date(e.target.value) : null
       ])}
     />
     <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
   </div>

  {/* 
   <Button onClick={handleExportPDF}>
     <Download className="h-4 w-4 mr-2" />
     Exporter PDF
   </Button>

    */}

 </div>

        

      </div>

      {/* Stats Cards */}
      
<div className="space-y-6">
  {/* Première ligne - 4 cartes */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard 
      icon={Users}
      title="Total Consommateurs"
      value={dashboardData.consumers}
      color="blue"
    />
    <StatCard 
      icon={Activity}
      title="Compteurs Actifs"
      value={dashboardData.meters.active.length}
      color="green"
    />
    <StatCard 
      icon={AlertCircle}
      title="Compteurs Inactifs"
      value={dashboardData.meters.inactive.length}
      color="red"
    />
    <StatCard 
      icon={TrendingUp}
      title="Total Factures"
      value={dashboardData.invoices.length}
      color="purple"
    />
  </div>

  {/* Deuxième ligne - 2 cartes */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <StatCard 
      icon={DollarSign}
      title="Factures Payées"
      value={dashboardData.invoices.filter(i => i.status === 'paid').length}
      amount={dashboardData.totalPaid}
      color="green"
    />
    <StatCard 
      icon={DollarSign}
      title="Factures Impayées"
      value={dashboardData.invoices.filter(i => i.status === 'pending').length}
      amount={dashboardData.totalUnpaid}
      color="red"
    />
  </div>
</div>



      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des paiements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des Paiements</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.monthlyInvoices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="paid_amount" 
                  name="Montant Payé"
                  stroke="#22C55E" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="unpaid_amount" 
                  name="Montant Impayé"
                  stroke="#EF4444" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Évolution des consommations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des Consommations (m³)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlyConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="consumption" 
                  name="Consommation"
                  fill="#2563EB"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;