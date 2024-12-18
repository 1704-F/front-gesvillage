import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const StatCard = ({ title, thisMonth, lastMonth, evolution, unit, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[200px] mb-4" />
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          {typeof thisMonth === 'number' ? thisMonth.toLocaleString() : thisMonth} {unit}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-sm ${evolution > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {evolution > 0 ? (
              <ArrowUpIcon className="h-4 w-4 inline" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 inline" />
            )}
            {Math.abs(evolution)}%
          </div>
          <div className="text-sm text-gray-500">
            vs mois dernier ({typeof lastMonth === 'number' ? lastMonth.toLocaleString() : lastMonth} {unit})
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ConsumerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servicePricing, setServicePricing] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [dashboardResponse, pricingResponse] = await Promise.all([
        api.get('/dashboards/consumer'),
        api.get('/service-pricing/current')
      ]);
      setDashboardData(dashboardResponse.data);
      setServicePricing(pricingResponse.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAmount = (consumption) => {
    if (!servicePricing || !consumption) return 0;

    const { threshold, base_price, extra_price } = servicePricing;
    
    if (consumption <= threshold) {
      return consumption * base_price;
    }

    const baseAmount = threshold * base_price;
    const extraAmount = (consumption - threshold) * extra_price;
    return baseAmount + extraAmount;
  };

  const chartData = dashboardData?.yearlyData?.consumption 
    ? Object.entries(dashboardData.yearlyData.consumption).map(([month, consumption]) => ({
        name: month,
        consumption,
        montant: calculateAmount(consumption)
      }))
    : [];

  const ConsumptionTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const consumption = payload[0].value;
    const amount = calculateAmount(consumption);

    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p>Consommation: {consumption.toFixed(2)} m³</p>
        <p>Montant: {Math.round(amount).toLocaleString()} FCFA</p>
        {servicePricing && (
          <div className="text-xs text-gray-500 mt-2">
            <p>Prix de base: {servicePricing.base_price} FCFA/m³</p>
            <p>Prix majoré: {servicePricing.extra_price} FCFA/m³</p>
            <p>Seuil: {servicePricing.threshold} m³</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Consommation"
          thisMonth={dashboardData?.currentConsumption?.thisMonth}
          lastMonth={dashboardData?.currentConsumption?.lastMonth}
          evolution={dashboardData?.currentConsumption?.evolution}
          unit="m³"
          loading={loading}
        />
        <StatCard
          title="Factures"
          thisMonth={Math.round(calculateAmount(dashboardData?.currentConsumption?.thisMonth || 0))}
          lastMonth={Math.round(calculateAmount(dashboardData?.currentConsumption?.lastMonth || 0))}
          evolution={dashboardData?.invoiceAmount?.evolution}
          unit="FCFA"
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Évolution annuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis 
                  yAxisId="left" 
                  className="text-xs"
                  label={{ value: 'Consommation (m³)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  className="text-xs"
                  label={{ value: 'Montant (FCFA)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<ConsumptionTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="consumption"
                  stroke="#2563eb"
                  name="Consommation (m³)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="montant"
                  stroke="#16a34a"
                  name="Montant (FCFA)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerDashboard;