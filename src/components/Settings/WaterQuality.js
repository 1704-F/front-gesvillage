//qualité de l'eau
import React, { useState, useEffect } from 'react';
import PumpingRecordForm from './PumpingRecordForm'; // Le composant de formulaire que nous avons créé
import ViewPumpingRecordModal from './ViewPumpingRecordModal'; // Le composant de vue détaillée
import PumpingRecordPDFDownloadButton from './PumpingRecordPDFDownloadButton';
import SinglePumpingRecordPDFButton from './SinglePumpingRecordPDFButton';
import DistributionRecordsTab from './Distribution/DistributionRecordsTab';
import DistributionRecordForm from './Distribution/DistributionRecordForm';
import SynthesisSection from './Distribution//SynthesisSection';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { useToast } from "../ui/toast/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Droplet, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  AlertCircle, 
  Beaker, 
  Check,
  Gauge,
  XCircle,
  SprayCan,
  TrendingUp
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';


// Composant pour le formulaire d'ajout/édition de source
const SourceForm = ({ isOpen, onClose, editingSource, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    source_type: '',
    location: '',
    capacity: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    if (editingSource) {
      setFormData(editingSource);
    }
  }, [editingSource]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingSource ? 'Modifier la source' : 'Ajouter une source'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de source</label>
              <Select
                value={formData.source_type}
                onValueChange={(value) => setFormData({ ...formData, source_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface">Eau de surface</SelectItem>
                  <SelectItem value="groundwater">Eau souterraine</SelectItem>
                  <SelectItem value="well">Puits</SelectItem>
                  <SelectItem value="spring">Source naturelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emplacement</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacité (m³/jour)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="Ex: 14.6937"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="Ex: -17.4441"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="maintenance">En maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingSource ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Composant pour le formulaire d'analyse
const AnalysisForm = ({ isOpen, onClose, sources, parameters, onSubmit }) => {
  const [formData, setFormData] = useState({
    source_id: '',
    analysis_date: format(new Date(), 'yyyy-MM-dd'),
    results: [],
    comments: ''
  });

  const handleParameterChange = (parameterId, value) => {
    const updatedResults = [...formData.results];
    const existingIndex = updatedResults.findIndex(r => r.parameter_id === parameterId);
    
    if (existingIndex >= 0) {
      updatedResults[existingIndex].value = value;
    } else {
      updatedResults.push({ parameter_id: parameterId, value });
    }
    
    setFormData({ ...formData, results: updatedResults });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Nouvelle analyse</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source d'eau</label>
            <Select
              value={formData.source_id}
              onValueChange={(value) => setFormData({ ...formData, source_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map(source => (
                  <SelectItem key={source.id} value={String(source.id)}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de l'analyse</label>
            <Input
              type="date"
              value={formData.analysis_date}
              onChange={(e) => setFormData({ ...formData, analysis_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium leading-none">Résultats</h3>
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {parameters.map(param => (
                <div key={param.id} className="space-y-2">
                  <label className="text-sm text-gray-500">
                    {param.name} ({param.unit})
                    {param.is_critical && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={`${param.min_value || ''} - ${param.max_value || ''}`}
                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                    required={param.is_critical}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Commentaires</label>
          <Input
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />
        </div>

        <DialogFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  );
};

// Composant pour le formulaire de paramètre
const ParameterForm = ({ isOpen, onClose, editingParameter, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    parameter_type: '',
    min_value: '',
    max_value: '',
    optimal_value: '',
    is_critical: false
  });

  useEffect(() => {
    if (editingParameter) {
      setFormData(editingParameter);
    }
  }, [editingParameter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingParameter ? 'Modifier le paramètre' : 'Ajouter un paramètre'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Unité</label>
            <Input
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={formData.parameter_type}
              onValueChange={(value) => setFormData({ ...formData, parameter_type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bacteriological">Bactériologique</SelectItem>
                <SelectItem value="physical">Physique</SelectItem>
                <SelectItem value="chemical">Chimique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Valeur min</label>
              <Input
                type="number"
                step="0.01"
                value={formData.min_value}
                onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valeur max</label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_value}
                onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valeur optimale</label>
              <Input
                type="number"
                step="0.01"
                value={formData.optimal_value}
                onChange={(e) => setFormData({ ...formData, optimal_value: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_critical}
              onChange={(e) => setFormData({ ...formData, is_critical: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label className="text-sm font-medium">Paramètre critique</label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingParameter ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PumpingRecordsTab = ({ 
  sources, 
  onEdit = (record) => {}, 
  shouldRefresh = false,
  onRefreshComplete = () => {}
}) => {
  const { toast } = useToast();
  const [pumpingRecords, setPumpingRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewPumpingModal, setViewPumpingModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // États pour les filtres
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [paginatedRecords, setPaginatedRecords] = useState([]);

  // Définir filteredRecords en tant qu'état
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchPumpingRecords(),
      fetchEmployees()
    ]).finally(() => setLoading(false));
  }, []);

  // Mettre à jour les records filtrés quand les filtres ou les données changent
  useEffect(() => {
    if (pumpingRecords.length > 0) {
      const filtered = pumpingRecords.filter(record => {
        let matches = true;
        
        // Filtre par source
        if (sourceFilter !== 'all') {
          matches = matches && record.source?.id.toString() === sourceFilter;
        }
        
        // Filtre par statut
        if (statusFilter !== 'all') {
          matches = matches && record.status === statusFilter;
        }
        
        return matches;
      });
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords([]);
    }
  }, [pumpingRecords, sourceFilter, statusFilter]);

  // Mettre à jour la pagination quand les données filtrées changent
  useEffect(() => {
    // Calculer le nombre total de pages
    const totalPagesCount = Math.ceil(filteredRecords.length / pageSize);
    setTotalPages(totalPagesCount);
    
    // S'assurer que la page courante est valide
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    } else {
      // Extraire les enregistrements pour la page courante
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setPaginatedRecords(filteredRecords.slice(startIndex, endIndex));
    }
  }, [filteredRecords, currentPage, pageSize]);

  // Si currentPage est modifié ailleurs, mettre à jour les enregistrements paginés
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedRecords(filteredRecords.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredRecords]);

  useEffect(() => {
    if (shouldRefresh) {
      fetchPumpingRecords().then(() => {
        onRefreshComplete();
      });
    }
  }, [shouldRefresh, onRefreshComplete]);

  // Récupération des enregistrements de pompage
  const fetchPumpingRecords = async () => {
    try {
      const response = await api.get('/water-quality/pumping');
      setPumpingRecords(response.data);
      setCurrentPage(1); // Réinitialiser à la première page lors du chargement des données
      return response.data;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les enregistrements de pompage",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
      return response.data.data || [];
    } catch (error) {
      console.error("Erreur:", error);
      setEmployees([]);
      return [];
    }
  };

  // Suppression d'un enregistrement de pompage
  const handleDeletePumping = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet enregistrement ?")) {
      return;
    }
    try {
      await api.delete(`/water-quality/pumping/${id}`);
      toast({
        title: "Succès",
        description: "Enregistrement supprimé avec succès"
      });
      fetchPumpingRecords();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Impossible de supprimer l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Validation d'un enregistrement de pompage
  const handleValidatePumping = async (id) => {
    try {
      await api.patch(`/water-quality/pumping/${id}/validate`);
      
      // Mise à jour de l'état local
      setPumpingRecords(pumpingRecords.map(record => {
        if (record.id === id) {
          return {
            ...record,
            status: 'validated'
          };
        }
        return record;
      }));

      toast({
        title: "Succès",
        description: "Enregistrement validé avec succès"
      });
      
      // Rechargement des données
      fetchPumpingRecords();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Affichage des détails d'un enregistrement
  const handleViewPumping = async (id) => {
    try {
      const response = await api.get(`/water-quality/pumping/${id}`);
      setSelectedRecord(response.data);
      setViewPumpingModal(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'enregistrement",
        variant: "destructive",
      });
    }
  };

  // Formatage de la durée en heures et minutes
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Fonction pour paginer les enregistrements
  const paginateRecords = (records) => {
    // Calculer le nombre total de pages
    const totalPagesCount = Math.ceil(records.length / pageSize);
    setTotalPages(totalPagesCount);
    
    // S'assurer que la page courante est valide
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    }
    
    // Extraire les enregistrements pour la page courante
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return records.slice(startIndex, endIndex);
  };

  // Composant de pagination
  const Pagination = ({ filteredCount }) => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Affichage de {filteredCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} à {Math.min(currentPage * pageSize, filteredCount)} sur {filteredCount} enregistrements
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(totalPages, 5)).keys()].map(index => {
              // Afficher jusqu'à 5 boutons de page
              let pageNumber;
              if (totalPages <= 5) {
                // Si moins de 5 pages, afficher toutes les pages
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                // Si on est près du début
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                // Si on est près de la fin
                pageNumber = totalPages - 4 + index;
              } else {
                // Si on est au milieu
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <Button 
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Suivant
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Éléments par page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1); // Retour à la première page lors du changement de taille
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-6">Chargement...</div>;
  }


  // Paginer les enregistrements filtrés
  

  return (
    <>
      {/* Filtres et bouton de téléchargement */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <Select
            value={sourceFilter}
            onValueChange={setSourceFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source.id} value={source.id.toString()}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bouton de téléchargement PDF pour tous les enregistrements filtrés */}
        <PumpingRecordPDFDownloadButton 
          pumpingRecords={filteredRecords} 
          sources={sources}
          filterStatus={statusFilter}
          sourceFilter={sourceFilter}
        />
      </div>

      {/* Tableau des enregistrements */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Employé</TableHead>
              <TableHead>Volume (m³)</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Aucun enregistrement de pompage trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.source?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(record.pumping_date), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {record.employee ? 
                      `${record.employee.first_name} ${record.employee.last_name}` : 
                      'N/A'
                    }
                  </TableCell>
                  <TableCell>{record.volume_pumped} m³</TableCell>
                  <TableCell>{formatDuration(record.pumping_duration)}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'validated' ? 'success' : 'warning'}>
                      {record.status === 'validated' ? 'Validé' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPumping(record.id)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      
                      {/* Bouton de téléchargement PDF individuel */}
                      <SinglePumpingRecordPDFButton record={record} />
                      
                      {record.status !== 'validated' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit(record)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidatePumping(record.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePumping(record.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination en bas du tableau */}
      {filteredRecords.length > 0 && <Pagination filteredCount={filteredRecords.length} />}

      {/* Modal de détails */}
      <ViewPumpingRecordModal
        isOpen={viewPumpingModal}
        onClose={() => {
          setViewPumpingModal(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </>
  );
};





// Composant principal
const WaterQualityPage = () => {
  // États
  const { toast } = useToast();
  const [sources, setSources] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [activeTab, setActiveTab] = useState("sources");
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [openPumpingModal, setOpenPumpingModal] = useState(null);
  const [refreshPumping, setRefreshPumping] = useState(false);

  // États des modaux
  const [sourceModal, setSourceModal] = useState({ isOpen: false, editing: null });
  const [analysisModal, setAnalysisModal] = useState({ isOpen: false });
  const [parameterModal, setParameterModal] = useState({ isOpen: false, editing: null });
  

  const [viewAnalysisModal, setViewAnalysisModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [pumpingModal, setPumpingModal] = useState({ isOpen: false, editing: null });

  const [distributionModal, setDistributionModal] = useState({ isOpen: false, editing: null });
  const [refreshDistribution, setRefreshDistribution] = useState(false);


  const [synthesisRangeDates, setSynthesisRangeDates] = useState([
  (() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // 1 mois en arrière
    date.setDate(1); // Premier jour du mois
    date.setHours(0, 0, 0, 0);
    return date;
  })(),
  new Date()
]);

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchSources(),
      fetchParameters(),
      fetchAnalyses(),
      fetchEmployees()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error("Erreur:", error);
      setEmployees([]);
    }
  };

  

  // Fonctions de récupération des données
  const fetchSources = async () => {
    try {
      const response = await api.get('/water-quality/sources');
      setSources(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les sources d'eau",
        variant: "destructive",
      });
    }
  };

  const fetchParameters = async () => {
    try {
      const response = await api.get('/water-quality/parameters');
      setParameters(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les paramètres",
        variant: "destructive",
      });
    }
  };

// Suite des fonctions du composant WaterQualityPage
const fetchAnalyses = async () => {
    try {
      const response = await api.get('/water-quality/analyses');
      setAnalyses(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les analyses",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sourceId) => {
    try {
      if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) {
        return;
      }
      await api.delete(`/water-quality/sources/${sourceId}`);
      toast({
        title: "Succès",
        description: "Source supprimée avec succès"
      });
      fetchSources(); // Recharger la liste des sources
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la source",
        variant: "destructive",
      });
    }
  };

  // Fonction d'édition
const handleEdit = (source) => {
  setSourceModal({ isOpen: true, editing: source });
};

  // Gestion des sources
  const handleSourceSubmit = async (data) => {
    try {
      if (sourceModal.editing) {
        await api.put(`/water-quality/sources/${sourceModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Source modifiée avec succès"
        });
      } else {
        await api.post('/water-quality/sources', data);
        toast({
          title: "Succès",
          description: "Source ajoutée avec succès"
        });
      }
      setSourceModal({ isOpen: false, editing: null });
      fetchSources();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSource = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette source ?")) {
      return;
    }
    try {
      await api.delete(`/water-quality/sources/${id}`);
      toast({
        title: "Succès",
        description: "Source supprimée avec succès"
      });
      fetchSources();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la source",
        variant: "destructive",
      });
    }
  };

  // Gestion des analyses
  const handleAnalysisSubmit = async (data) => {
    try {
      await api.post('/water-quality/analyses', data);
      toast({
        title: "Succès",
        description: "Analyse créée avec succès"
      });
      setAnalysisModal({ isOpen: false });
      fetchAnalyses();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleValidateAnalysis = async (analysisId) => {
    try {
      await api.patch(`/water-quality/analyses/${analysisId}/validate`);
      
      // Mettre à jour l'état local des analyses
      setAnalyses(analyses.map(analysis => {
        if (analysis.id === analysisId) {
          return {
            ...analysis,
            status: 'validated'
          };
        }
        return analysis;
      }));

      toast({
        title: "Succès",
        description: "Analyse validée avec succès"
      });

      // Recharger toutes les données
      await Promise.all([
        fetchAnalyses(),
        fetchSources()  // Pour mettre à jour la dernière analyse dans l'onglet sources
      ]);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider l'analyse",
        variant: "destructive",
      });
    }
};
  // Fonction helper pour traduire les types
const translateSourceType = (type) => {
    const types = {
      'surface': 'Eau de surface',
      'groundwater': 'Eau souterraine',
      'well': 'Puits',
      'spring': 'Source naturelle'
    };
    return types[type] || type;
  };

  // Gestion des paramètres
  const handleParameterSubmit = async (data) => {
    try {
      if (parameterModal.editing) {
        await api.put(`/water-quality/parameters/${parameterModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Paramètre modifié avec succès"
        });
      } else {
        await api.post('/water-quality/parameters', data);
        toast({
          title: "Succès",
          description: "Paramètre ajouté avec succès"
        });
      }
      setParameterModal({ isOpen: false, editing: null });
      fetchParameters();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleDeleteParameter = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce paramètre ?")) {
      return;
    }
    try {
      await api.delete(`/water-quality/parameters/${id}`);
      toast({
        title: "Succès",
        description: "Paramètre supprimé avec succès"
      });
      fetchParameters();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le paramètre",
        variant: "destructive",
      });
    }
  };





  const ViewAnalysisModal = ({ isOpen, onClose, analysis }) => {
    if (!analysis) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'analyse</DialogTitle>
        </DialogHeader>
    
        <div className="space-y-6">
          {/* Section: Informations de Base */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-medium">Source</p>
              <p>{analysis.source?.name}</p>
            </div>
            <div>
              <p className="font-medium">Date</p>
              <p>{format(new Date(analysis.analysis_date), 'dd/MM/yyyy')}</p>
            </div>
          </div>
    
          {/* Section: Résultats */}
          <div>
            <h3 className="font-medium mb-4">Résultats</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
  {analysis.results?.map((result) => {
    // Fonction de vérification de la conformité
    const checkCompliance = (value, min, max) => {
      const numValue = Number(value);
      
      // Si seulement max est défini
      if (max !== null && min === null) {
        return numValue <= max;
      }
      
      // Si seulement min est défini
      if (min !== null && max === null) {
        return numValue >= min;
      }
      
      // Si les deux sont définis
      if (min !== null && max !== null) {
        return numValue >= min && numValue <= max;
      }
      
      return true;
    };

    // Calcul de la conformité
    const isCompliant = checkCompliance(
      result.value,
      result.parameter.min_value,
      result.parameter.max_value
    );

    return (
      <div key={result.id} className="border p-3 rounded-md">
        <p className="font-medium text-sm">{result.parameter.name}</p>
        <p className="text-sm">{result.value} {result.parameter.unit}</p>
        <p className="text-xs text-gray-500">
          Limites : {result.parameter.min_value || '0'} - {result.parameter.max_value || '0'}
        </p>
        <Badge
          variant={isCompliant ? "success" : "destructive"}
          className="text-xs mt-2"
        >
          {isCompliant ? "Conforme" : "Non conforme"}
        </Badge>
      </div>
    );
  })}
</div>


          </div>
    
          {/* Section: Commentaires */}
          {analysis.comments && (
            <div>
              <p className="font-medium mb-2">Commentaires</p>
              <p>{analysis.comments}</p>
            </div>
          )}
        </div>
    
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    );
  };


  // Rendu du composant
  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Qualité de l'Eau</h1>
        {activeTab === 'sources' && (
          <Button onClick={() => setSourceModal({ isOpen: true, editing: null })}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter une source
          </Button>
        )}
        {activeTab === 'analyses' && (
          <Button onClick={() => setAnalysisModal({ isOpen: true })}>
            <Plus className="w-4 h-4 mr-2" /> Nouvelle analyse
          </Button>
        )}
        {activeTab === 'parameters' && (
          <Button onClick={() => setParameterModal({ isOpen: true, editing: null })}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un paramètre
          </Button>
        )}

{activeTab === 'pumping' && (
  <Button onClick={() => setPumpingModal({ isOpen: true, editing: null })}>
    <Plus className="w-4 h-4 mr-2" /> Ajouter un pompage
  </Button>
)}

{activeTab === 'distribution' && (
  <Button onClick={() => setDistributionModal({ isOpen: true, editing: null })}>
    <Plus className="w-4 h-4 mr-2" /> Ajouter une distribution
  </Button>
)}

{activeTab === 'synthesis' && (
  <div className="flex gap-2">
    <input
      type="date"
      className="px-3 py-2 border rounded-lg"
      value={format(synthesisRangeDates[0], 'yyyy-MM-dd')}
      onChange={(e) => setSynthesisRangeDates([
        new Date(e.target.value),
        synthesisRangeDates[1]
      ])}
    />
    <input
      type="date"
      className="px-3 py-2 border rounded-lg"
      value={format(synthesisRangeDates[1], 'yyyy-MM-dd')}
      onChange={(e) => setSynthesisRangeDates([
        synthesisRangeDates[0],
        new Date(e.target.value)
      ])}
    />
  </div>
)}



      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sources">
            <Droplet className="w-4 h-4 mr-2" />
            Sources d'eau ({sources.length})
          </TabsTrigger>
          <TabsTrigger value="analyses">
            <Beaker className="w-4 h-4 mr-2" />
            Analyses ({analyses.length})
          </TabsTrigger>
          <TabsTrigger value="parameters">
            <FileText className="w-4 h-4 mr-2" />
            Paramètres ({parameters.length})
          </TabsTrigger>
          <TabsTrigger value="pumping">
  <Gauge className="w-4 h-4 mr-2" />
  Suivi Pompage
</TabsTrigger>
<TabsTrigger value="distribution">
  < SprayCan className="w-4 h-4 mr-2" />
  Suivi Distribution
</TabsTrigger>
<TabsTrigger value="synthesis">
  <TrendingUp className="w-4 h-4 mr-2" />
  Synthèse
</TabsTrigger>



        </TabsList>

        <TabsContent value="sources">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Capacité (m³/j)</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière analyse</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{source.name}</TableCell>
                    <TableCell>{translateSourceType(source.source_type)}</TableCell>
                    <TableCell>{source.location}</TableCell>
                    <TableCell>{source.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={source.status === 'active' ? 'success' : 'warning'}>
                        {source.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
    {source.analyses && source.analyses[0] ? (
        format(new Date(source.analyses[0].analysis_date), 'dd/MM/yyyy')
    ) : (
        'Aucune analyse'
    )}
</TableCell>
<TableCell>
    <div className="flex space-x-2">
        <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(source)}
        >
            <Pencil className="w-4 h-4" />
        </Button>
      
        <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDelete(source.id)}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    </div>
</TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analyses">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Prélevé par</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell>{analysis.source?.name}</TableCell>
                    <TableCell>
                      {format(new Date(analysis.analysis_date), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {analysis.sampler ? 
                        `${analysis.sampler.first_name} ${analysis.sampler.last_name}` :
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={analysis.status === 'validated' ? 'success' : 'warning'}>
                        {analysis.status === 'validated' ? 'Validée' : 'En attente'}
                      </Badge>
                    </TableCell>

                    <TableCell>
  <div className="flex space-x-2">
    <Button 
      variant="outline" 
      size="sm"
      onClick={async () => {
        try {
          const response = await api.get(`/water-quality/analyses/${analysis.id}`);
          setSelectedAnalysis(response.data);
          setViewAnalysisModal(true);
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les détails de l'analyse",
            variant: "destructive",
          });
        }
      }}
    >
      <FileText className="w-4 h-4" />
    </Button>

    {analysis.status !== 'validated' && (
      <Button 
        variant="outline"
        size="sm"
        onClick={() => handleValidateAnalysis(analysis.id)}
      >
        <Check className="w-4 h-4" />
      </Button>
    )}
  </div>
</TableCell>

            
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="parameters">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paramètre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Valeurs min-max</TableHead>
                  <TableHead>Critique</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameters.map((param) => (
                  <TableRow key={param.id}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>{param.parameter_type}</TableCell>
                    <TableCell>{param.unit}</TableCell>
                    <TableCell>
                      {param.min_value} - {param.max_value}
                      {param.optimal_value && ` (optimal: ${param.optimal_value})`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={param.is_critical ? 'destructive' : 'secondary'}>
                        {param.is_critical ? 'Oui' : 'Non'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setParameterModal({ isOpen: true, editing: param })}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteParameter(param.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="pumping">
        <PumpingRecordsTab 
  sources={sources} 
  onEdit={(record) => setPumpingModal({ isOpen: true, editing: record })}
  shouldRefresh={refreshPumping}
  onRefreshComplete={() => setRefreshPumping(false)}
/>
</TabsContent>
<TabsContent value="distribution">
  <DistributionRecordsTab 
    sources={sources} 
    onEdit={(record) => setDistributionModal({ isOpen: true, editing: record })}
    shouldRefresh={refreshDistribution}
    onRefreshComplete={() => setRefreshDistribution(false)}
  />
</TabsContent>

<TabsContent value="synthesis">
  <SynthesisSection 
    sources={sources}
    period={synthesisRangeDates}
  />
</TabsContent>

      </Tabs>
    

      {/* Modaux */}
      <SourceForm 
        isOpen={sourceModal.isOpen}
        onClose={() => setSourceModal({ isOpen: false, editing: null })}
        editingSource={sourceModal.editing}
        onSubmit={handleSourceSubmit}
      />

      <AnalysisForm
        isOpen={analysisModal.isOpen}
        onClose={() => setAnalysisModal({ isOpen: false })}
        sources={sources}
        parameters={parameters}
        onSubmit={handleAnalysisSubmit}
      />

      <ParameterForm
        isOpen={parameterModal.isOpen}
        onClose={() => setParameterModal({ isOpen: false, editing: null })}
        editingParameter={parameterModal.editing}
        onSubmit={handleParameterSubmit}
      />
      <ViewAnalysisModal
  isOpen={viewAnalysisModal}
  onClose={() => {
    setViewAnalysisModal(false);
    setSelectedAnalysis(null);
  }}
  analysis={selectedAnalysis}
/>

<PumpingRecordForm
  isOpen={pumpingModal.isOpen}
  onClose={() => setPumpingModal({ isOpen: false, editing: null })}
  editingRecord={pumpingModal.editing}
  sources={sources}
  employees={employees}
  onSubmit={async (data) => {
    try {
      if (pumpingModal.editing) {
        await api.put(`/water-quality/pumping/${pumpingModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Enregistrement de pompage modifié avec succès"
        });
      } else {
        // S'assurer que les valeurs numériques sont correctement formatées pour l'API
        const formattedData = {
          ...data,
          start_meter_reading: parseFloat(data.start_meter_reading),
          end_meter_reading: parseFloat(data.end_meter_reading),
          volume_pumped: parseFloat(data.volume_pumped),
          pumping_duration: parseInt(data.pumping_duration)
        };
        
        await api.post('/water-quality/pumping', formattedData);
        toast({
          title: "Succès",
          description: "Enregistrement de pompage ajouté avec succès"
        });
      }
      setPumpingModal({ isOpen: false, editing: null });
      setRefreshPumping(true);
      // Rafraîchir les données de pompage
      // Vous pourriez avoir besoin d'ajouter un moyen de dire à PumpingRecordsTab de rafraîchir ses données
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  }}
/>

<DistributionRecordForm
  isOpen={distributionModal.isOpen}
  onClose={() => setDistributionModal({ isOpen: false, editing: null })}
  editingRecord={distributionModal.editing}
  sources={sources}
  employees={employees}
  onSubmit={async (data) => {
    try {
      if (distributionModal.editing) {
        await api.put(`/water-quality/distribution/${distributionModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Enregistrement de distribution modifié avec succès"
        });
      } else {
        // S'assurer que les valeurs numériques sont correctement formatées pour l'API
        const formattedData = {
          ...data,
          start_meter_reading: parseFloat(data.start_meter_reading),
          end_meter_reading: parseFloat(data.end_meter_reading),
          volume_distributed: parseFloat(data.volume_distributed),
          distribution_duration: parseInt(data.distribution_duration),
          beneficiaries: parseInt(data.beneficiaries) || 0
        };
        
        await api.post('/water-quality/distribution', formattedData);
        toast({
          title: "Succès",
          description: "Enregistrement de distribution ajouté avec succès"
        });
      }
      setDistributionModal({ isOpen: false, editing: null });
      setRefreshDistribution(true);
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  }}
/>




    </div>
  );

  




};

export default WaterQualityPage;