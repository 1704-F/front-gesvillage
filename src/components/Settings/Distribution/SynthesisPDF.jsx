import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
    borderBottom: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  kpiCard: {
    width: '25%',
    padding: 10,
    marginBottom: 10,
  },
  kpiTitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  kpiSubtitle: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableText: {
    fontSize: 9,
    color: '#111827',
  },
  tableCellSpanned: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
  },
  alertBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: 10,
    marginVertical: 5,
    borderRadius: 4,
  },
  alertText: {
    fontSize: 10,
    color: '#92400E',
  },
  recommendationBox: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
    padding: 10,
    marginVertical: 5,
    borderRadius: 4,
  },
  recommendationText: {
    fontSize: 10,
    color: '#1E40AF',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
  },
});

// Fonction pour formater les nombres avec des espaces
const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction pour formater les montants
const formatCurrency = (amount) => {
  return `${formatNumber(amount)} FCFA`;
};

const SynthesisPDF = ({ data, period }) => {
  if (!data) return null;

  // Copie du tableau avec la même structure que le frontend
  const quartierData = [...data.byQuartier];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Synthèse de la Distribution d'Eau</Text>
          <Text style={styles.subtitle}>
            Période : {format(period[0], 'dd MMMM yyyy', { locale: fr })} - {format(period[1], 'dd MMMM yyyy', { locale: fr })}
          </Text>
          <Text style={styles.subtitle}>
            Généré le {format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </Text>
        </View>

        {/* Indicateurs clés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicateurs Clés</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Volume Pompé</Text>
              <Text style={styles.kpiValue}>{formatNumber(data.totals.pumped)} m³</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Volume Distribué</Text>
              <Text style={styles.kpiValue}>{formatNumber(data.totals.distributed)} m³</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Volume Consommé</Text>
              <Text style={styles.kpiValue}>{formatNumber(data.totals.consumed)} m³</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Pertes</Text>
              <Text style={styles.kpiValue}>{data.totals.lossPercentage.toFixed(1)}%</Text>
              <Text style={styles.kpiSubtitle}>{formatNumber(data.totals.volumeLoss)} m³</Text>
            </View>
          </View>

          {/* Indicateurs financiers */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Recette Théorique</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.totals.theoreticalRevenue)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Recette Réelle</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.totals.actualRevenue)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Différence</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.totals.revenueDifference)}</Text>
              <Text style={styles.kpiSubtitle}>
                {((data.totals.revenueDifference / data.totals.theoreticalRevenue) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiTitle}>Rendement Hydraulique</Text>
              <Text style={styles.kpiValue}>{data.totals.hydraulicEfficiency.toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        {/* Performance par quartier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance par Quartier</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <Text style={styles.tableCellHeader}>Quartier</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Distribué (m³)</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Consommé (m³)</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Total consommé</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Pertes</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Recette Théorique</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Recette Réelle</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.tableCellHeader}>Différence</Text>
              </View>
            </View>
            {quartierData.slice(0, 10).map((quartier, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? { backgroundColor: '#F8FAFC' } : { backgroundColor: '#F1F5F9' }]}>
                <View style={[styles.tableCell, { flex: 1.5 }]}>
                  <Text style={styles.tableText}>{quartier.name}</Text>
                </View>
                {/* Distribué - Valeur fusionnée avec fond différent */}
                <View style={[index === 0 ? { ...styles.tableCellSpanned, backgroundColor: '#E0F2FE' } : styles.tableCell]}>
                  {index === 0 ? (
                    <Text style={styles.tableText}>{formatNumber(quartier.distributed)}</Text>
                  ) : (
                    <Text style={styles.tableText}> </Text>
                  )}
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.tableText}>{formatNumber(quartier.consumed)}</Text>
                </View>
                {/* Total consommé - Valeur fusionnée avec fond différent */}
                <View style={[index === 0 ? { ...styles.tableCellSpanned, backgroundColor: '#F1F5F9' } : styles.tableCell]}>
                  {index === 0 ? (
                    <Text style={styles.tableText}>{formatNumber(data.totals.consumed)}</Text>
                  ) : (
                    <Text style={styles.tableText}> </Text>
                  )}
                </View>
                <View style={styles.tableCell}>
                  <Text style={[styles.tableText, quartier.lossPercentage > 15 && { color: '#EF4444' }]}>
                    {formatNumber(quartier.volumeLoss)}
                  </Text>
                </View>
                {/* Recettes - Valeurs fusionnées avec fonds différents */}
                <View style={[index === 0 ? { ...styles.tableCellSpanned, backgroundColor: '#ECFCCB' } : styles.tableCell]}>
                  {index === 0 ? (
                    <Text style={styles.tableText}>{formatCurrency(data.totals.theoreticalRevenue)}</Text>
                  ) : (
                    <Text style={styles.tableText}> </Text>
                  )}
                </View>
                <View style={[index === 0 ? { ...styles.tableCellSpanned, backgroundColor: '#F0FDFA' } : styles.tableCell]}>
                  {index === 0 ? (
                    <Text style={styles.tableText}>{formatCurrency(data.totals.actualRevenue)}</Text>
                  ) : (
                    <Text style={styles.tableText}> </Text>
                  )}
                </View>
                <View style={[index === 0 ? { ...styles.tableCellSpanned, backgroundColor: '#EEF2FF' } : styles.tableCell]}>
                  {index === 0 ? (
                    <Text style={styles.tableText}>{formatCurrency(data.totals.revenueDifference)}</Text>
                  ) : (
                    <Text style={styles.tableText}> </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Anomalies */}
        {data.anomalies && data.anomalies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anomalies Détectées</Text>
            {data.anomalies.map((anomaly, index) => (
              <View key={index} style={styles.alertBox}>
                <Text style={styles.alertText}>
                  • {anomaly.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommandations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommandations</Text>
            {data.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationBox}>
                <Text style={styles.recommendationText}>
                  • {rec.message}
                </Text>
                <Text style={[styles.recommendationText, { marginTop: 3, fontSize: 9 }]}>
                  Action: {rec.action}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Pied de page */}
        <Text style={styles.footer}>
          Rapport généré automatiquement - Système de Gestion de l'Eau
        </Text>
      </Page>
    </Document>
  );
};

export default SynthesisPDF;