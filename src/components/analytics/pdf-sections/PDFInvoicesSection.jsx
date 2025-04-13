// src/components/analytics/pdf-sections/PDFInvoicesSection.jsx
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
    height: 180,
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
    width: '30%',
  },
  col2: {
    width: '20%',
    textAlign: 'right',
  },
  col3: {
    width: '20%',
    textAlign: 'right',
  },
  col4: {
    width: '30%',
    textAlign: 'right',
  }
});

const PDFInvoicesSection = ({ data }) => {
  const { stats = {}, trend = [], byZone = [], unpaidAge = [], recoveryRate = [] } = data || {};

  // Préparer les couleurs pour le graphique en camembert
  const colors = ['#16A34A', '#FBBF24', '#F97316', '#DC2626'];
  const pieData = unpaidAge?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    name: item.age_category,
    value: parseFloat(item.total_amount) || 0
  }));

  // Préparer les données pour le graphique à barres
  const zoneBarData = byZone?.slice(0, 5).map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Factures Émises"
          value={formatNumber(stats?.totalCount || 0)}
          subtitle={`${formatNumber(stats?.totalAmount || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Factures Payées"
          value={formatNumber(stats?.paidCount || 0)}
          subtitle={`${formatNumber(stats?.paidAmount || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Taux de Paiement"
          value={`${typeof stats?.paymentRate === 'number' ? (stats?.paymentRate || 0).toFixed(1) : '0'}%`}
        />
        <PDFMetricCard
          title="Factures Impayées"
          value={formatNumber(stats?.pendingCount || 0)}
          subtitle={`${formatNumber(stats?.pendingAmount || 0)} FCFA`}
        />
      </View>

      {/* Graphiques */}
      <View style={{ flexDirection: 'row' }}>
        {/* Répartition par quartier */}
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionTitle}>Factures par Quartier</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={zoneBarData}
              bars={[
                { dataKey: 'total_amount', name: 'Montant total', color: '#3B82F6' },
                { dataKey: 'paid_amount', name: 'Montant payé', color: '#16A34A' }
              ]}
              xKey="name"
            />
          </View>
        </View>
        </View>

        <View style={{ width: '100%' }}>

        {/* Âge des factures impayées */}
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionTitle}>Âge des Factures Impayées</Text>
          <View style={styles.chartContainer}>
            <PDFPieChart
              data={pieData}
              dataKey="value"
              nameKey="name"
              colorKey="color"
            />
          </View>
        </View>

        </View>
      

      {/* Taux de recouvrement */}
      <Text style={styles.sectionTitle}>Taux de Recouvrement Mensuel</Text>
      <View style={[styles.chartContainer, { height: 160 }]}>
        <PDFLineChart
          data={recoveryRate || []}
          lines={[
            { dataKey: 'rate', name: 'Taux de recouvrement', color: '#16A34A' }
          ]}
          xKey="month"
        />
      </View>

      {/* Tableau récapitulatif */}
      <Text style={styles.sectionTitle}>État des Factures par Période</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Période</Text>
          <Text style={styles.col2}>Factures</Text>
          <Text style={styles.col3}>Montant Total</Text>
          <Text style={styles.col4}>Montant Payé</Text>
        </View>
        
        {/* Lignes du tableau */}
        {trend?.slice(0, 6).map((item, index) => (
          <View key={index} style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>{item.month}</Text>
            <Text style={styles.col2}>{formatNumber(item.count)}</Text>
            <Text style={styles.col3}>{formatNumber(item.amount)} FCFA</Text>
            <Text style={styles.col4}>{formatNumber(item.paidAmount)} FCFA</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PDFInvoicesSection;