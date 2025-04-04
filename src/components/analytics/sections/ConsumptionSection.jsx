// src/components/analytics/sections/ConsumptionSection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, Droplets, Gauge, TrendingUp, BarChart2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num);
  };

const ConsumptionSection = ({ data, period }) => {
 
  const { stats = {}, trend = [], byZone = [] } = data || {};
  
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-blue-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-blue-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          {trendValue !== undefined && (
            <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="ml-2">
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
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

  // Calcul de tendance
  const calculateTrend = () => {
    if (!trend || trend.length < 2) return 0;
    
    const lastTwo = trend.slice(-2);
    const previous = parseFloat(lastTwo[0]?.consumption || 0);
    const current = parseFloat(lastTwo[1]?.consumption || 0);
    
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const consumptionTrend = calculateTrend();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analyse de la Consommation</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

      <MetricCard
  title="Consommation Totale"
  value={`${formatNumber(stats?.totalConsumption || 0)} m³`}
  trend={consumptionTrend > 0 ? 'up' : consumptionTrend < 0 ? 'down' : 'neutral'}
  trendValue={consumptionTrend}
  icon={Droplets}
/>

<MetricCard
  title="Consommation Moyenne"
  value={`${formatNumber(stats?.averageConsumption || 0)} m³`}
  subtitle="par compteur"
  trend="neutral"
  icon={Gauge}
/>



      </div>

      {/* Graphique d'évolution de la consommation 
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la Consommation</CardTitle>
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

      */}

      {/* Répartition par zone/quartier */}
      <Card>
        <CardHeader>
          <CardTitle>Consommation par Zone</CardTitle>
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
                dataKey="total_consumption" 
                name="Consommation (m³)"
                fill="#3B82F6"
              >
                {byZone?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tableau des zones avec le plus de consommation */}
      <Card>
        <CardHeader>
          <CardTitle>Top Quartiers par Consommation</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quartier</TableHead>
                <TableHead className="text-right">Consommation (m³)</TableHead>
                <TableHead className="text-right">% du Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byZone?.slice(0, 5).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.total_consumption)}</TableCell>

              

                  <TableCell className="text-right">
  {stats?.totalConsumption ? 
    `${((item.total_consumption / stats?.totalConsumption) * 100).toFixed(1)}%` : 
    '0%'
  }
</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumptionSection;