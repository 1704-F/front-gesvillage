import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast/use-toast';
import { axiosPrivate as api } from '../../utils/axios';
import { Save, AlertTriangle } from 'lucide-react';

const DisconnectionSettings = () => {
  const [minInvoices, setMinInvoices] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/services/disconnection-settings');
      setMinInvoices(response.data.data.min_invoices_for_disconnection);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les paramètres"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/services/disconnection-settings', {
        min_invoices_for_disconnection: minInvoices
      });

      toast({
        title: "Succès",
        description: "Paramètres de coupure mis à jour"
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de sauvegarder"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Paramètres des bons de coupure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Nombre minimum de factures impayées
          </label>
          <Select
            value={minInvoices.toString()}
            onValueChange={(val) => {
              setMinInvoices(parseInt(val));
              setHasChanges(true);
            }}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 facture</SelectItem>
              <SelectItem value="2">2 factures</SelectItem>
              <SelectItem value="3">3 factures</SelectItem>
              <SelectItem value="4">4 factures</SelectItem>
              <SelectItem value="6">6 factures</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Un bon de coupure ne pourra être généré que si le consommateur a au moins ce nombre de factures impayées.
          </p>
        </div>

        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DisconnectionSettings;
