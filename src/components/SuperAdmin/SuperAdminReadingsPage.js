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
import { ScrollArea } from "../ui/scroll-area";
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
import { Plus, Pencil, Trash2, Calendar, Calculator, AlertCircle, Download, Check, FileText, Search, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';

// Composant pour le formulaire de modification (simplifié pour SuperAdmin)
const SuperAdminReadingForm = ({ isOpen, onClose, editingReading, onSubmit }) => {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    reading_value: '',
    last_reading_value: '',
    reading_date: new Date(),
    status: 'pending',
    start_date: new Date(),
    end_date: new Date()
  });

  useEffect(() => {
    if (editingReading) {
      setFormData({
        reading_value: editingReading.reading_value,
        last_reading_value: editingReading.last_reading_value,
        reading_date: new Date(editingReading.reading_date),
        status: editingReading.status,
        start_date: new Date(editingReading.start_date),
        end_date: new Date(editingReading.end_date)
      });
    }
  }, [editingReading]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: format(formData.end_date, 'yyyy-MM-dd'),
      reading_date: format(formData.reading_date, 'yyyy-MM-dd')
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      setError("Une erreur est survenue lors de la modification du relevé");
    }
  };

  if (!editingReading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le relevé (SuperAdmin)</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Informations du compteur (lecture seule) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Informations du compteur</h3>
              <p><strong>Compteur:</strong> {editingReading.meter?.meter_number}</p>
              <p><strong>Service:</strong> {editingReading.meter?.service?.name}</p>
              <p><strong>Consommateur:</strong> {editingReading.meter?.user ? 
                `${editingReading.meter.user.first_name} ${editingReading.meter.user.last_name}` : 'N/A'}</p>
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
                    value={formData.start_date instanceof Date ? format(formData.start_date, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleChange('start_date', e.target.value ? new Date(e.target.value) : null)}
                  />
                  <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg" 
                    value={formData.end_date instanceof Date ? format(formData.end_date, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleChange('end_date', e.target.value ? new Date(e.target.value) : null)}
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

            {/* Affichage de la consommation calculée */}
            {formData.reading_value && formData.last_reading_value && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Consommation calculée: {(parseFloat(formData.reading_value) - parseFloat(formData.last_reading_value)).toFixed(2)} m³
                </p>
              </div>
            )}
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
              Modifier le relevé
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Composant principal
const SuperAdminReadingsPage = () => {
  const { toast } = useToast();
  const [readings, setReadings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    new Date()
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fonction de tri pour les numéros de compteur
  const sortByMeterNumber = (a, b) => {
    if (!a.meter || !b.meter) return 0;
    const aMatch = a.meter.meter_number.match(/(\D+)-?(\d+)/);
    const bMatch = b.meter.meter_number.match(/(\D+)-?(\d+)/);
    
    if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
      return parseInt(aMatch[2]) - parseInt(bMatch[2]);
    }
    return a.meter.meter_number.localeCompare(b.meter.meter_number);
  };

  // Récupérer la liste des services
  const fetchServices = async () => {
    try {
      const response = await api.get('/readings/superadmin/services');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer la liste des services"
      });
    }
  };

  // Récupérer les relevés avec filtrage par service
  const fetchReadings = async () => {
    try {
      setLoading(true);
      
      const params = {
        start_date: format(dateRange[0], 'yyyy-MM-dd'),
        end_date: format(dateRange[1], 'yyyy-MM-dd'),
        page: currentPage,
        limit: itemsPerPage
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (serviceFilter !== 'all') {
        params.service_id = serviceFilter;
      }

      const response = await api.get('/readings/superadmin/readings', { params });
      
      const data = response.data.data;
      setReadings(data.readings || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.total || 0);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des relevés:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les relevés"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchReadings();
    }
  }, [dateRange, statusFilter, serviceFilter, currentPage, itemsPerPage]);

  const handleSubmit = async (data) => {
    try {
      await api.put(`/readings/superadmin/readings/${editingReading.id}`, data);
      toast({
        title: "Succès",
        description: "Relevé modifié avec succès",
      });
      setIsModalOpen(false);
      fetchReadings();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le relevé",
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/readings/superadmin/readings/${readingToDelete.id}`);
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

  const sortedReadings = [...readings].sort(sortByMeterNumber);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          Gestion des Relevés - SuperAdmin
        </h1>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Période:</label>
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
        </div>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Filtrer par service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={String(service.id)}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
      </div>

      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">
            Relevés trouvés: {totalItems}
          </h2>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">N°</TableHead>
              <TableHead>Service</TableHead>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : sortedReadings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText className="h-8 w-8 mb-2" />
                    <p>Aucun relevé trouvé pour cette période.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedReadings.map((reading, index) => (
                <TableRow 
                  key={reading.id}
                  className={reading.status === 'validated' ? 'bg-green-50/50' : ''}
                >
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50">
                      {reading.meter?.service?.name || 'N/A'}
                    </Badge>
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
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
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
                <SelectItem value="1000">1000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} sur {totalItems}
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

      {/* Modal de modification */}
      <SuperAdminReadingForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReading(null);
        }}
        editingReading={editingReading}
        onSubmit={handleSubmit}
      />

      {/* Dialog de confirmation de suppression */}
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

export default SuperAdminReadingsPage;