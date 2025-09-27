// ================================================================
// src/components/ServiceInfo/AnomalyDashboard.js - VERSION AMÉLIORÉE
// ================================================================

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Settings,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Filter,
  Calendar,
  Users,
  Activity,
  List
} from "lucide-react";
import { axiosPrivate as api } from "../../utils/axios";
import { useToast } from "../ui/toast/use-toast";
import { Dialog, DialogContent } from "../ui/dialog";
import AnomalySettings from "./AnomalySettings";
import AnomalyDetail from "./AnomalyDetail";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnomalyDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detectionRunning, setDetectionRunning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d
  const [refreshInterval, setRefreshInterval] = useState(null);

  const { toast } = useToast();

  // Couleurs pour les graphiques
  const CHART_COLORS = {
    'consumption_spike': '#ef4444',
    'consumption_drop': '#f97316', 
    'zero_consumption': '#eab308',
    'billing_mismatch': '#8b5cf6'
  };

  // Auto-refresh toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !detectionRunning) {
        fetchDashboardData(true); // Silent refresh
      }
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);
    return () => clearInterval(interval);
  }, [loading, detectionRunning]);

  // Charger les données du dashboard
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/anomalies/dashboard", {
        params: { timeRange }
      });
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des données"
      );
      if (!silent) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les données d'anomalies",
        });
      }
      console.error("Erreur chargement dashboard anomalies:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Lancer la détection manuelle
  const runDetection = async () => {
    try {
      setDetectionRunning(true);
      const response = await api.post("/anomalies/detect");

      toast({
        title: "Succès",
        description: `Détection terminée: ${response.data.data.newAnomaliesSaved} nouvelles anomalies détectées`,
      });

      await fetchDashboardData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          err.response?.data?.message || "Erreur lors de la détection",
      });
      console.error("Erreur lors de la détection:", err);
    } finally {
      setDetectionRunning(false);
    }
  };

  // Obtenir l'icône pour le type d'anomalie
  const getAnomalyIcon = (type) => {
    switch (type) {
      case "consumption_spike":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "consumption_drop":
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case "zero_consumption":
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Obtenir la couleur pour le niveau de sévérité
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Formatage des nombres
  const formatNumber = (num) => {
    return new Intl.NumberFormat("fr-FR").format(num || 0);
  };

  // Temps depuis la dernière détection
  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Il y a moins d'1h";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          Chargement des données d'anomalies...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement: {error}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData()}
            className="ml-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  const { stats, anomaliesByType, recentAnomalies, dailyTrend } = dashboardData;

  // Données pour le graphique temporel
  const trendData = dailyTrend?.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    anomalies: parseInt(item.count)
  })) || [];

  // Données pour le graphique en secteurs
  const pieData = anomaliesByType?.map(item => ({
    name: item.label,
    value: item.count,
    color: CHART_COLORS[item.type] || '#6b7280'
  })) || [];

  return (
    <div className="space-y-6">
      {/* En-tête avec actions et filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Surveillance des Anomalies
          </h2>
          <p className="text-gray-600">
            Détection automatique des variations anormales de consommation
          </p>
          {dashboardData.lastDetection && (
            <p className="text-xs text-gray-500 mt-1">
              Dernière détection: {getTimeAgo(dashboardData.lastDetection)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre de période */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={timeRange === '7d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('7d')}
              className="h-8"
            >
              7j
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('30d')}
              className="h-8"
            >
              30j
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('90d')}
              className="h-8"
            >
              90j
            </Button>
          </div>

          <Button
            onClick={runDetection}
            disabled={detectionRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {detectionRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyse...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Lancer Détection
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Anomalies
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.total || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {timeRange === '7d' ? '7 derniers jours' : 
                   timeRange === '30d' ? '30 derniers jours' : 
                   '90 derniers jours'}
                </p>
              </div>
              <div className="relative">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
                {stats?.total > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats?.active || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  En attente de traitement
                </p>
              </div>
              <div className="relative">
                <Clock className="w-8 h-8 text-orange-400" />
                {stats?.active > 0 && (
                  <Badge variant="outline" className="absolute -top-2 -right-2 px-1 text-xs">
                    {stats.active}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(stats?.critical || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Attention immédiate requise
                </p>
              </div>
              <div className="relative">
                <AlertCircle className="w-8 h-8 text-red-400" />
                {stats?.critical > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Taux de Résolution
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.resolutionRate || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.resolved || 0)} résolues
                </p>
              </div>
              <div className="relative">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div className={`absolute inset-0 rounded-full border-2 border-green-200`}
                     style={{
                       background: `conic-gradient(#22c55e 0deg ${(stats?.resolutionRate || 0) * 3.6}deg, transparent ${(stats?.resolutionRate || 0) * 3.6}deg 360deg)`
                     }}>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendance temporelle */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendance des Détections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Anomalies']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="anomalies" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée de tendance</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Répartition par type - Graphique en secteurs */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Répartition par Type</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée</p>
              </div>
            )}
            {/* Légende */}
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies récentes avec actions rapides */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Anomalies Récentes à Traiter
            </CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentAnomalies && recentAnomalies.length > 0 ? (
              recentAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`p-4 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow ${
                    anomaly.severity === 'critical' ? 'border-l-red-500' :
                    anomaly.severity === 'high' ? 'border-l-orange-500' :
                    anomaly.severity === 'medium' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getAnomalyIcon(anomaly.type)}
                        <div>
                          <span className="font-medium text-gray-900">
                            {anomaly.consumer?.name || "Consommateur inconnu"}
                          </span>
                          <Badge 
                            className={`ml-2 ${getSeverityColor(anomaly.severity)} border text-xs`}
                          >
                            {anomaly.severity?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="font-medium">{anomaly.typeLabel}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Écart:</span>
                          <p className={`font-medium ${anomaly.deviation > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {anomaly.deviation > 0 ? "+" : ""}{Number(anomaly.deviation).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Consommation:</span>
                          <p className="font-medium">
                            {anomaly.currentReading}m³ 
                            <span className="text-gray-400 ml-1">
                              (moy: {Number(anomaly.averageReading || 0).toFixed(1)}m³)
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        Détectée: {getTimeAgo(anomaly.detectionDate)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAnomalyId(anomaly.id);
                          setShowDetailModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      
                      {anomaly.severity === 'critical' && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Urgent
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucune anomalie active</p>
                <p className="text-sm">Toutes les anomalies ont été traitées</p>
              </div>
            )}
          </div>

          {recentAnomalies && recentAnomalies.length > 0 && (
            <div className="mt-6 pt-4 border-t flex justify-center">
              <Button variant="outline" className="w-full md:w-auto">
                <List className="w-4 h-4 mr-2" />
                Voir toutes les anomalies ({formatNumber(stats?.active || 0)})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertes importantes avec actions suggérées */}
      {stats?.critical > 0 && (
        <Alert variant="destructive" className="border-l-4 border-l-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div>
                <strong>{stats.critical} anomalies critiques</strong> nécessitent une attention immédiate. 
                <br />
                Ces variations importantes peuvent indiquer des fuites importantes ou des manipulations de compteur.
              </div>
              <Button size="sm" className="ml-4">
                Voir les critiques
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {stats?.active > 15 && (
        <Alert className="border-l-4 border-l-yellow-500">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div>
                <strong>{stats.active} anomalies actives</strong> sont en attente de traitement. 
                <br />
                Considérez une investigation pour réduire ce nombre et améliorer la réactivité.
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                Plan d'action
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Modals */}
      {showSettingsModal && (
        <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <AnomalySettings />
          </DialogContent>
        </Dialog>
      )}

      {showDetailModal && selectedAnomalyId && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <AnomalyDetail
              anomalyId={selectedAnomalyId}
              onClose={() => setShowDetailModal(false)}
              onUpdate={() => {
                fetchDashboardData();
                setShowDetailModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnomalyDashboard;