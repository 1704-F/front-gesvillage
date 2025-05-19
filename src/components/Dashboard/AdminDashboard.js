// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "../ui/card";
import { 
  DollarSign, 
  PieChart, 
  BarChart, 
  Clock, 
  CheckSquare, 
  XCircle, 
  FileText,
  Users,
  Activity,
  AlertCircle,
  TrendingUp,
  Droplet,
  Beaker,
  Gauge,
  Scissors,
  MapPin,
  Wrench,
  CreditCard,
  Archive,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { axiosPrivate as api } from '../../utils/axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
  // Gérer dateRange en interne
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date(); 
      date.setMonth(date.getMonth() - 1);
      date.setDate(1); 
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    new Date()
  ]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Utilisez useEffect avec dateRange comme dépendance
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Formater les dates pour l'API
      const start_date = format(dateRange[0], 'yyyy-MM-dd');
      const end_date = format(dateRange[1], 'yyyy-MM-dd');
      
      const response = await api.get('/dashboards/admin/enriched', {
        params: { startDate: start_date, endDate: end_date }
      });
      
      // Afficher les données de déconnexion pour débogage
      console.log('Données de déconnexion:', response.data.data.disconnection);
      
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };
  
  fetchDashboardData();
}, [dateRange]);



  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Erreur</h3>
        </div>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700">Veuillez sélectionner une période pour afficher les données.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

       {/* Header avec sélecteurs de date */}
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="date"
              className="pl-10 pr-3 py-2 border rounded-lg"
              value={dateRange[0] instanceof Date ? format(dateRange[0], 'yyyy-MM-dd') : ''}
              onChange={(e) => setDateRange([
                e.target.value ? new Date(e.target.value) : null,
                dateRange[1]
              ])}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="date"
              className="pl-10 pr-3 py-2 border rounded-lg"
              value={dateRange[1] instanceof Date ? format(dateRange[1], 'yyyy-MM-dd') : ''} 
              onChange={(e) => setDateRange([
                dateRange[0],
                e.target.value ? new Date(e.target.value) : null
              ])}
            />
            <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>


      {/* Section 1: Statistiques principales (déjà existantes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users}
          title="Total Consommateurs"
          value={data.consumersCount}
          color="blue"
        />
        <StatCard 
          icon={Activity}
          title="Compteurs Actifs"
          value={data.meters.active.length}
          color="green"
        />
        <StatCard 
          icon={AlertCircle}
          title="Compteurs Inactifs"
          value={data.meters.inactive.length}
          color="red"
        />
        <StatCard 
          icon={TrendingUp}
          title="Total Factures"
          value={data.invoices.length}
          color="purple"
        />
      </div>
      
      {/* Section 2: Bons de coupure */}
      <SectionCard title="Bons de coupure">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  <StatCard 
    icon={Scissors}
    title="Avis générés"
    value={data.disconnection.stats.generated || 0}
    subValue={`${data.disconnection.stats.unpaidCustomers || 0} clients concernés`}
    color="yellow"
  />
  <StatCard 
    icon={CheckSquare}
    title="Avis exécutés"
    value={data.disconnection.stats.executed || 0}
    subValue={`${(((data.disconnection.stats.executed || 0) / ((data.disconnection.stats.generated || 0) || 1)) * 100).toFixed(1)}% d'exécution`}
    color="orange"
  />
  <StatCard 
    icon={DollarSign}
    title="Montant total impayé"
    value={`${(data.disconnection.stats.unpaidAmount || 0).toLocaleString()} FCFA`}
    subValue={`dont ${(data.disconnection.stats.totalPenalties || 0).toLocaleString()} FCFA de pénalités`}
    color="red"
  />
</div>
        
       
       <div className="bg-gray-50 p-4 rounded-lg mb-4">
         <div className="flex items-start">
           <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
           <p className="text-gray-700">{data.disconnection.statusComment}</p>
         </div>
       </div>


       {data && data.disconnection && (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={[
        {name: 'Clients concernés', value: data.disconnection.stats.unpaidCustomers},
        {name: 'Factures impayées', value: data.disconnection.stats.unpaidInvoices},
        {name: 'Avis générés', value: data.disconnection.stats.generated},
        {name: 'Avis exécutés', value: data.disconnection.stats.executed}
      ]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#ff9800" />
      </RechartsBarChart>
    </ResponsiveContainer>
  </div>
)}
    
       
     </SectionCard>
     
     {/* Section 3: Répartition des compteurs */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Répartition par type de facturation */}
       <SectionCard title="Répartition par type de facturation">
         <div className="grid grid-cols-3 gap-4 mb-4">
           <StatItem 
             label="Standard" 
             value={`${data.meters.active.filter(m => m.billing_type === 'standard').length} compteurs`}
             color="blue-100"
           />
           <StatItem 
             label="Premium" 
             value={`${data.meters.active.filter(m => m.billing_type === 'premium').length} compteurs`}
             color="purple-100"
           />
           <StatItem 
             label="Gratuit" 
             value={`${data.meters.active.filter(m => m.billing_type === 'free').length} compteurs`}
             color="green-100"
           />
         </div>
         
         <div className="flex items-center h-56">
         <div className="w-1/2 h-full">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <Pie
        data={[
          {name: 'Standard', value: data.meters.active.filter(m => m.billing_type === 'standard').length},
          {name: 'Premium', value: data.meters.active.filter(m => m.billing_type === 'premium').length},
          {name: 'Gratuit', value: data.meters.active.filter(m => m.billing_type === 'free').length}
        ]}
        cx="50%"
        cy="50%"
        innerRadius={40}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        labelLine={false}
        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
      >
        {[
          {name: 'Standard', value: data.meters.active.filter(m => m.billing_type === 'standard').length},
          {name: 'Premium', value: data.meters.active.filter(m => m.billing_type === 'premium').length},
          {name: 'Gratuit', value: data.meters.active.filter(m => m.billing_type === 'free').length}
        ].map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </RechartsPieChart>
  </ResponsiveContainer>
</div>
           

           <div className="w-1/2 pl-4">
             <p className="text-gray-700 text-sm">
               La majorité des compteurs utilisent la tarification standard ({((data.meters.active.filter(m => m.billing_type === 'standard').length / data.meters.active.length) * 100).toFixed(1)}%).
               {data.meters.active.filter(m => m.billing_type === 'premium').length > 0 && 
                 ` Les compteurs premium représentent ${((data.meters.active.filter(m => m.billing_type === 'premium').length / data.meters.active.length) * 100).toFixed(1)}% du parc.`}
               {data.meters.active.filter(m => m.billing_type === 'free').length > 0 && 
                 ` ${data.meters.active.filter(m => m.billing_type === 'free').length} compteurs sont en mode gratuit (services publics ou sociaux).`}
             </p>
           </div>
         </div>
       </SectionCard>
       
       {/* Répartition par quartier */}
       <SectionCard title="Répartition par quartier">

       <div className="h-56">
  <ResponsiveContainer width="100%" height="100%">

  <RechartsBarChart
  data={(data?.waterQuality?.metersByQuartier || []).map(quartier => ({
    name: quartier.name || 'Non défini',
    value: parseInt(quartier.count)
  }))}
  layout="vertical"
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis dataKey="name" type="category" width={100} />
  <Tooltip />
  <Bar dataKey="value" fill="#4fc3f7" barSize={20} /> 
</RechartsBarChart>

  </ResponsiveContainer>
</div>
         
         <div className="bg-blue-50 p-4 rounded-lg mt-4">
           <div className="flex">
             <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
             <p className="text-gray-700 text-sm">

             {(() => {
   const quartiers = (data?.waterQuality?.metersByQuartier || [])
     .sort((a, b) => parseInt(b.count) - parseInt(a.count));
   
   if (quartiers.length === 0) {
     return "Aucune donnée disponible sur la répartition par quartier.";
   }
   
   const topQuartier = quartiers[0];
   return `Le quartier ${topQuartier.name} comprend le plus grand nombre de compteurs (${topQuartier.count}), représentant ${((parseInt(topQuartier.count) / data.meters.active.length) * 100).toFixed(1)}% du total.`;
})()}

             </p>
           </div>
         </div>
       </SectionCard>
     </div>
     
     {/* Section 4: Qualité de l'eau */}
     <SectionCard title="Qualité de l'Eau">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Analyses */}
         <div>
           <h3 className="text-lg font-medium mb-3 flex items-center">
             <Beaker className="h-5 w-5 mr-2 text-green-500" />
             Analyses d'eau
           </h3>
           
           <div className="grid grid-cols-3 gap-3 mb-4">
             <StatItem 
               label="Total analyses" 
               value={data.waterQuality.analyses.total}
               color="green-100"
             />
             <StatItem 
               label="Validées" 
               value={data.waterQuality.analyses.validated}
               color="green-200"
             />
             <StatItem 
               label="En attente" 
               value={data.waterQuality.analyses.pending}
               color="yellow-100"
             />
           </div>
           
           <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
             {data.waterQuality.analysisComment}
           </div>
         </div>
         
         {/* Pompage */}
         <div>
           <h3 className="text-lg font-medium mb-3 flex items-center">
             <Gauge className="h-5 w-5 mr-2 text-blue-500" />
             Suivi Pompage
           </h3>
           
           <div className="grid grid-cols-2 gap-3 mb-4">
             <StatItem 
               label="Volume total" 
               value={`${data.waterQuality.pumping.totalVolume.toFixed(1)} m³`}
               color="blue-100"
             />
             <StatItem 
               label="Volume moyen" 
               value={`${data.waterQuality.pumping.avgVolume.toFixed(1)} m³`}
               color="blue-200"
             />
           </div>
           
           <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
             {data.waterQuality.pumpingComment}
           </div>
         </div>
       </div>
     </SectionCard>
     
     {/* Section 5: Dépenses et Maintenances */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Dépenses */}
       <SectionCard title="Dépenses">
         <div className="grid grid-cols-3 gap-3 mb-4">
           <StatItem 
             label="Total" 
             value={`${data.expenses.stats.total.toLocaleString()} FCFA`}
             color="red-100"
           />
           <StatItem 
             label="Approuvées" 
             value={`${data.expenses.stats.totalApproved.toLocaleString()} FCFA`}
             color="green-100"
           />
           <StatItem 
             label="En attente" 
             value={`${data.expenses.stats.totalPending.toLocaleString()} FCFA`}
             color="yellow-100"
           />
         </div>
         
         <div className="h-64 mb-3">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsPieChart>
      <Pie
        data={data.expenses.categories}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="total"
      >
        {data.expenses.categories.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
    </RechartsPieChart>
  </ResponsiveContainer>
</div>
         
         <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
           {data.expenses.comment}
         </div>
       </SectionCard>
       
       {/* Maintenances */}
       <SectionCard title="Maintenances">
         <div className="grid grid-cols-3 gap-3 mb-4">
           <StatItem 
             label="Total" 
             value={data.maintenance.total}
             color="indigo-100"
           />
           <StatItem 
             label="Préventives" 
             value={data.maintenance.preventive.total}
             color="green-100"
           />
           <StatItem 
             label="Curatives" 
             value={data.maintenance.corrective.total}
             color="orange-100"
           />
         </div>
         
         <div className="flex items-center mb-2">
           <div className="text-sm font-medium mr-2">Taux de complétion:</div>
           <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
             <div 
               className="h-full bg-green-500 rounded-full" 
               style={{width: `${data.maintenance.completionRate}%`}}
             ></div>
           </div>
           <div className="ml-2 text-sm font-medium">{data.maintenance.completionRate.toFixed(1)}%</div>
         </div>
         
         <div className="h-44 mb-3">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsBarChart
      data={[
        {name: 'Préventives', pending: data.maintenance.preventive.pending, done: data.maintenance.preventive.done},
        {name: 'Curatives', pending: data.maintenance.corrective.pending, done: data.maintenance.corrective.done},
      ]}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="done" stackId="a" fill="#4CAF50" name="Terminées" />
      <Bar dataKey="pending" stackId="a" fill="#FFC107" name="En attente" />
    </RechartsBarChart>
  </ResponsiveContainer>
</div>
         
         <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
           {data.maintenance.comment}
         </div>
       </SectionCard>
     </div>
     
     {/* Section 6: Emprunts et Inventaire */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Emprunts */}
       <SectionCard title="Emprunts">
  <div className="grid grid-cols-2 gap-3 mb-4">
    <StatItem 
      label="Total emprunts" 
      value={data.loans.stats.totalLoans}
      subLabel={`${data.loans.stats.totalAmount.toLocaleString()} FCFA`}
      color="purple-100"
    />
    <StatItem 
      label="Montant restant" 
      value={`${data.loans.stats.remainingAmount.toLocaleString()} FCFA`}
      subLabel={`Taux: ${data.loans.stats.repaymentRate.toFixed(1)}%`}
      color="indigo-100"
    />
  </div>
  
  <div className="h-44 mb-3">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={[
            {name: 'Remboursé', value: data.loans.stats.totalAmount - data.loans.stats.remainingAmount},
            {name: 'Restant', value: data.loans.stats.remainingAmount}
          ]}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={60}
          fill="#8884d8"
          dataKey="value"
          labelLine={true}
          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          <Cell fill="#4CAF50" />
          <Cell fill="#FF9800" />
        </Pie>
        <Tooltip formatter={(value) => `${value.toLocaleString()} FCFA`} />
      </RechartsPieChart>
    </ResponsiveContainer>
  </div>
  
  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
    {data.loans.comment}
  </div>
</SectionCard>
       
       {/* Inventaire */}
       <SectionCard title="Gestion des Stocks">
         <div className="grid grid-cols-2 gap-3 mb-4">
           <StatItem 
             label="Total articles" 
             value={data.inventory.stats.totalItems}
             color="teal-100"
           />
           <StatItem 
             label="Stock faible" 
             value={data.inventory.stats.lowStockItems}
             subLabel={`${data.inventory.stats.lowStockPercentage.toFixed(1)}%`}
             color={data.inventory.stats.lowStockPercentage > 20 ? "red-100" : "yellow-100"}
           />
         </div>
         
         {data.inventory.lowStockItems.length > 0 && (
           <div className="mb-4">
             <h4 className="text-sm font-medium mb-2">Articles en stock faible:</h4>
             <div className="bg-yellow-50 p-3 rounded-lg">
               <ul className="text-sm text-amber-800 space-y-1">
                 {data.inventory.lowStockItems.map((item, index) => (
                   <li key={index} className="flex justify-between">
                     <span>{item.name} ({item.category})</span>
                     <span>
                       {item.quantity} / {item.alert_threshold}
                     </span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         )}

<div className="h-44 mb-3">
  <ResponsiveContainer width="100%" height="100%">
    <RechartsBarChart
      data={data.inventory.categories.slice(0, 5)}
      layout="vertical"
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="category" type="category" width={100} />
      <Tooltip />
      <Bar dataKey="items" fill="#009688" name="Nombre d'articles" />
    </RechartsBarChart>
  </ResponsiveContainer>
</div>
         
        
         
         <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
           {data.inventory.comment}
         </div>
       </SectionCard>
     </div>

   </div>
 );
};

// Composants utilitaires
const SectionCard = ({ title, children }) => (
 <Card className="p-5">
   <h2 className="text-xl font-bold mb-4">{title}</h2>
   {children}
 </Card>
);

const StatCard = ({ icon: Icon, title, value, subValue, color }) => (
 <Card className="p-4">
   <div className="flex items-start justify-between">
     <div className={`p-3 rounded-lg bg-${color}-100`}>
       <Icon className={`h-6 w-6 text-${color}-600`} />
     </div>
     <div className="text-right">
       <p className="text-sm text-gray-600">{title}</p>
       <h3 className="text-xl font-bold">{value}</h3>
       {subValue && (
         <p className="text-sm text-gray-500">{subValue}</p>
       )}
     </div>
   </div>
 </Card>
);

const StatItem = ({ label, value, subLabel, color }) => (
 <div className={`bg-${color} p-3 rounded-lg`}>
   <div className="text-xs text-gray-600">{label}</div>
   <div className="text-lg font-semibold">{value}</div>
   {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
 </div>
);

export default AdminDashboard;
