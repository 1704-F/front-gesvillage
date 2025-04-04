// src/components/analytics/sections/InvoicesSection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, Receipt, FileText, Calendar, CreditCard } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

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
      {`${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%`}
    </text>
  );
};

const InvoicesSection = ({ data, period }) => {
  const { stats = {}, trend = [], byZone = [], unpaidAge = [], recoveryRate = [] } = data || {};
 
  
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </div>

         {trendValue !== undefined && (
  <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
    {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
    {typeof trendValue === 'number' ? Math.abs(trendValue).toFixed(1) : '0'}%
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
      <h2 className="text-xl font-semibold">Analyse des Factures</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
  title="Factures Émises"
  value={formatNumber(stats?.totalCount || 0)}
  subtitle={`${formatNumber(stats?.totalAmount || 0)} FCFA`}
  trend="up"
  icon={Receipt}
/>

<MetricCard
  title="Factures Payées"
  value={formatNumber(stats?.paidCount || 0)}
  subtitle={`${formatNumber(stats?.paidAmount || 0)} FCFA`}
  trend="up"
  icon={CreditCard}
/>

<MetricCard
  title="Taux de Paiement"
  value={`${typeof stats?.paymentRate === 'number' ? (stats?.paymentRate || 0).toFixed(1) : '0'}%`}
  trend={(stats?.paymentRate || 0) > 80 ? 'up' : 'down'}
  trendValue={stats?.paymentRate || 0}
  icon={FileText}
/>

<MetricCard
  title="Factures Impayées"
  value={formatNumber(stats?.pendingCount || 0)}
  subtitle={`${formatNumber(stats?.pendingAmount || 0)} FCFA`}
  trend={(stats?.pendingCount || 0) < (stats?.totalCount || 0) / 5 ? 'up' : 'down'}
  icon={Calendar}
/>

     </div>

     {/* Graphique d'évolution des factures */}
     <Card>
       <CardHeader>
         <CardTitle>Évolution des Factures</CardTitle>
       </CardHeader>
       <CardContent className="h-96">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart 
             data={trend || []}
             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
           >
             <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
             <XAxis 
               dataKey="month"
               tick={{ fill: '#6B7280' }}
             />
             <YAxis 
  yAxisId="left"
  tickFormatter={(value) => `${typeof value === 'number' ? (value/1000).toFixed(0) : '0'}k`}
  tick={{ fill: '#6B7280' }}
/>

             <YAxis 
               yAxisId="right"
               orientation="right"
               tickFormatter={(value) => `${value}`}
               tick={{ fill: '#6B7280' }}
             />
             <Tooltip 
               formatter={(value, name) => {
                 if (name === 'count') return [`${value} factures`, 'Nombre'];
                 return [`${formatNumber(value)} FCFA`, name];
               }}
               contentStyle={{
                 backgroundColor: '#ffffff',
                 borderRadius: '8px',
                 border: '1px solid #e5e7eb'
               }}
             />
             <Legend />
             <Line
               yAxisId="right"
               type="monotone"
               dataKey="count"
               name="Nombre de factures"
               stroke="#2563EB"
               strokeWidth={2}
               dot={{ r: 3 }}
             />
             <Line
               yAxisId="left"
               type="monotone"
               dataKey="amount"
               name="Montant total"
               stroke="#16A34A"
               strokeWidth={2}
               dot={{ r: 3 }}
             />
             <Line
               yAxisId="left"
               type="monotone"
               dataKey="paidAmount"
               name="Montant payé"
               stroke="#DC2626"
               strokeWidth={2}
               dot={{ r: 3 }}
             />
           </LineChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>

     {/* Répartition par zone et âge des factures */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* Répartition par quartier */}
       <Card>
         <CardHeader>
           <CardTitle>Factures par Quartier</CardTitle>
         </CardHeader>
         <CardContent className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart
               data={byZone || []}
               margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
             >
               <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
               <XAxis 
                 dataKey="name"
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
               <Bar 
                 dataKey="total_amount" 
                 name="Montant total" 
                 fill="#3B82F6"
                 stackId="a"
               />
               <Bar 
                 dataKey="paid_amount" 
                 name="Montant payé" 
                 fill="#16A34A"
                 stackId="b"
               />
             </BarChart>
           </ResponsiveContainer>
         </CardContent>
       </Card>

       {/* Âge des factures impayées */}
       <Card>
         <CardHeader>
           <CardTitle>Âge des Factures Impayées</CardTitle>
         </CardHeader>
         <CardContent className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={unpaidAge || []}
                 cx="50%"
                 cy="50%"
                 innerRadius={60}
                 outerRadius={100}
                 fill="#8884d8"
                 paddingAngle={5}
                 dataKey="total_amount"
                 nameKey="age_category"
                 label={renderCustomizedLabel}
               >
                 {unpaidAge?.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
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

     {/* Taux de recouvrement */}
     <Card>
       <CardHeader>
         <CardTitle>Taux de Recouvrement Mensuel</CardTitle>
       </CardHeader>
       <CardContent className="h-80">
         <ResponsiveContainer width="100%" height="100%">
           <LineChart 
             data={recoveryRate || []}
             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
           >
             <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
             <XAxis 
               dataKey="month"
               tick={{ fill: '#6B7280' }}
             />
             <YAxis 
               tickFormatter={(value) => `${value}%`}
               domain={[0, 100]}
               tick={{ fill: '#6B7280' }}
             />
             <Tooltip 
  formatter={(value) => {
    const formattedValue = typeof value === 'number' ? value.toFixed(1) : '0';
    return [`${formattedValue}%`, 'Taux de recouvrement'];
  }}
  contentStyle={{
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  }}
/>


             <Line
               type="monotone"
               dataKey="rate"
               name="Taux de recouvrement"
               stroke="#16A34A"
               strokeWidth={2}
               dot={{ r: 4 }}
               activeDot={{ r: 8 }}
             />
           </LineChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>
   </div>
 );
};

export default InvoicesSection;
          