import React, { useState, useEffect } from 'react';
import { cn } from "../lib/utils";
import { Card } from "../ui/card"; 
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useToast } from "../ui/toast/use-toast";
import { Plus, Pencil, Trash2, Calendar, Calculator, AlertCircle, Download,Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';


const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  dateRange: {
    marginBottom: 10,
    fontSize: 12,
    color: '#666',
  }
});

const formatNumber = (num, decimals = 0) => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true // S'assurer que le groupement est activé
  }).format(num)
    .replace(/\s/g, ' ') // Remplacer tous les espaces par des espaces normaux
    .replace(/[.,]\s/g, '.') // Gérer les décimales
    .replace(/\//g, ' '); // Remplacer les slashes par des espaces
};

const formatPercent = (num) => {
  if (isNaN(num)) return '0.00';
  return Number(num).toFixed(2);
};

// Composant PDF
const RelevePDF = ({ readings, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Relevés de consommation</Text>
      
      <Text style={styles.dateRange}>
        Période du {format(dateRange[0], 'dd/MM/yyyy')} au {format(dateRange[1], 'dd/MM/yyyy')}
      </Text>

      <View style={styles.table}>
        {/* En-têtes */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>N°</Text>
          <Text style={styles.tableCell}>Compteur</Text>
          <Text style={styles.tableCell}>Consommateur</Text>
          <Text style={styles.tableCell}>Ancien Index</Text>
          <Text style={styles.tableCell}>Nouvel Index</Text>
          <Text style={styles.tableCell}>Consommation (m³)</Text>
          <Text style={styles.tableCell}>Montant (FCFA)</Text>
          <Text style={styles.tableCell}>Date</Text>
          <Text style={styles.tableCell}>Statut</Text>
        </View>

        {/* Données */}
        {readings.map((reading, index) => (
          <View key={reading.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text>
            <Text style={styles.tableCell}>{reading.meter?.meter_number}</Text>
            <Text style={styles.tableCell}>
              {reading.meter?.user ? 
                `${reading.meter.user.first_name} ${reading.meter.user.last_name}` : 
                'N/A'}
            </Text>
            <Text style={styles.tableCell}>{reading.last_reading_value}</Text>
            <Text style={styles.tableCell}>{reading.reading_value}</Text>
            <Text style={styles.tableCell}>{reading.consumption}</Text>
            <Text style={styles.tableCell}>
              {formatNumber(reading.amount).toLocaleString()}
            </Text>
            <Text style={styles.tableCell}>
              {format(new Date(reading.reading_date), 'dd/MM/yyyy')}
            </Text>
            <Text style={styles.tableCell}>
              {reading.status === 'validated' ? 'Validé' : 'En attente'}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const ConsumptionDetails = ({ consumption }) => {
  const [calculationDetails, setCalculationDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!consumption) return;
      
      try {
        setLoading(true);
        const response = await api.post('/readings/calculate-preview', { 
          consumption
        });
        
        // La réponse a une nouvelle structure
        setCalculationDetails(response.data.data);
      } catch (error) {
        console.error('Erreur lors du calcul:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [consumption]);

  if (!calculationDetails || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Calcul en cours...</div>
      </div>
    );
  }

  const { calculationDetails: details } = calculationDetails;
  const isSingleTier = details.pricing_type === 'SINGLE';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcul
        </h3>
        <div className="text-lg font-bold text-blue-700">
          {Math.round(details.total_amount).toLocaleString()} FCFA
        </div>
      </div>

      <div className="bg-white rounded-md p-4 space-y-4">
        <div className="pb-3 border-b">
          <div className="text-sm font-medium text-gray-500">Consommation totale</div>
          <div className="text-2xl font-semibold">{consumption.toFixed(2)} m³</div>
        </div>

        <div className="space-y-4">
          {isSingleTier ? (
            // Affichage pour tarification unique
            <div>
              <div className="text-sm font-medium">Tarification unique</div>
              <div className="pl-3 text-sm text-gray-600">
                <div>Prix unitaire : {details.first_tier.rate} FCFA/m³</div>
                <div>{details.first_tier.consumption.toFixed(2)} m³ × {details.first_tier.rate} FCFA</div>
                <div className="font-medium text-black">
                  = {Math.round(details.first_tier.amount).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          ) : (
            // Affichage pour tarification à deux tranches
            <>
              <div>
                <div className="text-sm font-medium">Première tranche</div>
                <div className="pl-3 text-sm text-gray-600">
                  <div>{details.first_tier.consumption.toFixed(2)} m³ × {details.first_tier.rate} FCFA</div>
                  <div className="font-medium text-black">
                    = {Math.round(details.first_tier.amount).toLocaleString()} FCFA
                  </div>
                </div>
              </div>

              {details.second_tier.consumption > 0 && ( 
                <div>
                  <div className="text-sm font-medium">Deuxième tranche</div>
                  <div className="pl-3 text-sm text-gray-600">
                    <div>{details.second_tier.consumption.toFixed(2)} m³ × {details.second_tier.rate} FCFA</div>
                    <div className="font-medium text-black">
                      = {Math.round(details.second_tier.amount).toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          * Calcul basé sur la tarification en vigueur
        </div>
      </div>
    </div>
  );
};

const ReadingForm = ({ isOpen, onClose, editingReading, meters, onSubmit }) => {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    meter_id: '',
    last_reading_value: '',
    reading_value: '',
    method: 'manual',
    reading_date: new Date(),
    status: 'pending',
    period: {
      from: new Date(),
      to: new Date()
    }
  });

  const [consumption, setConsumption] = useState(null);

  useEffect(() => {
    if (editingReading) {
      setFormData({
        meter_id: String(editingReading.meter_id),
        last_reading_value: editingReading.last_reading_value,
        reading_value: editingReading.reading_value,
        method: editingReading.method,
        reading_date: new Date(editingReading.reading_date),
        status: editingReading.status,
        period: {
          from: new Date(editingReading.start_date),
          to: new Date(editingReading.end_date)
        }
      });
    }
  }, [editingReading]);

  useEffect(() => {
    if (formData.last_reading_value && formData.reading_value) {
      const newConsumption = parseFloat(formData.reading_value) - parseFloat(formData.last_reading_value);
      setConsumption(newConsumption > 0 ? newConsumption : null);
    } else {
      setConsumption(null);
    }
  }, [formData.last_reading_value, formData.reading_value]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (parseFloat(formData.reading_value) <= parseFloat(formData.last_reading_value)) {
      setError("Le nouvel index doit être supérieur à l'ancien index");
      return;
    }

    const submitData = {
      ...formData,
      start_date: format(formData.period.from, 'yyyy-MM-dd'),
      end_date: format(formData.period.to, 'yyyy-MM-dd'),
      reading_date: format(formData.reading_date, 'yyyy-MM-dd')
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      const errorData = error.response?.data;
      const errorText = errorData?.error || '';
      
      if (errorText.includes('unique_reading_per_day')) {
        setError(
          <div className="space-y-2">
            <p className="font-medium text-red-700">Un relevé existe déjà pour cette date</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Un seul relevé est autorisé par jour pour chaque compteur</li>
              <li>Veuillez choisir une autre date pour ce relevé</li>
            </ul>
          </div>
        );
      } else if (
        errorText.includes('existe déjà sur cette période') || 
        errorText.includes('existe d,j') || 
        errorText.toLowerCase().includes('relev')
      ) {
        setError(
          <div className="space-y-2">
            <p className="font-medium text-red-700">Période déjà couverte</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Un relevé existe déjà pour la période sélectionnée</li>
              <li>Veuillez choisir une autre période pour ce relevé</li>
            </ul>
          </div>
        );
      } else {
        setError(errorData?.message || "Une erreur est survenue lors de l'enregistrement du relevé");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            {editingReading ? 'Modifier le relevé' : 'Nouveau relevé'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compteur</label>
                  <Select
                    value={formData.meter_id}
                    onValueChange={(value) => handleChange('meter_id', value)}
                    disabled={!!editingReading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un compteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {meters.map((meter) => (
                        <SelectItem key={meter.id} value={String(meter.id)}>
                          {`${meter.meter_number} - ${meter.user?.first_name} ${meter.user?.last_name} (${meter.serial_number})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ancien index</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.last_reading_value}
                    onChange={(e) => handleChange('last_reading_value', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouvel index</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reading_value}
                    onChange={(e) => handleChange('reading_value', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
 <label className="text-sm font-medium">Période de consommation</label>
 <div className="grid grid-cols-2 gap-4">
   <div className="relative">
     <input
       type="date"
       className="w-full pl-10 pr-3 py-2 border rounded-lg"
       value={formData.period.from instanceof Date ? format(formData.period.from, 'yyyy-MM-dd') : ''}
       onChange={(e) => handleChange('period', { 
         ...formData.period, 
         from: e.target.value ? new Date(e.target.value) : null 
       })}
     />
     <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
   </div>
   <div className="relative">
     <input
       type="date"
       className="w-full pl-10 pr-3 py-2 border rounded-lg" 
       value={formData.period.to instanceof Date ? format(formData.period.to, 'yyyy-MM-dd') : ''}
       onChange={(e) => handleChange('period', {
         ...formData.period,
         to: e.target.value ? new Date(e.target.value) : null
       })}
     />
     <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
   </div>
 </div>
</div>
              
<div className="space-y-2">
 <label className="text-sm font-medium">Date du relevé</label>
 <div className="relative">
   <input
     type="date"
     className="w-full pl-10 pr-3 py-2 border rounded-lg"
     value={formData.reading_date instanceof Date ? format(formData.reading_date, 'yyyy-MM-dd') : ''}
     onChange={(e) => handleChange('reading_date', e.target.value ? new Date(e.target.value) : null)}
   />
   <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
 </div>
</div>

              {editingReading && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="validated">Validé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="w-96 border-l pl-8">
              {consumption !== null && (
                <ConsumptionDetails 
                  consumption={consumption}
                />
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setError(null);
                onClose();
              }}
            >
              Annuler
            </Button>
            <Button type="submit">
              {editingReading ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
const ConsumptionHeatmap = ({ readings }) => {
  // Organiser les données par mois
  const monthlyData = readings.reduce((acc, reading) => {
    const date = new Date(reading.reading_date);
    const monthKey = format(date, 'MM/yyyy');
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        consumption: 0,
        count: 0
      };
    }
    
    // Conversion explicite en nombre
    acc[monthKey].consumption += Number(reading.consumption) || 0;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  // Trouver la consommation max pour l'échelle de couleur
  const maxConsumption = Math.max(...Object.values(monthlyData)
    .map(data => data.consumption));

  // Calculer l'intensité de la couleur
  const getColor = (value) => {
    const intensity = (value / maxConsumption);
    return `rgb(0, ${Math.floor(100 + (intensity * 155))}, ${Math.floor(200 + (intensity * 55))})`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Carte thermique des consommations</h2>
      <div className="grid grid-cols-6 gap-2">
        {Object.entries(monthlyData).map(([month, data]) => (
          <div
            key={month}
            className="p-4 rounded-lg text-white"
            style={{
              backgroundColor: getColor(data.consumption),
            }}
          >
            <div className="text-sm font-medium">{month}</div>
            <div className="text-xl font-bold">
              {Number(data.consumption).toFixed(1)}
            </div>
            <div className="text-xs">m³</div>
            <div className="text-xs">{data.count} relevé(s)</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <div className="text-sm">Intensité de consommation:</div>
        <div className="flex h-2 w-32">
          <div className="w-full bg-gradient-to-r from-[rgb(0,100,200)] to-[rgb(0,255,255)]" />
        </div>
        <div className="text-sm">Faible</div>
        <div className="text-sm">Élevée</div>
      </div>
    </Card>
  );
};



const ReadingPage = () => {
  const { toast } = useToast();
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
   const [dateRange, setDateRange] = useState([
      (() => {
        const date = new Date('2024-01-01');
        //const date = new Date();
        //date.setMonth(date.getMonth() - 1);
        //date.setDate(1);
        return date;
      })(),
      new Date()
    ]);


  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);

  const [selectedReadings, setSelectedReadings] = useState([]);
const [selectAll, setSelectAll] = useState(false);

  const totalPages = Math.ceil(readings.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const currentReadings = readings.slice(startIndex, endIndex);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/readings', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd'),
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setReadings(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les relevés"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMeters = async () => {
    try {
      const response = await api.get('/meters', {
        params: { status: 'active' }
      });
      setMeters(response.data.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les compteurs"
      });
    }
  };

  useEffect(() => {
    Promise.all([
      fetchReadings(),
      fetchMeters()
    ]);
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [dateRange, statusFilter]);

  const handleSubmit = async (data) => {
    try {
      if (editingReading) {
        await api.put(`/readings/${editingReading.id}`, data);
        toast({
          title: "Succès",
          description: "Relevé modifié avec succès",
        });
      } else {
        await api.post("/readings", data);
        toast({
          title: "Succès",
          description: "Relevé ajouté avec succès",
        });
      }
      setIsModalOpen(false);
      fetchReadings();
    } catch (error) {
      // Gestion des erreurs spécifiques provenant du backend
      const errorMessage = error.response?.data?.message || "Une erreur est survenue";
      const errorDetail = error.response?.data?.error || "";
  
      // Identifier les erreurs et afficher un message clair
      if (errorDetail.includes("unique_reading_per_day")) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un relevé existe déjà pour cette date.",
        });
      } else if (errorDetail.includes("période") || errorDetail.includes("chevauchement")) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un relevé existe déjà sur cette période. Veuillez choisir une autre période.",
        });
      } else {
        // Message générique pour les erreurs non gérées
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorMessage,
        });
      }
      throw error; // Optionnel : relancer l'erreur pour d'autres traitements éventuels
    }
  };


  

  const handleDelete = async () => {
    try {
      await api.delete(`/readings/${readingToDelete.id}`);
      toast({
        title: "Succès",
        description: "Relevé supprimé avec succès"
      });
      fetchReadings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le relevé"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setReadingToDelete(null);
    }
  };

  const ActionsBar = ({ selectedCount, onValidate, onChangeStatus }) => {
    if (selectedCount === 0) return null;
  
    return (
      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
          >
            <Check className="h-4 w-4 mr-2" />
            Valider
          </Button>
          
          <Select onValueChange={onChangeStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Changer le statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const handleBulkValidate = async () => {
    try {
      await api.post('/readings/bulk-validate', { ids: selectedReadings });
      toast({
        title: "Succès",
        description: "Les relevés sélectionnés ont été validés"
      });
      setSelectedReadings([]);
      fetchReadings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de valider les relevés"
      });
    }
  };
  
  const handleBulkStatusChange = async (status) => {
    try {
      await api.post('/readings/bulk-status-update', { 
        ids: selectedReadings,
        status 
      });
      toast({
        title: "Succès",
        description: "Le statut des relevés sélectionnés a été mis à jour"
      });
      setSelectedReadings([]);
      fetchReadings();
    } catch (error) {
      if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('Impossible de changer le statut')) {
        toast({
          variant: "destructive",
          title: "Action non autorisée",
          description: "Les relevés validés ne peuvent pas être remis en attente"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de modifier le statut des relevés"
        });
      }
    }
  };


  return (
    <div className="p-6 space-y-6">

<ActionsBar
  selectedCount={selectedReadings.length}
  onValidate={handleBulkValidate}
  onChangeStatus={handleBulkStatusChange}
/>


   
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Relevés</h1>

        <div className="flex items-center space-x-4">
  <div className="relative">
    <input
      type="date"
      className="pl-10 pr-3 py-2 border rounded-lg"
      value={dateRange[0] instanceof Date ? format(dateRange[0], 'yyyy-MM-dd') : ''}
      onChange={(e) => setDateRange([e.target.value ? new Date(e.target.value) : null, dateRange[1]])}
    />
    <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
  </div>
  
  <div className="relative">
    <input
      type="date"
      className="pl-10 pr-3 py-2 border rounded-lg"
      value={dateRange[1] instanceof Date ? format(dateRange[1], 'yyyy-MM-dd') : ''}
      onChange={(e) => setDateRange([dateRange[0], e.target.value ? new Date(e.target.value) : null])}
    />
    <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
  </div>

  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="Statut" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tous</SelectItem>
      <SelectItem value="pending">En attente</SelectItem>
      <SelectItem value="validated">Validé</SelectItem>
    </SelectContent>
  </Select>

  <PDFDownloadLink
  document={<RelevePDF readings={readings} dateRange={dateRange} />}
  fileName={`releves-${format(dateRange[0], 'dd-MM-yyyy')}-au-${format(dateRange[1], 'dd-MM-yyyy')}.pdf`}
>
  {({ loading }) => (
    <Button variant="outline" disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Génération...' : 'Télécharger PDF'}
    </Button>
  )}
</PDFDownloadLink>


  <Button onClick={() => {
      setEditingReading(null);
      setIsModalOpen(true);
    }}>
      <Plus className="h-4 w-4 mr-2" />
      Ajouter
    </Button>
</div>
        
     
      </div>



      <Card>
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="w-12">
      <input
        type="checkbox"
        className="rounded border-gray-300"
        checked={selectAll}
        onChange={(e) => {
          setSelectAll(e.target.checked);
          setSelectedReadings(
            e.target.checked ? currentReadings.map(r => r.id) : []
          );
        }}
      />
    </TableHead>
            <TableHead className="w-16">N°</TableHead>
              <TableHead>Compteur</TableHead>
              <TableHead>Consommateur</TableHead>
              <TableHead>Ancien Index</TableHead>
              <TableHead>Nouvel Index</TableHead>
              <TableHead>Consommation (m³)</TableHead>
              <TableHead>Montant (FCFA)</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Date du relevé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentReadings.map((reading, index) => (
              <TableRow 
                key={reading.id}
                className={reading.status === 'validated' ? 'bg-green-50/50' : ''}
              >
                <TableCell>
  <input
    type="checkbox"
    className="rounded border-gray-300"
    checked={selectedReadings.includes(reading.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedReadings([...selectedReadings, reading.id]);
      } else {
        setSelectedReadings(selectedReadings.filter(id => id !== reading.id));
      }
    }}
  />
</TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{reading.meter?.meter_number}</TableCell>
                <TableCell>
                  {reading.meter?.user ? 
                    `${reading.meter.user.first_name} ${reading.meter.user.last_name}` : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {reading.last_reading_value ? 
                    parseFloat(reading.last_reading_value).toFixed(2) : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {parseFloat(reading.reading_value).toFixed(2)}
                </TableCell>
                <TableCell>
                  {reading.consumption ? 
                    parseFloat(reading.consumption).toFixed(2) : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {reading.amount ? 
                    Number(reading.amount).toLocaleString() : 
                    'N/A'}
                </TableCell>
                <TableCell>
                  {`${format(new Date(reading.start_date), 'dd/MM/yy')} au ${format(new Date(reading.end_date), 'dd/MM/yy')}`}
                </TableCell>
                <TableCell>
                  {format(new Date(reading.reading_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                <Badge 
    variant={reading.status === 'validated' ? 'success' : 'warning'}
    className={cn(
      "w-24 flex justify-center",
      reading.status === 'validated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    )}
  >
    {reading.status === 'validated' ? 'Validé' : 'En attente'}
  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"

                      disabled={reading.status === 'validated' || reading.is_invoiced}

                      onClick={() => {
                        setEditingReading(reading);
                        setIsModalOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"


                      disabled={reading.status === 'validated' || reading.is_invoiced}
                      onClick={() => {
                        setReadingToDelete(reading);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between mt-4 px-2">
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Lignes par page:</span>
    <Select
      value={String(itemsPerPage)}
      onValueChange={(value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-[70px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">5</SelectItem>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="20">20</SelectItem>
        <SelectItem value="50">50</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">
      {startIndex + 1}-{Math.min(endIndex, readings.length)} sur {readings.length}
    </span>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
    >
      Précédent
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
    >
      Suivant
    </Button>
  </div>
</div>

      
      </Card>

     
      <div className="mt-6">
  <ConsumptionHeatmap readings={readings} />
</div>

     

      <ReadingForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReading(null);
        }}
        editingReading={editingReading}
        meters={meters}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement ce relevé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



    </div>

    

    
  );

  
};

export default ReadingPage;