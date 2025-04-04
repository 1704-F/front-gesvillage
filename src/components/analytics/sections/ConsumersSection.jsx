// src/components/analytics/sections/ConsumersSection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, Users, UserPlus, Home, Activity } from 'lucide-react';
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

const ConsumersSection = ({ data, period }) => {
  const { stats = {}, distribution = [], growth = [] } = data || {};
  
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
      <h2 className="text-xl font-semibold">Analyse des Consommateurs</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
     

<MetricCard
  title="Consommateurs Actifs"
  value={stats?.activeConsumers || 0}
  subtitle={`sur ${stats?.totalConsumers || 0} consommateurs`}
  trend={(stats?.activeRate || 0) > 80 ? 'up' : 'down'}
  trendValue={stats?.activeRate || 0}
  icon={Users}
/>

        <MetricCard
          title="Nouveaux Consommateurs"
          value={stats.newConsumers || 0}
          trend="up"
          icon={UserPlus}
        />
        <MetricCard
          title="Taux d'Activité"
          value={`${stats.activeRate?.toFixed(1) || 0}%`}
          trend={stats.activeRate > 80 ? 'up' : 'down'}
          icon={Activity}
        />
        <MetricCard
          title="Consommateurs Inactifs"
          value={stats.inactiveConsumers || 0}
          trend={stats.inactiveConsumers < stats.activeConsumers / 2 ? 'up' : 'down'}
          icon={Home}
        />
      </div>

      {/* Graphique d'évolution des inscriptions 
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Inscriptions</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={growth || []}
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
                dataKey="newConsumers"
                name="Nouveaux consommateurs"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="totalConsumers"
                name="Total cumulé"
                stroke="#16A34A"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      */}

      {/* Répartition par quartier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Quartier</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis 
                  dataKey="name"
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
                <Bar 
                  dataKey="consumer_count" 
                  name="Nombre de consommateurs"
                  fill="#3B82F6"
                >
                  {distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des statuts */}
        <Card>
          <CardHeader>
            <CardTitle>Statuts des consommateurs</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Actifs', value: stats.activeConsumers || 0 },
                    { name: 'Inactifs', value: stats.inactiveConsumers || 0 }
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
                  formatter={(value) => [value, 'Consommateurs']}
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

      {/* Tableau des quartiers avec le plus de consommateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Quartiers par Nombre de Consommateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quartier</TableHead>
                <TableHead className="text-right">Nombre de Consommateurs</TableHead>
                <TableHead className="text-right">% du Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distribution?.slice(0, 5).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.consumer_count)}</TableCell>
                  <TableCell className="text-right">
                    {stats.totalConsumers ? 
                      `${((item.consumer_count / stats.totalConsumers) * 100).toFixed(1)}%` : 
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

export default ConsumersSection;