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
    width: '40%',
  },
  col2: {
    width: '30%',
    textAlign: 'right',
  },
  col3: {
    width: '30%',
    textAlign: 'right',
  },
  subtotalRow: {
    backgroundColor: '#F0F9FF',  // Légère teinte bleue
    fontWeight: 'bold',
  },
  totalRow: {
    backgroundColor: '#ECFDF5',  // Légère teinte verte
    fontWeight: 'bold',
  }
});

const PDFSummarySection = ({ data }) => {
  const { stats = {}, monthlyFinance = [] } = data || {};

  // Préparer les données pour le graphique d'évolution financière
  const financeData = monthlyFinance?.map(item => ({
    ...item,
    totalRevenue: parseFloat(item.totalRevenue || 0),
    totalExpense: parseFloat(item.totalExpense || 0),
    profit: parseFloat(item.profit || 0)
  }));

  // Préparer les données pour le graphique de répartition des revenus
  const revenueData = [
    { name: "Facture d'eau", value: parseFloat(stats?.invoiceRevenue || 0), color: '#2563EB' },
    { name: 'Dons', value: parseFloat(stats?.donationRevenue || 0), color: '#10B981' }
  ];

  // Préparer les données pour le graphique de répartition des dépenses
  const expenseData = [
    { name: 'Opérationnelles', value: parseFloat(stats?.operationalExpense || 0), color: '#DC2626' },
    { name: 'Salaires', value: parseFloat(stats?.salaryExpense || 0), color: '#F59E0B' }
  ];

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
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
          title="Bénéfice Net"
          value={`${formatNumber(stats?.profit || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Marge Opérationnelle"
          value={`${stats?.margin || 0}%`}
        />
        <PDFMetricCard
          title="Ratio Dépenses/Revenus"
          value={`${stats?.expenseRatio || 0}%`}
        />
        <PDFMetricCard
          title="Revenus par Factures"
          value={`${formatNumber(stats?.invoiceRevenue || 0)} FCFA`}
          subtitle={`(${((stats?.invoiceRevenue || 0) / (stats?.totalRevenue || 1) * 100).toFixed(1) || 0}%)`}
        />
      </View>

      {/* Graphique d'évolution financière */}
      <Text style={styles.sectionTitle}>Évolution Financière Mensuelle</Text>
      <View style={styles.chartContainer}>
        <PDFLineChart
          data={financeData}
          lines={[
            { dataKey: 'totalRevenue', name: 'Revenus', color: '#2563EB' },
            { dataKey: 'totalExpense', name: 'Dépenses', color: '#DC2626' },
            { dataKey: 'profit', name: 'Bénéfice', color: '#10B981' }
          ]}
          xKey="month"
        />
      </View>

      {/* Graphiques de répartition des revenus et dépenses */}
      <View style={{ flexDirection: 'row' }}>
        {/* Répartition des revenus */}
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

      {/* Tableau récapitulatif */}
      <Text style={styles.sectionTitle}>Synthèse Financière</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Catégorie</Text>
          <Text style={styles.col2}>Montant (FCFA)</Text>
          <Text style={styles.col3}>% du Total</Text>
        </View>
        
        {/* Section revenus */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Facture d'eau</Text>
          <Text style={styles.col2}>{formatNumber(stats.invoiceRevenue || 0)}</Text>
          <Text style={styles.col3}>
            {stats?.totalRevenue ? 
              `${((stats?.invoiceRevenue / stats?.totalRevenue) * 100).toFixed(1)}%` : 
              '0%'
            }
          </Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Dons</Text>
          <Text style={styles.col2}>{formatNumber(stats.donationRevenue || 0)}</Text>
          <Text style={styles.col3}>
            {stats.totalRevenue ? 
              `${((stats.donationRevenue / stats.totalRevenue) * 100).toFixed(1)}%` : 
              '0%'
            }
          </Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.subtotalRow]}>
          <Text style={styles.col1}>Total Revenus</Text>
          <Text style={styles.col2}>{formatNumber(stats.totalRevenue || 0)}</Text>
          <Text style={styles.col3}>100%</Text>
        </View>
        
        {/* Section dépenses */}
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Dépenses Opérationnelles</Text>
          <Text style={styles.col2}>{formatNumber(stats.operationalExpense || 0)}</Text>
          <Text style={styles.col3}>
            {stats.totalExpense ? 
              `${((stats.operationalExpense / stats.totalExpense) * 100).toFixed(1)}%` : 
              '0%'
            }
          </Text>
        </View>
        <View style={[styles.row, styles.tableRow]}>
          <Text style={styles.col1}>Salaires</Text>
          <Text style={styles.col2}>{formatNumber(stats.salaryExpense || 0)}</Text>
          <Text style={styles.col3}>
            {stats.totalExpense ? 
              `${((stats.salaryExpense / stats.totalExpense) * 100).toFixed(1)}%` : 
              '0%'
            }
          </Text>
        </View>
        <View style={[styles.row, styles.tableRow, styles.subtotalRow]}>
          <Text style={styles.col1}>Total Dépenses</Text>
          <Text style={styles.col2}>{formatNumber(stats.totalExpense || 0)}</Text>
          <Text style={styles.col3}>100%</Text>
        </View>
        
        {/* Bénéfice net */}
        <View style={[styles.row, styles.tableRow, styles.totalRow]}>
          <Text style={styles.col1}>Bénéfice Net</Text>
          <Text style={styles.col2}>{formatNumber(stats.profit || 0)}</Text>
          <Text style={styles.col3}>
            {stats.totalRevenue ? 
              `${((stats.profit / stats.totalRevenue) * 100).toFixed(1)}%` : 
              '0%'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PDFSummarySection;