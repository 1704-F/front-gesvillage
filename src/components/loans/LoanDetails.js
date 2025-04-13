import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  DollarSign, 
  Clock, 
  Download, 
  PlusCircle, 
  UsersIcon,
  FileText,
  AlertCircle
} from 'lucide-react';

const LoanDetails = ({ isOpen, onClose, loan, onAddRepayment, onDownloadAttachment, onMarkAsDefaulted }) => {
  if (!loan) return null;
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  const formatStatus = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'active': 'En cours',
      'completed': 'Terminé',
      'defaulted': 'Défaillant'
    };
    return statusMap[status] || status;
  };

  const statusVariant = (status) => {
    const variantMap = {
      'pending': 'warning',
      'active': 'default',
      'completed': 'success',
      'defaulted': 'destructive'
    };
    return variantMap[status] || 'default';
  };

  const formatPaymentMethod = (method) => {
    const methodMap = {
      'cash': 'Espèces',
      'bank': 'Virement bancaire',
      'cheque': 'Chèque',
      'mobile': 'Mobile Money'
    };
    return methodMap[method] || method;
  };

  const formatResponsibleRole = (role) => {
    const roleMap = {
      'manager': 'Gestionnaire',
      'guarantor': 'Garant',
      'processor': 'Opérateur'
    };
    return roleMap[role] || role;
  };

  const calculateProgress = () => {
    if (!loan.amount) return 0;
    const totalRepaid = loan.amount - loan.remaining_amount;
    return Math.min(100, Math.round((totalRepaid / loan.amount) * 100));
  };

  const progress = calculateProgress();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Détails de l'emprunt</span>
            <Badge variant={statusVariant(loan.status)}>
              {formatStatus(loan.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations principales */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{loan.lender}</h3>
                <p className="text-gray-600">{loan.purpose}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{parseFloat(loan.amount).toLocaleString()} FCFA</div>
                <div className="text-sm text-gray-600">
                  {loan.interest_rate > 0 ? `Taux d'intérêt: ${loan.interest_rate}%` : 'Sans intérêts'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    loan.status === 'completed' ? 'bg-green-600' : 
                    loan.status === 'defaulted' ? 'bg-red-600' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-sm">
                <span>{progress}% remboursé</span>
                <span>Restant: {parseFloat(loan.remaining_amount).toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p>{formatDate(loan.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date d'échéance</p>
                <p>{formatDate(loan.due_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mode de paiement</p>
                <p>{formatPaymentMethod(loan.payment_method)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Autorisé par</p>
                <p>{loan.authorizedBy ? `${loan.authorizedBy.first_name} ${loan.authorizedBy.last_name}` : '—'}</p>
              </div>
            </div>

            {loan.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="whitespace-pre-line">{loan.description}</p>
              </div>
            )}
          </Card>

          {/* Responsables */}
          {loan.responsibles && loan.responsibles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                Responsables
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Rôle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.responsibles.map((responsible) => (
                      <TableRow key={responsible.id}>
                        <TableCell>{responsible.first_name} {responsible.last_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {formatResponsibleRole(responsible.LoanResponsible?.role)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* Remboursements */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Remboursements
              </h3>
              {(loan.status === 'pending' || loan.status === 'active') && (
                <Button onClick={onAddRepayment} size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              )}
            </div>

            <Card>
              {loan.repayments && loan.repayments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Traité par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.repayments.map((repayment) => (
                      <TableRow key={repayment.id}>
                        <TableCell>{formatDate(repayment.date)}</TableCell>
                        <TableCell className="font-medium">
                          {parseFloat(repayment.amount).toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{formatPaymentMethod(repayment.payment_method)}</TableCell>
                        <TableCell>{repayment.reference || '—'}</TableCell>
                        <TableCell>
                          {repayment.processedBy 
                            ? `${repayment.processedBy.first_name} ${repayment.processedBy.last_name}` 
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Aucun remboursement enregistré
                </div>
              )}
            </Card>
          </div>

          {/* Pièces jointes */}
          {loan.attachments && loan.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Pièces jointes
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom du fichier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Taille</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loan.attachments.map((attachment) => (
                      <TableRow key={attachment.id}>
                        <TableCell>{attachment.file_name}</TableCell>
                        <TableCell>{attachment.file_type}</TableCell>
                        <TableCell>
                          {(attachment.file_size / 1024).toFixed(2)} KB
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDownloadAttachment(attachment.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {(loan.status === 'pending' || loan.status === 'active') && (
              <Button 
                variant="destructive" 
                onClick={onMarkAsDefaulted}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Marquer comme défaillant
              </Button>
            )}
          </div>
          <Button onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetails;