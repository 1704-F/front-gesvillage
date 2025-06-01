// src/components/analytics/pdf-sections/PDFOverviewSection.jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import PDFMetricCard from '../pdf-components/PDFMetricCard';

import { PDFLineChart, PDFBarChart, PDFPieChart } from '../pdf-components/PDFCharts';

// Fonction pour formater les nombres - corrigée pour éviter les barres obliques
const formatNumber = (num) => {
  if (isNaN(num)) return '0';
  
  // Utiliser la méthode standard pour formater les nombres avec espaces
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chartsSection: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2081E2',
  },
  chartContainer: {
    marginBottom: 15,
    height: 150,
  },
});

const PDFOverviewSection = ({ data }) => {
  const { consumers = {}, meters = {}, consumption = {}, invoices = {}, expenses = {}, summary = {} } = data || {};

  // Indicateurs clés pour la vue d'ensemble
  const metrics = [
    {
      title: "Consommateurs actifs",
      value: formatNumber(consumers?.stats?.activeConsumers || 0),
      subtitle: `sur ${formatNumber(consumers?.stats?.totalConsumers || 0)} total`
    },
    {
      title: "Compteurs actifs",
      value: formatNumber(meters?.stats?.activeMeters || 0),
      subtitle: `sur ${formatNumber(meters?.stats?.totalMeters || 0)} total`
    },
    {
      title: "Consommation totale",
      value: `${formatNumber(consumption?.stats?.totalConsumption || 0)} m³`,
    },
    {
      title: "Factures impayées",
      value: formatNumber(invoices?.stats?.pendingCount || 0),
      subtitle: `(${formatNumber(invoices?.stats?.pendingAmount || 0)} FCFA)`
    },
    {
      title: "Dépenses totales",
      value: `${formatNumber(expenses?.stats?.totalAmount || 0)} FCFA`,
    },
    {
      title: "Marge opérationnelle",
      value: `${summary?.stats?.margin || 0}%`,
    }
  ];

  return (
    <View style={styles.container}>
      {/* Grille des métriques principales */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <PDFMetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
          />
        ))}
      </View>

      {/* Section graphiques 
      <View style={styles.chartsSection}>
      

        <Text style={styles.chartTitle}>Évolution financière</Text>
        <View style={styles.chartContainer}>
          <PDFLineChart
            data={summary?.monthlyFinance || []}
            lines={[
              { dataKey: 'totalRevenue', name: 'Revenus', color: '#2563EB' },
              { dataKey: 'totalExpense', name: 'Dépenses', color: '#DC2626' },
              { dataKey: 'profit', name: 'Bénéfice', color: '#16A34A' }
            ]}
            xKey="month"
          />
        </View>

       
        <Text style={styles.chartTitle}>Évolution de la consommation</Text>
        <View style={styles.chartContainer}>
          <PDFBarChart
            data={consumption?.trend || []}
            bars={[
              { dataKey: 'consumption', name: 'Consommation (m³)', color: '#3B82F6' }
            ]}
            xKey="month"
          />
        </View>
      </View>
*/}
      
    </View>
  );
};

export default PDFOverviewSection;