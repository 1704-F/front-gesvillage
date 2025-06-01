// src/components/analytics/pdf-sections/PDFMetersSection.jsx
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
    width: '40%',
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
    width: '20%',
    textAlign: 'right',
  }
});

const PDFMetersSection = ({ data }) => {
  const { stats = {}, distribution = [], avgConsumption = [] } = data || {};

  // Préparer les couleurs pour le graphique en camembert
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const pieData = distribution?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    name: item.type === 'standard' ? 'Standard' : 
          item.type === 'premium' ? 'Premium' : 
          item.type === 'free' ? 'Gratuit' : item.type,
    value: item.count
  }));

  // Préparer les données pour le graphique à barres
  const barData = avgConsumption?.map((item, index) => ({
    ...item,
    type: item.type === 'standard' ? 'Standard' : 
          item.type === 'premium' ? 'Premium' : 
          item.type === 'free' ? 'Gratuit' : item.type
  }));

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Compteurs Actifs"
          value={formatNumber(stats?.activeMeters || 0)}
          subtitle={`sur ${formatNumber(stats?.totalMeters || 0)} compteurs`}
        />
        <PDFMetricCard
          title="Compteurs Sans Relevés"
          value={formatNumber(stats?.metersWithoutReadings || 0)}
        />
        <PDFMetricCard
          title="Taux d'Utilisation"
          value={`${(stats?.utilizationRate || 0).toFixed(1)}%`}
        />
        <PDFMetricCard
          title="Compteurs Inactifs"
          value={formatNumber(stats?.inactiveMeters || 0)}
        />
      </View>

      {/* Graphiques */}
      <View style={{ flexDirection: 'row' }}>
        {/* Distribution par type de compteur */}
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionTitle}>Distribution par Type de Compteur</Text>
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

        <View style={{ flexDirection: 'row' }}>

        {/* Consommation moyenne par type 
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionTitle}>Consommation Moyenne par Type</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={barData}
              bars={[
                { dataKey: 'avgConsumption', name: 'Consommation moyenne (m³)', color: '#3B82F6' }
              ]}
              xKey="type"
            />
          </View>
        </View>
        */}
        
        </View>

      {/* Tableau des types de compteurs */}
      <Text style={styles.sectionTitle}>Répartition par Type de Compteur</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Type de Compteur</Text>
          <Text style={styles.col2}>Nombre</Text>
          <Text style={styles.col3}>% du Total</Text>
          <Text style={styles.col4}>Consommation Moyenne (m³)</Text>
        </View>
        
        {/* Lignes du tableau */}
        {distribution?.map((item, index) => {
          const avgConsItem = avgConsumption?.find(a => a.type === item.type);
          return (
            <View key={index} style={[styles.row, styles.tableRow]}>
              <Text style={styles.col1}>
                {item.type === 'standard' ? 'Standard' : 
                item.type === 'premium' ? 'Premium' : 
                item.type === 'free' ? 'Gratuit' : item.type}
              </Text>
              <Text style={styles.col2}>{formatNumber(item.count)}</Text>
              <Text style={styles.col3}>
                {stats?.totalMeters ? 
                  `${((item.count / stats?.totalMeters) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </Text>
              <Text style={styles.col4}>
                {avgConsItem ? formatNumber(avgConsItem.avgConsumption) : '0'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default PDFMetersSection;