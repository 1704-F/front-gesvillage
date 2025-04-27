// src/components/inventory/StatsTab.jsx
import React from 'react';
import { Card } from "../ui/card";
import { 
  AlertTriangle, 
  Calendar, 
  TrendingDown, 
  Package,
  BarChart,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const StatsTab = ({ stats }) => {
  if (!stats) {
    return <div className="text-center py-6">Chargement des statistiques...</div>;
  }

  const { categoryCounts, lowStockItems, nearExpiryItems, recentMovements } = stats;

  // Calculer la valeur totale du stock
  const totalValue = categoryCounts.reduce((sum, category) => {
    return sum + (parseFloat(category.totalValue) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Résumé du stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Package className="w-4 h-4 mr-2 text-blue-500" /> 
            Total des articles
          </h3>
          <div className="text-2xl font-bold">
            {categoryCounts.reduce((sum, cat) => sum + parseInt(cat.itemCount || 0), 0)}
          </div>
        </Card>

        <Card className="p-4 flex flex-col"> 
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-green-500" /> 
            Valeur du stock
          </h3>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(totalValue)}
          </div>
        </Card>

        <Card className="p-4 flex flex-col">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> 
            Articles en alerte stock
          </h3>
          <div className="text-2xl font-bold">
            {lowStockItems.length}
          </div>
        </Card>

        <Card className="p-4 flex flex-col">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-red-500" /> 
            Expirations proches
          </h3>
          <div className="text-2xl font-bold">
            {nearExpiryItems.length}
          </div>
        </Card>
      </div>

      {/* Stock par catégorie */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <BarChart className="w-5 h-5 mr-2" /> 
          Inventaire par catégorie
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">Catégorie</th>
                <th className="text-center py-2 font-medium">Nombre d'articles</th>
                <th className="text-center py-2 font-medium">Quantité totale</th>
                <th className="text-right py-2 font-medium">Valeur</th>
              </tr>
            </thead>
            <tbody>
              {categoryCounts.map((category, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{category.category?.name || 'Non catégorisé'}</td>
                  <td className="py-2 text-center">{category.itemCount}</td>
                  <td className="py-2 text-center">{parseFloat(category.totalQuantity || 0).toFixed(2)}</td>
                  <td className="py-2 text-right">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(category.totalValue || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Articles en alerte stock */}
      {lowStockItems.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-amber-500" /> 
            Articles en alerte de stock
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Article</th>
                  <th className="text-left py-2 font-medium">Catégorie</th>
                  <th className="text-center py-2 font-medium">Quantité actuelle</th>
                  <th className="text-center py-2 font-medium">Seuil d'alerte</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2">{item.category?.name || 'Non catégorisé'}</td>
                    <td className="py-2 text-center">
                      <span className={parseFloat(item.quantity) <= 0 ? "text-red-600 font-bold" : "text-amber-600 font-medium"}>
                        {parseFloat(item.quantity).toFixed(2)} {item.unit}
                      </span>
                    </td>
                    <td className="py-2 text-center">{parseFloat(item.alert_threshold).toFixed(2)} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Articles proches de la date d'expiration */}
      {nearExpiryItems.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-red-500" /> 
            Articles proches de la date d'expiration
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Article</th>
                  <th className="text-left py-2 font-medium">Catégorie</th>
                  <th className="text-center py-2 font-medium">Quantité</th>
                  <th className="text-center py-2 font-medium">Date d'expiration</th>
                  <th className="text-center py-2 font-medium">Jours restants</th>
                </tr>
              </thead>
              <tbody>
                {nearExpiryItems.map((item) => {
                  const expiryDate = new Date(item.expiration_date);
                  const today = new Date();
                  const diffTime = expiryDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 font-medium">{item.name}</td>
                      <td className="py-2">{item.category?.name || 'Non catégorisé'}</td>
                      <td className="py-2 text-center">{parseFloat(item.quantity).toFixed(2)} {item.unit}</td>
                      <td className="py-2 text-center">
                        {format(expiryDate, 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="py-2 text-center">
                        <span className={
                          diffDays <= 7 ? "text-red-600 font-bold" : 
                          diffDays <= 14 ? "text-amber-600 font-medium" : 
                          "text-amber-500"
                        }>
                          {diffDays} jours
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Mouvements récents */}
      {recentMovements.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Mouvements récents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Article</th>
                  <th className="text-center py-2 font-medium">Quantité</th>
                  <th className="text-left py-2 font-medium">Responsable</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((movement) => (
                  <tr key={movement.id} className="border-b">
                    <td className="py-2">
                      {format(new Date(movement.movement_date), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="py-2">
                      {movement.movement_type === 'in' ? 
                        <span className="text-green-600">Entrée</span> : 
                        <span className="text-amber-600">Sortie</span>
                      }
                    </td>
                    <td className="py-2 font-medium">{movement.item?.name || 'N/A'}</td>
                    <td className="py-2 text-center">
                      {parseFloat(movement.quantity).toFixed(2)} {movement.item?.unit || ''}
                    </td>
                    <td className="py-2">
                      {movement.employee ? 
                        `${movement.employee.first_name} ${movement.employee.last_name}` : 
                        'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatsTab;