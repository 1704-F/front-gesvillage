// src/components/expenses/ExpenseStatistics.jsx
import React from 'react';
import { Card } from "../ui/card";
import { DollarSign, PieChart, BarChart, Clock, CheckSquare, XCircle, FileText  } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ExpenseStatistics = ({ statistics }) => {
  if (!statistics) return null;
  
  // Formatage des données de catégories pour faciliter l'affichage
  const categoryData = statistics.byCategory?.map(cat => ({
    name: cat.category?.name || 'Non catégorisé',
    amount: parseFloat(cat.total) || 0
  })) || [];
  
  // Données de statut formatées
  const statusData = {};
  statistics.byStatus?.forEach(stat => {
    statusData[stat.status] = {
      count: parseInt(stat.count) || 0,
      total: parseFloat(stat.total) || 0
    };
  });
  
  // Total par statut
  const pendingAmount = statusData.pending?.total || 0;
  const approvedAmount = statusData.approved?.total || 0;
  const rejectedAmount = statusData.rejected?.total || 0;
  
  // Calcul du total si la donnée totalAmount est absente
  const totalAmount = statistics.totalAmount || pendingAmount + approvedAmount + rejectedAmount;
  
  return (
    <div className="mb-6">
      {/* Première ligne de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total des dépenses</h3>
              <p className="text-2xl font-bold">{parseFloat(totalAmount).toLocaleString()} FCFA</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">En attente</h3>
              <p className="text-2xl font-bold">{parseFloat(pendingAmount).toLocaleString()} FCFA</p>
              <p className="text-sm text-gray-500">{statusData.pending?.count || 0} dépense(s)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-4">
              <CheckSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Approuvées</h3>
              <p className="text-2xl font-bold">{parseFloat(approvedAmount).toLocaleString()} FCFA</p>
              <p className="text-sm text-gray-500">{statusData.approved?.count || 0} dépense(s)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
  <div className="flex items-center">
    <div className="p-2 bg-purple-100 rounded-full mr-4">
      <FileText className="h-6 w-6 text-purple-600" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">Nombre de dépenses</h3>
      <p className="text-2xl font-bold">
        {(statusData.pending?.count || 0) + (statusData.approved?.count || 0)}
      </p>
      <p className="text-sm text-gray-500">
        {statusData.pending?.count || 0} en attente, {statusData.approved?.count || 0} approuvées
      </p>
    </div>
  </div>
</Card>

      </div>
      
      {/* Deuxième ligne pour les catégories et tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Répartition par catégorie */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3">Répartition par catégorie</h3>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Catégorie</th>
                  <th className="pb-2 text-right">Montant</th>
                  <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.length > 0 ? (
                  categoryData.map((cat, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{cat.name}</td>
                      <td className="py-2 text-right">{cat.amount.toLocaleString()} FCFA</td>
                      <td className="py-2 text-right">
                        {totalAmount > 0 ? ((cat.amount / totalAmount) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        
        {/* Tendance mensuelle */}
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3">Tendance mensuelle</h3>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Mois</th>
                  <th className="pb-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {statistics.monthlyTrend && statistics.monthlyTrend.length > 0 ? (
                  statistics.monthlyTrend.map((month, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {format(new Date(month.month), 'MMMM yyyy', { locale: fr })}
                      </td>
                      <td className="py-2 text-right">
                        {parseFloat(month.total).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="py-2 text-center text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseStatistics;