// src/components/analytics/sections/SummarySection.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../ui/table";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, TrendingDown, Activity, Target, BarChart3, Wallet, Save, Wrench, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Tooltip, Legend, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { Button } from "../../ui/button";
import { useToast } from "../../ui/toast/use-toast";
import { axiosPrivate as api } from '../../../utils/axios';

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(num); 
};

const SummarySection = ({ data, period }) => {
  const { stats = {}, monthlyFinance = [], lastBalanceSheet = null, currentBalanceSheet = null } = data || {};
  const { toast } = useToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const MetricCard = ({ title, value, trend, subtitle, icon: Icon, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-blue-600'}`} />
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

  // Fonction pour sauvegarder le bilan actuel comme bilan historique
  const saveAsHistoricalBalanceSheet = async () => {
    try {
      if (!currentBalanceSheet) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Aucune donnée de bilan disponible pour la sauvegarde"
        });
        return;
      }
      
      // Vérifier l'équilibre du bilan
      const totalAssets = parseFloat(currentBalanceSheet.accounts_receivable) +
                         parseFloat(currentBalanceSheet.cash_and_bank) +
                         parseFloat(currentBalanceSheet.other_assets);
      
      const totalLiabilities = parseFloat(currentBalanceSheet.accounts_payable) +
                              parseFloat(currentBalanceSheet.loans) +
                              parseFloat(currentBalanceSheet.other_liabilities);
      
      if (Math.abs(totalAssets - totalLiabilities) > 0.01) {
        // Ajuster les fonds propres pour équilibrer le bilan
        const equity = totalAssets - totalLiabilities;
        currentBalanceSheet.other_liabilities = (parseFloat(currentBalanceSheet.other_liabilities) + equity).toFixed(2);
      }
      
      const response = await api.post('/historical-balance-sheets', currentBalanceSheet);
      
      toast({
        variant: "success",
        title: "Succès",
        description: "Le bilan a été sauvegardé avec succès"
      });
      
      setShowSaveModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du bilan:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de sauvegarder le bilan"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bilan Financier</h2>
{/* 
        {currentBalanceSheet && (
          <Button 
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder comme bilan historique
          </Button>
        )}
 */}
      </div>
      
      {/* Métriques principales avec nouveaux revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Revenus Totaux"
          value={`${formatNumber(stats?.totalRevenue || 0)} FCFA`}
          subtitle={`Factures: ${formatNumber(stats?.invoiceRevenue || 0)} | Dons: ${formatNumber(stats?.donationRevenue || 0)}`}
          trend="up"
          icon={TrendingUp}
        />

        <MetricCard
          title="Frais de Branchement"
          value={`${formatNumber(stats?.connectionLaborRevenue || 0)} FCFA`}
          subtitle="Main-d'œuvre payée"
          trend="up"
          icon={Wrench}
        />

        <MetricCard
          title="Pénalités de Coupure"
          value={`${formatNumber(stats?.penaltyRevenue || 0)} FCFA`}
          subtitle="Pénalités payées"
          trend="up"
          icon={AlertTriangle}
        />

        <MetricCard
          title="Dépenses Totales"
          value={`${formatNumber(stats?.totalExpense || 0)} FCFA`}
          trend="down"
          icon={TrendingDown}
        />

        <MetricCard
          title="Résultat d'Exploitation"
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
          title="Trésorerie Finale"
          value={`${formatNumber(stats?.finalCashBalance || 0)} FCFA`}
          subtitle={`(${formatNumber(stats?.initialCashBalance || 0)} FCFA initiale)`}
          trend={parseFloat(stats?.netCashFlow || 0) > 0 ? 'up' : 'down'}
          icon={Wallet}
        />
      </div>

      {/* 1. COMPTE DE RÉSULTAT DÉTAILLÉ */}
      <Card>
        <CardHeader>
          <CardTitle>1. Compte de Résultat Détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">Affiche toutes les sources de revenus et les dépenses de l'exercice :</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant (FCFA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenus d'exploitation (factures)</TableCell>
                <TableCell className="text-right">{formatNumber(stats.invoiceRevenue || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Autres revenus (dons)</TableCell>
                <TableCell className="text-right">{formatNumber(stats.donationRevenue || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Frais de branchement (main-d'œuvre)</TableCell>
                <TableCell className="text-right">{formatNumber(stats.connectionLaborRevenue || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Pénalités de coupure payées</TableCell>
                <TableCell className="text-right">{formatNumber(stats.penaltyRevenue || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold">Total Revenus</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.totalRevenue || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dépenses opérationnelles</TableCell>
                <TableCell className="text-right">{formatNumber(stats.operationalExpense || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Salaires</TableCell>
                <TableCell className="text-right">{formatNumber(stats.salaryExpense || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-red-50">
                <TableCell className="font-bold">Total Dépenses</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.totalExpense || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-bold">Résultat d'exploitation</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.profit || 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 2. TABLEAU DE FLUX DE TRÉSORERIE */}
      <Card>
        <CardHeader>
          <CardTitle>2. Bilan de Trésorerie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">Montre les flux financiers hors exploitation (emprunts, remboursements, investissements) :</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant (FCFA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Trésorerie initiale (année précédente)</TableCell>
                <TableCell className="text-right">{formatNumber(stats.initialCashBalance || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">Résultat d'exploitation (incluant nouveaux revenus)</TableCell>
                <TableCell className="text-right">{formatNumber(stats.profit || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Emprunts reçus</TableCell>
                <TableCell className="text-right">{formatNumber(stats.loanTotal || 0)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Remboursements effectués</TableCell>
                <TableCell className="text-right">{formatNumber(stats.loanRepayment || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-purple-50">
                <TableCell className="font-bold">Variation de trésorerie</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.netCashFlow || 0)}</TableCell>
              </TableRow>
              <TableRow className="bg-blue-50">
                <TableCell className="font-bold">Trésorerie finale</TableCell>
                <TableCell className="text-right font-bold">{formatNumber(stats.finalCashBalance || 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 3. BILAN COMPTABLE */}
      <Card>
        <CardHeader>
          <CardTitle>3. Bilan Comptable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">Photographie de la situation financière à la fin de la période :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ACTIF */}
            <div>
              <h3 className="text-lg font-bold mb-4">ACTIF</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Montant (FCFA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Trésorerie</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.cash_and_bank || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Créances clients</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.accounts_receivable || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Autres actifs</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.other_assets || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold">TOTAL ACTIF</TableCell>
                    <TableCell className="text-right font-bold">{formatNumber(stats.total_assets || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            {/* PASSIF */}
            <div>
              <h3 className="text-lg font-bold mb-4">PASSIF</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right">Montant (FCFA)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dettes fournisseurs</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.accounts_payable || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Emprunts</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.loans || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Autres passifs</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.other_liabilities || 0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fonds propres</TableCell>
                    <TableCell className="text-right">{formatNumber(stats.equity || 0)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold">TOTAL PASSIF</TableCell>
                    <TableCell className="text-right font-bold">{formatNumber(stats.total_liabilities || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Indicateur d'équilibre du bilan */}
          {stats.total_assets && stats.total_liabilities && (
            <div className={`mt-6 p-4 rounded-lg ${Math.abs(parseFloat(stats.total_assets) - parseFloat(stats.total_liabilities)) < 0.01 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-lg font-medium ${Math.abs(parseFloat(stats.total_assets) - parseFloat(stats.total_liabilities)) < 0.01 ? 'text-green-800' : 'text-red-800'}`}>
                Équilibre du bilan
              </h3>
              <p className="mt-2">
                {Math.abs(parseFloat(stats.total_assets) - parseFloat(stats.total_liabilities)) < 0.01 
                  ? "Le bilan est équilibré (Actif = Passif)" 
                  : `Le bilan présente un écart de ${formatNumber(Math.abs(parseFloat(stats.total_assets) - parseFloat(stats.total_liabilities)))} FCFA`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. HISTORIQUE CUMULATIF */}
      <Card>
        <CardHeader>
          <CardTitle>4. Cumulatif Historique (multi-années)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">Intègre les résultats nets des années précédentes :</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Revenus cumulés</h3>
              <p className="mt-2 text-2xl font-bold">{formatNumber(stats.ytdRevenue || 0)} FCFA</p>
              <div className="mt-2 text-sm text-blue-600">
                <p>Branchements: {formatNumber(stats.ytdConnectionLaborRevenue || 0)} FCFA</p>
                <p>Pénalités: {formatNumber(stats.ytdPenaltyRevenue || 0)} FCFA</p>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Dépenses cumulées</h3>
              <p className="mt-2 text-2xl font-bold">{formatNumber(stats.ytdExpense || 0)} FCFA</p>
            </div>
            
            <div className={`p-4 rounded-lg ${parseFloat(stats.ytdProfit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-lg font-medium ${parseFloat(stats.ytdProfit || 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Résultat net cumulé
              </h3>
              <p className="mt-2 text-2xl font-bold">{formatNumber(stats.ytdProfit || 0)} FCFA</p>
              <p className="text-sm mt-1">
                Marge: {parseFloat(stats.ytdMargin || 0).toFixed(1)}%
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${parseFloat(stats.ytdNetCashFlow || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-lg font-medium ${parseFloat(stats.ytdNetCashFlow || 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Flux de trésorerie cumulé
              </h3>
              <p className="mt-2 text-2xl font-bold">{formatNumber(stats.ytdNetCashFlow || 0)} FCFA</p>
            </div>
          </div>
          
          {/* Tableau avec référence au dernier bilan historique */}
          {lastBalanceSheet && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Dernier bilan historique de référence</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead>Actif Total</TableHead>
                    <TableHead>Passif Total</TableHead>
                    <TableHead>Trésorerie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {new Date(lastBalanceSheet.period_start).toLocaleDateString()} - {new Date(lastBalanceSheet.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatNumber(
                        parseFloat(lastBalanceSheet.accounts_receivable) +
                        parseFloat(lastBalanceSheet.cash_and_bank) +
                        parseFloat(lastBalanceSheet.other_assets)
                      )} FCFA
                    </TableCell>
                    <TableCell>
                      {formatNumber(
                        parseFloat(lastBalanceSheet.accounts_payable) +
                        parseFloat(lastBalanceSheet.loans) +
                        parseFloat(lastBalanceSheet.other_liabilities)
                      )} FCFA
                    </TableCell>
                    <TableCell>
                      {formatNumber(lastBalanceSheet.cash_and_bank)} FCFA
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphique d'évolution financière mis à jour */}
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
                name="Résultat"
                fill="#10B981"
                stroke="#10B981"
                fillOpacity={0.3}
              />
              <Bar 
                dataKey="revenue" 
                name="Revenus factures" 
                fill="#2563EB"
                stackId="revenue"
                barSize={20}
              />
              <Bar 
                dataKey="connectionLaborRevenue" 
                name="Frais branchement" 
                fill="#059669"
                stackId="revenue"
                barSize={20}
              />
              <Bar 
                dataKey="penaltyRevenue" 
                name="Pénalités coupure" 
                fill="#F59E0B"
                stackId="revenue"
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
                dataKey="netCashFlow"
                name="Flux de trésorerie"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Répartition des revenus et dépenses mise à jour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des revenus avec nouvelles sources */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Revenus</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Factures d'eau", value: parseFloat(stats?.invoiceRevenue || 0) },
                    { name: 'Dons', value: parseFloat(stats?.donationRevenue || 0) },
                    { name: 'Frais branchement', value: parseFloat(stats?.connectionLaborRevenue || 0) },
                    { name: 'Pénalités coupure', value: parseFloat(stats?.penaltyRevenue || 0) }
                  ].filter(item => item.value > 0)} // Filtrer les valeurs nulles
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
                  <Cell fill="#059669" />
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

      {/* Indicateurs de performance avec nouveaux revenus */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Sources de Revenus</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Factures d'eau:</span>
                  <span className="font-medium">{((parseFloat(stats?.invoiceRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Frais branchement:</span>
                  <span className="font-medium">{((parseFloat(stats?.connectionLaborRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pénalités:</span>
                  <span className="font-medium">{((parseFloat(stats?.penaltyRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Dons:</span>
                  <span className="font-medium">{((parseFloat(stats?.donationRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Revenus Complémentaires</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total branchements + pénalités:</span>
                  <span className="font-medium">{formatNumber((parseFloat(stats?.connectionLaborRevenue || 0) + parseFloat(stats?.penaltyRevenue || 0)))} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">% du total:</span>
                  <span className="font-medium">{(((parseFloat(stats?.connectionLaborRevenue || 0) + parseFloat(stats?.penaltyRevenue || 0)) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${parseFloat(stats?.margin || 0) > 20 ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className={`text-lg font-medium ${parseFloat(stats?.margin || 0) > 20 ? 'text-green-800' : 'text-red-800'}`}>
                Performance Globale
              </h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Marge opérationnelle:</span>
                  <span className="font-medium">{stats?.margin || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ratio efficacité:</span>
                  <span className="font-medium">{(100 - parseFloat(stats?.expenseRatio || 0)).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation pour sauvegarder le bilan */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Sauvegarder comme bilan historique</h3>
            
            <p className="mb-4">
              Vous êtes sur le point de sauvegarder ce bilan comme un bilan historique. 
              Cette action enregistrera l'état financier actuel pour référence future.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <p className="font-medium">Période: {new Date(currentBalanceSheet.period_start).toLocaleDateString()} - {new Date(currentBalanceSheet.period_end).toLocaleDateString()}</p>
              <p className="mt-2">Total Actif: {formatNumber(
                parseFloat(currentBalanceSheet.accounts_receivable) +
                parseFloat(currentBalanceSheet.cash_and_bank) +
                parseFloat(currentBalanceSheet.other_assets)
              )} FCFA</p>
              <div className="mt-2 text-sm text-blue-600">
                <p>Inclut: Frais branchement ({formatNumber(stats?.connectionLaborRevenue || 0)} FCFA) + Pénalités ({formatNumber(stats?.penaltyRevenue || 0)} FCFA)</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSaveModal(false)}
              >
                Annuler
              </Button>
              <Button 
                onClick={saveAsHistoricalBalanceSheet}
              >
                Confirmer la sauvegarde
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;