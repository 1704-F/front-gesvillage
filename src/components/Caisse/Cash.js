//src/components/Caisse/Cash.js
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign, 
  Users, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calculator,
  Copy,
  Eye,
  Send,
  UserCheck
} from 'lucide-react';

import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from "../ui/toast/use-toast";


const CashStatementManager = () => {
  // États principaux
  const [cashStatements, setCashStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [eligibleEmployees, setEligibleEmployees] = useState({ all: [] });
  const [denominations, setDenominations] = useState({ billets: [], pieces: [] });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: 'all', search: '' });

  const { toast } = useToast();

  // États pour le formulaire de création
  const [formData, setFormData] = useState({
    statement_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    theoretical_balance: 0,
    calculation_details: null,
    cash_counts: [],
    discrepancies: [],
    notes: ''
  });

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchCashStatements(),
      fetchDenominations(),
      fetchEligibleEmployees()
    ]);
  }, [pagination.page, filters]);

  // API Calls
  const fetchCashStatements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        status: filters.status,
        ...(filters.search && { search: filters.search })
      });
      
      const response = await api.get(`/cash-statements?${params}`);
      const data = response.data;
      
      setCashStatements(data.cashStatements);
      setPagination(prev => ({ ...prev, totalPages: data.pagination.totalPages }));
    } catch (error) {
      console.error('Erreur lors du chargement des PV:', error);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchDenominations = async () => {
    try {
        const response = await api.get('/cash-statements/denominations');
        const data = response.data;
      
      setDenominations(data.denominations);
      
      // Initialiser les comptages avec toutes les dénominations
      const initialCounts = [
        ...data.denominations.billets.map(d => ({ denomination: d, type: 'billet', quantity: 0, amount: 0 })),
        ...data.denominations.pieces.map(d => ({ denomination: d, type: 'piece', quantity: 0, amount: 0 }))
      ];
      setFormData(prev => ({ ...prev, cash_counts: initialCounts }));
    } catch (error) {
      console.error('Erreur lors du chargement des dénominations:', error);
    }
  };

  const fetchEligibleEmployees = async () => {
    try {
        const response = await api.get('/cash-statements/employees/eligible');
        const data = response.data;
      
      setEligibleEmployees(data.employees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  // NOUVEAU CODE (avec debug et gestion d'erreurs)
const calculateTheoreticalBalance = async () => {
  console.log('🔍 Debug - Calcul du solde théorique');
  console.log('📅 Dates:', {
    period_start: formData.period_start,
    period_end: formData.period_end
  });

  if (!formData.period_start || !formData.period_end) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Veuillez sélectionner les dates de début et fin de période"
    });
    return;
  }

  try {
    console.log('🚀 Envoi de la requête...');
    const params = new URLSearchParams({
      period_start: formData.period_start,
      period_end: formData.period_end
    });
    
    console.log('📋 URL complète:', `/cash-statements/calculate-balance?${params}`);
    
    const response = await api.get(`/cash-statements/calculate-balance?${params}`);
    console.log('✅ Réponse complète:', response);
    console.log('📊 Data reçue:', response.data);
    
    if (response.data && response.data.calculation) {
      setFormData(prev => ({
        ...prev,
        theoretical_balance: response.data.calculation.theoretical_balance,
        calculation_details: response.data.calculation
      }));

      toast({
        title: "Succès",
        description: `Solde théorique: ${response.data.calculation.theoretical_balance.toLocaleString()} FCFA`
      });
    } else {
      console.error('❌ Structure de réponse inattendue:', response.data);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Réponse du serveur invalide"
      });
    }
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    console.error('📡 Réponse d\'erreur:', error.response?.data);
    console.error('📡 Status:', error.response?.status);
    
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Erreur lors du calcul du solde théorique"
    });
  }
};

  // Gestionnaires d'événements
  const handleCreateStatement = async () => {
    try {
      const response = await api.post('/cash-statements', formData);

if (response.status === 201) {
  toast({
    title: "Succès",
    description: "PV de caisse créé avec succès"
  });
  setShowCreateModal(false);
  fetchCashStatements();
  resetForm();
}
    } catch (error) {
      console.error('Erreur lors de la création du PV:', error);
    }
  };

  const handleSignStatement = async (statementId, employeeId, role) => {
    try {
        const response = await api.patch(`/cash-statements/${statementId}/sign`, {
  employee_id: employeeId, 
  signature_role: role
});

if (response.status === 200) {
  toast({
    title: "Succès",
    description: "Signature ajoutée avec succès"
  });
  fetchCashStatements();
  setShowSignModal(false);
}
     
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
    }
  };

  const handleSubmitForValidation = async (id) => {
    try {
        const response = await api.patch(`/cash-statements/${id}/submit`);

if (response.status === 200) {
  toast({
    title: "Succès",
    description: "PV soumis pour validation avec succès"
  });
  fetchCashStatements();
}
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const handleDeleteStatement = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce PV ?')) {
      try {
        const response = await api.delete(`/cash-statements/${id}`);

if (response.status === 200) {
  toast({
    title: "Succès",
    description: "PV supprimé avec succès"
  });
  fetchCashStatements();
}
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleDownloadPDF = async (id) => {
  try {
    // Utiliser la même approche que pour les coupures
    const response = await api.get(`/cash-statements/${id}/pdf`, {
      responseType: 'blob' // ✅ Important : spécifier le type de réponse
    });
    
    // Créer un URL temporaire pour le blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Générer un nom de fichier approprié
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `PV-Caisse-${id}-${today}.pdf`);
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Succès",
      description: "Téléchargement du PDF en cours"
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de télécharger le PDF"
    });
  }
};

  const resetForm = () => {
    setFormData({
      statement_date: new Date().toISOString().split('T')[0],
      period_start: '',
      period_end: '',
      theoretical_balance: 0,
      cash_counts: denominations.billets && denominations.pieces ? [
        ...denominations.billets.map(d => ({ denomination: d, type: 'billet', quantity: 0, amount: 0 })),
        ...denominations.pieces.map(d => ({ denomination: d, type: 'piece', quantity: 0, amount: 0 }))
      ] : [],
      discrepancies: [],
      notes: ''
    });
  };

  const updateCashCount = (index, field, value) => {
    const newCounts = [...formData.cash_counts];
    newCounts[index][field] = value;
    
    if (field === 'quantity') {
      newCounts[index].amount = newCounts[index].denomination * parseInt(value || 0);
    }
    
    setFormData(prev => ({ ...prev, cash_counts: newCounts }));
  };

  const addDiscrepancy = () => {
    setFormData(prev => ({
      ...prev,
      discrepancies: [...prev.discrepancies, { type: 'bons_avoirs', amount: 0, description: '', reference: '' }]
    }));
  };

  const updateDiscrepancy = (index, field, value) => {
    const newDiscrepancies = [...formData.discrepancies];
    newDiscrepancies[index][field] = value;
    setFormData(prev => ({ ...prev, discrepancies: newDiscrepancies }));
  };

  const removeDiscrepancy = (index) => {
    const newDiscrepancies = formData.discrepancies.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, discrepancies: newDiscrepancies }));
  };

  // Fonctions utilitaires
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-FR').format(num || 0);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'pending_validation': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'validated': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Brouillon',
      pending_validation: 'En attente',
      validated: 'Validé',
      rejected: 'Rejeté'
    };
    return labels[status] || status;
  };

  const calculatePhysicalTotal = () => {
    return formData.cash_counts.reduce((sum, count) => sum + (count.amount || 0), 0);
  };

  const calculateDiscrepancy = () => {
    return calculatePhysicalTotal() - (formData.theoretical_balance || 0);
  };

  return (
    <div className="bg-gray-50">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Procès-Verbaux de Caisse</h1>
            <p className="text-gray-600">Gestion des arrêtés de caisse et inventaires</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau PV
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher par numéro ou notes..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending_validation">En attente</option>
              <option value="validated">Validé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des PV */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° PV</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde Théorique</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde Physique</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashStatements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {statement.statement_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(statement.statement_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(statement.theoretical_balance)} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(statement.physical_balance)} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${statement.total_discrepancy === 0 ? 'text-green-600' : 
                          statement.total_discrepancy > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {statement.total_discrepancy > 0 ? '+' : ''}{formatNumber(statement.total_discrepancy)} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(statement.status)}
                          <span className={`text-sm ${
                            statement.status === 'validated' ? 'text-green-600' :
                            statement.status === 'pending_validation' ? 'text-yellow-600' :
                            statement.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {getStatusLabel(statement.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStatement(statement);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {statement.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleSubmitForValidation(statement.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Soumettre pour validation"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStatement(statement.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {statement.status === 'pending_validation' && (
                            <button
                              onClick={() => {
                                setSelectedStatement(statement);
                                setShowSignModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                              title="Signer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          {statement.status === 'validated' && (
                            <button
                              onClick={() => handleDownloadPDF(statement.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Télécharger PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {pagination.page} sur {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nouveau PV de Caisse</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date du PV</label>
                  <input
                    type="date"
                    value={formData.statement_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, statement_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début période</label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin période</label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Solde théorique avec détails */}
<div className="bg-blue-50 p-4 rounded-lg">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-lg font-medium text-gray-900">Solde Théorique</h3>
    <button
      onClick={calculateTheoreticalBalance}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
    >
      <Calculator className="w-4 h-4" />
      Calculer
    </button>
  </div>
  
  <div className="text-2xl font-bold text-blue-600 mb-4">
    {formatNumber(formData.theoretical_balance)} FCFA
  </div>

  {/* ✅ AJOUTER cette section pour les détails */}
  {formData.calculation_details && (
    <div className="space-y-4 border-t border-blue-200 pt-4">
      <h4 className="font-medium text-gray-900">Détail du calcul :</h4>
      
      {/* Solde initial */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Solde initial :</span>
          <span className="font-medium ml-2">{formatNumber(formData.calculation_details.initial_balance)} FCFA</span>
        </div>
      </div>

      {/* Entrées */}
      <div>
        <h5 className="font-medium text-green-700 mb-2">➕ Entrées d'argent</h5>
        <div className="grid grid-cols-2 gap-2 text-sm pl-4">
          <div>Factures d'eau : <span className="font-medium">{formatNumber(formData.calculation_details.cash_inflows.invoices)} FCFA</span></div>
          <div>Dons reçus : <span className="font-medium">{formatNumber(formData.calculation_details.cash_inflows.donations)} FCFA</span></div>
          <div>Emprunts contractés : <span className="font-medium">{formatNumber(formData.calculation_details.cash_inflows.loans)} FCFA</span></div>
          <div className="col-span-2 border-t pt-2 font-medium text-green-700">
            Total entrées : {formatNumber(formData.calculation_details.cash_inflows.total)} FCFA
          </div>
        </div>
      </div>

      {/* Sorties */}
      <div>
        <h5 className="font-medium text-red-700 mb-2">➖ Sorties d'argent</h5>
        <div className="grid grid-cols-2 gap-2 text-sm pl-4">
          <div>Dépenses payées : <span className="font-medium">{formatNumber(formData.calculation_details.cash_outflows.expenses)} FCFA</span></div>
          <div>Salaires payés : <span className="font-medium">{formatNumber(formData.calculation_details.cash_outflows.salaries)} FCFA</span></div>
          <div>Remboursements : <span className="font-medium">{formatNumber(formData.calculation_details.cash_outflows.repayments)} FCFA</span></div>
          <div className="col-span-2 border-t pt-2 font-medium text-red-700">
            Total sorties : {formatNumber(formData.calculation_details.cash_outflows.total)} FCFA
          </div>
        </div>
      </div>

      {/* Mouvement net */}
      <div className="bg-blue-100 p-3 rounded border-t border-blue-300">
        <div className="font-medium text-blue-800">
          Mouvement net : {formatNumber(formData.calculation_details.net_movement)} FCFA
        </div>
      </div>
    </div>
  )}
</div>

              

              {/* Comptage physique */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comptage Physique</h3>
                
                {/* Billets */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">BILLETS</h4>
                  {formData.cash_counts
                    .filter(count => count.type === 'billet')
                    .map((count, index) => (
                      <div key={`billet-${count.denomination}`} className="grid grid-cols-4 gap-3 mb-2 items-center">
                        <div className="text-sm text-gray-600">
                          Billet de {formatNumber(count.denomination)} FCFA
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={count.quantity}
                          onChange={(e) => updateCashCount(
                            formData.cash_counts.findIndex(c => c.denomination === count.denomination && c.type === 'billet'),
                            'quantity',
                            e.target.value
                          )}
                          placeholder="Nombre"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="text-sm text-gray-900 font-medium">
                          {formatNumber(count.amount)} FCFA
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pièces */}
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-3 bg-gray-100 px-3 py-2 rounded">PIÈCES</h4>
                  {formData.cash_counts
                    .filter(count => count.type === 'piece')
                    .map((count, index) => (
                      <div key={`piece-${count.denomination}`} className="grid grid-cols-4 gap-3 mb-2 items-center">
                        <div className="text-sm text-gray-600">
                          Pièce de {formatNumber(count.denomination)} FCFA
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={count.quantity}
                          onChange={(e) => updateCashCount(
                            formData.cash_counts.findIndex(c => c.denomination === count.denomination && c.type === 'piece'),
                            'quantity',
                            e.target.value
                          )}
                          placeholder="Nombre"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="text-sm text-gray-900 font-medium">
                          {formatNumber(count.amount)} FCFA
                        </div>
                      </div>
                    ))}
                </div>

                {/* Total physique */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-lg font-medium text-gray-900">Total Physique</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(calculatePhysicalTotal())} FCFA
                  </div>
                </div>
              </div>

              {/* Écart */}
              <div className={`p-4 rounded-lg ${calculateDiscrepancy() === 0 ? 'bg-gray-50' : 
                calculateDiscrepancy() > 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                <div className="text-lg font-medium text-gray-900">Écart (Physique - Théorique)</div>
                <div className={`text-2xl font-bold ${calculateDiscrepancy() === 0 ? 'text-gray-600' : 
                  calculateDiscrepancy() > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {calculateDiscrepancy() > 0 ? '+' : ''}{formatNumber(calculateDiscrepancy())} FCFA
                </div>
              </div>

              {/* Détails des écarts */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Détails des Écarts</h3>
                  <button
                    onClick={addDiscrepancy}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                
                {formData.discrepancies.map((discrepancy, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 border border-gray-200 rounded-lg">
                    <select
                      value={discrepancy.type}
                      onChange={(e) => updateDiscrepancy(index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bons_avoirs">Bons/Avoirs</option>
                      <option value="pertes">Pertes</option>
                      <option value="gains">Gains</option>
                    </select>
                    <input
                      type="number"
                      value={discrepancy.amount}
                      onChange={(e) => updateDiscrepancy(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="Montant"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={discrepancy.description}
                      onChange={(e) => updateDiscrepancy(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={discrepancy.reference}
                      onChange={(e) => updateDiscrepancy(index, 'reference', e.target.value)}
                      placeholder="Référence"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeDiscrepancy(index)}
                      className="text-red-600 hover:text-red-900 px-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Notes ou observations..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions du modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateStatement}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
              >
                Créer le PV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  PV N° {selectedStatement.statement_number}
                </h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedStatement.status)}
                  <span className={`text-sm font-medium ${
                    selectedStatement.status === 'validated' ? 'text-green-600' :
                    selectedStatement.status === 'pending_validation' ? 'text-yellow-600' :
                    selectedStatement.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getStatusLabel(selectedStatement.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date du PV</h3>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedStatement.statement_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Période</h3>
                  <p className="text-lg text-gray-900">
                    {selectedStatement.period_start && selectedStatement.period_end ? 
                      `${new Date(selectedStatement.period_start).toLocaleDateString('fr-FR')} au ${new Date(selectedStatement.period_end).toLocaleDateString('fr-FR')}` :
                      'Non spécifiée'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Préparé par</h3>
                  <p className="text-lg text-gray-900">
                    {selectedStatement.preparer ? 
                      `${selectedStatement.preparer.first_name} ${selectedStatement.preparer.last_name}` :
                      'Non spécifié'
                    }
                  </p>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Solde Théorique</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(selectedStatement.theoretical_balance)} FCFA
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Solde Physique</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(selectedStatement.physical_balance)} FCFA
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${selectedStatement.total_discrepancy === 0 ? 'bg-gray-50' : 
                  selectedStatement.total_discrepancy > 0 ? 'bg-blue-50' : 'bg-red-50'}`}>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Écart</h3>
                  <p className={`text-2xl font-bold ${selectedStatement.total_discrepancy === 0 ? 'text-gray-600' : 
                    selectedStatement.total_discrepancy > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {selectedStatement.total_discrepancy > 0 ? '+' : ''}{formatNumber(selectedStatement.total_discrepancy)} FCFA
                  </p>
                </div>
              </div>

              {/* Détails du comptage */}
              {selectedStatement.cash_counts && selectedStatement.cash_counts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Détails du Comptage</h3>
                  
                  {/* Billets */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2 bg-gray-100 px-3 py-2 rounded">BILLETS</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 mb-2">
                      <div>Dénomination</div>
                      <div>Quantité</div>
                      <div>Montant</div>
                    </div>
                    {selectedStatement.cash_counts
                      .filter(count => count.type === 'billet' && count.quantity > 0)
                      .map((count, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 text-sm mb-1 py-1">
                          <div>{formatNumber(count.denomination)} FCFA</div>
                          <div>{count.quantity}</div>
                          <div className="font-medium">{formatNumber(count.amount)} FCFA</div>
                        </div>
                      ))}
                  </div>

                  {/* Pièces */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-700 mb-2 bg-gray-100 px-3 py-2 rounded">PIÈCES</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 mb-2">
                      <div>Dénomination</div>
                      <div>Quantité</div>
                      <div>Montant</div>
                    </div>
                    {selectedStatement.cash_counts
                      .filter(count => count.type === 'piece' && count.quantity > 0)
                      .map((count, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 text-sm mb-1 py-1">
                          <div>{formatNumber(count.denomination)} FCFA</div>
                          <div>{count.quantity}</div>
                          <div className="font-medium">{formatNumber(count.amount)} FCFA</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Détails des écarts */}
              {selectedStatement.discrepancies && selectedStatement.discrepancies.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Détails des Écarts</h3>
                  <div className="space-y-3">
                    {selectedStatement.discrepancies.map((discrepancy, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Type:</span>
                            <p className="capitalize">{discrepancy.type.replace('_', '/')}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Montant:</span>
                            <p className="font-medium">{formatNumber(discrepancy.amount)} FCFA</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Description:</span>
                            <p>{discrepancy.description || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Référence:</span>
                            <p>{discrepancy.reference || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Signatures</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Trésorier</h4>
                    {selectedStatement.treasurer ? (
                      <>
                        <p className="text-sm text-gray-600">
                          {selectedStatement.treasurer.first_name} {selectedStatement.treasurer.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{selectedStatement.treasurer.job_title}</p>
                        {selectedStatement.treasurer_signed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Signé le {new Date(selectedStatement.treasurer_signed_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Non signé</p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Secrétaire Général</h4>
                    {selectedStatement.secretaryGeneral ? (
                      <>
                        <p className="text-sm text-gray-600">
                          {selectedStatement.secretaryGeneral.first_name} {selectedStatement.secretaryGeneral.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{selectedStatement.secretaryGeneral.job_title}</p>
                        {selectedStatement.secretary_general_signed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Signé le {new Date(selectedStatement.secretary_general_signed_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Non signé</p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Président</h4>
                    {selectedStatement.president ? (
                      <>
                        <p className="text-sm text-gray-600">
                          {selectedStatement.president.first_name} {selectedStatement.president.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{selectedStatement.president.job_title}</p>
                        {selectedStatement.president_signed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Signé le {new Date(selectedStatement.president_signed_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Non signé</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedStatement.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedStatement.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions du modal de détails */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Fermer
              </button>
              
              <div className="flex gap-3">
                {selectedStatement.status === 'validated' && (
                  <button
                    onClick={() => handleDownloadPDF(selectedStatement.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                )}
                
                {selectedStatement.status === 'pending_validation' && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowSignModal(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Signer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de signature */}
      {showSignModal && selectedStatement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Signer le PV N° {selectedStatement.statement_number}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Rôle Trésorier */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Trésorier</h3>
                  {selectedStatement.treasurer_signed_at ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Signé
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Non signé</span>
                  )}
                </div>
                
                {!selectedStatement.treasurer_signed_at && (
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSignStatement(selectedStatement.id, parseInt(e.target.value), 'treasurer');
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Sélectionner un employé</option>
                      {eligibleEmployees.treasurers?.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                      {eligibleEmployees.all?.filter(emp => !eligibleEmployees.treasurers?.find(t => t.id === emp.id)).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Rôle Secrétaire Général */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Secrétaire Général</h3>
                  {selectedStatement.secretary_general_signed_at ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Signé
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Non signé</span>
                  )}
                </div>
                
                {!selectedStatement.secretary_general_signed_at && (
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSignStatement(selectedStatement.id, parseInt(e.target.value), 'secretary_general');
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Sélectionner un employé</option>
                      {eligibleEmployees.secretaries?.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                      {eligibleEmployees.all?.filter(emp => !eligibleEmployees.secretaries?.find(s => s.id === emp.id)).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Rôle Président */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Président</h3>
                  {selectedStatement.president_signed_at ? (
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Signé
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Non signé</span>
                  )}
                </div>
                
                {!selectedStatement.president_signed_at && (
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSignStatement(selectedStatement.id, parseInt(e.target.value), 'president');
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Sélectionner un employé</option>
                      {eligibleEmployees.presidents?.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                      {eligibleEmployees.all?.filter(emp => !eligibleEmployees.presidents?.find(p => p.id === emp.id)).map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.job_title})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Information sur la validation automatique */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Validation automatique</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Le PV sera automatiquement validé dès que les trois signatures seront présentes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions du modal de signature */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashStatementManager;