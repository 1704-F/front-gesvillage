// ================================================================
// src/components/ServiceInfo/AnomalySettings.js
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
  Settings,
  TrendingUp,
  TrendingDown,
  Zap,
  Save,
  RotateCcw,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from "../ui/toast/use-toast";

const AnomalySettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  const { toast } = useToast();

  // Paramètres par défaut
  const defaultSettings = {
    spike_threshold_low: 50,
    spike_threshold_medium: 100,
    spike_threshold_high: 200,
    drop_threshold_low: 30,
    drop_threshold_medium: 50,
    drop_threshold_high: 70,
    min_months_history: 3,
    zero_consumption_months: 2,
    exclude_new_meters: false,
    exclude_first_months: 2
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/anomalies/settings/detection');
      setSettings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des paramètres');
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les paramètres de détection"
      });
      console.error('Erreur chargement paramètres:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/anomalies/settings/detection', settings);
      
      toast({
        title: "Succès",
        description: "Paramètres de détection mis à jour avec succès"
      });
      
      setHasChanges(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.response?.data?.message || 'Erreur lors de la sauvegarde'
      });
      console.error('Erreur sauvegarde paramètres:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({ ...settings, ...defaultSettings });
    setHasChanges(true);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les valeurs par défaut ont été restaurées"
    });
  };

  // Validation des seuils
  const validateThresholds = () => {
    const errors = [];
    
    if (settings.spike_threshold_low >= settings.spike_threshold_medium) {
      errors.push("Le seuil bas de hausse doit être inférieur au seuil moyen");
    }
    if (settings.spike_threshold_medium >= settings.spike_threshold_high) {
      errors.push("Le seuil moyen de hausse doit être inférieur au seuil élevé");
    }
    if (settings.drop_threshold_low >= settings.drop_threshold_medium) {
      errors.push("Le seuil bas de baisse doit être inférieur au seuil moyen");
    }
    if (settings.drop_threshold_medium >= settings.drop_threshold_high) {
      errors.push("Le seuil moyen de baisse doit être inférieur au seuil élevé");
    }
    
    return errors;
  };

  const validationErrors = settings ? validateThresholds() : [];
  const canSave = hasChanges && validationErrors.length === 0;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement des paramètres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSettings}
            className="ml-2"
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-gray-500">
        Aucun paramètre disponible
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configuration de la Détection
          </h2>
          <p className="text-gray-600">
            Paramétrez les seuils de détection des anomalies de consommation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Valeurs par défaut
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!canSave || saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alertes de validation */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Erreurs de configuration :</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Modifications non sauvegardées */}
      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Vous avez des modifications non sauvegardées. N'oubliez pas de cliquer sur "Sauvegarder".
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration des seuils de hausse */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            Seuils de Détection - Hausses Anormales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Bas (Niveau : Modéré)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.spike_threshold_low}
                  onChange={(e) => updateSetting('spike_threshold_low', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={settings.spike_threshold_low}
                    onChange={(e) => updateSetting('spike_threshold_low', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 20m³ à 30m³ (+50%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Moyen (Niveau : Élevé)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.spike_threshold_medium}
                  onChange={(e) => updateSetting('spike_threshold_medium', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="50"
                    max="200"
                    value={settings.spike_threshold_medium}
                    onChange={(e) => updateSetting('spike_threshold_medium', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 20m³ à 40m³ (+100%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Élevé (Niveau : Critique)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={settings.spike_threshold_high}
                  onChange={(e) => updateSetting('spike_threshold_high', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="100"
                    max="500"
                    value={settings.spike_threshold_high}
                    onChange={(e) => updateSetting('spike_threshold_high', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 20m³ à 60m³ (+200%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration des seuils de baisse */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
            Seuils de Détection - Baisses Suspectes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Bas (Niveau : Modéré)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={settings.drop_threshold_low}
                  onChange={(e) => updateSetting('drop_threshold_low', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={settings.drop_threshold_low}
                    onChange={(e) => updateSetting('drop_threshold_low', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 50m³ à 35m³ (-30%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Moyen (Niveau : Élevé)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="30"
                  max="90"
                  value={settings.drop_threshold_medium}
                  onChange={(e) => updateSetting('drop_threshold_medium', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="30"
                    max="90"
                    value={settings.drop_threshold_medium}
                    onChange={(e) => updateSetting('drop_threshold_medium', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 60m³ à 30m³ (-50%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil Élevé (Niveau : Critique)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={settings.drop_threshold_high}
                  onChange={(e) => updateSetting('drop_threshold_high', parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={settings.drop_threshold_high}
                    onChange={(e) => updateSetting('drop_threshold_high', parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
                <span className="text-sm text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Exemple : Passer de 60m³ à 18m³ (-70%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres généraux */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Paramètres Généraux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historique minimum requis
              </label>
              <select
                value={settings.min_months_history}
                onChange={(e) => updateSetting('min_months_history', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 mois</option>
                <option value={3}>3 mois</option>
                <option value={4}>4 mois</option>
                <option value={6}>6 mois</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nombre de mois d'historique nécessaire avant de détecter des anomalies
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consommation nulle (alerte après)
              </label>
              <select
                value={settings.zero_consumption_months}
                onChange={(e) => updateSetting('zero_consumption_months', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 mois</option>
                <option value={2}>2 mois</option>
                <option value={3}>3 mois</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Générer une alerte si la consommation est nulle pendant cette durée
              </p>
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="exclude_new_meters"
                checked={settings.exclude_new_meters}
                onChange={(e) => updateSetting('exclude_new_meters', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="exclude_new_meters" className="text-sm font-medium text-gray-700">
                Exclure les nouveaux compteurs de la détection
              </label>
            </div>
            
            {settings.exclude_new_meters && (
              <div className="ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Période d'exclusion
                </label>
                <select
                  value={settings.exclude_first_months}
                  onChange={(e) => updateSetting('exclude_first_months', parseInt(e.target.value))}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 mois</option>
                  <option value={2}>2 mois</option>
                  <option value={3}>3 mois</option>
                  <option value={6}>6 mois</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Ignorer les anomalies pendant les premiers mois après installation
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu des paramètres */}
      <Card className="shadow-sm bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-5 h-5" />
            Résumé de la Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-2">Seuils de Hausse :</div>
              <div className="space-y-1 text-blue-700">
                <div>• Modéré : +{settings.spike_threshold_low}%</div>
                <div>• Élevé : +{settings.spike_threshold_medium}%</div>
                <div>• Critique : +{settings.spike_threshold_high}%</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-2">Seuils de Baisse :</div>
              <div className="space-y-1 text-blue-700">
                <div>• Modéré : -{settings.drop_threshold_low}%</div>
                <div>• Élevé : -{settings.drop_threshold_medium}%</div>
                <div>• Critique : -{settings.drop_threshold_high}%</div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-blue-200 text-sm text-blue-700">
            <span className="font-medium">Paramètres :</span> Historique minimum {settings.min_months_history} mois, 
            alerte consommation nulle après {settings.zero_consumption_months} mois
            {settings.exclude_new_meters && `, exclusion nouveaux compteurs pendant ${settings.exclude_first_months} mois`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalySettings;