// ================================================================
// src/components/ServiceInfo/AnomalyDetail.js
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
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  User,
  MapPin,
  Phone,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from "../ui/toast/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnomalyDetail = ({ anomalyId, onClose, onUpdate }) => {
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    if (anomalyId) {
      fetchAnomalyDetails();
    }
  }, [anomalyId]);

  const fetchAnomalyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/anomalies/${anomalyId}`);
      const data = response.data.data;
      setAnomaly(data);
      setNotes(data.anomaly.adminNotes || '');
      setNewStatus(data.anomaly.status);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des détails');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'anomalie"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await api.patch(`/anomalies/${anomalyId}/resolve`, {
        status: newStatus,
        notes: notes
      });

      toast({
        title: "Succès",
        description: "Anomalie mise à jour avec succès"
      });

      if (onUpdate) onUpdate();
      if (onClose) onClose();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || 'Erreur lors de la mise à jour'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'consumption_spike':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'consumption_drop':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'zero_consumption':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'detected':
        return <Eye className="w-4 h-4" />;
      case 'investigating':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'ignored':
      case 'false_positive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Préparer les données pour le graphique
  const chartData = anomaly?.readingsHistory ? 
    anomaly.readingsHistory.map((reading, index) => ({
      month: `Mois ${anomaly.readingsHistory.length - index}`,
      consommation: parseFloat(reading.consumption || 0),
      date: reading.reading_date
    })).reverse() : [];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des détails...</p>
      </div>
    );
  }

  if (error || !anomaly) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Anomalie non trouvée'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec informations principales */}
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          {getAnomalyIcon(anomaly.anomaly.type)}
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {anomaly.anomaly.typeLabel}
            </h3>
            <p className="text-gray-600">
              Consommateur: {anomaly.consumer.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${getSeverityColor(anomaly.anomaly.severity)} border`}>
            {anomaly.anomaly.severityLabel}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getStatusIcon(anomaly.anomaly.status)}
            {anomaly.anomaly.statusLabel}
          </Badge>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-600 font-medium">Consommation Actuelle</div>
            <div className="text-2xl font-bold text-blue-800">
              {formatNumber(anomaly.anomaly.currentReading)} m³
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="text-sm text-green-600 font-medium">Moyenne Historique</div>
            <div className="text-2xl font-bold text-green-800">
              {formatNumber(anomaly.anomaly.averageReading)} m³
            </div>
          </CardContent>
        </Card>

        <Card className={`${anomaly.anomaly.deviation > 0 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
          <CardContent className="p-4">
            <div className={`text-sm font-medium ${anomaly.anomaly.deviation > 0 ? 'text-red-600' : 'text-orange-600'}`}>
              Écart Détecté
            </div>
            <div className={`text-2xl font-bold ${anomaly.anomaly.deviation > 0 ? 'text-red-800' : 'text-orange-800'}`}>
              {anomaly.anomaly.deviation > 0 ? '+' : ''}{anomaly.anomaly.deviation.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de l'historique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Historique de Consommation (6 derniers mois)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value)} m³`, 'Consommation']}
                  labelFormatter={(label) => `Période: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="consommation" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun historique disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations du consommateur et compteur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations Consommateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{anomaly.consumer.name}</div>
                <div className="text-sm text-gray-500">ID: {anomaly.consumer.id}</div>
              </div>
            </div>
            
            {anomaly.consumer.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{anomaly.consumer.phone}</div>
                  <div className="text-sm text-gray-500">Téléphone</div>
                </div>
              </div>
            )}

            {anomaly.consumer.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{anomaly.consumer.address}</div>
                  <div className="text-sm text-gray-500">Adresse</div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${anomaly.consumer.waterStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium">
                  {anomaly.consumer.waterStatus === 'connected' ? 'Connecté' : 'Déconnecté'}
                </div>
                <div className="text-sm text-gray-500">État alimentation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Informations Compteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div>
                <div className="font-medium">{anomaly.meter.serial || 'N/A'}</div>
                <div className="text-sm text-gray-500">Numéro de série</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{anomaly.meter.location || 'Non spécifié'}</div>
                <div className="text-sm text-gray-500">Emplacement</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <div>
                <div className="font-medium capitalize">{anomaly.meter.type || 'Standard'}</div>
                <div className="text-sm text-gray-500">Type de compteur</div>
              </div>
            </div>

            {/*  

            {anomaly.meter.installationDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium">{formatDate(anomaly.meter.installationDate)}</div>
                  <div className="text-sm text-gray-500">Date d'installation</div>
                </div>
              </div>
            )}
              */}

            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${anomaly.meter.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-medium capitalize">{anomaly.meter.status}</div>
                <div className="text-sm text-gray-500">Statut</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails de l'anomalie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Détails de l'Anomalie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Date de détection</div>
              <div className="font-medium">{formatDate(anomaly.anomaly.detectionDate)}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500">Période concernée</div>
              <div className="font-medium">
                {new Date(anomaly.anomaly.period.start).toLocaleDateString('fr-FR')} au{' '}
                {new Date(anomaly.anomaly.period.end).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {anomaly.anomaly.resolvedDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Date de résolution</div>
                <div className="font-medium">{formatDate(anomaly.anomaly.resolvedDate)}</div>
              </div>
              
              {anomaly.resolver && (
                <div>
                  <div className="text-sm text-gray-500">Résolu par</div>
                  <div className="font-medium">{anomaly.resolver.name}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions et notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Actions et Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau statut
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="detected">Détectée</option>
              <option value="investigating">En investigation</option>
              <option value="resolved">Résolue</option>
              <option value="ignored">Ignorée</option>
              <option value="false_positive">Faux positif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes administratives
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Ajouter des notes sur cette anomalie..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {anomaly.anomaly.adminNotes && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium text-gray-700 mb-1">Notes existantes :</div>
              <div className="text-sm text-gray-600">{anomaly.anomaly.adminNotes}</div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fermer
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === anomaly.anomaly.status}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetail;