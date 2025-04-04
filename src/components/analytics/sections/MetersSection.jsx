// src/components/analytics/sections/MetersSection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, Gauge, Activity, Clock, CheckCircle } from 'lucide-react';
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
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MetersSection = ({ data, period }) => {
    const { stats = {}, distribution = [], avgConsumption = [] } = data || {};
  
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analyse des Compteurs</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
  title="Compteurs Actifs"
  value={stats?.activeMeters || 0}
  subtitle={`sur ${stats?.totalMeters || 0} compteurs`}
  trend="up"
  trendValue={stats?.utilizationRate || 0}
  icon={Gauge}
/>

<MetricCard
  title="Compteurs Sans Relevés"
  value={stats?.metersWithoutReadings || 0}
  trend={(stats?.metersWithoutReadings || 0) < (stats?.activeMeters || 0) / 10 ? 'up' : 'down'}
  icon={Clock}
/>

<MetricCard
  title="Taux d'Utilisation"
  value={`${(stats?.utilizationRate || 0).toFixed(1)}%`}
  trend={(stats?.utilizationRate || 0) > 80 ? 'up' : 'down'}
  icon={Activity}
/>

<MetricCard
  title="Compteurs Inactifs"
  value={stats?.inactiveMeters || 0}
  trend={(stats?.inactiveMeters || 0) < (stats?.activeMeters || 0) / 2 ? 'up' : 'down'}
  icon={CheckCircle}
/>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par type de compteur */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution par Type de Compteur</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                  label={renderCustomizedLabel}
                >
                  {distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} compteurs`, name]}
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

        {/* Consommation moyenne par type */}
        <Card>
          <CardHeader>
            <CardTitle>Consommation Moyenne par Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={avgConsumption || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="type"
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  tickFormatter={(value) => `${value} m³`}
                />
                <Tooltip 
                  formatter={(value) => [`${value} m³`, 'Consommation moyenne']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
                <Bar 
                  dataKey="avgConsumption" 
                  name="Consommation moyenne" 
                  fill="#3B82F6"
                >
                  {avgConsumption?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des types de compteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Type de Compteur</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type de Compteur</TableHead>
                <TableHead className="text-right">Nombre</TableHead>
                <TableHead className="text-right">% du Total</TableHead>
                <TableHead className="text-right">Consommation Moyenne (m³)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distribution?.map((item, index) => {
                const avgConsItem = avgConsumption?.find(a => a.type === item.type);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.type === 'standard' ? 'Standard' : 
                       item.type === 'premium' ? 'Premium' : 
                       item.type === 'free' ? 'Gratuit' : item.type}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(item.count)}</TableCell>

                    <TableCell className="text-right">
  {stats?.totalMeters ? 
    `${((item.count / stats?.totalMeters) * 100).toFixed(1)}%` : 
    '0%'
  }
</TableCell>

                   

                    <TableCell className="text-right">
                      {avgConsItem ? formatNumber(avgConsItem.avgConsumption) : '0'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetersSection;