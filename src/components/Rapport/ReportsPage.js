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
// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num);
};

// ================ COMPOSANTS ================
const DownloadButton = ({ data, currentPeriod, serviceInfo }) => {
  if (!serviceInfo) {
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
  onCurrentRangeChange
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
    </div>
  );
};

// ================ COMPOSANT PRINCIPAL ================
const ReportsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // États des données
  const [data, setData] = useState({
    invoices: [],
    readings: [],
    meters: [],
    expenses: [],
    consumers: [],
    donations: [],
    salaries: [],
    pendingExpenses: []
  });
  
  // États pour les données précalculées
  const [metrics, setMetrics] = useState({
    financial: {
      revenues: { invoices: 0, donations: 0 },
      expenses: { operational: 0, salaries: 0 },
      totalRevenues: 0,
      totalExpenses: 0,
      pendingExpenses: 0,
      balance: 0,
      operatingMargin: 0,
      expenseRatio: 0
    },
    consumption: {
      totalConsumption: 0,
      averageConsumption: 0,
      activeMeters: 0,
      totalMeters: 0,
      utilizationRate: 0
    },
    clients: {
      newClients: 0,
      totalActiveClients: 0,
      inactiveClients: 0,
      activeRate: 0
    }
  });

  const [chartData, setChartData] = useState({
    monthlyData: [],
    expenseCategories: [],
    revenueDistribution: [],
    clientsHistory: []
  });

  const [serviceInfo, setServiceInfo] = useState(null);

  // États des périodes
  const [currentPeriod, setCurrentPeriod] = useState([
    (() => {
      const date = new Date();
    date.setMonth(date.getMonth() - 1); // Mois dernier 
    date.setDate(1); // Premier jour du mois
    date.setHours(0, 0, 0, 0);
    return date;
      
    })(),
    new Date()
  ]);

  // Fonction pour charger les données
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const startDate = format(currentPeriod[0], 'yyyy-MM-dd');
      const endDate = format(currentPeriod[1], 'yyyy-MM-dd');
      
      console.log('Fetching data for period:', { startDate, endDate });
      
      const response = await api.get('/reports/dashboard', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      
      const responseData = response.data.data;
      
      // Mettre à jour les états avec les données préparées par le serveur
      setData(responseData.rawData);
      setMetrics(responseData.metrics);
      setChartData(responseData.chartData);
      setServiceInfo(responseData.serviceInfo);
      
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
            onCurrentRangeChange={setCurrentPeriod}
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
        <TabsContent value="overview" className="space-y-6">
          <OverviewContent
            metrics={metrics}
            chartData={chartData}
          />
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="financial" className="space-y-6">
          <FinancesContent
            metrics={metrics}
            chartData={chartData}
          />
        </TabsContent>

        {/* Consommation Tab */}
        <TabsContent value="consumption" className="space-y-6">
          <ConsumptionContent
            metrics={metrics}
            chartData={chartData}
            currentPeriod={currentPeriod}
          />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <ClientsContent
            metrics={metrics}
            chartData={chartData}
            currentPeriod={currentPeriod}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ================ COMPOSANTS DE CONTENU DES TABS ================
const OverviewContent = ({ metrics, chartData }) => {
  const { financial } = metrics;
  const { monthlyData, revenueDistribution, expenseCategories } = chartData;
  
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

  // Données pour les camemberts de dépenses
  const expensesDistribution = [
    { name: 'Opérationnelles', value: financial.expenses.operational },
    { name: 'Salaires', value: financial.expenses.salaries }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenus Totaux"
          value={`${formatNumber(financial.totalRevenues)} FCFA`}
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(financial.totalExpenses)} FCFA`}
          trend={financial.totalExpenses <= financial.totalRevenues ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <MetricCard
          title="Balance"
          value={`${formatNumber(financial.balance)} FCFA`}
          trend={financial.balance >= 0 ? 'up' : 'down'}
          icon={Calculator}
        />
        <MetricCard
          title="Dépenses en Attente"
          value={`${formatNumber(financial.pendingExpenses)} FCFA`}
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
              data={monthlyData}
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
  dataKey="consommation"
  name="Consommation"
  stroke="#2563EB"
  strokeWidth={2}
  dot={{ r: 4 }}
  activeDot={{ r: 8 }}
/>
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

const FinancesContent = ({ metrics, chartData }) => {
  const { financial } = metrics;
  const { monthlyData, expenseCategories, revenueDistribution } = chartData;

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

  return (
    <div className="space-y-6">
      {/* Section des métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Revenus Totaux"
          value={`${formatNumber(financial.totalRevenues)} FCFA`}
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(financial.totalExpenses)} FCFA`}
          trend="down"
          icon={TrendingDown}
        />
        <MetricCard
          title="Marge Opérationnelle"
          value={`${financial.operatingMargin.toFixed(1)}%`}
          trend={financial.operatingMargin > 0 ? 'up' : 'down'}
          icon={Target}
        />
        <MetricCard
          title="Ratio Dépenses/Revenus"
          value={`${financial.expenseRatio.toFixed(1)}%`}
          trend={financial.expenseRatio < 70 ? 'up' : 'down'}
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
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  data={revenueDistribution}
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
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {expenseCategories.map((entry, index) => (
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
              <BarChart data={expenseCategories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `${formatNumber(value)} FCFA`} />
                <Bar dataKey="value" fill="#3B82F6">
                  {expenseCategories.map((entry, index) => (
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

const ConsumptionContent = ({ metrics, chartData, currentPeriod }) => {
  const { consumption } = metrics;
  const { monthlyData } = chartData;

  console.log("Metrics from backend:", metrics);
  console.log("Chart data from backend:", chartData);

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

  return (
    <div className="space-y-6">
      {/* Cartes métriques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consommation Totale"
          value={`${formatNumber(consumption?.totalConsumption ?? 0)} m³`}
          trend="up"
          icon={Droplets}
        />
        <MetricCard
          title="Consommation Moyenne"
          value={`${formatNumber((consumption?.averageConsumption ?? 0).toFixed(1))} m³`}
          subtitle="par compteur"
          trend="up"
          icon={Gauge}
        />
        <MetricCard
          title="Compteurs Actifs"
          value={consumption?.activeMeters ?? 0}
          subtitle={`sur ${consumption?.totalMeters ?? 0} compteurs`}
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          title="Taux d'Utilisation"
          value={`${(consumption?.utilizationRate ?? 0).toFixed(1)}%`}
          trend={(consumption?.utilizationRate ?? 0) > 80 ? 'up' : 'down'}
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
              data={monthlyData || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              {/* Reste du code LineChart */}
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
                dataKey="consommation"
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
      {/* Graphique de distribution par zone/quartier */}
      <Card>
        <CardHeader>
          <CardTitle>Consommation par Zone</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.consumptionByZone || []}
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
              <Bar 
                dataKey="consumption" 
                name="Consommation"
                fill="#3B82F6"
              >
                {(chartData.consumptionByZone || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const ClientsContent = ({ metrics, chartData }) => {
  const { clients } = metrics;
  const { clientsHistory, clientsByZone } = chartData;

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

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Consommateurs Actifs"
          value={clients.totalActiveClients}
          subtitle={`sur ${clients.totalActiveClients + clients.inactiveClients} consommateurs`}
          trend={clients.activeRate > 80 ? 'up' : 'down'}
          trendValue={clients.activeRate.toFixed(1)}
          icon={Users}
        />
        <MetricCard
          title="Nouveaux Consommateurs"
          value={clients.newClients}
          trend="up"
          icon={UserPlus}
        />
        <MetricCard
          title="Taux d'Activité"
          value={`${clients.activeRate.toFixed(1)}%`}
          trend={clients.activeRate > 80 ? 'up' : 'down'}
          icon={Activity}
        />
        <MetricCard
          title="Consommateurs Inactifs"
          value={clients.inactiveClients}
          trend={clients.inactiveClients < clients.totalActiveClients / 2 ? 'up' : 'down'}
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
              data={clientsHistory || []}
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
                dataKey="nouveauxClients"
                name="Consommateurs"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalClients"
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
              data={clientsByZone || []}
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
                  { name: 'Actifs', value: clients.totalActiveClients },
                  { name: 'Inactifs', value: clients.inactiveClients }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={renderCustomizedLabel}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;