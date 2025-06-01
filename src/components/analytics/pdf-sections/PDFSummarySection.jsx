// src/components/analytics/pdf-sections/PDFSummarySection.jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import PDFMetricCard from '../pdf-components/PDFMetricCard';
import { PDFBarChart, PDFPieChart, PDFLineChart } from '../pdf-components/PDFCharts';

// Fonction pour formater les nombres
const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  
  // Utiliser la méthode standard pour formater les nombres avec espaces
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#2081E2',
  },
  sectionSubtitle: {
    fontSize: 8,
    marginBottom: 5,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  chartContainer: {
    height: 170,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#4B5563',
    paddingTop: 5,
    paddingBottom: 5,
  },
  tableRow: {
    fontSize: 8,
    color: '#4B5563',
    paddingTop: 5,
    paddingBottom: 5,
  },
  col1: {
    width: '50%',
  },
  col2: {
    width: '50%',
    textAlign: 'right',
  },
  colWithPct: {
    width: '40%',
  },
  colWithPctRight: {
    width: '30%',
    textAlign: 'right',
  },
  colWithPctPct: {
    width: '30%',
    textAlign: 'right',
  },
  subtotalRow: {
    backgroundColor: '#F0F9FF',  // Légère teinte bleue
    fontWeight: 'bold',
  },
  newRevenueRow: {
    backgroundColor: '#ECFDF5',  // Légère teinte verte pour les nouveaux revenus
    fontWeight: 'bold',
  },
  expenseRow: {
    backgroundColor: '#FEF2F2',  // Légère teinte rouge pour les dépenses
    fontWeight: 'bold',
  },
  resultatRow: {
    backgroundColor: '#ECFDF5',  // Légère teinte verte pour le résultat
    fontWeight: 'bold',
  },
  cashflowHeader: {
    marginTop: 10,
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
  },
  cashflowSubtotal: {
    backgroundColor: '#E0E7FF',  // Teinte indigo pour la variation de trésorerie
    fontWeight: 'bold',
  },
  cashflowTotal: {
    backgroundColor: '#C7D2FE',  // Teinte indigo plus foncée pour le total
    fontWeight: 'bold',
  },
  balanceSheetHeader: {
    marginTop: 10,
    backgroundColor: '#F5F3FF',  // Teinte violet clair
    fontWeight: 'bold',
  },
  balanceSheetTotal: {
    backgroundColor: '#EDE9FE',  // Teinte violette pour le total
    fontWeight: 'bold',
  },
  cumulativeHeader: {
    marginTop: 10,
    backgroundColor: '#FEF3C7',  // Teinte jaune clair
    fontWeight: 'bold',
  },
  cumulativeTotal: {
    backgroundColor: '#FDE68A',  // Teinte jaune pour le total
    fontWeight: 'bold',
  },
  balanceSheetGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  balanceSheetColumn: {
    width: '50%',
    paddingRight: 5,
  }
});

const PDFSummarySection = ({ data }) => {
  const { stats = {}, monthlyFinance = [], lastBalanceSheet = null } = data || {};

  // Préparer les données pour le graphique d'évolution financière
  const financeData = monthlyFinance?.map(item => ({
    ...item,
    totalRevenue: parseFloat(item.totalRevenue || 0),
    totalExpense: parseFloat(item.totalExpense || 0),
    profit: parseFloat(item.profit || 0),
    netCashFlow: parseFloat(item.netCashFlow || 0),
    connectionLaborRevenue: parseFloat(item.connectionLaborRevenue || 0),
    penaltyRevenue: parseFloat(item.penaltyRevenue || 0)
  }));

  // Préparer les données pour le graphique de répartition des revenus (mis à jour)
  const revenueData = [
    { name: "Facture d'eau", value: parseFloat(stats?.invoiceRevenue || 0), color: '#2563EB' },
    { name: 'Dons', value: parseFloat(stats?.donationRevenue || 0), color: '#10B981' },
    { name: 'Frais branchement', value: parseFloat(stats?.connectionLaborRevenue || 0), color: '#059669' },
    { name: 'Pénalités coupure', value: parseFloat(stats?.penaltyRevenue || 0), color: '#F59E0B' }
  ].filter(item => item.value > 0); // Filtrer les valeurs nulles

  // Préparer les données pour le graphique de répartition des dépenses
  const expenseData = [
    { name: 'Opérationnelles', value: parseFloat(stats?.operationalExpense || 0), color: '#DC2626' },
    { name: 'Salaires', value: parseFloat(stats?.salaryExpense || 0), color: '#F59E0B' }
  ];

  return (
    <View style={styles.container}>
      {/* Métriques principales (mises à jour) */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Revenus Totaux"
          value={`${formatNumber(stats?.totalRevenue || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Dépenses Totales"
          value={`${formatNumber(stats?.totalExpense || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Résultat d'exploitation"
          value={`${formatNumber(stats?.profit || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Marge Opérationnelle"
          value={`${stats?.margin || 0}%`}
        />
        <PDFMetricCard
          title="Frais Branchement"
          value={`${formatNumber(stats?.connectionLaborRevenue || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Pénalités Coupure"
          value={`${formatNumber(stats?.penaltyRevenue || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Trésorerie initiale"
          value={`${formatNumber(stats?.initialCashBalance || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Trésorerie finale"
          value={`${formatNumber(stats?.finalCashBalance || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Total Actif"
          value={`${formatNumber(stats?.total_assets || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Total Passif"
          value={`${formatNumber(stats?.total_liabilities || 0)} FCFA`}
        />
      </View>

      {/* 1. COMPTE DE RÉSULTAT DÉTAILLÉ */}
      <Text style={styles.sectionTitle}>1. Compte de Résultat Détaillé</Text>
      <Text style={styles.sectionSubtitle}>Affiche toutes les sources de revenus et les dépenses de l'exercice :</Text>
      <View>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Catégorie</Text>
          <Text style={styles.col2}>Montant (FCFA)</Text>
        </View>
        
        {/* Revenus */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Revenus d'exploitation (factures)</Text>
          <Text style={styles.col2}>{formatNumber(stats.invoiceRevenue || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Autres revenus (dons)</Text>
          <Text style={styles.col2}>{formatNumber(stats.donationRevenue || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.newRevenueRow]}>
          <Text style={styles.col1}>Frais de branchement (main-d'œuvre)</Text>
          <Text style={styles.col2}>{formatNumber(stats.connectionLaborRevenue || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.newRevenueRow]}>
          <Text style={styles.col1}>Pénalités de coupure payées</Text>
          <Text style={styles.col2}>{formatNumber(stats.penaltyRevenue || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.subtotalRow]}>
          <Text style={styles.col1}>Total Revenus</Text>
          <Text style={styles.col2}>{formatNumber(stats.totalRevenue || 0)}</Text>
        </View>
        
        {/* Dépenses */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Dépenses opérationnelles</Text>
          <Text style={styles.col2}>{formatNumber(stats.operationalExpense || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Salaires</Text>
          <Text style={styles.col2}>{formatNumber(stats.salaryExpense || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.expenseRow]}>
          <Text style={styles.col1}>Total Dépenses</Text>
          <Text style={styles.col2}>{formatNumber(stats.totalExpense || 0)}</Text>
        </View>
        
        {/* Résultat */}
        <View style={[styles.row, styles.tableRow, styles.resultatRow]}>
          <Text style={styles.col1}>Résultat d'exploitation</Text>
          <Text style={styles.col2}>{formatNumber(stats.profit || 0)}</Text>
        </View>
      </View>

      {/* 2. TABLEAU DE FLUX DE TRÉSORERIE */}
      <Text style={styles.sectionTitle}>2. Bilan de Trésorerie</Text>
      <Text style={styles.sectionSubtitle}>Montre les flux financiers hors exploitation (emprunts, remboursements, investissements) :</Text>
      <View>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Catégorie</Text>
          <Text style={styles.col2}>Montant (FCFA)</Text>
        </View>
        
        {/* Trésorerie */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Trésorerie initiale (année précédente)</Text>
          <Text style={styles.col2}>{formatNumber(stats.initialCashBalance || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.subtotalRow]}>
          <Text style={styles.col1}>Résultat d'exploitation (incluant nouveaux revenus)</Text>
          <Text style={styles.col2}>{formatNumber(stats.profit || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Emprunts reçus</Text>
          <Text style={styles.col2}>{formatNumber(stats.loanTotal || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Remboursements effectués</Text>
          <Text style={styles.col2}>{formatNumber(stats.loanRepayment || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.cashflowSubtotal]}>
          <Text style={styles.col1}>Variation de trésorerie</Text>
          <Text style={styles.col2}>{formatNumber(stats.netCashFlow || 0)}</Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.cashflowTotal]}>
          <Text style={styles.col1}>Trésorerie finale</Text>
          <Text style={styles.col2}>{formatNumber(stats.finalCashBalance || 0)}</Text>
        </View>
      </View>

      {/* 3. BILAN COMPTABLE */}
      <Text style={styles.sectionTitle}>3. Bilan Comptable</Text>
      <Text style={styles.sectionSubtitle}>Photographie de la situation financière à la fin de la période :</Text>
      <View style={styles.balanceSheetGrid}>
        {/* ACTIF */}
        <View style={styles.balanceSheetColumn}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.col1}>ACTIF</Text>
            <Text style={styles.col2}>Montant (FCFA)</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Trésorerie</Text>
            <Text style={styles.col2}>{formatNumber(stats.cash_and_bank || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Créances clients</Text>
            <Text style={styles.col2}>{formatNumber(stats.accounts_receivable || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Autres actifs</Text>
            <Text style={styles.col2}>{formatNumber(stats.other_assets || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow, styles.balanceSheetTotal]}>
            <Text style={styles.col1}>TOTAL ACTIF</Text>
            <Text style={styles.col2}>{formatNumber(stats.total_assets || 0)}</Text>
          </View>
        </View>
        
        {/* PASSIF */}
        <View style={styles.balanceSheetColumn}>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.col1}>PASSIF</Text>
            <Text style={styles.col2}>Montant (FCFA)</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Dettes fournisseurs</Text>
            <Text style={styles.col2}>{formatNumber(stats.accounts_payable || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Emprunts</Text>
            <Text style={styles.col2}>{formatNumber(stats.loans || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Autres passifs</Text>
            <Text style={styles.col2}>{formatNumber(stats.other_liabilities || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Fonds propres</Text>
            <Text style={styles.col2}>{formatNumber(stats.equity || 0)}</Text>
          </View>
          <View style={[styles.row, styles.tableRow, styles.balanceSheetTotal]}>
            <Text style={styles.col1}>TOTAL PASSIF</Text>
            <Text style={styles.col2}>{formatNumber(stats.total_liabilities || 0)}</Text>
          </View>
        </View>
      </View>

      {/* 4. HISTORIQUE CUMULATIF */}
      <Text style={styles.sectionTitle}>4. Cumulatif Historique (multi-années)</Text>
      <Text style={styles.sectionSubtitle}>Intègre les résultats nets des années précédentes :</Text>

      {/* Tableau historique par année */}
      <View>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={{ width: '20%' }}>Année</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Revenus</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Dépenses</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Résultat net</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>Trésorerie clôture</Text>
        </View>
        
        {/* Utiliser lastBalanceSheet et données historiques */}
        {lastBalanceSheet && (
          <View style={[styles.row, styles.tableRow]}>
            <Text style={{ width: '20%' }}>
              {new Date(lastBalanceSheet.period_end).getFullYear()}
            </Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>
              {formatNumber(parseFloat(lastBalanceSheet.previous_revenue || 0))}
            </Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>
              {formatNumber(parseFloat(lastBalanceSheet.previous_expense || 0))}
            </Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>
              {formatNumber(parseFloat(lastBalanceSheet.previous_profit || 0))}
            </Text>
            <Text style={{ width: '20%', textAlign: 'right' }}>
              {formatNumber(parseFloat(lastBalanceSheet.cash_and_bank || 0))}
            </Text>
          </View>
        )}
        
        {/* Année courante */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={{ width: '20%' }}>{new Date().getFullYear()}</Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            {formatNumber(stats.totalRevenue || 0)}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            {formatNumber(stats.totalExpense || 0)}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            {formatNumber(stats.profit || 0)}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right' }}>
            {formatNumber(stats.finalCashBalance || 0)}
          </Text>
        </View>
        
        {/* Ligne de total */}
        <View style={[styles.row, styles.tableRow, styles.cumulativeTotal]}>
          <Text style={{ width: '20%', fontWeight: 'bold' }}>Total cumul</Text>
          <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>
            {formatNumber((parseFloat(lastBalanceSheet?.previous_revenue || 0) + parseFloat(stats.totalRevenue || 0)))}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>
            {formatNumber((parseFloat(lastBalanceSheet?.previous_expense || 0) + parseFloat(stats.totalExpense || 0)))}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>
            {formatNumber((parseFloat(lastBalanceSheet?.previous_profit || 0) + parseFloat(stats.profit || 0)))}
          </Text>
          <Text style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>
            {formatNumber(stats.finalCashBalance || 0)}
          </Text>
        </View>
      </View>

      {/* Statistiques cumulatives sous forme de cartes métriques */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Revenus cumulés historiques"
          value={`${formatNumber((parseFloat(lastBalanceSheet?.previous_revenue || 0) + parseFloat(stats.totalRevenue || 0)))} FCFA`}
        />
        <PDFMetricCard
          title="Dépenses cumulées historiques"
          value={`${formatNumber((parseFloat(lastBalanceSheet?.previous_expense || 0) + parseFloat(stats.totalExpense || 0)))} FCFA`}
        />
        <PDFMetricCard
          title="Résultat net cumulé historique"
          value={`${formatNumber((parseFloat(lastBalanceSheet?.previous_profit || 0) + parseFloat(stats.profit || 0)))} FCFA`}
        />
        <PDFMetricCard
          title="Trésorerie actuelle"
          value={`${formatNumber(stats.finalCashBalance || 0)} FCFA`}
        />
      </View>

      {/* 5. ANALYSE DES REVENUS COMPLÉMENTAIRES */}
      <Text style={styles.sectionTitle}>5. Analyse des Revenus Complémentaires</Text>
      <Text style={styles.sectionSubtitle}>Détail des nouvelles sources de revenus :</Text>

      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Revenus Traditionnels"
          value={`${formatNumber((parseFloat(stats?.invoiceRevenue || 0) + parseFloat(stats?.donationRevenue || 0)))} FCFA`}
        />
        <PDFMetricCard
          title="Nouveaux Revenus"
          value={`${formatNumber((parseFloat(stats?.connectionLaborRevenue || 0) + parseFloat(stats?.penaltyRevenue || 0)))} FCFA`}
        />
        <PDFMetricCard
          title="% Nouveaux Revenus"
          value={`${(((parseFloat(stats?.connectionLaborRevenue || 0) + parseFloat(stats?.penaltyRevenue || 0)) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%`}
        />
        <PDFMetricCard
          title="Impact sur Marge"
          value={`${stats?.margin || 0}%`}
        />
      </View>

      {/* Tableau détaillé des nouveaux revenus */}
      <View>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.colWithPct}>Source de Revenus</Text>
          <Text style={styles.colWithPctRight}>Montant (FCFA)</Text>
          <Text style={styles.colWithPctPct}>% du Total</Text>
        </View>
        
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.colWithPct}>Factures d'eau</Text>
          <Text style={styles.colWithPctRight}>{formatNumber(stats?.invoiceRevenue || 0)}</Text>
          <Text style={styles.colWithPctPct}>{((parseFloat(stats?.invoiceRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.colWithPct}>Frais de branchement</Text>
          <Text style={styles.colWithPctRight}>{formatNumber(stats?.connectionLaborRevenue || 0)}</Text>
          <Text style={styles.colWithPctPct}>{((parseFloat(stats?.connectionLaborRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.colWithPct}>Pénalités de coupure</Text>
          <Text style={styles.colWithPctRight}>{formatNumber(stats?.penaltyRevenue || 0)}</Text>
          <Text style={styles.colWithPctPct}>{((parseFloat(stats?.penaltyRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.colWithPct}>Dons</Text>
          <Text style={styles.colWithPctRight}>{formatNumber(stats?.donationRevenue || 0)}</Text>
          <Text style={styles.colWithPctPct}>{((parseFloat(stats?.donationRevenue || 0) / parseFloat(stats?.totalRevenue || 1)) * 100).toFixed(1)}%</Text>
        </View>
        
        <View style={[styles.row, styles.tableRow, styles.subtotalRow]}>
          <Text style={styles.colWithPct}>Total Revenus</Text>
          <Text style={styles.colWithPctRight}>{formatNumber(stats?.totalRevenue || 0)}</Text>
          <Text style={styles.colWithPctPct}>100.0%</Text>
        </View>
      </View>

      {/* Si un bilan historique est disponible */}
      {lastBalanceSheet && (
        <View>
          <Text style={styles.sectionTitle}>Dernier bilan historique de référence</Text>
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={styles.col1}>Période</Text>
            <Text style={styles.col2}>Montant (FCFA)</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Actif Total</Text>
            <Text style={styles.col2}>{formatNumber(
              parseFloat(lastBalanceSheet.accounts_receivable) +
              parseFloat(lastBalanceSheet.cash_and_bank) +
              parseFloat(lastBalanceSheet.other_assets)
            )}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Passif Total</Text>
            <Text style={styles.col2}>{formatNumber(
              parseFloat(lastBalanceSheet.accounts_payable) +
              parseFloat(lastBalanceSheet.loans) +
              parseFloat(lastBalanceSheet.other_liabilities)
            )}</Text>
          </View>
          <View style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>Trésorerie</Text>
            <Text style={styles.col2}>{formatNumber(lastBalanceSheet.cash_and_bank)}</Text>
          </View>
        </View>
      )}

      {/* Graphique d'évolution financière mis à jour 
      <Text style={styles.sectionTitle}>Évolution Financière Mensuelle</Text>
      <View style={styles.chartContainer}>
        <PDFLineChart
          data={financeData}
          lines={[
            { dataKey: 'totalRevenue', name: 'Revenus totaux', color: '#2563EB' },
            { dataKey: 'connectionLaborRevenue', name: 'Frais branchement', color: '#059669' },
            { dataKey: 'penaltyRevenue', name: 'Pénalités', color: '#F59E0B' },
            { dataKey: 'totalExpense', name: 'Dépenses', color: '#DC2626' },
            { dataKey: 'profit', name: 'Résultat', color: '#10B981' },
            { dataKey: 'netCashFlow', name: 'Flux de trésorerie', color: '#8B5CF6' }
          ]}
          xKey="month"
        />
      </View>

      */}

      {/* Graphiques de répartition des revenus et dépenses */}
      <View style={{ flexDirection: 'row' }}>
        {/* Répartition des revenus (mise à jour) */}
        <View style={{ width: '50%' }}>
          <Text style={styles.sectionTitle}>Répartition des Revenus</Text> 
          <View style={styles.chartContainer}>
            <PDFPieChart
              data={revenueData}
              dataKey="value"
              nameKey="name"
              colorKey="color"
            />
          </View>
        </View>

        {/* Répartition des dépenses */}
        <View style={{ width: '50%' }}>
          <Text style={styles.sectionTitle}>Répartition des Dépenses</Text>
          <View style={styles.chartContainer}>
            <PDFPieChart
              data={expenseData}
              dataKey="value"
              nameKey="name"
              colorKey="color"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default PDFSummarySection;