// src/components/analytics/pdf-sections/PDFExpensesSection.jsx
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

const PDFExpensesSection = ({ data }) => {
  const { stats = {}, byCategory = [], trend = [], salaries = [], byType = [] } = data || {};

  // Préparer les couleurs pour le graphique en camembert
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Convertir explicitement les données de catégorie
  const formattedByCategory = byCategory.map((item, index) => ({
    category_name: item.category_name,
    total_amount: parseFloat(item.total_amount || 0),
    expense_count: parseInt(item.expense_count || 0),
    color: colors[index % colors.length]
  }));

  // Préparer les données pour le graphique par type
  const typeData = byType?.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  return (
    <View style={styles.container}>
      {/* Métriques principales */}
      <View style={styles.metricsGrid}>
        <PDFMetricCard
          title="Dépenses Totales"
          value={`${formatNumber(stats?.totalAmount || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Dépenses en Attente"
          value={`${formatNumber(stats?.pendingAmount || 0)} FCFA`}
        />
        <PDFMetricCard
          title="Nombre de Dépenses"
          value={formatNumber(stats?.totalCount || 0)}
        />
        <PDFMetricCard
          title="Salaires Totaux"
          value={`${formatNumber(salaries.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))} FCFA`}
        />
      </View>

      {/* Graphiques */}
      <View style={{ flexDirection: 'row' }}>
        {/* Répartition par type */}
        <View style={{ width: '100%' }}>
          <Text style={styles.sectionTitle}>Répartition par Type</Text>
          <View style={styles.chartContainer}>
            <PDFBarChart
              data={typeData}
              bars={[
                { dataKey: 'amount', name: 'Montant', color: '#82ca9d' }
              ]}
              xKey="type"
            />
          </View>
        </View>
        </View>

        {/* Répartition par catégorie */}
        <View style={{ width: '100%' }}>
        <View style={{ width: '50%' }}>
          <Text style={styles.sectionTitle}>Répartition par Catégorie</Text>
          <View style={styles.chartContainer}>
            <PDFPieChart
              data={formattedByCategory}
              dataKey="total_amount"
              nameKey="category_name"
              colorKey="color"
            />
          </View>
        </View>
        </View>
      

      {/* Évolution des dépenses */}
      <Text style={styles.sectionTitle}>Évolution des Dépenses</Text>
      <View style={styles.chartContainer}>
        <PDFLineChart
          data={trend || []}
          lines={[
            { dataKey: 'amount', name: 'Montant total', color: '#8884d8' },
            { dataKey: 'recurringAmount', name: 'Dépenses récurrentes', color: '#82ca9d' }
          ]}
          xKey="month"
        />
      </View>

      {/* Tableau des catégories de dépenses */}
      <Text style={styles.sectionTitle}>Détail des Catégories de Dépenses</Text>
      <View>
        {/* Entêtes du tableau */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Catégorie</Text>
          <Text style={styles.col2}>Montant Total</Text>
          <Text style={styles.col3}>Nombre</Text>
          <Text style={styles.col4}>% du Total</Text>
        </View>
        
        {/* Lignes du tableau */}
        {byCategory.length > 0 ? byCategory.slice(0, 6).map((item, index) => (
          <View key={index} style={[styles.row, styles.tableRow]}>
            <Text style={styles.col1}>{item.category_name}</Text>
            <Text style={styles.col2}>{formatNumber(item.total_amount)} FCFA</Text>
            <Text style={styles.col3}>{formatNumber(item.expense_count)}</Text>
            <Text style={styles.col4}>
              {stats?.totalAmount ? 
                `${((item.total_amount / stats?.totalAmount) * 100).toFixed(1)}%` : 
                '0%'
              }
            </Text>
          </View>
        )) : (
          <View style={[styles.row, styles.tableRow]}>
            <Text style={{ ...styles.col1, textAlign: 'center' }}>Aucune donnée de catégorie disponible</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default PDFExpensesSection;