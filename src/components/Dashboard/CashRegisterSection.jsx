// src/components/dashboard/CashRegisterSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Wallet, 
  Smartphone, 
  FileText, 
  Building2,
  Lock,
  Unlock,
  Search,
  X,
  Clock,
  TrendingUp,
  CreditCard,
  History,
  Download,
  Users,
  Calendar 
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from '../ui/toast/use-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces', icon: Wallet },
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
  { value: 'check', label: 'Chèque', icon: FileText },
  { value: 'bank_transfer', label: 'Virement bancaire', icon: Building2 }
];

const CashRegisterSection = () => {
  const { toast } = useToast();
  
  // États
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [cashRegister, setCashRegister] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');

  // Charger l'état de la caisse au montage
  useEffect(() => {
    fetchCashRegisterStatus();
  }, []);

  // Recherche de factures
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchInvoices();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
  if (!cashRegister) {
    fetchEmployees();
  }
}, [cashRegister]);

  // Récupérer l'état de la caisse
  const fetchCashRegisterStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cash-receipts/current');
      setCashRegister(response.data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer l'état de la caisse"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir la caisse
  const handleOpenCashRegister = async () => {
  if (!selectedEmployeeId) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Veuillez sélectionner une caissière"
    });
    return;
  }

  try {
    const response = await api.post('/cash-receipts/open', {
      employee_id: selectedEmployeeId
    });
    
    setCashRegister(response.data.data);
    setShowOpenModal(false);
    setSelectedEmployeeId('');
    
    toast({
      title: "Succès",
      description: "Caisse ouverte avec succès"
    });
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Impossible d'ouvrir la caisse"
    });
  }
};

  // Rechercher des factures impayées
  const searchInvoices = async () => {
    try {
      setIsSearching(true);
      const response = await api.get('/invoices', {
        params: {
          status: 'pending',
          search: searchTerm,
          limit: 10
        }
      });
      
      // Filtrer celles qui ne sont pas déjà dans le panier
      const filtered = response.data.data.filter(
        inv => !cart.find(c => c.id === inv.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Ajouter une facture au panier
  const addToCart = (invoice) => {
    if (!cart.find(i => i.id === invoice.id)) {
      setCart([...cart, invoice]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  // Retirer une facture du panier
  const removeFromCart = (invoiceId) => {
    setCart(cart.filter(i => i.id !== invoiceId));
  };

  // Calculer le total
  const calculateTotal = () => {
    return cart.reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
  };

  // Traiter le paiement
 const handlePayment = async () => {
  if (cart.length === 0) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Veuillez ajouter au moins une facture"
    });
    return;
  }

  try {
    const response = await api.post('/cash-receipts/payment', {
      invoice_ids: cart.map(i => i.id),
      payment_method: paymentMethod
    });

    const totalAmount = calculateTotal();

    toast({
      title: "Succès",
      description: `Paiement de ${totalAmount.toLocaleString()} FCFA enregistré`
    });

    // Réinitialiser le panier
    setCart([]);
    
    // Rafraîchir les stats
    await fetchCashRegisterStatus();

    // Proposer d'imprimer le reçu
    const shouldPrint = window.confirm(
      `Paiement enregistré avec succès !\n\nVoulez-vous imprimer le reçu client ?`
    );

    if (shouldPrint) {
      // Récupérer les IDs des transactions qui viennent d'être créées
      // (le backend devrait les retourner dans la réponse)
      if (response.data.data.transaction_ids) {
        await handlePrintClientReceipt(response.data.data.transaction_ids);
      }
    }

  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Erreur lors du paiement"
    });
  }
};

  // Clôturer la caisse
  const handleCloseCashRegister = async () => {
    try {
      await api.post('/cash-receipts/close', {
        notes: closeNotes
      });

      toast({
        title: "Succès",
        description: "Caisse clôturée avec succès"
      });

      setShowCloseModal(false);
      setCloseNotes('');
      setCashRegister(null);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Erreur lors de la clôture"
      });
    }
  };

  // Imprimer le reçu client
const handlePrintClientReceipt = async (transactionIds) => {
  try {
    const response = await api.post('/cash-receipts/client-receipt-pdf', {
      transaction_ids: transactionIds
    }, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Ouvrir dans un nouvel onglet pour impression
    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    
    window.URL.revokeObjectURL(url);

  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de générer le reçu"
    });
  }
};

const fetchEmployees = async () => {
  try {
    const response = await api.get('/cash-receipts/employees');
    setEmployees(response.data.data);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de récupérer la liste des employés"
    });
  }
};



  // Si en chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si la caisse n'est pas ouverte
  if (!cashRegister) {
  return (
    <>
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-100 rounded-full">
                <Lock className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Ouvrir la caisse</h2>
            <p className="text-gray-600">
              Veuillez ouvrir votre caisse pour commencer les encaissements de la journée
            </p>
            <Button onClick={() => setShowOpenModal(true)} className="w-full" size="lg">
              <Unlock className="mr-2 h-5 w-5" />
              Ouvrir la caisse
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal de sélection de la caissière */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sélectionner la caissière</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Qui sera la caissière aujourd'hui ?
              </label>
              
              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2" />
                  <p>Aucun employé actif trouvé</p>
                  <p className="text-sm">Veuillez d'abord ajouter des employés</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedEmployeeId === employee.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedEmployeeId(employee.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.job_title}
                          </div>
                        </div>
                        {selectedEmployeeId === employee.id && (
                          <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleOpenCashRegister}
              disabled={!selectedEmployeeId}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Ouvrir la caisse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

  // Interface principale de caisse
  return (
    <div className="space-y-6">
      {/* En-tête avec statut */}
      <Card className="bg-green-50 border-green-200">
  <div className="p-4">
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Unlock className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold text-green-800">
            Caisse ouverte
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-green-700">
          <span>Bon N° {cashRegister.receipt_number}</span>
          <span>•</span>
          {cashRegister.employee && ( // ✅ AJOUTER
            <>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {cashRegister.employee.first_name} {cashRegister.employee.last_name}
                {cashRegister.employee.job_title && ` (${cashRegister.employee.job_title})`}
              </span>
              <span>•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Ouvert depuis {format(new Date(cashRegister.opening_date), 'HH:mm', { locale: fr })}
          </span>
        </div>
      </div>
      <Button 
        variant="destructive" 
        onClick={() => setShowCloseModal(true)}
      >
        <Lock className="mr-2 h-4 w-4" />
        Clôturer la caisse
      </Button>
    </div>
  </div>
</Card>

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold">
                {cashRegister.stats?.total_transactions || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total encaissé</p>
              <p className="text-2xl font-bold">
                {parseFloat(cashRegister.expected_amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">FCFA</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Espèces</p>
              <p className="text-2xl font-bold">
                {parseFloat(cashRegister.cash_amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">FCFA</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mobile Money</p>
              <p className="text-2xl font-bold">
                {parseFloat(cashRegister.mobile_money_amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">FCFA</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone de recherche et panier */}
        <div className="space-y-4">
          {/* Recherche de factures */}
          <Card>
            <div className="p-4">
              <label className="text-sm font-medium mb-2 block">
                Rechercher une facture
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="N° facture, nom client, n° compteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
  <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
    {searchResults.map(invoice => (
      <div
        key={invoice.id}
        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
        onClick={() => addToCart(invoice)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="font-medium">{invoice.invoice_number}</div>
            <div className="text-sm text-gray-600">
              {invoice.meter?.user?.first_name} {invoice.meter?.user?.last_name}
            </div>
            {/* ✅ AJOUTER la période */}
            {invoice.start_date && invoice.end_date && (
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(invoice.start_date), 'dd/MM/yyyy', { locale: fr })} - {format(new Date(invoice.end_date), 'dd/MM/yyyy', { locale: fr })}
              </div>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="font-bold">
              {parseFloat(invoice.amount_due).toLocaleString()} FCFA
            </div>
            <div className="text-xs text-gray-500">
              {invoice.meter?.meter_number}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

            </div>
          </Card>

          {/* Panier */}
          <Card>
            <div className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Factures à encaisser
              </h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune facture ajoutée</p>
                  <p className="text-sm">Recherchez et ajoutez des factures</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
  {cart.map(invoice => (
    <div 
      key={invoice.id}
      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
    >
      <div className="flex-1">
        <div className="font-medium">{invoice.invoice_number}</div>
        <div className="text-sm text-gray-600">
          {invoice.meter?.user?.first_name} {invoice.meter?.user?.last_name}
        </div>
        <div className="text-xs text-gray-500">
          {invoice.meter?.meter_number}
        </div>
        {/* ✅ AJOUTER la période dans le panier */}
        {invoice.start_date && invoice.end_date && (
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(invoice.start_date), 'dd/MM/yyyy', { locale: fr })} - {format(new Date(invoice.end_date), 'dd/MM/yyyy', { locale: fr })}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="font-bold text-right">
          {parseFloat(invoice.amount_due).toLocaleString()}
          <span className="text-xs text-gray-500 ml-1">FCFA</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFromCart(invoice.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ))}
</div>
              )}
            </div>
          </Card>
        </div>

        {/* Zone de paiement */}
        <div className="space-y-4">
          {/* Mode de paiement */}
          <Card>
            <div className="p-4">
              <label className="text-sm font-medium mb-3 block">
                Mode de paiement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(method => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.value}
                      variant={paymentMethod === method.value ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod(method.value)}
                      className="justify-start"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {method.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Total et validation */}
          <Card>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-lg font-medium">TOTAL À ENCAISSER</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateTotal().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">FCFA</div>
                </div>
              </div>

              <Button
                className="w-full py-6 text-lg"
                onClick={handlePayment}
                disabled={cart.length === 0}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                ENCAISSER
              </Button>

              {cart.length > 0 && (
                <div className="text-sm text-gray-600 text-center">
                  {cart.length} facture{cart.length > 1 ? 's' : ''} • {
                    PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label
                  }
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de clôture */}
      <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clôturer la caisse</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  La caisse sera clôturée et vous ne pourrez plus effectuer d'encaissements 
                  jusqu'à l'ouverture d'une nouvelle caisse.
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Observations (optionnel)
              </label>
              <Textarea
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                placeholder="Ajoutez des remarques..."
                rows={3}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nombre de transactions :</span>
                <span className="font-medium">
                  {cashRegister.stats?.total_transactions || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total encaissé :</span>
                <span className="font-bold text-lg">
                  {parseFloat(cashRegister.expected_amount || 0).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCloseModal(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCloseCashRegister}
            >
              <Lock className="mr-2 h-4 w-4" />
              Clôturer la caisse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashRegisterSection;