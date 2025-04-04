// src/components/analytics/HistoricalBalanceSheetList.jsx
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2, Filter, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "../ui/toast/use-toast";
import { axiosPrivate as api } from '../../utils/axios';

const HistoricalBalanceSheetList = ({ onRefresh }) => {
 const { toast } = useToast();
 const [loading, setLoading] = useState(true);
 const [data, setData] = useState([]);
 const [deleteId, setDeleteId] = useState(null);
 const [showDeleteDialog, setShowDeleteDialog] = useState(false);
 const [showDetailDialog, setShowDetailDialog] = useState(false);
 const [selectedSheet, setSelectedSheet] = useState(null);

 useEffect(() => {
   fetchBalanceSheets();
 }, [onRefresh]);

 const fetchBalanceSheets = async () => {
   try {
     setLoading(true);
     const response = await api.get('/historical-balance-sheets');
     setData(response.data.data);
   } catch (error) {
     console.error('Erreur lors de la récupération des bilans:', error);
     toast({
       variant: "destructive",
       title: "Erreur",
       description: "Impossible de récupérer les bilans historiques"
     });
   } finally {
     setLoading(false);
   }
 };

 const initiateDelete = (id) => {
   setDeleteId(id);
   setShowDeleteDialog(true);
 };

 const confirmDelete = async () => {
   try {
     await api.delete(`/historical-balance-sheets/${deleteId}`);
     toast({
       title: "Succès",
       description: "Bilan historique supprimé avec succès"
     });
     fetchBalanceSheets();
   } catch (error) {
     console.error('Erreur lors de la suppression:', error);
     toast({
       variant: "destructive",
       title: "Erreur",
       description: "Impossible de supprimer le bilan"
     });
   } finally {
     setShowDeleteDialog(false);
     setDeleteId(null);
   }
 };
 
 const showDetails = (sheet) => {
   setSelectedSheet(sheet);
   setShowDetailDialog(true);
 };

 const formatAmount = (amount) => {
   return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
 };

 if (loading && data.length === 0) {
   return (
     <div className="flex justify-center p-6">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
     </div>
   );
 }

 return (
   <div>
     {data.length === 0 ? (
       <div className="text-center py-6 text-gray-500">
         Aucun bilan historique trouvé
       </div>
     ) : (
       <Table>
         <TableHeader>
           <TableRow>
             <TableHead>Période</TableHead>
             <TableHead>Total Actifs</TableHead>
             <TableHead>Total Passifs</TableHead>
             <TableHead>Créé par</TableHead>
             <TableHead>Date de création</TableHead>
             <TableHead className="text-right">Actions</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {data.map((item) => {
             const totalAssets = parseFloat(item.accounts_receivable) + 
                               parseFloat(item.cash_and_bank) + 
                               parseFloat(item.other_assets);
             
             const totalLiabilities = parseFloat(item.accounts_payable) + 
                                    parseFloat(item.loans) + 
                                    parseFloat(item.other_liabilities);
             
             return (
               <TableRow key={item.id}>
                 <TableCell>
                   {format(new Date(item.period_start), 'dd/MM/yyyy')} - 
                   {format(new Date(item.period_end), 'dd/MM/yyyy')}
                 </TableCell>
                 <TableCell>{formatAmount(totalAssets)}</TableCell>
                 <TableCell>{formatAmount(totalLiabilities)}</TableCell>
                 <TableCell>
                   {item.creator ? 
                     `${item.creator.first_name} ${item.creator.last_name}` : 
                     'N/A'}
                 </TableCell>
                 <TableCell>
                   {format(new Date(item.created_at), 'dd/MM/yyyy')}
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                     <Button variant="outline" size="sm" onClick={() => showDetails(item)}>
                       <Info className="h-4 w-4" />
                     </Button>
                     <Button variant="destructive" size="sm" onClick={() => initiateDelete(item.id)}>
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </TableCell>
               </TableRow>
             );
           })}
         </TableBody>
       </Table>
     )}
     
     {/* Dialogue de confirmation de suppression */}
     {showDeleteDialog && (
       <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
           <h3 className="text-lg font-medium mb-4">Confirmation de suppression</h3>
           <p className="mb-6 text-gray-600">Êtes-vous sûr de vouloir supprimer ce bilan historique ? Cette action est irréversible.</p>
           <div className="flex justify-end space-x-4">
             <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
               Annuler
             </Button>
             <Button variant="destructive" onClick={confirmDelete}>
               Supprimer
             </Button>
           </div>
         </div>
       </div>
     )}
     
     {/* Dialogue de détails */}
     {showDetailDialog && selectedSheet && (
       <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
         <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
           <h3 className="text-lg font-medium mb-4">Détails du Bilan</h3>
           
           <div className="mb-4">
             <p className="text-sm text-gray-600">Période: {format(new Date(selectedSheet.period_start), 'dd/MM/yyyy')} - {format(new Date(selectedSheet.period_end), 'dd/MM/yyyy')}</p>
             <p className="text-sm text-gray-600">Créé par: {selectedSheet.creator ? `${selectedSheet.creator.first_name} ${selectedSheet.creator.last_name}` : 'N/A'}</p>
             <p className="text-sm text-gray-600">Date de création: {format(new Date(selectedSheet.created_at), 'dd/MM/yyyy')}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
             <div>
               <h4 className="font-medium mb-2">Actifs</h4>
               <table className="min-w-full">
                 <tbody>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Créances clients</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.accounts_receivable)}</td>
                   </tr>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Trésorerie</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.cash_and_bank)}</td>
                   </tr>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Autres actifs</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.other_assets)}</td>
                   </tr>
                   <tr className="font-semibold">
                     <td className="py-2">Total Actifs</td>
                     <td className="py-2 text-right">{formatAmount(
                       parseFloat(selectedSheet.accounts_receivable) + 
                       parseFloat(selectedSheet.cash_and_bank) + 
                       parseFloat(selectedSheet.other_assets)
                     )}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
             
             <div>
               <h4 className="font-medium mb-2">Passifs</h4>
               <table className="min-w-full">
                 <tbody>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Dettes fournisseurs</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.accounts_payable)}</td>
                   </tr>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Emprunts</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.loans)}</td>
                   </tr>
                   <tr className="border-b">
                     <td className="py-2 text-gray-600">Autres passifs</td>
                     <td className="py-2 text-right">{formatAmount(selectedSheet.other_liabilities)}</td>
                   </tr>
                   <tr className="font-semibold">
                     <td className="py-2">Total Passifs</td>
                     <td className="py-2 text-right">{formatAmount(
                       parseFloat(selectedSheet.accounts_payable) + 
                       parseFloat(selectedSheet.loans) + 
                       parseFloat(selectedSheet.other_liabilities)
                     )}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>
           
           {selectedSheet.notes && (
             <div className="mb-6">
               <h4 className="font-medium mb-2">Notes</h4>
               <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedSheet.notes}</p>
             </div>
           )}
           
           <div className="flex justify-end">
             <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
               Fermer
             </Button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default HistoricalBalanceSheetList;