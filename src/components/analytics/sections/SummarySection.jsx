// src/components/analytics/sections/SummarySection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, TrendingDown, Activity, Target, BarChart3, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, ComposedChart, Area } from 'recharts';

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('fr-FR').format(num); 
  };

const SummarySection = ({ data, period }) => {
  const { stats = {}, monthlyFinance = [] } = data || {};
  
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
      <h2 className="text-xl font-semibold">Bilan Financier</h2>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

     


<MetricCard
  title="Revenus Totaux"
  value={`${formatNumber(stats?.totalRevenue || 0)} FCFA`}
  trend="up"
  icon={TrendingUp}
/>

<MetricCard
  title="Dépenses Totales"
  value={`${formatNumber(stats?.totalExpense || 0)} FCFA`}
  trend="down"
  icon={TrendingDown}
/>

<MetricCard
  title="Bénéfice Net"
  value={`${formatNumber(stats?.profit || 0)} FCFA`}
  trend={parseFloat(stats?.profit || 0) > 0 ? 'up' : 'down'}
  icon={DollarSign}
/>

<MetricCard
  title="Marge Opérationnelle"
  value={`${stats?.margin || 0}%`}
  trend={parseFloat(stats?.margin || 0) > 20 ? 'up' : 'down'}
  trendValue={parseFloat(stats?.margin || 0)}
  icon={Target}
/>

<MetricCard
  title="Ratio Dépenses/Revenus"
  value={`${stats?.expenseRatio || 0}%`}
  trend={parseFloat(stats?.expenseRatio || 0) < 80 ? 'up' : 'down'}
  trendValue={100 - parseFloat(stats?.expenseRatio || 0)}
  icon={Activity}
/>

<MetricCard
  title="Revenus Factures d'eau"
  value={`${formatNumber(stats?.invoiceRevenue || 0)} FCFA`}
  subtitle={`(${((stats?.invoiceRevenue || 0) / (stats?.totalRevenue || 1) * 100).toFixed(1) || 0}%)`}
  trend="up"
  icon={BarChart3}
/>
<MetricCard
  title="Emprunts en cours"
  value={`${formatNumber(stats?.loanRemaining || 0)} FCFA`}
  subtitle={`Total: ${formatNumber(stats?.loanTotal || 0)} FCFA`}
  trend="neutral"
  icon={Wallet}
/>

<MetricCard
  title="Variation de trésorerie"
  value={`${formatNumber(stats?.netCashFlow || 0)} FCFA`}
  trend={parseFloat(stats?.netCashFlow || 0) > 0 ? 'up' : 'down'}
  icon={Wallet}
/>


      </div>

      {/* Graphique d'évolution financière */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution Financière Mensuelle</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={monthlyFinance || []}
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
              <Area
                type="monotone"
                dataKey="profit"
                name="Bénéfice"
                fill="#10B981"
                stroke="#10B981"
                fillOpacity={0.3}
              />
              <Bar 
                dataKey="totalRevenue" 
                name="Revenus" 
                fill="#2563EB"
                stackId="a"
                barSize={20}
              />
              <Bar 
                dataKey="totalExpense" 
                name="Dépenses" 
                fill="#DC2626"
                stackId="b"
                barSize={20}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Bénéfice"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition des revenus et dépenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                   
                    { name: "Facture d'eau", value: parseFloat(stats?.invoiceRevenue || 0) },
                    { name: 'Dons', value: parseFloat(stats?.donationRevenue || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  <Cell fill="#2563EB" />
                  <Cell fill="#10B981" />
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

        {/* Répartition des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Dépenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Opérationnelles', value: parseFloat(stats?.operationalExpense || 0) },
                    { name: 'Salaires', value: parseFloat(stats?.salaryExpense || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  <Cell fill="#DC2626" />
                  <Cell fill="#F59E0B" />
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

      {/* Tableau récapitulatif */}
      <Card>
        <CardHeader>
          <CardTitle>Synthèse Financière</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant (FCFA)</TableHead>
                <TableHead className="text-right">% du Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Facture d'eau</TableCell>
                <TableCell className="text-right">{formatNumber(stats.invoiceRevenue || 0)}</TableCell>

                <TableCell className="text-right">
  {stats?.totalRevenue ? 
    `${((stats?.invoiceRevenue / stats?.totalRevenue) * 100).toFixed(1)}%` : 
    '0%'
  }
</TableCell>

              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dons</TableCell>
                <TableCell className="text-right">{formatNumber(stats.donationRevenue || 0)}</TableCell>
                <TableCell className="text-right">
                  {stats.totalRevenue ? 
                    `${((stats.donationRevenue / stats.totalRevenue) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold">Total Revenus</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.totalRevenue || 0)}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dépenses Opérationnelles</TableCell>
                <TableCell className="text-right">{formatNumber(stats.operationalExpense || 0)}</TableCell>
                <TableCell className="text-right">
                  {stats.totalExpense ? 
                    `${((stats.operationalExpense / stats.totalExpense) * 100).toFixed(1)}%` : 
                    '0%'
                  }
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Salaires</TableCell>
                <TableCell className="text-right">{formatNumber(stats.salaryExpense || 0)}</TableCell>
               <TableCell className="text-right">
                 {stats.totalExpense ? 
                   `${((stats.salaryExpense / stats.totalExpense) * 100).toFixed(1)}%` : 
                   '0%'
                 }
               </TableCell>
             </TableRow>

             <TableRow className="bg-red-50">
  <TableCell className="font-bold">Total Dépenses</TableCell>
  <TableCell className="text-right font-bold">{formatNumber(stats.totalExpense || 0)}</TableCell>
  <TableCell className="text-right">100%</TableCell>
</TableRow>

<TableRow className="bg-green-50">
  <TableCell className="font-bold">Résultat d'exploitation</TableCell>
  <TableCell className="text-right font-bold">{formatNumber(stats.profit || 0)}</TableCell>
  <TableCell className="text-right">
    {stats.totalRevenue ? 
      `${((stats.profit / stats.totalRevenue) * 100).toFixed(1)}%` : 
      '0%'
    }
  </TableCell>
</TableRow>

{/* Section séparée pour les mouvements de trésorerie */}
<TableRow className="border-t-2 border-gray-300">
  <TableCell className="font-bold pt-4">MOUVEMENTS DE TRÉSORERIE</TableCell>
  <TableCell></TableCell>
  <TableCell></TableCell>
</TableRow>

<TableRow>
  <TableCell className="font-medium">Emprunts reçus</TableCell>
  <TableCell className="text-right">{formatNumber(stats?.loanTotal || 0)}</TableCell>
  <TableCell className="text-right">+</TableCell>
</TableRow>

<TableRow>
  <TableCell className="font-medium">Remboursements d'emprunts</TableCell>
  <TableCell className="text-right">{formatNumber(stats?.loanRepayment || 0)}</TableCell>
  <TableCell className="text-right">-</TableCell>
</TableRow>

<TableRow>
  <TableCell className="font-medium">Emprunts en défaut</TableCell>
  <TableCell className="text-right">{formatNumber(stats?.defaultedLoan || 0)}</TableCell>
  <TableCell className="text-right">!</TableCell>
</TableRow>

<TableRow className="bg-purple-50">
  <TableCell className="font-bold">Variation de trésorerie</TableCell>
  <TableCell className="text-right font-bold">{formatNumber(stats?.netCashFlow || 0)}</TableCell>
  <TableCell className="text-right"></TableCell>
</TableRow>



  

           </TableBody>
         </Table>
       </CardContent>
     </Card>
   </div>
 );
};

export default SummarySection;
                