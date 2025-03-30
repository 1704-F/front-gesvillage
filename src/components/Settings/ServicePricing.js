import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast/use-toast";
import { Settings2, History, AlertCircle, Plus, Calendar } from 'lucide-react';
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

// Composant formulaire de prix
const PricingForm = ({ formData, handleChange, handleSubmit, loading }) => {
  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

        <FormItem>
            <FormLabel>Type de tarification</FormLabel>
            <FormControl>
              <Select 
                name="pricing_type"
                value={formData.pricing_type}
                onValueChange={(value) => handleChange({ target: { name: 'pricing_type', value }})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de tarification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Tarification unique</SelectItem>
                  <SelectItem value="TIERED">Tarification à deux tranches</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              Choisissez entre une tarification unique ou à deux tranches
            </FormDescription>
          </FormItem>

          <FormItem>
            <FormLabel>Prix de base (FCFA/m³)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                placeholder="Ex: 500"
              />
            </FormControl>
            <FormDescription>
              {formData.pricing_type === 'SINGLE' 
                ? "Prix unique appliqué à toute la consommation"
                : "Prix appliqué jusqu'au seuil de consommation"
              }
            </FormDescription>
          </FormItem>

          {formData.pricing_type === 'TIERED' && (
  <>
    <FormItem>
      <FormLabel>Seuil de consommation (m³)</FormLabel>
      <FormControl>
        <Input 
          type="number"
          name="threshold"
          value={formData.threshold}
          onChange={handleChange}
          placeholder="Ex: 50"
        />
      </FormControl>
      <FormDescription>
        Volume d'eau en m³ avant application du tarif majoré
      </FormDescription>
    </FormItem>

    <FormItem>
      <FormLabel>Prix majoré (FCFA/m³)</FormLabel>
      <FormControl>
        <Input 
          type="number"
          name="extra_price"
          value={formData.extra_price}
          onChange={handleChange}
          placeholder="Ex: 750"
        />
      </FormControl>
      <FormDescription>
        Prix appliqué au-delà du seuil de consommation
      </FormDescription>
    </FormItem>
  </>
)}

{/* Ces options doivent être en dehors du bloc conditionnel pour être toujours visibles */}
<FormItem>
  <FormLabel>Multiplicateur pour compteurs premium</FormLabel>
  <FormControl>
    <Input 
      type="number"
      name="premium_multiplier"
      value={formData.premium_multiplier}
      onChange={handleChange}
      placeholder="Ex: 1.5"
      step="0.1"
    />
  </FormControl>
  <FormDescription>
    Facteur appliqué au tarif standard pour les compteurs premium (ex: 1.5 = +50%)
  </FormDescription>
</FormItem>

<FormItem>
  <FormLabel>Compteurs gratuits</FormLabel>
  <div className="flex items-center space-x-2">
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
              Date à partir de laquelle ces tarifs seront appliqués
            </FormDescription>
          </FormItem>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            Enregistrer les modifications
          </Button>
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
    pricing_type: "SINGLE", // valeur par défaut
    threshold: "",
    base_price: "",
    extra_price: "",
    premium_multiplier: "1.5", // Valeur par défaut
    free_enabled: true, // Activé par défaut
    effective_date: format(new Date(), 'yyyy-MM-dd') // Ajout de la date d'effectivité
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currentResponse, historyResponse, dueDateResponse, dueDateHistoryResponse] = await Promise.all([
          api.get('/service-pricing/current'),
          api.get('/service-pricing/history'),
          api.get('/due-date-rules/current'),
          api.get('/due-date-rules/history')
        ]);
  
        // Vérification que current existe
        if (currentResponse?.data?.data?.current) {
          const current = currentResponse.data.data.current;
          setFormData({
            pricing_type: current.threshold ? 'TIERED' : 'SINGLE',
            threshold: current.threshold?.toString() || "",
            base_price: current.base_price?.toString() || "",
            extra_price: current.extra_price?.toString() || "",
            premium_multiplier: current.premium_multiplier?.toString() || "1.5",
            free_enabled: current.free_enabled !== undefined ? current.free_enabled : true,
            effective_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
  
        // Vérification pour l'historique
        if (historyResponse?.data?.data) {
          setPricingHistory(historyResponse.data.data);
        }
  
        // Vérification pour les dates d'échéance
        if (dueDateResponse?.data?.data?.current) {
          const dueDateCurrent = dueDateResponse.data.data.current;
          setDueDateFormData({
            rule_type: dueDateCurrent.rule_type || 'DAYS_AFTER_PERIOD',
            value: dueDateCurrent.value?.toString() || "",
            effective_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
  
        // Vérification pour l'historique des dates d'échéance
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
        free_enabled: formData.free_enabled === true, // Convertir en booléen
        effective_date: formData.effective_date,
      };
  
      if (formData.pricing_type === 'TIERED') {
        submitData.threshold = Number(formData.threshold);
        submitData.extra_price = Number(formData.extra_price);
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


  // Ajouter le gestionnaire de soumission pour la date d'échéance
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

    // Recharger l'historique
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
            <AlertTitle>Information sur la tarification</AlertTitle>
            <AlertDescription>
              <p className="mt-2">La tarification se fait en deux tranches :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Une tranche de base jusqu'au seuil défini</li>
                <li>Une tranche majorée au-delà du seuil</li>
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
          <TableHead>Date d'effet</TableHead> {/* Nouvelle colonne */}
          <TableHead>Seuil (m³)</TableHead>
          <TableHead>Prix de base (FCFA)</TableHead>
          <TableHead>Prix majoré (FCFA)</TableHead>
          <TableHead>Multiplicateur Premium</TableHead>
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
        <TableCell>{history.threshold || '-'}</TableCell>
        <TableCell>{history.base_price}</TableCell>
        <TableCell>{history.threshold ? history.extra_price : '-'}</TableCell>
        <TableCell>{history.premium_multiplier || '1.5'}</TableCell>
        
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