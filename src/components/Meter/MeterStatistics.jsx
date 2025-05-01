// src/components/meters/MeterStatistics.jsx
import React from 'react';
import { Card } from "../ui/card";
import { 
  Activity, 
  Check, 
  XCircle, 
  MapPin, 
  Database, 
  Tag,
  CreditCard,
  TrendingUp,
  Clock
} from 'lucide-react';

const MeterStatistics = ({ statistics }) => {
  if (!statistics) return null;
  
  // Récupérer les données des types de facturation
  const getBillingTypeCount = (type) => {
    const found = statistics.metersByBillingType?.find(item => item.billing_type === type);
    return found ? parseInt(found.count) : 0;
  };
  
  const standardMeters = getBillingTypeCount('standard');
  const premiumMeters = getBillingTypeCount('premium');
  const freeMeters = getBillingTypeCount('free');
  
  // Formater les nombres avec séparateurs de milliers
  const formatNumber = (num) => {
    return num.toLocaleString();
  };
  
  return (
    <div className="mb-6">
      {/* Première ligne - Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-4">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total des compteurs</h3>
              <p className="text-2xl font-bold">{formatNumber(statistics.totalMeters || 0)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Compteurs actifs</h3>
              <p className="text-2xl font-bold">{formatNumber(statistics.activeMeters || 0)}</p>
              <p className="text-sm text-gray-500">
                {statistics.totalMeters > 0 
                  ? `${((statistics.activeMeters / statistics.totalMeters) * 100).toFixed(1)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Compteurs inactifs</h3>
              <p className="text-2xl font-bold">{formatNumber(statistics.inactiveMeters || 0)}</p>
              <p className="text-sm text-gray-500">
                {statistics.totalMeters > 0 
                  ? `${((statistics.inactiveMeters / statistics.totalMeters) * 100).toFixed(1)}%` 
                  : '0%'}
              </p>
            </div>
          </div>
        </Card>
        
        
      </div>
      
      {/* Deuxième ligne - Répartition par catégories 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
            Répartition par type de facturation
          </h3>
          <div className="max-h-[200px] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-32 font-medium">Standard</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ 
                        width: `${statistics.totalMeters > 0 
                          ? (standardMeters / statistics.totalMeters) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  {standardMeters} ({statistics.totalMeters > 0 
                    ? ((standardMeters / statistics.totalMeters) * 100).toFixed(1) 
                    : 0}%)
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-32 font-medium">Premium</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ 
                        width: `${statistics.totalMeters > 0 
                          ? (premiumMeters / statistics.totalMeters) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  {premiumMeters} ({statistics.totalMeters > 0 
                    ? ((premiumMeters / statistics.totalMeters) * 100).toFixed(1) 
                    : 0}%)
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-32 font-medium">Gratuit</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ 
                        width: `${statistics.totalMeters > 0 
                          ? (freeMeters / statistics.totalMeters) * 100 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  {freeMeters} ({statistics.totalMeters > 0 
                    ? ((freeMeters / statistics.totalMeters) * 100).toFixed(1) 
                    : 0}%)
                </div>
              </div>
            </div>
          </div>
        </Card>
        
 
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-500" />
            Répartition par quartier
          </h3>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Quartier</th>
                  <th className="pb-2 text-right">Compteurs</th>
                  <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {statistics.metersByQuartier && statistics.metersByQuartier.length > 0 ? (
                  statistics.metersByQuartier.map((quartier, index) => (
                    <tr key={quartier.id || index} className="border-b">
                      <td className="py-2">{quartier.name || 'Non assigné'}</td>
                      <td className="py-2 text-right">{parseInt(quartier.count) || 0}</td>
                      <td className="py-2 text-right">
                        {statistics.totalMeters > 0 
                          ? ((parseInt(quartier.count) / statistics.totalMeters) * 100).toFixed(1) 
                          : 0}%
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
        
    
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-green-500" />
            Répartition par type de compteur
          </h3>
          <div className="max-h-[200px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Compteurs</th>
                  <th className="pb-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {statistics.metersByType && statistics.metersByType.length > 0 ? (
                  statistics.metersByType.map((type, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{type.type || 'Non défini'}</td>
                      <td className="py-2 text-right">{parseInt(type.count) || 0}</td>
                      <td className="py-2 text-right">
                        {statistics.totalMeters > 0 
                          ? ((parseInt(type.count) / statistics.totalMeters) * 100).toFixed(1) 
                          : 0}%
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
        
      </div>
*/}

    </div>
  );
};

export default MeterStatistics;