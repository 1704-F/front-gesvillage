import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import moment from 'moment';
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const getNestedValue = (obj, path) => {
  if (!path) return obj;
  if (Array.isArray(path)) {
    return path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  return obj[path];
};

const ConsumerConsumption = () => {
  const [consumption, setConsumption] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(6, 'months').toDate(),
    to: moment().toDate()
  });
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicePricing, setServicePricing] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchConsumption();
  }, [selectedMeter, dateRange]);

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

  const fetchConsumption = async () => {
    try {
      setLoading(true);
      const response = await api.get('/readings/consumer', {
        params: {
          meter_id: selectedMeter !== 'all' ? selectedMeter : undefined,
          start_date: moment(dateRange.from).format('YYYY-MM-DD'),
          end_date: moment(dateRange.to).format('YYYY-MM-DD')
        }
      });
      
      const processedData = response.data.data.map(reading => ({
        ...reading,
        calculatedAmount: calculateAmount(parseFloat(reading.consumption))
      }));
      setConsumption(processedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des consommations:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
  
    // Extraire les valeurs du payload
    const consumptionData = payload.find(p => p.dataKey === 'consumption');
    const amountData = payload.find(p => p.dataKey === 'calculatedAmount');
  
    // Convertir en nombres avec valeurs par défaut
    const consumption = parseFloat(consumptionData?.value || 0);
    const amount = parseFloat(amountData?.value || 0);
  
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-bold">{moment(label).format('DD/MM/YYYY')}</p>
        <div className="space-y-1">
          <p>Consommation: {consumption.toFixed(2)} m³</p>
          <p>Montant: {Math.round(amount).toLocaleString()} FCFA</p>
        </div>
        {servicePricing && (
          <div className="text-xs text-gray-500 mt-2 space-y-0.5">
            <div>Tarification:</div>
            <div className="ml-2">
              <div>• {servicePricing.base_price} FCFA/m³ jusqu'à {servicePricing.threshold} m³</div>
              <div>• {servicePricing.extra_price} FCFA/m³ au-delà de {servicePricing.threshold} m³</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'reading_date',
      key: 'reading_date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Compteur',
      dataIndex: ['meter', 'meter_number'],
      key: 'meter',
    },
    {
      title: 'Ancien Index',
      dataIndex: 'last_reading_value',
      key: 'last_reading_value',
      render: (value) => parseFloat(value).toFixed(2),
    },
    {
      title: 'Nouvel Index',
      dataIndex: 'reading_value',
      key: 'reading_value',
      render: (value) => parseFloat(value).toFixed(2),
    },
    {
      title: 'Consommation (m³)',
      dataIndex: 'consumption',
      key: 'consumption',
      render: (value) => parseFloat(value).toFixed(2),
    },
    {
      title: 'Montant (FCFA)',
      dataIndex: 'calculatedAmount',
      key: 'calculatedAmount',
      render: (value) => Math.round(value).toLocaleString(),
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Suivi des Consommations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="w-72">
              <Select value={selectedMeter} onValueChange={setSelectedMeter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un compteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les compteurs</SelectItem>
                  {meters.map(meter => (
                    <SelectItem key={meter.id} value={meter.id}>
                      {meter.meter_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="h-[400px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
<LineChart
  data={consumption}
  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
  <XAxis 
    dataKey="reading_date" 
    tickFormatter={(date) => moment(date).format('MM/YYYY')} 
    className="text-xs"
  />
  <YAxis className="text-xs" />
  <Tooltip content={<CustomTooltip />} />
  <Legend />
  <Line 
    type="monotone" 
    dataKey="consumption" 
    stroke="#2563eb" 
    name="Consommation (m³)"
    strokeWidth={2} 
  />
  <Line 
    type="monotone" 
    dataKey="calculatedAmount" 
    stroke="#16a34a" 
    name="Montant (FCFA)"
    strokeWidth={2} 
  />
</LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.title}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumption.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={`${item.id}-${column.key}`}>
                        {column.render 
                          ? column.render(getNestedValue(item, column.dataIndex))
                          : getNestedValue(item, column.dataIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerConsumption;