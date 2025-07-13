import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast/use-toast";
import { Settings2, History, AlertCircle, Plus, Calendar, Layers, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { axiosPrivate as api } from '../../utils/axios';
import { Checkbox } from "../ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue,
} from "../ui/select";

import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";

// Composant formulaire de prix amélioré
const PricingForm = ({ formData, handleChange, handleSubmit, loading }) => {
  const renderTranche = (number, isLast = false) => {
    const shouldShow = formData.pricing_type === 'SINGLE' ? number === 1 : 
                       parseInt(formData.pricing_type.split('_')[0]) >= number;
    
    if (!shouldShow) return null;

    const colors = {
      1: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
      2: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
      3: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800' },
      4: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' }
    };

    const color = colors[number];

    if (number === 1) {
      return (
        <div key="tranche1" className={`${color.bg} p-4 rounded-lg border-2 ${color.border}`}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className={color.badge}>Tranche 1</Badge>
            <span className="text-sm text-gray-600">
              {formData.pricing_type === 'SINGLE' ? 'Toute consommation' : `0 → ${formData.threshold || '?'} m³`}
            </span>
          </div>
          <FormItem>
            <FormLabel>Prix (FCFA/m³)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                placeholder="500"
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        </div>
      );
    }

    const fieldMapping = {
      2: { threshold: 'threshold', price: 'extra_price', nextThreshold: 'threshold_2' },
      3: { threshold: 'threshold_2', price: 'price_3', nextThreshold: 'threshold_3' },
      4: { threshold: 'threshold_3', price: 'price_4', nextThreshold: null }
    };

    const fields = fieldMapping[number];
    const rangeEnd = fields.nextThreshold ? (formData[fields.nextThreshold] || '∞') : '∞';

    return (
      <div key={`tranche${number}`} className={`${color.bg} p-4 rounded-lg border-2 ${color.border}`}>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={color.badge}>Tranche {number}</Badge>
          <span className="text-sm text-gray-600">
            {`${formData[fields.threshold] || '?'} → ${rangeEnd} m³`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormItem>
            <FormLabel>Seuil (m³)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                name={fields.threshold}
                value={formData[fields.threshold]}
                onChange={handleChange}
                placeholder={`${number === 2 ? '50' : number === 3 ? '100' : '200'}`}
                className="bg-white"
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Prix (FCFA/m³)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                name={fields.price}
                value={formData[fields.price]}
                onChange={handleChange}
                placeholder={`${number === 2 ? '750' : number === 3 ? '1000' : '1250'}`}
                className="bg-white"
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Section 1: Type de tarification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Structure tarifaire</h3>
            </div>
            
            <FormItem>
              <FormLabel>Nombre de tranches de tarification</FormLabel>
              <FormControl>
                <Select 
                  name="pricing_type"
                  value={formData.pricing_type}
                  onValueChange={(value) => handleChange({ target: { name: 'pricing_type', value }})}
                >
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Sélectionner le nombre de tranches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">1 tranche (tarification unique)</SelectItem>
                    <SelectItem value="2_TRANCHES">2 tranches</SelectItem>
                    <SelectItem value="3_TRANCHES">3 tranches</SelectItem>
                    <SelectItem value="4_TRANCHES">4 tranches</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Plus de tranches permettent une tarification plus progressive
              </FormDescription>
            </FormItem>

            {/* Grille des tranches - Layout adaptatif */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {renderTranche(1)}
              {renderTranche(2)}
              {renderTranche(3)}
              {renderTranche(4, true)}
            </div>
          </div>

          {/* Section 2: Multiplicateurs - Grid compact */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Multiplicateurs par type de compteur</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <FormLabel>Premium</FormLabel>
                <Input 
                  type="number"
                  name="premium_multiplier"
                  value={formData.premium_multiplier}
                  onChange={handleChange}
                  placeholder="1.5"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">ex: 1.5 = +50%</p>
              </div>

              <div className="space-y-2">
                <FormLabel>Agricole</FormLabel>
                <Input 
                  type="number"
                  name="agricole_multiplier"
                  value={formData.agricole_multiplier}
                  onChange={handleChange}
                  placeholder="0.8"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">ex: 0.8 = -20%</p>
              </div>

              <div className="space-y-2">
                <FormLabel>Industriel</FormLabel>
                <Input 
                  type="number"
                  name="industriel_multiplier"
                  value={formData.industriel_multiplier}
                  onChange={handleChange}
                  placeholder="0.8"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">Tarif industriel</p>
              </div>

              <div className="space-y-2">
                <FormLabel>Autre tarif</FormLabel>
                <Input 
                  type="number"
                  name="autre_tarif_multiplier"
                  value={formData.autre_tarif_multiplier}
                  onChange={handleChange}
                  placeholder="0.8"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">Autres types</p>
              </div>
            </div>
          </div>

          {/* Section 3: Options et validation - Layout horizontal */}
          <div className="space-y-6 border-t pt-6">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Options et application</h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Compteurs gratuits */}
              <FormItem>
                <FormLabel>Compteurs gratuits</FormLabel>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="free_enabled"
                    checked={formData.free_enabled}
                    onCheckedChange={(checked) => handleChange({ 
                      target: { 
                        name: 'free_enabled', 
                        value: checked 
                      } 
                    })}
                  />
                  <label
                    htmlFor="free_enabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Activer les compteurs gratuits
                  </label>
                </div>
                <FormDescription>
                  Permet d'avoir des compteurs exemptés de facturation (bâtiments publics, etc.)
                </FormDescription>
              </FormItem>

              {/* Date d'application */}
              <FormItem>
                <FormLabel>Date d'application</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    name="effective_date"
                    value={formData.effective_date}
                    onChange={handleChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="max-w-xs"
                  />
                </FormControl>
                <FormDescription>
                  Date à partir de laquelle ces tarifs seront appliqués
                </FormDescription>
              </FormItem>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto px-8"
              disabled={loading}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};




const DueDateForm = ({ formData, handleChange, handleSubmit, loading }) => (
  <Card className="p-6">
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <FormItem>
          <FormLabel>Type de règle</FormLabel>
          <FormControl>
            <Select 
              name="rule_type"
              value={formData.rule_type}
              onValueChange={(value) => handleChange({ target: { name: 'rule_type', value }})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type de règle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_DATE">Date fixe du mois</SelectItem>
                <SelectItem value="DAYS_AFTER_PERIOD">Jours après la période</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>
            Choisissez comment la date d'échéance sera calculée
          </FormDescription>
        </FormItem>

        <FormItem>
          <FormLabel>
            {formData.rule_type === 'FIXED_DATE' ? 'Jour du mois' : 'Nombre de jours'}
          </FormLabel>
          <FormControl>
            <Input 
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              min={1}
              max={formData.rule_type === 'FIXED_DATE' ? 31 : 90}
              placeholder={formData.rule_type === 'FIXED_DATE' ? "Ex: 25" : "Ex: 30"}
            />
          </FormControl>
          <FormDescription>
            {formData.rule_type === 'FIXED_DATE' 
              ? "Le jour du mois où la facture sera due" 
              : "Le nombre de jours après la fin de période pour le paiement"}
          </FormDescription>
        </FormItem>

        <FormItem>
          <FormLabel>Date d'application</FormLabel>
          <FormControl>
            <Input 
              type="date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </FormControl>
          <FormDescription>
            Date à partir de laquelle cette règle sera appliquée
          </FormDescription>
        </FormItem>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          Enregistrer la règle
        </Button>
      </div>
    </form>
  </Card>
);

// Page principale
const PricingSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [pricingHistory, setPricingHistory] = useState([]);
  const [formData, setFormData] = useState({
    pricing_type: "SINGLE",
    threshold: "",
    base_price: "",
    extra_price: "",
    threshold_2: "",
    price_3: "",
    threshold_3: "",
    price_4: "",
    premium_multiplier: "1.5",
    agricole_multiplier: "0.8",
    industriel_multiplier: "0.8",
    autre_tarif_multiplier: "0.8",
    free_enabled: true,
    effective_date: format(new Date(), 'yyyy-MM-dd')
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };

  const [dueDateFormData, setDueDateFormData] = useState({ 
    rule_type: "DAYS_AFTER_PERIOD",
    value: "",
    effective_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [dueDateHistory, setDueDateHistory] = useState([]);

  // Fonction pour déterminer le type de tarification basé sur les données
  const determinePricingType = (current) => {
    if (!current.threshold) return 'SINGLE';
    if (current.threshold && !current.threshold_2) return '2_TRANCHES';
    if (current.threshold_2 && !current.threshold_3) return '3_TRANCHES';
    if (current.threshold_3) return '4_TRANCHES';
    return 'SINGLE';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentResponse, historyResponse, dueDateResponse, dueDateHistoryResponse] = await Promise.all([
          api.get('/service-pricing/current'),
          api.get('/service-pricing/history'),
          api.get('/due-date-rules/current'),
          api.get('/due-date-rules/history')
        ]);
  
        if (currentResponse?.data?.data?.current) {
          const current = currentResponse.data.data.current;
          setFormData({
            pricing_type: determinePricingType(current),
            threshold: current.threshold?.toString() || "",
            base_price: current.base_price?.toString() || "",
            extra_price: current.extra_price?.toString() || "",
            threshold_2: current.threshold_2?.toString() || "",
            price_3: current.price_3?.toString() || "",
            threshold_3: current.threshold_3?.toString() || "",
            price_4: current.price_4?.toString() || "",
            premium_multiplier: current.premium_multiplier?.toString() || "1.5",
            agricole_multiplier: current.agricole_multiplier?.toString() || "0.8",
            industriel_multiplier: current.industriel_multiplier?.toString() || "0.8",
            autre_tarif_multiplier: current.autre_tarif_multiplier?.toString() || "0.8",
            free_enabled: current.free_enabled !== undefined ? current.free_enabled : true,
            effective_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
  
        if (historyResponse?.data?.data) {
          setPricingHistory(historyResponse.data.data);
        }
  
        if (dueDateResponse?.data?.data?.current) {
          const dueDateCurrent = dueDateResponse.data.data.current;
          setDueDateFormData({
            rule_type: dueDateCurrent.rule_type || 'DAYS_AFTER_PERIOD',
            value: dueDateCurrent.value?.toString() || "",
            effective_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
  
        if (dueDateHistoryResponse?.data?.data) {
          setDueDateHistory(dueDateHistoryResponse.data.data);
        }
  
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.message || "Impossible de récupérer les données."
        });
        console.error('Erreur de chargement:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        base_price: Number(formData.base_price),
        premium_multiplier: Number(formData.premium_multiplier),
        agricole_multiplier: Number(formData.agricole_multiplier),
        industriel_multiplier: Number(formData.industriel_multiplier),
        autre_tarif_multiplier: Number(formData.autre_tarif_multiplier),
        free_enabled: formData.free_enabled === true,
        effective_date: formData.effective_date,
      };
  
      // Ajouter les tranches selon le type sélectionné
      if (formData.pricing_type !== 'SINGLE') {
        if (formData.threshold && formData.extra_price) {
          submitData.threshold = Number(formData.threshold);
          submitData.extra_price = Number(formData.extra_price);
        }
        
        if (formData.pricing_type === '3_TRANCHES' || formData.pricing_type === '4_TRANCHES') {
          if (formData.threshold_2 && formData.price_3) {
            submitData.threshold_2 = Number(formData.threshold_2);
            submitData.price_3 = Number(formData.price_3);
          }
        }
        
        if (formData.pricing_type === '4_TRANCHES') {
          if (formData.threshold_3 && formData.price_4) {
            submitData.threshold_3 = Number(formData.threshold_3);
            submitData.price_4 = Number(formData.price_4);
          }
        }
      }
  
      await api.put('/service-pricing/update', submitData);
      
      toast({
        title: "Succès",
        description: "Configuration de tarification mise à jour avec succès."
      });
  
      // Recharger les données
      const historyResponse = await api.get('/service-pricing/history');
      setPricingHistory(historyResponse.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDueDateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/due-date-rules/update', {
        rule_type: dueDateFormData.rule_type,
        value: Number(dueDateFormData.value),
        effective_date: dueDateFormData.effective_date
      });
      
      toast({
        title: "Succès",
        description: "Règle de date d'échéance mise à jour avec succès."
      });

      const historyResponse = await api.get('/due-date-rules/history');
      setDueDateHistory(historyResponse.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la mise à jour."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          Paramètres de tarification
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">
            <Settings2 className="w-4 h-4 mr-2" />
            Configuration actuelle
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" /> 
            Historique des modifications
          </TabsTrigger>
          <TabsTrigger value="due-date">
         <Calendar className="w-4 h-4 mr-2" />
          Date d'échéance
         </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Alert variant="info" className="bg-blue-50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tarification progressive</AlertTitle>
            <AlertDescription>
              <p className="mt-2">Configurez jusqu'à 4 tranches de tarification :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Plus de tranches permettent une tarification plus équitable</li>
                <li>Chaque type de compteur peut avoir son propre multiplicateur</li>
                <li>Les compteurs gratuits restent exemptés de facturation</li>
              </ul>
            </AlertDescription>
          </Alert>

          <PricingForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de modification</TableHead>
                  <TableHead>Date d'effet</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tranches</TableHead>
                  <TableHead>Multiplicateurs</TableHead>
                  <TableHead>Compteurs gratuits</TableHead>
                  <TableHead>Modifié par</TableHead> 
                </TableRow>
              </TableHeader>

              <TableBody>
                {pricingHistory.map((history) => {
                  const isActive = new Date(history.effective_date) <= new Date();
                  const isFuture = new Date(history.effective_date) > new Date();
                  
                  return (
                    <TableRow key={history.id}>
                      <TableCell>
                        {formatDate(history.createdAt)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {formatDate(history.effective_date)}
                        {isActive && <Badge variant="success">Actif</Badge>}
                        {isFuture && <Badge variant="warning">À venir</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{history.pricing_type || 'SINGLE'}</Badge>
                      </TableCell>

                      <TableCell>
  <div className="text-xs space-y-1">
    <div>T1: {history.base_price} FCFA</div>
    {history.threshold && (
      <div>
        T2: {history.extra_price} FCFA (&gt;{history.threshold}m³)
      </div>
    )}
    {history.threshold_2 && (
      <div>
        T3: {history.price_3} FCFA (&gt;{history.threshold_2}m³)
      </div>
    )}
    {history.threshold_3 && (
      <div>
        T4: {history.price_4} FCFA (&gt;{history.threshold_3}m³)
      </div>
    )}
  </div>
</TableCell>


                    

                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>Premium: x{history.premium_multiplier || '1.5'}</div>
                          <div>Agricole: x{history.agricole_multiplier || '0.8'}</div>
                          <div>Industriel: x{history.industriel_multiplier || '0.8'}</div>
                          <div>Autre: x{history.autre_tarif_multiplier || '0.8'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={history.free_enabled === true ? "success" : "secondary"}>
                          {history.free_enabled === true ? "Activé" : "Désactivé"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {`${history.user.first_name} ${history.user.last_name}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="due-date">
          <Alert variant="info" className="bg-blue-50 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration de la date d'échéance</AlertTitle>
            <AlertDescription>
              Définissez comment la date d'échéance des factures sera calculée.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Règle actuelle</h3>
              <DueDateForm 
                formData={dueDateFormData}
                handleChange={(e) => {
                  const { name, value } = e.target;
                  setDueDateFormData(prev => ({
                    ...prev,
                    [name]: value
                  }));
                }}
                handleSubmit={handleDueDateSubmit}
                loading={loading}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Historique des modifications</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date de modification</TableHead>
                      <TableHead>Type de règle</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Date d'effet</TableHead>
                      <TableHead>Modifié par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueDateHistory.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>
                          {format(new Date(history.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {history.rule_type === 'FIXED_DATE' ? 'Date fixe' : 'Jours après période'}
                        </TableCell>
                        <TableCell>
                          {history.value} {history.rule_type === 'FIXED_DATE' ? 'du mois' : 'jours'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(history.effective_date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {`${history.user.first_name} ${history.user.last_name}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingSettingsPage;