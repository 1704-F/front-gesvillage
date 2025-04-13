// src/components/analytics/pdf-sections/PDFConsumersSection.jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import PDFMetricCard from '../pdf-components/PDFMetricCard';
import { PDFBarChart, PDFPieChart } from '../pdf-components/PDFCharts';

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
  },
});

const PDFConsumersSection = ({ data }) => {
  const { stats = {}, distribution = [], growth = [] } = data || {};

  // Préparer couleurs pour distribution
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const distributionData = distribution?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  })).slice(0, 6);

  // Préparer les données pour le graphique camembert
  const pieData = [
    { name: 'Actifs', value: stats?.activeConsumers || 0, color: '#16A34A' },
    { name: 'Inactifs', value: stats?.inactiveConsumers || 0, color: '#DC2626' }
  ];

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Consommateurs Actifs"
          value={formatNumber(stats?.activeConsumers || 0)}
          subtitle={`sur ${formatNumber(stats?.totalConsumers || 0)} consommateurs`}
        />
        <PDFMetricCard
          title="Nouveaux Consommateurs"
          value={formatNumber(stats?.newConsumers || 0)}
        />
        <PDFMetricCard
          title="Taux d'Activité"
          value={`${(stats?.activeRate || 0).toFixed(1)}%`}
        />
        <PDFMetricCard
          title="Consommateurs Inactifs"
          value={formatNumber(stats?.inactiveConsumers || 0)}
        />
      </View>

      {/* Graphiques */}
      <View style={{ flexDirection: 'row' }}>
        {/* Graphique répartition par quartier */}
        <View style={{ width: '60%' }}>
          <Text style={styles.sectionTitle}>Répartition par Quartier</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={distributionData}
              bars={[
                { dataKey: 'consumer_count', name: 'Nombre de consommateurs', color: '#3B82F6' }
              ]}
              xKey="name"
            />
          </View>
        </View>

        {/* Graphique répartition des statuts 
        <View style={{ width: '40%' }}>
          <Text style={styles.sectionTitle}>Statuts des consommateurs</Text>
          <View style={styles.chartContainer}>
            <PDFPieChart
              data={pieData}
              dataKey="value"
              nameKey="name"
              colorKey="color"
            />
          </View>
        </View>
*/}

      </View>

      {/* Tableau des quartiers */}
      <Text style={styles.sectionTitle}>Top Quartiers par Nombre de Consommateurs</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Quartier</Text>
          <Text style={styles.col2}>Nombre de Consommateurs</Text>
          <Text style={styles.col3}>% du Total</Text>
        </View>
        
        {/* Lignes du tableau */}
        {distribution?.slice(0, 5).map((item, index) => (
          <View key={index} style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>{item.name}</Text>
            <Text style={styles.col2}>{formatNumber(item.consumer_count)}</Text>
            <Text style={styles.col3}>
              {stats?.totalConsumers ? 
                `${((item.consumer_count / stats?.totalConsumers) * 100).toFixed(1)}%` : 
                '0%'
              }
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PDFConsumersSection;