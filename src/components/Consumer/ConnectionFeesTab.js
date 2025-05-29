// ==========================================
// COMPOSANT PRINCIPAL - ConnectionFeesTab.js
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
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
import { 
  Plus, 
  Download,
  Eye,
  Trash2,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Minus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { axiosPrivate as api } from '../../utils/axios';

const ConnectionFeesTab = () => {
  const { toast } = useToast();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [connectionFees, setConnectionFees] = useState([]);
  const [eligibleConsumers, setEligibleConsumers] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [statistics, setStatistics] = useState({
    total_count: 0,
    pending_count: 0,
    paid_count: 0,
    cancelled_count: 0,
    total_amount: 0,
    pending_amount: 0,
    paid_amount: 0,
    average_amount: 0
  });

  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');

  // États des filtres
  const [filters, setFilters] = useState({
    start_date: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      date.setDate(1);
      return format(date, 'yyyy-MM-dd');
    })(),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    status: 'all'
  });

  // États de pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  // États des modals
  const [createModal, setCreateModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  // États du formulaire de création
  const [formData, setFormData] = useState({
    consumer_id: '',
    meter_id: '',
    association_name: '',
    labor_cost: '',
    items: [],
    notes: '',
    due_date: ''
  });

  // États pour la gestion des items
  const [selectedItems, setSelectedItems] = useState([]);

  // Charger les données du dashboard
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/connection-fees/dashboard', {
        params: {
          start_date: filters.start_date,
          end_date: filters.end_date,
          status: filters.status !== 'all' ? filters.status : undefined,
          page: pagination.page,
          limit: pagination.limit
        }
      });

      const data = response.data.data;
      setConnectionFees(data.connectionFees);
      setEligibleConsumers(data.eligibleConsumers);
      setInventoryItems(data.inventoryItems);
      setStatistics(data.statistics);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les données"
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Formatage des nombres
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(num).replace(/\s/g, ' ');
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "En attente", variant: "warning" },
      paid: { label: "Payé", variant: "success" },
      cancelled: { label: "Annulé", variant: "destructive" }
    };
    return badges[status] || { label: status, variant: "default" };
  };

  // Gérer la création
  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        items: selectedItems,
        labor_cost: parseFloat(formData.labor_cost) || 0
      };

      await api.post('/connection-fees', payload);
      
      toast({
        title: "Succès",
        description: "Frais de branchement créés avec succès"
      });

      setCreateModal(false);
      resetForm();
      fetchDashboard();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la création"
      });
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      consumer_id: '',
      meter_id: '',
      association_name: '',
      labor_cost: '',
      items: [],
      notes: '',
      due_date: ''
    });
    setSelectedItems([]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
  };

  // Gérer la suppression
  const handleDelete = async () => {
    try {
      await api.delete(`/connection-fees/${selectedFee.id}`);
      
      toast({
        title: "Succès",
        description: "Frais de branchement supprimés avec succès"
      });

      setDeleteModal(false);
      setSelectedFee(null);
      fetchDashboard();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la suppression"
      });
    }
  };

  // Mettre à jour le statut
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/connection-fees/${id}/status`, { status: newStatus });
      
      toast({
        title: "Succès",  
        description: "Statut mis à jour avec succès"
      });

      fetchDashboard();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut"
      });
    }
  };

  // Télécharger le PDF
  const handleDownloadPDF = async (id, referenceNumber) => {
    try {
      const response = await api.get(`/connection-fees/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `frais-branchement-${referenceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le PDF"
      });
    }
  };

  // Ajouter un item au panier
 const addItemToCart = (inventoryId, quantity) => {
  const item = inventoryItems.find(i => i.id === parseInt(inventoryId));
  if (!item || !quantity || parseFloat(quantity) <= 0) return;

    const existingIndex = selectedItems.findIndex(i => i.inventory_id === parseInt(inventoryId));
    
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity_used = parseFloat(quantity);
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, {
        inventory_id: parseInt(inventoryId),
        quantity_used: parseFloat(quantity),
        name: item.name,
        unit: item.unit,
        unit_price: parseFloat(item.unit_price || 0),
        category: item.category?.name || 'Non catégorisé'
      }]);
    }
  };

  // Supprimer un item du panier
  const removeItemFromCart = (inventoryId) => {
    setSelectedItems(selectedItems.filter(i => i.inventory_id !== inventoryId));
  };

  // Calculer le total des matériaux
  const calculateMaterialsTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.quantity_used * item.unit_price);
    }, 0);
  };

  // Calculer le total général
  const calculateGrandTotal = () => {
    const materialsTotal = calculateMaterialsTotal();
    const laborCost = parseFloat(formData.labor_cost) || 0;
    return materialsTotal + laborCost;
  };

  // Obtenir les compteurs d'un consommateur
  const getConsumerMeters = (consumerId) => {
    const consumer = eligibleConsumers.find(c => c.id === parseInt(consumerId));
    return consumer?.meters || [];
  };

  return (
    <div className="space-y-6">
      {/* ==========================================
          SECTION SYNTHÈSE
          ========================================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold">{statistics.total_count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Payés</p>
              <p className="text-2xl font-bold text-green-600">{statistics.paid_count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{statistics.pending_count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-2xl font-bold">{formatNumber(statistics.total_amount)} FCFA</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ==========================================
          SECTION FILTRES
          ========================================== */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de début</label>
            <div className="relative">
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date de fin</label>
            <div className="relative">
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={fetchDashboard}>
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
          
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau
          </Button>
        </div>
      </Card>

      {/* ==========================================
          MESSAGE INFORMATIF
          ========================================== */}
      {eligibleConsumers.length === 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-medium text-orange-800">Information importante</h3>
              <p className="text-sm text-orange-600 mt-1">
                Pour générer des frais de branchement, vous devez d'abord :
              </p>
              <ul className="text-sm text-orange-600 mt-2 space-y-1">
                <li>• Créer le consommateur</li>
                <li>• Lui attribuer un compteur actif</li>
                <li>• Puis générer ses frais de branchement</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* ==========================================
          TABLEAU PRINCIPAL
          ========================================== */}
      <Card>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>Consommateur</TableHead>
              <TableHead>Compteur</TableHead>
              <TableHead>Association</TableHead>
              <TableHead>Montant total</TableHead>
              <TableHead>Date d'émission</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectionFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {loading ? "Chargement des données..." : "Aucun frais de branchement"}
                </TableCell>
              </TableRow>
            ) : (
              connectionFees.map((fee) => {
                const statusBadge = getStatusBadge(fee.status);
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.reference_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {fee.consumer?.first_name} {fee.consumer?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{fee.consumer?.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{fee.meter?.meter_number}</TableCell>
                    <TableCell>{fee.association_name || '-'}</TableCell>
                    <TableCell className="font-medium">
                      {formatNumber(fee.total_amount)} FCFA
                      <div className="text-xs text-gray-500">
                        Mat: {formatNumber(fee.materials_cost)} + 
                        MO: {formatNumber(fee.labor_cost)}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(fee.issue_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(fee.due_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedFee(fee);
                            setViewModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(fee.id, fee.reference_number)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        {fee.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(fee.id, 'paid')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {fee.status === 'pending' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setSelectedFee(fee);
                              setDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {connectionFees.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-500">
              Affichage de {(pagination.page - 1) * pagination.limit + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm">
                Page {pagination.page} sur {pagination.totalPages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages) }))}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Select 
                value={pagination.limit.toString()} 
                onValueChange={(value) => {
                  setPagination(prev => ({
                    ...prev,
                    page: 1,
                    limit: parseInt(value)
                  }));
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 lignes</SelectItem>
                  <SelectItem value="50">50 lignes</SelectItem>
                  <SelectItem value="100">100 lignes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* ==========================================
          MODAL DE CRÉATION
          ========================================== */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer des frais de branchement</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Colonne gauche - Formulaire */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Consommateur *</label>

                <Select
  value={formData.consumer_id}
  onValueChange={(value) => {
    setFormData({ ...formData, consumer_id: value, meter_id: '' });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner un consommateur" />
  </SelectTrigger>
  <SelectContent className="max-h-48 overflow-y-auto">
    {eligibleConsumers.map((consumer) => (
      <SelectItem key={consumer.id} value={consumer.id.toString()}>
        <div className="flex flex-col">
          <span className="font-medium">
            {consumer.first_name} {consumer.last_name}
          </span>
          <span className="text-xs text-gray-500">{consumer.name}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>

              </div>

              {formData.consumer_id && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Compteur *</label>

                  <Select
  value={formData.meter_id}
  onValueChange={(value) => setFormData({ ...formData, meter_id: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner un compteur" />
  </SelectTrigger>
  <SelectContent className="max-h-48 overflow-y-auto">
    {getConsumerMeters(formData.consumer_id).map((meter) => (
      <SelectItem key={meter.id} value={meter.id.toString()}>
        <div className="flex flex-col">
          <span className="font-medium">{meter.meter_number}</span>
          <span className="text-xs text-gray-500">{meter.location}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>


                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Association (optionnel)</label>
                <Input
                  placeholder="Nom de l'association"
                  value={formData.association_name}
                  onChange={(e) => setFormData({ ...formData, association_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Frais de branchement (main d'œuvre) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.labor_cost}
                  onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'échéance</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Notes sur les travaux..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Colonne droite - Sélection des matériaux */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Matériaux utilisés</h3>

                
                {/* Sélection d'articles */}
                <div className="space-y-3">
  <div className="grid grid-cols-3 gap-2">
    <Select 
      value={selectedMaterialId}
      onValueChange={setSelectedMaterialId}
    >
      <SelectTrigger className="col-span-2">
        <SelectValue placeholder="Sélectionner un matériau" />
      </SelectTrigger>
      <SelectContent className="max-h-48">
        {inventoryItems.map((item) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-gray-500">
                {formatNumber(item.unit_price)} FCFA/{item.unit} (Stock: {item.quantity})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    <div className="flex gap-1">
      <Input
        type="number"
        placeholder="Qté"
        value={materialQuantity}
        onChange={(e) => setMaterialQuantity(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && selectedMaterialId && materialQuantity) {
            addItemToCart(selectedMaterialId, materialQuantity);
            setSelectedMaterialId('');
            setMaterialQuantity('');
          }
        }}
      />
      <Button
        type="button"
        size="sm"
        onClick={() => {
          if (selectedMaterialId && materialQuantity) {
            addItemToCart(selectedMaterialId, materialQuantity);
            setSelectedMaterialId('');
            setMaterialQuantity('');
          }
        }}
        disabled={!selectedMaterialId || !materialQuantity}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
                



                {/* Liste des items sélectionnés */}
                <div className="mt-4 space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.inventory_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.category} • {item.quantity_used} {item.unit} × {formatNumber(item.unit_price)} FCFA
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatNumber(item.quantity_used * item.unit_price)} FCFA
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromCart(item.inventory_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Récapitulatif */}
                <div className="mt-4 p-4 bg-blue-50 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coût matériaux:</span>
                    <span>{formatNumber(calculateMaterialsTotal())} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Main d'œuvre:</span>
                    <span>{formatNumber(parseFloat(formData.labor_cost) || 0)} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatNumber(calculateGrandTotal())} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!formData.consumer_id || !formData.meter_id || selectedItems.length === 0}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==========================================
          MODAL DE VISUALISATION
          ========================================== */}

      <Dialog open={viewModal} onOpenChange={setViewModal}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        Détails des frais de branchement - {selectedFee?.reference_number}
      </DialogTitle>
    </DialogHeader>

    {selectedFee && (
      <div className="space-y-6">
        {/* Informations générales - En grille pour optimiser l'espace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-blue-600 border-b pb-1">Consommateur</h3>
            <div className="text-sm space-y-1">
              <div className="font-medium">
                {selectedFee.consumer?.first_name} {selectedFee.consumer?.last_name}
              </div>
              <div className="text-gray-600">{selectedFee.consumer?.name}</div>
              <div>{selectedFee.consumer?.phone_number}</div>
              <div className="text-xs text-gray-500">{selectedFee.consumer?.address}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-green-600 border-b pb-1">Compteur</h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">N°:</span> {selectedFee.meter?.meter_number}</div>
              <div><span className="font-medium">Série:</span> {selectedFee.meter?.serial_number || 'N/A'}</div>
              <div><span className="font-medium">Lieu:</span> {selectedFee.meter?.location || 'N/A'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-purple-600 border-b pb-1">Informations</h3>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Émission:</span> {format(new Date(selectedFee.issue_date), 'dd/MM/yyyy')}</div>
              <div><span className="font-medium">Échéance:</span> {format(new Date(selectedFee.due_date), 'dd/MM/yyyy')}</div>
              <div>
                <Badge variant={getStatusBadge(selectedFee.status).variant} className="text-xs">
                  {getStatusBadge(selectedFee.status).label}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Association */}
        {selectedFee.association_name && (
          <div className="bg-blue-50 p-3 rounded-md">
            <h3 className="font-medium text-blue-700 mb-1">Association</h3>
            <div className="text-sm">{selectedFee.association_name}</div>
          </div>
        )}

        {/* Matériaux utilisés - Version compacte */}
        <div>
          <h3 className="font-medium text-orange-600 border-b pb-1 mb-3">Matériaux utilisés</h3>
          {selectedFee.items && selectedFee.items.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedFee.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{item.inventoryItem?.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.inventoryItem?.category?.name} • 
                      {parseFloat(item.quantity_used).toFixed(2)} {item.inventoryItem?.unit} × {formatNumber(item.unit_price)} FCFA
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(item.total_price)} FCFA</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm bg-gray-50 p-3 rounded text-center">
              Aucun matériau utilisé
            </div>
          )}
        </div>

        {/* Récapitulatif financier - Version compacte et highlight */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-700 mb-3">💰 Récapitulatif financier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-gray-600">Matériaux</div>
              <div className="font-bold text-blue-600">{formatNumber(selectedFee.materials_cost)} FCFA</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-gray-600">Main d'œuvre</div>
              <div className="font-bold text-orange-600">{formatNumber(selectedFee.labor_cost)} FCFA</div>
            </div>
            <div className="text-center p-2 bg-green-100 rounded border-2 border-green-300">
              <div className="text-gray-700 font-medium">TOTAL</div>
              <div className="font-bold text-lg text-green-700">{formatNumber(selectedFee.total_amount)} FCFA</div>
            </div>
          </div>
        </div>

        {/* Notes - Si présentes */}
        {selectedFee.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="font-medium text-yellow-700 mb-2">📋 Notes</h3>
            <div className="text-sm p-2 bg-white rounded border">{selectedFee.notes}</div>
          </div>
        )}
      </div>
    )}

    <DialogFooter className="flex-shrink-0 border-t pt-4 mt-6">
      <Button variant="outline" onClick={() => setViewModal(false)}>
        Fermer
      </Button>
      
      {selectedFee && (
        <Button onClick={() => handleDownloadPDF(selectedFee.id, selectedFee.reference_number)}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger PDF
        </Button>
      )}
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* ==========================================
          MODAL DE SUPPRESSION
          ========================================== */}
      <AlertDialog open={deleteModal} onOpenChange={setDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ces frais de branchement ? 
              Cette action remettra les matériaux en stock et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConnectionFeesTab;