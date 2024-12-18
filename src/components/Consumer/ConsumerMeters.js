import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { MapPin, Cloud, Droplet, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const ConsumerMeters = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicePricing, setServicePricing] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [metersResponse, pricingResponse] = await Promise.all([
        api.get('/meters/consumer'),
        api.get('/service-pricing/current')
      ]);
      setMeters(metersResponse.data.data);
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

  const renderConsumptionDetails = (consumption) => {
    if (!servicePricing || !consumption) return null;

    const { threshold, base_price, extra_price } = servicePricing;
    const baseConsumption = Math.min(consumption, threshold);
    const extraConsumption = Math.max(0, consumption - threshold);
    const baseAmount = baseConsumption * base_price;
    const extraAmount = extraConsumption * extra_price;
    const totalAmount = baseAmount + extraAmount;

    return (
      <div className="p-4 space-y-2 w-80">
        <div className="font-bold">Détails de facturation :</div>
        <div className="space-y-1">
          <div className="text-sm">
            Tranche 1 (jusqu'à {threshold} m³) :
            <div className="ml-2">
              {baseConsumption.toFixed(2)} m³ × {base_price} FCFA = {Math.round(baseAmount).toLocaleString()} FCFA
            </div>
          </div>
          {extraConsumption > 0 && (
            <div className="text-sm">
              Tranche 2 (au-delà de {threshold} m³) :
              <div className="ml-2">
                {extraConsumption.toFixed(2)} m³ × {extra_price} FCFA = {Math.round(extraAmount).toLocaleString()} FCFA
              </div>
            </div>
          )}
        </div>
        <div className="pt-2 border-t text-sm font-bold">
          Total : {Math.round(totalAmount).toLocaleString()} FCFA
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2081E2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Compteurs</h2>
        <Badge variant="outline" className="text-sm">
          Total: {meters.length} compteur{meters.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Compteur</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernier relevé</TableHead>
                <TableHead>Consommation du mois</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meters.map((meter) => {
                const lastReading = meter.readings?.[0];
                const consumption = lastReading ? parseFloat(lastReading.consumption) : 0;
                const amount = calculateAmount(consumption);

                return (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span>{meter.meter_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{meter.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={meter.type === 'iot' ? 'default' : 'secondary'}
                        className="flex items-center space-x-1 w-fit"
                      >
                        {meter.type === 'iot' && <Cloud className="h-3 w-3" />}
                        <span>{meter.type.toUpperCase()}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={meter.status === 'active' ? 'success' : 'destructive'}
                        className="w-fit"
                      >
                        {meter.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lastReading ? (
                        <div className="space-y-1">
                          <div className="font-medium">
                            {parseFloat(lastReading.reading_value).toFixed(2)} m³
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(lastReading.reading_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Aucun relevé</span>
                      )}
                    </TableCell>
                    <TableCell>
    {lastReading ? (
      <div className="space-y-1">
        <div className="font-medium flex items-center space-x-2">
          <span>{consumption.toFixed(2)} m³</span>
          <Popover>
            <PopoverTrigger>
              <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent>
              {renderConsumptionDetails(consumption)}
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm text-[#2081E2]">
          {Math.round(amount).toLocaleString()} FCFA
        </div>
      </div>
    ) : (
      <span className="text-gray-500">N/A</span>
    )}
  </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerMeters;