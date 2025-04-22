// components/salaries/SalaryStatistics.js
import React from 'react';
import { Card } from "../ui/card"; 
import { 
  Users, 
  DollarSign, 
  BadgePercent, 
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const StatCard = ({ title, value, icon, description, variant }) => {
  const colorVariants = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };
  
  const colorClass = colorVariants[variant || "default"];
  
  
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
      
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-2 rounded-full ${colorClass}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const SalaryStatistics = ({ statistics }) => { 
  if (!statistics) return null;
  
  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString() + ' FCFA';
  };
  
  // Déterminer les icônes et variantes pour l'évolution mensuelle
  const differenceIcon = statistics.monthly_difference >= 0 ? 
    <TrendingUp className="w-5 h-5" /> : 
    <TrendingDown className="w-5 h-5" />;
  
  const differenceVariant = statistics.monthly_difference > 5 ? 
    "warning" : statistics.monthly_difference < 0 ? "success" : "default";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
      <StatCard 
        title="Masse salariale"
        value={formatAmount(statistics.total_amount)}
        icon={<DollarSign className="w-5 h-5" />}
        variant="default"
        description={`${statistics.current_month}/${statistics.current_year}`}
      />
      
      <StatCard 
        title="Employés actifs"
        value={statistics.employee_count}
        icon={<Users className="w-5 h-5" />}
        variant="default"
        description={`${statistics.contract_types.find(t => t.type === 'salary')?.count || 0} salariés, ${statistics.contract_types.find(t => t.type === 'hourly')?.count || 0} horaires`}
      />
      
      <StatCard 
        title="Salaire moyen"
        value={formatAmount(statistics.average_salary)}
        icon={<BadgePercent className="w-5 h-5" />}
        variant="default"
      />
      
      <StatCard 
        title="Statut des paiements"
        value={`${statistics.payment_status.paid} payés`}
        icon={statistics.payment_status.pending > 0 ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        variant={statistics.payment_status.pending > 0 ? "warning" : "success"}
        description={statistics.payment_status.pending > 0 ? `${statistics.payment_status.pending} en attente` : "Tous les salaires sont payés"}
      />
      
      {statistics.monthly_difference !== 0 && (
        <StatCard 
          title="Évolution mensuelle"
          value={`${statistics.monthly_difference > 0 ? '+' : ''}${statistics.monthly_difference.toFixed(2)}%`}
          icon={differenceIcon}
          variant={differenceVariant}
          description="Par rapport au mois précédent"
        />
      )}
    </div>
  );
};

export default SalaryStatistics;