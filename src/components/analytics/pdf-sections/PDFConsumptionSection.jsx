// src/components/analytics/pdf-sections/PDFConsumptionSection.jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import PDFMetricCard from '../pdf-components/PDFMetricCard';
import { PDFBarChart } from '../pdf-components/PDFCharts';

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
    width: '50%',
  },
  col2: {
    width: '25%',
    textAlign: 'right',
  },
  col3: {
    width: '25%',
    textAlign: 'right',
  }
});

const PDFConsumptionSection = ({ data }) => {
  const { stats = {}, trend = [], byZone = [] } = data || {};

  // Préparer les couleurs pour le graphique
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const zoneData = byZone?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  })).slice(0, 10); // Limiter à 10 pour la lisibilité

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Consommation Totale"
          value={`${formatNumber(stats?.totalConsumption || 0)} m³`}
        />
        <PDFMetricCard
          title="Consommation Moyenne"
          value={`${formatNumber(stats?.averageConsumption || 0)} m³`}
          subtitle="par compteur"
        />
      </View>

      {/* Graphique de répartition par zone */}
      <Text style={styles.sectionTitle}>Consommation par Zone</Text>
      <View style={styles.chartContainer}>
        <PDFBarChart
          data={zoneData}
          bars={[
            { dataKey: 'total_consumption', name: 'Consommation (m³)', color: '#3B82F6' }
          ]}
          xKey="name"
        />
      </View>

      {/* Tableau des zones avec le plus de consommation */}
      <Text style={styles.sectionTitle}>Top Quartiers par Consommation</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Quartier</Text>
          <Text style={styles.col2}>Consommation (m³)</Text>
          <Text style={styles.col3}>% du Total</Text>
        </View>
        
        {/* Lignes du tableau */}
        {byZone?.slice(0, 5).map((item, index) => (
          <View key={index} style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{formatNumber(item.total_consumption)}</Text>
            <Text style={styles.col3}>
              {stats?.totalConsumption ? 
                `${((item.total_consumption / stats?.totalConsumption) * 100).toFixed(1)}%` : 
                '0%'
              }
            </Text>
          </View>
        ))}
      </View>

      {/* Section supplémentaire de commentaire/analyse */}
      <View style={{ marginTop: 15, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 5 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2081E2', marginBottom: 5 }}>
          Analyse de la consommation
        </Text>
        <Text style={{ fontSize: 8, color: '#4B5563' }}>
          La consommation moyenne par compteur est de {formatNumber(stats?.averageConsumption || 0)} m³.
          {stats?.totalConsumption && byZone && byZone.length > 0 ? 
            ` Le quartier ${byZone[0].name} représente la plus forte consommation avec ${((byZone[0].total_consumption / stats.totalConsumption) * 100).toFixed(1)}% du total.` 
            : ''}
        </Text>
      </View>
    </View>
  );
};

export default PDFConsumptionSection;