import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Badge } from "../../ui/badge";
import { useToast } from "../../ui/toast/use-toast";
import { 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  Download,
  LineChart as LineChartIcon,
  BarChart3,
  Activity,
  Gauge,
  Calculator,
  CircleDollarSign,
  ArrowUpDown,
  Lightbulb
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { axiosPrivate as api } from '../../../utils/axios';

// Import du composant Sankey personnalisé
import SankeyDiagram from './SankeyDiagram';

// Import du PDF
import SynthesisPDF from './SynthesisPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

const SynthesisSection = ({ sources, period }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    source: 'all',
    quartier: 'all'
  });

  // Récupérer les données
  useEffect(() => {
    fetchSynthesisData();
  }, [period, filters]);

  const fetchSynthesisData = async () => {
    try {
      setLoading(true);
      const params = {
        start_date: format(period[0], 'yyyy-MM-dd'),
        end_date: format(period[1], 'yyyy-MM-dd'),
        source_filter: filters.source,
        quartier_filter: filters.quartier
      };

      const response = await api.get('/water-quality/synthesis', { params });
      setData(response.data.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de synthèse",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater les nombres
  const formatNumber = (num) => {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  };

  // Fonction pour formater les montants
  const formatCurrency = (amount) => {
    return `${formatNumber(amount)} FCFA`;
  };

  // Composant pour les KPI Cards
  const KPICard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          {trend && (
            <Badge variant={trend > 0 ? "destructive" : "success"}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );

  // Composant pour les anomalies
  const AnomaliesSection = ({ anomalies = [] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Anomalies Détectées
        </CardTitle>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <p className="text-center text-gray-500">Aucune anomalie détectée</p>
        ) : (
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="font-medium">{anomaly.message}</p>
                  <p className="text-sm text-gray-600">{anomaly.quartier}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Composant pour les recommandations
  const RecommendationsSection = ({ recommendations = [] }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommandations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-center text-gray-500">Aucune recommandation</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-500' : 
                  rec.priority === 'medium' ? 'bg-orange-500' : 
                  'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium">{rec.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 mt-8">
        Aucune donnée disponible pour la période sélectionnée
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et export */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={filters.source} onValueChange={(value) => setFilters({...filters, source: value})}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source.id} value={String(source.id)}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PDFDownloadLink
          document={<SynthesisPDF data={data} period={period} />}
          fileName={`synthese-eau-${format(period[0], 'yyyy-MM-dd')}-${format(period[1], 'yyyy-MM-dd')}.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Volume Pompé"
          value={`${formatNumber(data.totals.pumped)} m³`}
          icon={Droplets}
          color="blue"
        />
        <KPICard
          title="Volume Distribué"
          value={`${formatNumber(data.totals.distributed)} m³`}
          icon={Activity}
          color="green"
        />
        <KPICard
          title="Volume Consommé"
          value={`${formatNumber(data.totals.consumed)} m³`}
          icon={Gauge}
          color="purple"
        />
        <KPICard
          title="Pertes"
          value={`${data.totals.lossPercentage.toFixed(1)}%`}
          subtitle={`${formatNumber(data.totals.volumeLoss)} m³`}
          icon={TrendingUp}
          color="orange"
          trend={data.totals.lossPercentage > 10 ? data.totals.lossPercentage : null}
        />
      </div>

      {/* KPIs financiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Recette Théorique"
          value={formatCurrency(data.totals.theoreticalRevenue)}
          icon={Calculator}
          color="blue"
        />
        <KPICard
          title="Recette Réelle"
          value={formatCurrency(data.totals.actualRevenue)}
          icon={CircleDollarSign}
          color="green"
        />
        <KPICard
          title="Différence"
          value={formatCurrency(data.totals.revenueDifference)}
          subtitle={`${((data.totals.revenueDifference / data.totals.theoreticalRevenue) * 100).toFixed(1)}%`}
          icon={ArrowUpDown}
          color={data.totals.revenueDifference < 0 ? "green" : "red"}
          trend={data.totals.revenueDifference > 0 ? 
            (data.totals.revenueDifference / data.totals.theoreticalRevenue) * 100 : null}
        />
      </div>

      {/* Diagramme Sankey */}
      <Card>
        <CardHeader>
          <CardTitle>Flux de l'eau</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <SankeyDiagram data={data.sankeyData} />
        </CardContent>
      </Card>

      {/* Évolution temporelle */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des volumes et pertes</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.evolution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => format(new Date(value), 'MMM yyyy', { locale: fr })}
              />
              <YAxis 
                label={{ value: 'Volume (m³)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'MMMM yyyy', { locale: fr })}
                formatter={(value) => `${formatNumber(value)} m³`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="distributed" 
                name="Distribué" 
                stroke="#3B82F6" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="consumed" 
                name="Consommé" 
                stroke="#10B981" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="loss" 
                name="Pertes" 
                stroke="#EF4444" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Analyse par quartier */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par quartier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-gray-500 bg-slate-100">
                  <th className="text-left p-2">Quartier</th>
                  <th className="text-right p-2">Distribué (m³)</th>
                  <th className="text-right p-2">Consommé (m³)</th>
                  <th className="text-right p-2">Total consommé</th>
                  <th className="text-right p-2">Pertes</th>
                  <th className="text-right p-2">Recette Théorique</th>
                  <th className="text-right p-2">Recette Réelle</th>
                  <th className="text-right p-2">Différence</th>
                </tr>
              </thead>
              <tbody>
                {data.byQuartier.map((quartier, index) => (
                  <tr key={quartier.id} className={`border-b ${index % 2 === 0 ? 'bg-blue-50' : 'bg-cyan-50'}`}>
                    <td className="p-2 font-medium">{quartier.name}</td>
                    {index === 0 && (
                      <td className="text-right p-2 bg-sky-100" rowSpan={data.byQuartier.length}>
                        {formatNumber(quartier.distributed)}
                      </td>
                    )}
                    <td className="text-right p-2">{formatNumber(quartier.consumed)}</td>
                    {index === 0 && (
                      <td className="text-right p-2 bg-slate-200" rowSpan={data.byQuartier.length}>
                        {formatNumber(data.totals.consumed)}
                      </td>
                    )}
                    <td className="text-right p-2">
                      <span className={quartier.lossPercentage > 15 ? 'text-red-600' : ''}>
                        {formatNumber(quartier.volumeLoss)}
                      </span>
                    </td>
                    {index === 0 && (
                      <td className="text-right p-2 bg-emerald-100" rowSpan={data.byQuartier.length}>
                        {formatCurrency(data.totals.theoreticalRevenue)}
                      </td>
                    )}
                    {index === 0 && (
                      <td className="text-right p-2 bg-teal-100" rowSpan={data.byQuartier.length}>
                        {formatCurrency(data.totals.actualRevenue)}
                      </td>
                    )}
                    {index === 0 && (
                      <td className="text-right p-2 bg-indigo-100" rowSpan={data.byQuartier.length}>
                        <span className={data.totals.revenueDifference < 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(data.totals.revenueDifference)}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    

     

      {/* Anomalies et recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnomaliesSection anomalies={data.anomalies} />
        <RecommendationsSection recommendations={data.recommendations} />
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Rendement Hydraulique"
          value={`${data.totals.hydraulicEfficiency.toFixed(1)}%`}
          subtitle="Volume consommé / Volume pompé"
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Indice de Distribution"
          value={`${data.totals.distributionIndex.toFixed(1)}%`}
          subtitle="Volume consommé / Volume distribué"
          icon={Droplets}
          color="green"
        />
        <KPICard
          title="Coût par m³"
          value={formatCurrency(data.totals.costPerCubicMeter)}
          subtitle="Recette réelle / Volume distribué"
          icon={Calculator}
          color="purple"
        />
      </div>
    </div>
  );
};

export default SynthesisSection;