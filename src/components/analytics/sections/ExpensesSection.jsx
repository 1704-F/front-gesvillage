import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, CreditCard, Clock, TrendingDown, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, ComposedChart, ReferenceLine, LabelList } from 'recharts';

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

const ExpensesSection = ({ data, period }) => {
  // Destructurer avec des valeurs par défaut pour éviter les erreurs
  const { 
    stats = {}, 
    byCategory = [], 
    trend = [], 
    salaries = [],
    byType = [] // Extraction des données par type
  } = data || {};
  
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Convertir explicitement les données de catégorie
  const formattedByCategory = byCategory.map(item => ({
    category_name: item.category_name,
    total_amount: parseFloat(item.total_amount),
    expense_count: parseInt(item.expense_count)
  }));

  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
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
      <h2 className="text-xl font-semibold">Analyse des Dépenses</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(stats?.totalAmount || 0)} FCFA`}
          trend="neutral"
          icon={CreditCard}
        />
        
        <MetricCard
          title="Dépenses en Attente"
          value={`${formatNumber(stats?.pendingAmount || 0)} FCFA`}
          trend={parseFloat(stats?.pendingAmount || 0) < parseFloat(stats?.totalAmount || 0) / 10 ? 'up' : 'down'}
          icon={Clock}
        />
        
        <MetricCard
          title="Nombre de Dépenses"
          value={formatNumber(stats?.totalCount || 0)}
          trend="neutral"
          icon={TrendingDown}
        />
        
        {/* Carte pour les salaires totaux */}
        <MetricCard
          title="Salaires Totaux"
          value={`${formatNumber(salaries.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))} FCFA`}
          trend="neutral"
          icon={Users}
          
        />
      </div>

      {/* Répartition par type */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Type</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byType}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
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
              <Bar dataKey="amount" fill="#82ca9d" name="Montant" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Catégorie</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="total_amount"
                nameKey="category_name"
                label={renderCustomizedLabel}
              >
                {formattedByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${formatNumber(value)} FCFA`]}
                labelFormatter={(name) => `Catégorie: ${name}`}
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

      {/* Évolution des dépenses - Version améliorée */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Dépenses</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={trend.map((item, index, array) => {
                // Calculer le pourcentage de variation par rapport au mois précédent
                let percentChange = 0;
                if (index > 0 && array[index-1].amount > 0) {
                  percentChange = ((parseFloat(item.amount) - parseFloat(array[index-1].amount)) / parseFloat(array[index-1].amount)) * 100;
                }
                return {
                  ...item,
                  amount: parseFloat(item.amount || 0),
                  percentChange: parseFloat(percentChange.toFixed(1))
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#6B7280' }}
                height={50}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                tick={{ fill: '#6B7280' }}
                width={60}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[-20, 20]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#6B7280' }}
                width={40}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'percentChange') return [`${value}%`, 'Variation'];
                  return [`${formatNumber(value)} FCFA`, 'Montant total'];
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                yAxisId="left"
                dataKey="amount" 
                name="Montant total" 
                fill="#8884d8"
                barSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentChange"
                name="Variation mensuelle"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
              <ReferenceLine y={0} yAxisId="right" stroke="#000" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Évolution des salaires - Version améliorée 
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Salaires</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={salaries.map(item => {
                const amount = parseFloat(item.amount || 0);
                const employees = parseInt(item.employeeCount || 0);
                return {
                  ...item,
                  amount: amount,
                  avgSalary: employees > 0 ? amount / employees : 0
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis 
                dataKey="month"
                tick={{ fill: '#6B7280' }}
                height={50}
              />
              <YAxis 
                tickFormatter={(value) => `${(value/1000).toFixed(0)}k`}
                tick={{ fill: '#6B7280' }}
                width={60}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'amount') return [`${formatNumber(value)} FCFA`, 'Salaires totaux'];
                  if (name === 'avgSalary') return [`${formatNumber(value)} FCFA`, 'Salaire moyen']; 
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
                labelFormatter={(label, items) => {
                  const item = items[0]?.payload;
                  return `${label} (${item?.employeeCount || 0} employés)`;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="amount" 
                name="Salaires totaux" 
                fill="#DC2626"
                barSize={25}
              />
              <Bar 
                dataKey="avgSalary" 
                name="Salaire moyen" 
                fill="#2563EB" 
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      */}

      {/* Tableau des catégories de dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Catégories de Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant Total (FCFA)</TableHead>
                <TableHead className="text-right">Nombre de Dépenses</TableHead>
                <TableHead className="text-right">% du Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCategory.length > 0 ? byCategory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.category_name}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.total_amount)}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.expense_count)}</TableCell>
                  <TableCell className="text-right">
                    {stats?.totalAmount ? 
                      `${((item.total_amount / stats?.totalAmount) * 100).toFixed(1)}%` : 
                      '0%'
                    }
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">Aucune donnée de catégorie disponible</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesSection;