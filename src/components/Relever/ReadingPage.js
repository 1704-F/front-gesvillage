import React, { useState, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, Calendar, Calculator, AlertCircle  } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from 'date-fns';
import api from '../../utils/axios';
import { cn } from "../lib/utils";

const PERIODS = {
  TODAY: {
    label: "Aujourd'hui",
    start: () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      return date;
    },
    end: () => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    }
  },
  WEEK: {
    label: 'Une semaine',
    start: () => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    end: () => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    }
  },
  MONTH: {
    label: 'Un mois',
    start: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    end: () => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    }
  },
  YEAR: {
    label: 'Une année',
    start: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      date.setHours(0, 0, 0, 0);
      return date;
    },
    end: () => {
      const date = new Date();
      date.setHours(23, 59, 59, 999);
      return date;
    }
  }
};

// Composant pour le calcul détaillé de la consommation
const ConsumptionCalculator = ({ consumption, servicePricing }) => {
  if (!consumption || !servicePricing) return null;

  const { threshold, base_price, extra_price } = servicePricing;
  const baseConsumption = Math.min(consumption, threshold);
  const extraConsumption = Math.max(0, consumption - threshold);
  const baseAmount = baseConsumption * base_price;
  const extraAmount = extraConsumption * extra_price;
  const totalAmount = baseAmount + extraAmount;

  return (
    <div className="mt-6 bg-blue-50 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Détails de la tarification
        </h3>
        <div className="text-lg font-bold text-blue-700">
          Total : {Math.round(totalAmount).toLocaleString()} FCFA
        </div>
      </div>

      <div className="bg-white rounded-md p-4 space-y-4">
        <div className="pb-3 border-b">
          <div className="text-sm font-medium text-gray-500">Consommation totale</div>
          <div className="text-2xl font-semibold">{consumption.toFixed(2)} m³</div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">Première tranche (0 à {threshold} m³)</div>
            <div className="pl-4 space-y-1 text-gray-600">
              <div>{baseConsumption.toFixed(2)} m³ × {base_price} FCFA</div>
              <div className="font-medium text-black">
                = {Math.round(baseAmount).toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {extraConsumption > 0 && (
            <div className="space-y-2">
              <div className="font-medium">Deuxième tranche ( {threshold} m³)</div>
              <div className="pl-4 space-y-1 text-gray-600">
                <div>{extraConsumption.toFixed(2)} m³ × {extra_price} FCFA</div>
                <div className="font-medium text-black">
                  = {Math.round(extraAmount).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConsumptionDetails = ({ consumption, servicePricing }) => {
  if (!consumption || !servicePricing) return null;

  const { threshold, base_price, extra_price } = servicePricing;
  const baseConsumption = Math.min(consumption, threshold);
  const extraConsumption = Math.max(0, consumption - threshold);
  const baseAmount = baseConsumption * base_price;
  const extraAmount = extraConsumption * extra_price;
  const totalAmount = baseAmount + extraAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcul
        </h3>
        <div className="text-lg font-bold text-blue-700">
          {Math.round(totalAmount).toLocaleString()} FCFA
        </div>
      </div>

      <div className="space-y-4">
        <div className="pb-2 border-b">
          <div className="text-sm text-gray-500">Consommation</div>
          <div className="text-xl font-semibold">{consumption.toFixed(2)} m³</div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">Première tranche</div>
            <div className="pl-3 text-sm text-gray-600">
              <div>0 à {threshold} m³ à {base_price} FCFA/m³</div>
              <div>{baseConsumption.toFixed(2)} m³ × {base_price} FCFA</div>
              <div className="font-medium text-black">
                = {Math.round(baseAmount).toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {extraConsumption > 0 && (
            <div>
              <div className="text-sm font-medium">Deuxième tranche</div>
              <div className="pl-3 text-sm text-gray-600">
                <div>Au-delà de {threshold} m³ à {extra_price} FCFA/m³</div>
                <div>{extraConsumption.toFixed(2)} m³ × {extra_price} FCFA</div>
                <div className="font-medium text-black">
                  = {Math.round(extraAmount).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Composant du formulaire de relevé
const ReadingForm = ({ isOpen, onClose, editingReading, meters, onSubmit }) => {
  const { toast } = useToast();
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
  const [servicePricing, setServicePricing] = useState(null);
  const [consumption, setConsumption] = useState(null);

  useEffect(() => {
    const fetchServicePricing = async () => {
      try {
        const response = await api.get('/readings/service-pricing');
        setServicePricing(response.data.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de la tarification:', error);
      }
    };
    fetchServicePricing();
  }, []);

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
    setError(null); // Réinitialiser l'erreur lors d'un changement
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation du nouvel index
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
      // Vérifier l'erreur de doublon dans la réponse complète
      if (error.response?.data?.error?.includes('unique_reading_per_day')) {
        setError(
          <div className="space-y-2">
            <p className="font-medium text-red-700">Un relevé existe déjà pour cette date</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Un seul relevé est autorisé par jour pour chaque compteur</li>
              <li>Veuillez choisir une autre date pour ce relevé</li>
            </ul>
          </div>
        );
      } else {
        setError(error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement du relevé");
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
              <div className="grid grid-cols-2 gap-4">
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
                          {meter.meter_number}
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.period.from && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.period.from ? (
                          format(formData.period.from, "dd/MM/yyyy")
                        ) : (
                          <span>Date début</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.period.from}
                        onSelect={(date) => handleChange('period', { ...formData.period, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.period.to && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.period.to ? (
                          format(formData.period.to, "dd/MM/yyyy")
                        ) : (
                          <span>Date fin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.period.to}
                        onSelect={(date) => handleChange('period', { ...formData.period, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date du relevé</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.reading_date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.reading_date ? (
                        format(formData.reading_date, "dd/MM/yyyy")
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.reading_date}
                      onSelect={(date) => handleChange('reading_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              {consumption !== null && servicePricing && (
                <ConsumptionDetails
                  consumption={consumption}
                  servicePricing={servicePricing}
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


// Composant principal

const ReadingPage = () => {
  const { toast } = useToast();
  const [readings, setReadings] = useState([]);
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTH');
  const [dateRange, setDateRange] = useState([
    PERIODS.MONTH.start(),
    PERIODS.MONTH.end()
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [servicePricing, setServicePricing] = useState(null);

  // Fonction pour calculer le montant
  const calculateAmount = (consumption) => {
    if (!servicePricing || !consumption) return 0;
    
    const { threshold, base_price, extra_price } = servicePricing;
    if (consumption <= threshold) {
      return consumption * base_price;
    }
    const baseAmount = threshold * base_price;
    const extraAmount = (consumption - threshold) * extra_price;
    return baseAmount + extraAmount;
  };

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

  const fetchServicePricing = async () => {
    try {
      const response = await api.get('/readings/service-pricing');
      setServicePricing(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tarification:', error);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchReadings(),
      fetchMeters(),
      fetchServicePricing()
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
          description: "Relevé modifié avec succès"
        });
        setIsModalOpen(false);
        fetchReadings();
      } else {
        await api.post('/readings', data);
        toast({
          title: "Succès",
          description: "Relevé ajouté avec succès"
        });
        setIsModalOpen(false);
        fetchReadings();
      }
    } catch (error) {
      console.log('Erreur complète:', error.response?.data);
    
      // Vérifier si l'erreur contient le message de doublon
      if (error.response?.data?.error?.includes('unique_reading_per_day')) {
        throw error; // Relancer l'erreur pour qu'elle soit gérée par le formulaire
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.message || "Une erreur est survenue"
        });
      }
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Relevés</h1>
        
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedPeriod}
            onValueChange={(value) => {
              setSelectedPeriod(value);
              const period = PERIODS[value];
              setDateRange([
                period.start(),
                period.end()
              ]);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIODS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setEditingReading(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
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
            {readings.map((reading) => {
              const amount = calculateAmount(reading.consumption);
              
              return (
                <TableRow 
                  key={reading.id}
                  className={reading.status === 'validated' ? 'bg-green-50/50' : ''}
                >
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
                    {amount ? 
                      Math.round(amount).toLocaleString() : 
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
                    >
                      {reading.status === 'validated' ? 'Validé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
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
                        disabled={reading.status === 'validated'}
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
              );
            })}
          </TableBody>
        </Table>
      </Card>

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