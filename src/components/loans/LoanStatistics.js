//components/loans/LoanStatistics.js
import React from 'react';
import { Card } from "../ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle2
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

const LoanStatistics = ({ statistics }) => {
  if (!statistics) return null;
  
  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString() + ' FCFA';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Total emprunté"
        value={formatAmount(statistics.total_borrowed)}
        icon={<TrendingUp className="w-5 h-5" />}
        variant="default"
      />
      
      <StatCard 
        title="Restant à rembourser"
        value={formatAmount(statistics.total_remaining)}
        icon={<TrendingDown className="w-5 h-5" />}
        variant={statistics.total_remaining > 0 ? "default" : "success"}
        description={`${statistics.status_distribution.find(s => s.status === 'completed')?.count || 0} emprunts terminés`}
      />
      
      <StatCard 
        title="Emprunts actifs"
        value={statistics.status_distribution.find(s => s.status === 'active')?.count || 0}
        icon={<Clock className="w-5 h-5" />}
        variant="default"
        description="En cours de remboursement"
      />
      
      <StatCard 
        title="Emprunts en retard"
        value={statistics.overdue_loans}
        icon={<AlertTriangle className="w-5 h-5" />}
        variant={statistics.overdue_loans > 0 ? "danger" : "success"}
        description={statistics.overdue_loans > 0 
          ? `${statistics.risky_loans} à échéance proche` 
          : "Aucun emprunt en retard"
        }
      />
    </div>
  );
};

export default LoanStatistics;