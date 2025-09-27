// ================================================================
// src/components/ServiceInfo/AnomalyList.js
// ================================================================

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  Alert, 
  AlertDescription 
} from "../ui/alert";
import { 
  Button 
} from "../ui/button";
import { 
  Badge 
} from "../ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  User,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from "../ui/toast/use-toast";
import { Dialog, DialogContent } from "../ui/dialog";
import AnomalyDetail from "./AnomalyDetail";

const AnomalyList = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // États de filtrage et pagination
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    severity: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalItems: 0
  });
  const [sortBy, setSortBy] = useState('detection_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const { toast } = useToast();

  // Charger les anomalies au montage et quand les filtres changent
  useEffect(() => {
    fetchAnomalies();
  }, [filters, pagination.page, sortBy, sortOrder]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== 'all')
        )
      });

      const response = await api.get(`/anomalies?${params}`);
      const data = response.data.data;
      
      setAnomalies(data.anomalies || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalItems || 0
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des anomalies');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la liste des anomalies"
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer les changements de filtres
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset à la page 1
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      severity: 'all',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Changer la page
  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Gérer le tri
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Actions rapides sur les anomalies
  const handleQuickAction = async (anomalyId, action) => {
    try {
      await api.patch(`/anomalies/${anomalyId}/resolve`, {
        status: action,
        notes: `Action rapide: ${action}`
      });

      toast({
        title: "Succès",
        description: `Anomalie marquée comme ${action}`
      });

      fetchAnomalies(); // Recharger la liste
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || 'Erreur lors de l\'action'
      });
    }
  };

  // Icônes et couleurs par type
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "detected":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "ignored":
        return "bg-gray-100 text-gray-800";
      case "false_positive":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("fr-FR").format(num || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Nombre de filtres actifs
  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== '' && value !== 'all'
  ).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Toutes les Anomalies
          </h2>
          <p className="text-gray-600">
            {pagination.totalItems} anomalies trouvées
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Ligne 1: Filtres principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="detected">Détectée</option>
                  <option value="investigating">En cours</option>
                  <option value="resolved">Résolue</option>
                  <option value="ignored">Ignorée</option>
                  <option value="false_positive">Faux positif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="consumption_spike">Hausse anormale</option>
                  <option value="consumption_drop">Baisse suspecte</option>
                  <option value="zero_consumption">Consommation nulle</option>
                  <option value="billing_mismatch">Écart facturation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sévérité
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => updateFilter('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes les sévérités</option>
                  <option value="critical">Critique</option>
                  <option value="high">Élevée</option>
                  <option value="medium">Modérée</option>
                  <option value="low">Faible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom du consommateur..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ligne 2: Filtres de date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => updateFilter('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => updateFilter('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  disabled={activeFiltersCount === 0}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser ({activeFiltersCount})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des anomalies */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des anomalies...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : anomalies.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune anomalie trouvée</h3>
              <p className="text-gray-500">
                {activeFiltersCount > 0 
                  ? "Essayez de modifier vos filtres pour voir plus de résultats"
                  : "Toutes les anomalies ont été traitées ou aucune anomalie n'a été détectée"
                }
              </p>
            </div>
          ) : (
            <>
              {/* En-tête du tableau */}
              <div className="bg-gray-50 border-b px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort('consumer_name')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Consommateur
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('anomaly_type')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Type
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => handleSort('severity_level')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Sévérité
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-2">Écart</div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort('detection_date')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Détection
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="col-span-1">Statut</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Lignes du tableau */}
              <div className="divide-y divide-gray-200">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Consommateur */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getAnomalyIcon(anomaly.anomaly.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {anomaly.consumer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {anomaly.consumer.phone}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Type */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {anomaly.anomaly.typeLabel}
                        </div>
                        <div className="text-xs text-gray-500">
                          {anomaly.meter.location}
                        </div>
                      </div>

                      {/* Sévérité */}
                      <div className="col-span-1">
                        <Badge className={`${getSeverityColor(anomaly.anomaly.severity)} border text-xs`}>
                          {anomaly.anomaly.severityLabel}
                        </Badge>
                      </div>

                      {/* Écart */}
                      <div className="col-span-2">
                        <div className={`text-sm font-medium ${
                          anomaly.anomaly.deviation > 0 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {anomaly.anomaly.deviation > 0 ? '+' : ''}{anomaly.anomaly.deviation.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(anomaly.anomaly.currentReading)}m³ → 
                          {formatNumber(anomaly.anomaly.averageReading)}m³
                        </div>
                      </div>

                      {/* Date de détection */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900">
                          {formatDate(anomaly.anomaly.detectionDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Période: {new Date(anomaly.anomaly.period.start).toLocaleDateString('fr-FR')} - 
                          {new Date(anomaly.anomaly.period.end).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1">
                        <Badge className={`${getStatusColor(anomaly.anomaly.status)} text-xs`}>
                          {anomaly.anomaly.statusLabel}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAnomalyId(anomaly.id);
                              setShowDetailModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {anomaly.anomaly.status !== 'resolved' && (
                            <div className="relative group">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                              
                              {/* Menu dropdown d'actions rapides */}
                              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleQuickAction(anomaly.id, 'investigating')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Marquer en cours
                                  </button>
                                  <button
                                    onClick={() => handleQuickAction(anomaly.id, 'resolved')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <CheckCircle className="w-4 h-4 inline mr-2" />
                                    Marquer résolue
                                  </button>
                                  <button
                                    onClick={() => handleQuickAction(anomaly.id, 'false_positive')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <X className="w-4 h-4 inline mr-2" />
                                    Faux positif
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Affichage {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.totalItems)} sur{' '}
                    {pagination.totalItems} anomalies
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, pagination.page - 2) + i;
                        if (pageNum > pagination.totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === pagination.page ? "default" : "outline"}
                            size="sm"
                            onClick={() => changePage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail */}
      {showDetailModal && selectedAnomalyId && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <AnomalyDetail
              anomalyId={selectedAnomalyId}
              onClose={() => setShowDetailModal(false)}
              onUpdate={() => {
                fetchAnomalies();
                setShowDetailModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnomalyList;