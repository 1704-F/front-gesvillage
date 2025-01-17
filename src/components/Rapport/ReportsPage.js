import React, { useState, useEffect } from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFReport from './PDFReport';

import { useToast } from "../ui/toast/use-toast";
import { 
  Calendar, 
  BarChart4, 
  TrendingUp,
  DollarSign,
  Users,
  Droplets,
  FileBarChart,
  Calculator,
  CheckCircle,
  Home,
  Gauge,
  TrendingDown,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  UserPlus,
  Clock

} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, Pie, PieChart, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { axiosPrivate as api } from '../../utils/axios';



// ================ CONSTANTES ================
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300'
  ];
  
  // Fonction helper pour les labels de graphiques circulaires
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="black" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // ================ FONCTIONS UTILITAIRES ================
  
  
// Modification de la fonction getRevenueData pour mieux gérer le filtrage par période
const getRevenueData = (invoices, donations, period) => {
  console.log('Period:', period);
  console.log('Invoices:', invoices);
  console.log('Donations:', donations);
  
  const monthlyData = {};

  // S'assurer que les dates sont au bon format
  const startDate = new Date(period[0]);
  const endDate = new Date(period[1]);

  // Générer tous les mois entre les dates
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const month = format(currentDate, 'MM/yyyy');
    monthlyData[month] = { month, factures: 0, dons: 0 };
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Traiter les factures
  if (invoices && invoices.length > 0) {
    invoices
      .filter(invoice => {
        const isValidInvoice = invoice.status === 'paid' &&
          isWithinPeriod(invoice.start_date, period) && 
          isWithinPeriod(invoice.end_date, period);
        return isValidInvoice;
      })
      .forEach(invoice => {
        const month = format(new Date(invoice.start_date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].factures += Number(invoice.amount_due || 0);
        }
      });
  }

  // Traiter les dons
  if (donations && donations.length > 0) {
    donations
      .filter(donation => {
        const isValidDonation = donation.status === 'received' && 
          isWithinPeriod(donation.date, period);
        return isValidDonation;
      })
      .forEach(donation => {
        const month = format(new Date(donation.date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].dons += Number(donation.amount || 0);
        }
      });
  }

  // Convertir les données mensuelles en tableau et trier par date
  const result = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month) - new Date(b.month));
  
  console.log('Processed revenue data:', result);
  return result;
};

  
  // Fonction pour formater les nombres avec séparateur de milliers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  // Fonction pour vérifier si une date est dans une période
  const isWithinPeriod = (dateStr, period) => {
    if (!dateStr || !period || !period[0] || !period[1]) return false;
    
    // Convertir les dates en objets Date en début de journée
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    const startDate = new Date(period[0]);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(period[1]);
    endDate.setHours(23, 59, 59, 999);
  
    return date >= startDate && date <= endDate;
  };

  const getMonthlyFinancialData = (data, period) => {
    const monthlyData = {};
  
    // Générer tous les mois entre les dates
    const startDate = new Date(period[0]);
    const endDate = new Date(period[1]);
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = format(currentDate, 'MM/yyyy');
      monthlyData[month] = {
        month,
        factures: 0,
        dons: 0,
        depenses: 0,
        salaires: 0
      };
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    // Traitement des factures
    data.invoices
      .filter(i => i.status === 'paid' && 
        isWithinPeriod(i.start_date, period))
      .forEach(invoice => {
        const month = format(new Date(invoice.start_date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].factures += Number(invoice.amount_due);
        }
      });
  
    // Traitement des dons
    data.donations
      .filter(d => d.status === 'received' && 
        isWithinPeriod(d.date, period))
      .forEach(donation => {
        const month = format(new Date(donation.date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].dons += Number(donation.amount);
        }
      });
  
    // Traitement des dépenses
    data.expenses
      .filter(e => e.status === 'approved' && 
        isWithinPeriod(e.date, period))
      .forEach(expense => {
        const month = format(new Date(expense.date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].depenses += Number(expense.amount);
        }
      });
  
    // Traitement des salaires
    data.salaries
      .filter(s => s.status === 'paid' && 
        isWithinPeriod(s.month, period))
      .forEach(salary => {
        const month = format(new Date(salary.month), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].salaires += Number(salary.total_amount);
        }
      });
  
    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };


  // ================ COMPOSANTS ================



  const DownloadButton = ({ data, currentPeriod, serviceInfo }) => {
    console.log('DownloadButton props:', { data, currentPeriod, serviceInfo });

    if (!serviceInfo) {
      console.log('serviceInfo is null or undefined'); 
      return null;
    }
    
    const fileName = `Rapport_${format(currentPeriod[0], 'dd-MM-yyyy')}_${format(currentPeriod[1], 'dd-MM-yyyy')}.pdf`;
    
    return (
      <PDFDownloadLink
        document={
          <PDFReport 
            data={data} 
            currentPeriod={currentPeriod}
            serviceInfo={serviceInfo}
          />
        }
        fileName={fileName}
      >
        {({ blob, url, loading, error }) => (
          <Button 
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap"
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            {loading ? 'Génération...' : 'Télécharger le rapport'}
          </Button>
        )}
      </PDFDownloadLink>
    );
  };
  
  // DateRangeSelector Component
  const DateRangeSelector = ({
    currentRange,
    compareRange,
    onCurrentRangeChange,
    onCompareRangeChange,
    compareModeActive
  }) => {
    return (
      <div className="flex items-center gap-4">
        {/* Période principale */}
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="date"
              className="pl-10 pr-3 py-2 border rounded-lg"
              value={format(currentRange[0], 'yyyy-MM-dd')}
              onChange={(e) => onCurrentRangeChange([
                new Date(e.target.value), 
                currentRange[1]
              ])}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="date"
              className="pl-10 pr-3 py-2 border rounded-lg"
              value={format(currentRange[1], 'yyyy-MM-dd')}
              onChange={(e) => onCurrentRangeChange([
                currentRange[0], 
                new Date(e.target.value)
              ])}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>
  
        {/* Période de comparaison */}
        {compareModeActive && (
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg border-blue-200 bg-blue-50"
                value={format(compareRange[0], 'yyyy-MM-dd')}
                onChange={(e) => onCompareRangeChange([
                  new Date(e.target.value), 
                  compareRange[1]
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="date"
                className="pl-10 pr-3 py-2 border rounded-lg border-blue-200 bg-blue-50"
                value={format(compareRange[1], 'yyyy-MM-dd')}
                onChange={(e) => onCompareRangeChange([
                  compareRange[0], 
                  new Date(e.target.value)
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ================ COMPOSANT PRINCIPAL ================
const ReportsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [compareModeActive, setCompareModeActive] = useState(false);
    const [serviceInfo, setServiceInfo] = useState(null);
  
    // États des données
    const [data, setData] = useState({
      invoices: [],
      readings: [],
      meters: [],
      expenses: [],
      consumers: [],
      donations: [],  // Ajouté
      salaries: [],
      pendingExpenses: []
    });
  
    // États des périodes
    const [currentPeriod, setCurrentPeriod] = useState([
      (() => {
        const date = new Date('2024-01-01');
        //date.setMonth(date.getMonth() - 1);
        return date;
      })(),
      new Date()
    ]);
  
    const [comparePeriod, setComparePeriod] = useState([ 
      (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 2);
        return date;
      })(),
      (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date;
      })()
    ]);
  
    // Effet pour charger les données
   
      const fetchData = async () => {
        try {
          const startDate = format(currentPeriod[0], 'yyyy-MM-dd');
          const endDate = format(currentPeriod[1], 'yyyy-MM-dd');

          // Pour la requête des salaires
          const salaryDate = new Date(currentPeriod[0]);
          const month = salaryDate.getMonth() + 1;
          const year = salaryDate.getFullYear();


      
          console.log('Fetching data for period:', { startDate, endDate });
      
          const [
            invoicesRes,
            readingsRes,
            metersRes,
            expensesApprovedRes,
            expensesPendingRes,
            consumersRes,
            donationsRes,
            salariesRes,
            serviceRes
          ] = await Promise.all([
            // Filtrer les factures payées dans la période
            api.get(`/invoices`, {
              params: {
                start_date: startDate,
                end_date: endDate,
                status: 'paid',
                payment_date_filter: true  // Ajouter ce paramètre
              }
            }),
            api.get(`/readings?start_date=${startDate}&end_date=${endDate}`),
            api.get('/meters'),
            // Filtrer les dépenses approuvées
            api.get(`/expenses?start_date=${startDate}&end_date=${endDate}&status=approved`),
            api.get(`/expenses?start_date=${startDate}&end_date=${endDate}&status=pending`),
            api.get('/consumers'),
            // Filtrer les dons reçus
            api.get(`/donations?start_date=${startDate}&end_date=${endDate}&status=received`),
            // Filtrer les salaires payés
            api.get(`/salaries`, {
              params: {
                start_date: startDate,
                end_date: endDate
              }
            }),


            api.get('/services/available')
          ]);

          console.log('Service Response:', serviceRes);

          if (serviceRes.data && Array.isArray(serviceRes.data) && serviceRes.data.length > 0) {
            // Prendre le premier service du tableau
            const serviceData = serviceRes.data[0];
            console.log('Service Data to set:', serviceData);
            setServiceInfo(serviceData);
          } else {
            console.warn('No service data available');
            setServiceInfo(null);
          }


          console.log('Received data:', {
            invoices: invoicesRes.data.data,
            donations: donationsRes.data.data,
            salaries: salariesRes.data.data,
            expenses: expensesApprovedRes.data.data
          });

          
      
          setData({
            invoices: invoicesRes.data.data || [],
            readings: readingsRes.data.data || [],
            meters: metersRes.data.data || [],
            expenses: expensesApprovedRes.data.data || [],
            pendingExpenses: expensesPendingRes.data.data || [],
            consumers: consumersRes.data.data || [],
            donations: donationsRes.data.data || [],
            salaries: salariesRes.data.data || []
          });
        } catch (error) {
          console.error('Error fetching data:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les données"
          });
        } finally {
          setLoading(false);
        }
      };
  
      
   

    useEffect(() => {
      fetchData();
    }, [currentPeriod[0], currentPeriod[1]]);
  
    
  // Calcul des métriques pour la période actuelle
  const currentMetrics = React.useMemo(() => ({
    revenues: {
      invoices: (data.invoices || [])
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + Number(i.amount_due || 0), 0),
      donations: (data.donations || [])
        .filter(d => d.status === 'received')
        .reduce((sum, d) => sum + Number(d.amount || 0), 0)
    },
    expenses: {
      operational: (data.expenses || [])
        .filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + Number(e.amount || 0), 0),
      salaries: (data.salaries || [])
      .filter(s => s.status === 'paid' && isWithinPeriod(s.month, currentPeriod)) // Utiliser month au lieu de payment_date
      .reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
    },
    pending_expenses: (data.pendingExpenses || [])
      .filter(e => isWithinPeriod(e.date, currentPeriod))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
  }), [data, currentPeriod]);

  // Calcul des métriques pour la période de comparaison
  const compareMetrics = React.useMemo(() => 
    compareModeActive ? {
      revenue: data.invoices
        .filter(i => i.status === 'paid' && isWithinPeriod(i.payment_date, comparePeriod))
        .reduce((sum, i) => sum + Number(i.amount_due), 0),
      consumption: data.readings
       .filter(r => isWithinPeriod(r.start_date, comparePeriod))  // Même changement
       .reduce((sum, r) => sum + Number(r.reading_value), 0),     // Même changement
      expenses: data.expenses
        .filter(e => isWithinPeriod(e.date, comparePeriod))
        .reduce((sum, e) => sum + Number(e.amount), 0),
      activeMeters: data.meters.filter(m => m.status === 'active').length
    } : null, [data, comparePeriod, compareModeActive]);

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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileBarChart className="h-6 w-6" />
          Rapports
        </h1>

        <div className="flex items-center gap-4">
          {/* Sélecteurs de dates */}
          <DateRangeSelector
            currentRange={currentPeriod}
            compareRange={comparePeriod}
            onCurrentRangeChange={setCurrentPeriod}
            onCompareRangeChange={setComparePeriod}
            compareModeActive={compareModeActive}
          />

{serviceInfo && (
          <div className="ml-4">
            <DownloadButton 
              data={data}
              currentPeriod={currentPeriod}
              serviceInfo={serviceInfo}
            />
          </div>
        )}

          {/* Bouton de comparaison 
          <Button
            variant={compareModeActive ? "default" : "outline"}
            onClick={() => setCompareModeActive(!compareModeActive)}
          >
            <BarChart4 className="w-4 h-4 mr-2" />
            Comparer
          </Button>
          */}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart4 className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Finances
          </TabsTrigger>
          <TabsTrigger value="consumption" className="flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Consommation
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Consommateurs
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        {/* Vue d'ensemble */}
<TabsContent value="overview" className="space-y-6">
  <OverviewContent
    data={data}
    currentPeriod={currentPeriod}
  />
</TabsContent>

        {/* Finances Tab */}
        <TabsContent value="financial" className="space-y-6">
          <FinancesContent
            data={data}
            currentPeriod={currentPeriod}
            comparePeriod={compareModeActive ? comparePeriod : null}
          />
        </TabsContent>

        {/* Consommation Tab */}
        <TabsContent value="consumption" className="space-y-6">
          <ConsumptionContent
            data={data}
            currentPeriod={currentPeriod}
            comparePeriod={compareModeActive ? comparePeriod : null}
          />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <ClientsContent
            data={data}
            currentPeriod={currentPeriod}
            comparePeriod={compareModeActive ? comparePeriod : null}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};




// ================ COMPOSANTS DE CONTENU DES TABS ================

const OverviewContent = ({ data, currentPeriod }) => {
  // Calcul des métriques principales
  const metrics = React.useMemo(() => {
    const revenues = {
      invoices: data.invoices
        .filter(i => i.status === 'paid' && isWithinPeriod(i.start_date, currentPeriod))
        .reduce((sum, i) => sum + Number(i.amount_due || 0), 0),
      donations: data.donations
        .filter(d => d.status === 'received' && isWithinPeriod(d.date, currentPeriod))
        .reduce((sum, d) => sum + Number(d.amount || 0), 0)
    };

    const expenses = {
      operational: data.expenses
        .filter(e => e.status === 'approved' && isWithinPeriod(e.date, currentPeriod))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0),
      salaries: data.salaries
        .filter(s => s.status === 'paid' && isWithinPeriod(s.month, currentPeriod))
        .reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
    };

    const pendingExpenses = data.pendingExpenses
      .filter(e => isWithinPeriod(e.date, currentPeriod))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const totalRevenues = revenues.invoices + revenues.donations;
    const totalExpenses = expenses.operational + expenses.salaries;

    // Calcul des variations (mois précédent)
    const previousMonthStart = new Date(currentPeriod[0]);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(currentPeriod[1]);
    previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);

    const previousRevenues = {
      invoices: data.invoices
        .filter(i => i.status === 'paid' && isWithinPeriod(i.start_date, [previousMonthStart, previousMonthEnd]))
        .reduce((sum, i) => sum + Number(i.amount_due || 0), 0),
      donations: data.donations
        .filter(d => d.status === 'received' && isWithinPeriod(d.date, [previousMonthStart, previousMonthEnd]))
        .reduce((sum, d) => sum + Number(d.amount || 0), 0)
    };

    const previousExpenses = {
      operational: data.expenses
        .filter(e => e.status === 'approved' && isWithinPeriod(e.date, [previousMonthStart, previousMonthEnd]))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0),
      salaries: data.salaries
        .filter(s => s.status === 'paid' && isWithinPeriod(s.month, [previousMonthStart, previousMonthEnd]))
        .reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
    };

    const previousTotal = previousRevenues.invoices + previousRevenues.donations;
    const previousExpensesTotal = previousExpenses.operational + previousExpenses.salaries;

    return {
      revenues,
      expenses,
      totalRevenues,
      totalExpenses,
      pendingExpenses,
      balance: totalRevenues - totalExpenses,
      variations: {
        revenues: previousTotal ? ((totalRevenues - previousTotal) / previousTotal * 100) : 0,
        expenses: previousExpensesTotal ? ((totalExpenses - previousExpensesTotal) / previousExpensesTotal * 100) : 0
      }
    };
  }, [data, currentPeriod]);

  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          {trendValue !== undefined && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {Math.abs(trendValue).toFixed(1)}%
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="ml-2 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Données pour le graphique des revenus
  const revenueData = React.useMemo(() => {
    const monthlyData = getRevenueData(data.invoices, data.donations, currentPeriod);
    return monthlyData;
  }, [data.invoices, data.donations, currentPeriod]);

  // Données pour les camemberts
  const revenueDistribution = [
    { name: 'Factures', value: metrics.revenues.invoices },
    { name: 'Dons', value: metrics.revenues.donations }
  ];

  const expensesDistribution = [
    { name: 'Opérationnelles', value: metrics.expenses.operational },
    { name: 'Salaires', value: metrics.expenses.salaries }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenus Totaux"
          value={`${formatNumber(metrics.totalRevenues)} FCFA`}
          trend={metrics.variations.revenues >= 0 ? 'up' : 'down'}
          trendValue={metrics.variations.revenues}
          icon={DollarSign}
        />
        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(metrics.totalExpenses)} FCFA`}
          trend={metrics.variations.expenses <= 0 ? 'up' : 'down'}
          trendValue={metrics.variations.expenses}
          icon={TrendingUp}
        />
        <MetricCard
          title="Balance"
          value={`${formatNumber(metrics.balance)} FCFA`}
          trend={metrics.balance >= 0 ? 'up' : 'down'}
          icon={Calculator}
        />
        <MetricCard
          title="Dépenses en Attente"
          value={`${formatNumber(metrics.pendingExpenses)} FCFA`}
          subtitle="à approuver"
          icon={Clock}
        />
      </div>

      {/* Graphique d'évolution des revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Revenus</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                formatter={(value) => [`${formatNumber(value)} FCFA`]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="factures"
                name="Factures"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="dons"
                name="Dons"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition des revenus et dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  <Cell fill="#2563EB" />
                  <Cell fill="#16A34A" />
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)} FCFA`]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  <Cell fill="#DC2626" />
                  <Cell fill="#EA580C" />
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)} FCFA`]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


const FinancesContent = ({ data, currentPeriod }) => {
  const financialMetrics = React.useMemo(() => {
    const revenues = {
      factures: data.invoices
        .filter(i => i.status === 'paid' && isWithinPeriod(i.start_date, currentPeriod))
        .reduce((sum, i) => sum + Number(i.amount_due), 0),
      dons: data.donations
        .filter(d => d.status === 'received' && isWithinPeriod(d.date, currentPeriod))
        .reduce((sum, d) => sum + Number(d.amount), 0)
    };

    const expenses = {
      operational: data.expenses
        .filter(e => e.status === 'approved' && isWithinPeriod(e.date, currentPeriod))
        .reduce((sum, e) => sum + Number(e.amount), 0),
      salaries: data.salaries
        .filter(s => s.status === 'paid' && isWithinPeriod(s.month, currentPeriod))
        .reduce((sum, s) => sum + Number(s.total_amount), 0)
    };

    const totalRevenues = revenues.factures + revenues.dons;
    const totalExpenses = expenses.operational + expenses.salaries;
    const balance = totalRevenues - totalExpenses;

    return {
      revenues,
      expenses,
      totalRevenues,
      totalExpenses,
      balance,
      operatingMargin: totalRevenues ? ((balance / totalRevenues) * 100) : 0,
      expenseRatio: totalRevenues ? ((totalExpenses / totalRevenues) * 100) : 0
    };
  }, [data, currentPeriod]);

  // Composant de carte métrique réutilisable
  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          {trendValue && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {trendValue}%
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="ml-2 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Fonction pour traiter les dépenses par catégorie
const processCategoryExpenses = (expenses, salaries, currentPeriod) => {
  // Créer un objet pour stocker les dépenses par catégorie
  const categorizedExpenses = {};

  // Traiter les dépenses opérationnelles
  expenses
    .filter(e => e.status === 'approved' && isWithinPeriod(e.date, currentPeriod))
    .forEach(expense => {
      const category = expense.category?.name || 'Autres';
      if (!categorizedExpenses[category]) {
        categorizedExpenses[category] = 0;
      }
      categorizedExpenses[category] += Number(expense.amount || 0);
    });

  // Ajouter les salaires comme une catégorie distincte
  const totalSalaries = salaries
    .filter(s => s.status === 'paid' && isWithinPeriod(s.month, currentPeriod))
    .reduce((sum, s) => sum + Number(s.total_amount || 0), 0);

  if (totalSalaries > 0) {
    categorizedExpenses['Salaires'] = totalSalaries;
  }

  // Convertir l'objet en tableau pour Recharts
  return Object.entries(categorizedExpenses)
    .map(([name, value]) => ({
      name,
      value
    }))
    .filter(item => item.value > 0) // Filtrer les catégories avec une valeur de 0
    .sort((a, b) => b.value - a.value); // Trier par valeur décroissante
};

  const monthlyFinancialData = getMonthlyFinancialData(data, currentPeriod);
  const expensesByCategory = processCategoryExpenses(data.expenses, data.salaries, currentPeriod);

  return (
    <div className="space-y-6">
      {/* Section des métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenus Totaux"
          value={`${formatNumber(financialMetrics.totalRevenues)} FCFA`}
          trend="up"
          trendValue="12.5"
          icon={DollarSign}
        />
        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(financialMetrics.totalExpenses)} FCFA`}
          trend="down"
          trendValue="8.3"
          icon={TrendingDown}
        />
        <MetricCard
          title="Marge Opérationnelle"
          value={`${financialMetrics.operatingMargin.toFixed(1)}%`}
          trend={financialMetrics.operatingMargin > 0 ? 'up' : 'down'}
          icon={Target}
        />
        <MetricCard
          title="Ratio Dépenses/Revenus"
          value={`${financialMetrics.expenseRatio.toFixed(1)}%`}
          trend={financialMetrics.expenseRatio < 70 ? 'up' : 'down'}
          icon={Activity}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Évolution Financière</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFinancialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`}
                  tick={{ fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  formatter={(value) => [`${formatNumber(value)} FCFA`]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="factures" 
                  name="Factures" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="dons" 
                  name="Dons" 
                  stroke="#16A34A" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphiques de répartition */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Factures', value: financialMetrics.revenues.factures },
                    { name: 'Dons', value: financialMetrics.revenues.dons }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  <Cell fill="#2563EB" />
                  <Cell fill="#16A34A" />
                </Pie>
                <Tooltip formatter={(value) => `${formatNumber(value)} FCFA`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatNumber(value)} FCFA`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analyse des dépenses par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses par Catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `${formatNumber(value)} FCFA`} />
                <Bar dataKey="value" fill="#3B82F6">
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsumptionContent = ({ data, currentPeriod }) => {
  const { readings, meters } = data;

  // Calcul des métriques pour la période actuelle
  const consumptionMetrics = React.useMemo(() => {
    const filteredReadings = readings.filter(r => 
      isWithinPeriod(r.start_date, currentPeriod)
    );

    const totalConsumption = filteredReadings.reduce((sum, r) => 
      sum + Number(r.reading_value || 0), 0
    );

    const activeMeters = meters.filter(m => m.status === 'active').length;

    return {
      totalConsumption,
      averageConsumption: activeMeters ? totalConsumption / activeMeters : 0,
      peakConsumption: Math.max(...filteredReadings.map(r => Number(r.reading_value || 0)), 0),
      activeMeters,
      totalMeters: meters.length,
      utilizationRate: (activeMeters / meters.length) * 100
    };
  }, [readings, meters, currentPeriod]);

  // Composant Carte Métrique
  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-blue-100' : 'bg-red-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-blue-600' : 'text-red-600'}`} />
          </div>
          {trendValue && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {trendValue}%
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="ml-2 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Données pour le graphique d'évolution
  const monthlyConsumptionData = React.useMemo(() => {
    const monthlyData = {};
    
    // Générer tous les mois entre les dates
    const startDate = new Date(currentPeriod[0]);
    const endDate = new Date(currentPeriod[1]);
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = format(currentDate, 'MM/yyyy');
      monthlyData[month] = { month, consumption: 0 };
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Ajouter les consommations
    readings
      .filter(r => isWithinPeriod(r.start_date, currentPeriod))
      .forEach(reading => {
        const month = format(new Date(reading.start_date), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].consumption += Number(reading.reading_value || 0);
        }
      });

    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [readings, currentPeriod]);

  // Données pour le graphique par quartier
  const consumptionByZone = React.useMemo(() => {
    const zoneData = {};
    
    readings
      .filter(r => isWithinPeriod(r.start_date, currentPeriod))
      .forEach(reading => {
        const meter = meters.find(m => m.id === reading.meter_id);
        if (meter?.quartier?.name) {
          const zone = meter.quartier.name;
          if (!zoneData[zone]) {
            zoneData[zone] = {
              name: zone,
              consumption: 0,
              activeMeters: 0
            };
          }
          zoneData[zone].consumption += Number(reading.reading_value || 0);
          zoneData[zone].activeMeters = meters.filter(m => 
            m.quartier?.name === zone && m.status === 'active'
          ).length;
        }
      });

    return Object.values(zoneData)
      .sort((a, b) => b.consumption - a.consumption);
  }, [readings, meters, currentPeriod]);

  return (
    <div className="space-y-6">
      {/* Cartes métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consommation Totale"
          value={`${formatNumber(consumptionMetrics.totalConsumption)} m³`}
          trend="up"
          trendValue="15.2"
          icon={Droplets}
        />
        <MetricCard
          title="Consommation Moyenne"
          value={`${formatNumber(consumptionMetrics.averageConsumption.toFixed(1))} m³`}
          subtitle="par compteur"
          trend="up"
          trendValue="8.7"
          icon={Gauge}
        />
        <MetricCard
          title="Pic de Consommation"
          value={`${formatNumber(consumptionMetrics.peakConsumption)} m³`}
          trend="down"
          trendValue="5.3"
          icon={TrendingUp}
        />
        <MetricCard
          title="Taux d'Utilisation"
          value={`${consumptionMetrics.utilizationRate.toFixed(1)}%`}
          subtitle={`${consumptionMetrics.activeMeters}/${consumptionMetrics.totalMeters} compteurs`}
          trend={consumptionMetrics.utilizationRate > 80 ? 'up' : 'down'}
          icon={Activity}
        />
      </div>

      {/* Graphique d'évolution de la consommation */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la Consommation</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={monthlyConsumptionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(1)}k`}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                formatter={(value) => [`${formatNumber(value)} m³`]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="consumption"
                name="Consommation"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique de consommation par quartier */}
      <Card>
        <CardHeader>
          <CardTitle>Consommation par Quartier</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={consumptionByZone}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="name"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(1)}k`}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                formatter={(value) => [`${formatNumber(value)} m³`]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Bar 
                dataKey="consumption" 
                name="Consommation"
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientsContent = ({ data, currentPeriod }) => {
  const { consumers, meters } = data;

  // Calcul des métriques clients
  const clientMetrics = React.useMemo(() => {
    const filteredConsumers = consumers.filter(c => 
      isWithinPeriod(c.createdAt, currentPeriod)
    );

    const activeMeters = meters.filter(m => m.status === 'active');
    const totalZones = new Set(meters.map(m => m.quartier?.name).filter(Boolean)).size;
    
    const newClients = filteredConsumers.length;
    const totalActiveClients = activeMeters.length;
    const inactiveClients = meters.length - activeMeters.length;
    
    const previousMonthStart = new Date(currentPeriod[0]);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(currentPeriod[1]);
    previousMonthEnd.setMonth(previousMonthEnd.getMonth() - 1);
    
    const previousNewClients = consumers.filter(c => 
      isWithinPeriod(c.createdAt, [previousMonthStart, previousMonthEnd])
    ).length;

    return {
      newClients,
      previousNewClients,
      totalActiveClients,
      inactiveClients,
      totalZones,
      growthRate: previousNewClients ? ((newClients - previousNewClients) / previousNewClients * 100) : 0,
      activeRate: (totalActiveClients / meters.length * 100)
    };
  }, [consumers, meters, currentPeriod]);

  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          {trendValue && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {trendValue}%
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          {subtitle && <p className="ml-2 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Préparation des données pour les graphiques
  const registrationHistory = React.useMemo(() => {
    const monthlyData = {};
    
    // Générer tous les mois entre les dates
    const startDate = new Date(currentPeriod[0]);
    const endDate = new Date(currentPeriod[1]);
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const month = format(currentDate, 'MM/yyyy');
      monthlyData[month] = { month, nouveaux: 0, total: 0 };
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Ajouter les nouveaux Consommateur
    consumers
      .filter(c => isWithinPeriod(c.createdAt, currentPeriod))
      .forEach(consumer => {
        const month = format(new Date(consumer.createdAt), 'MM/yyyy');
        if (monthlyData[month]) {
          monthlyData[month].nouveaux += 1;
        }
      });

    // Calculer le total cumulatif
    let cumulative = 0;
    Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .forEach(data => {
        cumulative += data.nouveaux;
        data.total = cumulative;
      });

    return Object.values(monthlyData);
  }, [consumers, currentPeriod]);

  const clientsByZone = React.useMemo(() => {
    const zoneData = {};
    
    meters.forEach(meter => {
      const zone = meter.quartier?.name || 'Non défini';
      if (!zoneData[zone]) {
        zoneData[zone] = {
          name: zone,
          total: 0,
          actifs: 0
        };
      }
      zoneData[zone].total += 1;
      if (meter.status === 'active') {
        zoneData[zone].actifs += 1;
      }
    });

    return Object.values(zoneData)
      .map(zone => ({
        ...zone,
        tauxActivite: (zone.actifs / zone.total * 100).toFixed(1)
      }))
      .sort((a, b) => b.total - a.total);
  }, [meters]);

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consommateur Actifs"
          value={clientMetrics.totalActiveClients}
          subtitle={`sur ${meters.length} consommateurs`}
          trend={clientMetrics.activeRate > 80 ? 'up' : 'down'}
          trendValue={clientMetrics.activeRate.toFixed(1)}
          icon={Users}
        />
        <MetricCard
          title="Nouveaux Consommateur"
          value={clientMetrics.newClients}
          trend={clientMetrics.growthRate > 0 ? 'up' : 'down'}
          trendValue={clientMetrics.growthRate.toFixed(1)}
          icon={UserPlus}
        />
        <MetricCard
          title="Taux d'Activité"
          value={`${clientMetrics.activeRate.toFixed(1)}%`}
          trend={clientMetrics.activeRate > 80 ? 'up' : 'down'}
          icon={Activity}
        />
        <MetricCard
          title="Zones Couvertes"
          value={clientMetrics.totalZones}
          subtitle="quartiers"
          trend="up"
          icon={Home}
        />
      </div>

      {/* Graphique d'évolution des inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Inscriptions</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={registrationHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="nouveaux"
                name="Consommateur"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total cumulé"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition par quartier */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Quartier</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={clientsByZone}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="name"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fill: '#6B7280' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6B7280' }}
                unit="%"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="total" 
                name="Total consommateurs"
                fill="#3B82F6"
                barSize={20}
              />
              <Bar 
                yAxisId="left"
                dataKey="actifs" 
                name="Consommateurs actifs"
                fill="#16A34A"
                barSize={20}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tauxActivite"
                name="Taux d'activité"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition des statuts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Statuts des consommateurs</CardTitle>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Actifs</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Inactifs</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Actifs', value: clientMetrics.totalActiveClients },
                  { name: 'Inactifs', value: clientMetrics.inactiveClients }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#16A34A" />
                <Cell fill="#DC2626" />
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Clients']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};





export default ReportsPage;