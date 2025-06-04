// src/components/analytics/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, Tooltip, Legend, CartesianGrid, XAxis, YAxis,  ResponsiveContainer } from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Download, PieChart as PieChartIcon, Gauge, Droplets, Users, TrendingUp, FileText, CreditCard,AlertTriangle, Wrench } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "../ui/toast/use-toast";
import { PDFDownloadLink } from '@react-pdf/renderer';

// Composants de section
import ConsumersSection from './sections/ConsumersSection';
import MetersSection from './sections/MetersSection';
import ConsumptionSection from './sections/ConsumptionSection';
import InvoicesSection from './sections/InvoicesSection';
import ExpensesSection from './sections/ExpensesSection';
import SummarySection from './sections/SummarySection';
import HistoricalBalanceSheetSection from './HistoricalBalanceSheetSection';

import DownloadButton from './DownloadButton';
// Composant PDF
import AnalyticsPDF from './AnalyticsPDF';

// Utilitaires
import { axiosPrivate as api } from '../../utils/axios';

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

// Composant de sélection de période
const DateRangeSelector = ({ currentRange, onCurrentRangeChange }) => {
 return (
   <div className="flex items-center gap-4">
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

const AnalyticsPage = () => {
 const { toast } = useToast();
 const [loading, setLoading] = useState(true);
 const [activeTab, setActiveTab] = useState("overview");
 
 // État des données
 const [data, setData] = useState({
   consumers: {},
   meters: {},
   consumption: {},
   invoices: {},
   expenses: {},
   summary: {},
   serviceInfo: null
 });
 
 // État de la période
 const [currentPeriod, setCurrentPeriod] = useState([
   (() => {
     const date = new Date();
     date.setMonth(date.getMonth() - 3); // 3 mois en arrière
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
     
     console.log('Chargement des données pour la période:', { startDate, endDate });
     
     const response = await api.get('/analytics/dashboard', {
       params: {
         start_date: startDate,
         end_date: endDate
       }
     });
     
     setData(response.data.data);
     
   } catch (error) {
     console.error('Erreur lors du chargement des données:', error);
     toast({
       variant: "destructive",
       title: "Erreur",
       description: "Impossible de récupérer les données analytiques"
     });
   } finally {
     setLoading(false);
   }
 };

 // Charger les données lors du changement de période
 useEffect(() => {
   fetchData();
 }, [currentPeriod[0], currentPeriod[1]]);

 // Composant de bouton de téléchargement
 const DownloadButtonSection = () => {
  if (!data.serviceInfo) {
    return null;
  }
  
  return (
    <div className="ml-4">
      <DownloadButton 
        data={data}
        period={currentPeriod}
      />
    </div>
  );
};



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
       <h1 className="text-2xl font-bold">Rapport</h1>

       <div className="flex items-center gap-4">
         {/* Sélecteurs de dates */}
         <DateRangeSelector
           currentRange={currentPeriod}
           onCurrentRangeChange={setCurrentPeriod}
         />

{data.serviceInfo && (
  <div className="ml-4">
    <DownloadButton 
      data={data}
      period={currentPeriod}
    />
  </div>
)}

         

       </div>
     </div>

     {/* Tabs */}
     <Tabs value={activeTab} onValueChange={setActiveTab}>
       <TabsList className="mb-4">
         <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
         <TabsTrigger value="consumers">Consommateurs</TabsTrigger>
         <TabsTrigger value="meters">Compteurs</TabsTrigger>
         <TabsTrigger value="consumption">Consommation</TabsTrigger>
         <TabsTrigger value="invoices">Factures</TabsTrigger>
         <TabsTrigger value="expenses">Dépenses</TabsTrigger>
         <TabsTrigger value="summary">Bilan</TabsTrigger>
         <TabsTrigger value="historical-balance">Bilans antérieurs</TabsTrigger>
         
       </TabsList>

       {/* Vue d'ensemble */}
       <TabsContent value="overview" className="space-y-6">
         <OverviewContent 
           data={data}
           period={currentPeriod}
         />
       </TabsContent>

       {/* Sections détaillées */}
       <TabsContent value="consumers" className="space-y-6">
         <ConsumersSection 
           data={data.consumers} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="meters" className="space-y-6">
         <MetersSection 
           data={data.meters} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="consumption" className="space-y-6">
         <ConsumptionSection 
           data={data.consumption} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="invoices" className="space-y-6">
         <InvoicesSection 
           data={data.invoices} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="expenses" className="space-y-6">
         <ExpensesSection 
           data={data.expenses} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="summary" className="space-y-6">
         <SummarySection 
           data={data.summary} 
           period={currentPeriod}
         />
       </TabsContent>

       <TabsContent value="historical-balance" className="space-y-6">
  <HistoricalBalanceSheetSection />
</TabsContent>

      


     </Tabs>
   </div>
 );
};

// Vue d'ensemble - Affiche les indicateurs clés de toutes les sections
const OverviewContent = ({ data, period }) => {
  // Extraire les métriques principales de chaque section
  const { consumers = {}, meters = {}, consumption = {}, invoices = {}, expenses = {}, summary = {} } = data || {};
  
  // Composant pour les cartes d'indicateurs
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
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
      <h2 className="text-xl font-semibold">Indicateurs clés de performance</h2>
      
      {/* Grille des indicateurs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Métriques de consommateurs */}
        <MetricCard
          title="Consommateurs actifs"
          value={consumers?.stats?.activeConsumers || 0}
          subtitle={`sur ${consumers?.stats?.totalConsumers || 0} total`}
          icon={Users}
          trend="up"
        />

        <MetricCard
          title="Compteurs actifs"
          value={meters?.stats?.activeMeters || 0}
          subtitle={`sur ${meters?.stats?.totalMeters || 0} total`}
          icon={Gauge}
          trend="up"
        />

        <MetricCard
          title="Consommation totale"
          value={`${consumption?.stats?.totalConsumption || 0} m³`}
          icon={Droplets}
          trend="neutral"
        />

        <MetricCard
          title="Factures impayées"
          value={invoices?.stats?.pendingCount || 0}
          subtitle={`(${formatNumber(invoices?.stats?.pendingAmount || 0)} FCFA)`}
          icon={FileText}
          trend="down"
        />

        <MetricCard
          title="Dépenses totales"
          value={`${formatNumber(expenses?.stats?.totalAmount || 0)} FCFA`}
          icon={CreditCard}
          trend="neutral"
        />

        <MetricCard
          title="Marge opérationnelle"
          value={`${summary?.stats?.margin || 0}%`}
          icon={TrendingUp}
          trend={parseFloat(summary?.stats?.margin || 0) > 20 ? 'up' : 'down'}
        />
      </div>

      {/* Nouvelle section pour les revenus complémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Frais de Branchement"
          value={`${formatNumber(summary?.stats?.connectionLaborRevenue || 0)} FCFA`}
          icon={Wrench}
          trend="up"
        />

        <MetricCard
          title="Pénalités de Coupure"
          value={`${formatNumber(summary?.stats?.penaltyRevenue || 0)} FCFA`}
          subtitle="Pénalités payées"
          icon={AlertTriangle}
          trend="up"
        />
      </div>
      
      {/* Graphique d'évolution financière mis à jour */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution financière avec nouveaux revenus</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={summary?.monthlyFinance || []}
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
                dataKey="totalRevenue"
                name="Revenus totaux"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenus factures"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="connectionLaborRevenue"
                name="Frais branchement"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="penaltyRevenue"
                name="Pénalités coupure"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="totalExpense"
                name="Dépenses"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Bénéfice"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Graphique de consommation */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la consommation</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={consumption?.trend || []}
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
              <Bar
                dataKey="consumption"
                name="Consommation (m³)"
                fill="#3B82F6"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Résumé des nouveaux revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Revenus Complémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Revenus Traditionnels</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Factures d'eau:</span>
                  <span className="font-medium">{formatNumber(summary?.stats?.invoiceRevenue || 0)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Dons:</span>
                  <span className="font-medium">{formatNumber(summary?.stats?.donationRevenue || 0)} FCFA</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Sous-total:</span>
                  <span className="font-bold">{formatNumber((parseFloat(summary?.stats?.invoiceRevenue || 0) + parseFloat(summary?.stats?.donationRevenue || 0)))} FCFA</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Nouveaux Revenus</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Frais branchement:</span>
                  <span className="font-medium">{formatNumber(summary?.stats?.connectionLaborRevenue || 0)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pénalités coupure:</span>
                  <span className="font-medium">{formatNumber(summary?.stats?.penaltyRevenue || 0)} FCFA</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Sous-total:</span>
                  <span className="font-bold">{formatNumber((parseFloat(summary?.stats?.connectionLaborRevenue || 0) + parseFloat(summary?.stats?.penaltyRevenue || 0)))} FCFA</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800">Impact Global</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Revenus totaux:</span>
                  <span className="font-medium">{formatNumber(summary?.stats?.totalRevenue || 0)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">% nouveaux revenus:</span>
                  <span className="font-medium">{(((parseFloat(summary?.stats?.connectionLaborRevenue || 0) + parseFloat(summary?.stats?.penaltyRevenue || 0)) / parseFloat(summary?.stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Marge finale:</span>
                  <span className="font-bold">{summary?.stats?.margin || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;