// src/components/analytics/AnalyticsPDF.jsx
import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Créer des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  serviceInfo: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#2563EB',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#E5E7EB',
    padding: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    padding: 5,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    padding: 5,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metricCard: {
    width: '30%',
    margin: '1.5%',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  metricTitle: {
    fontSize: 10,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
  },
});

const AnalyticsPDF = ({ data, currentPeriod }) => {
  const { consumers, meters, consumption, invoices, expenses, summary, serviceInfo } = data;
  
  // Formater les dates pour l'affichage
  const startDate = format(currentPeriod[0], 'dd MMMM yyyy', { locale: fr });
  const endDate = format(currentPeriod[1], 'dd MMMM yyyy', { locale: fr });
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          {serviceInfo?.logo && (
            <Image
              src={`${process.env.REACT_APP_API_URL}/${serviceInfo.logo}`}
              style={styles.logo}
            />
          )}
          <View style={styles.serviceInfo}>
            <Text>{serviceInfo?.name || 'GesVillage'}</Text>
            <Text>{serviceInfo?.location || ''}</Text>
            <Text>{serviceInfo?.contact_info || ''}</Text>
          </View>
        </View>
        
        {/* Titre du rapport */}
        <Text style={styles.title}>Rapport Analytique</Text>
        <Text style={styles.subtitle}>Période: {startDate} - {endDate}</Text>
        
        {/* Section Résumé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          
          <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Consommateurs Actifs</Text>
             <Text style={styles.metricValue}>{consumers?.stats?.activeConsumers || 0}</Text>
           </View>
           
           <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Compteurs Actifs</Text>
             <Text style={styles.metricValue}>{meters?.stats?.activeMeters || 0}</Text>
           </View>
           
           <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Consommation Totale</Text>
             <Text style={styles.metricValue}>{consumption?.stats?.totalConsumption || 0} m³</Text>
           </View>
           
           <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Revenus Totaux</Text>
             <Text style={styles.metricValue}>{summary?.stats?.totalRevenue || 0} FCFA</Text>
           </View>
           
           <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Dépenses Totales</Text>
             <Text style={styles.metricValue}>{summary?.stats?.totalExpense || 0} FCFA</Text>
           </View>
           
           <View style={styles.metricCard}>
             <Text style={styles.metricTitle}>Marge Opérationnelle</Text>
             <Text style={styles.metricValue}>{summary?.stats?.margin || 0}%</Text>
           </View>
         </View>
       </View>
       
       {/* Section Finances */}
       <View style={styles.section} break>
         <Text style={styles.sectionTitle}>Finances</Text>
         
         <View style={styles.table}>
           <View style={styles.tableRow}>
             <Text style={styles.tableColHeader}>Catégorie</Text>
             <Text style={styles.tableColHeader}>Revenus (FCFA)</Text>
             <Text style={styles.tableColHeader}>Dépenses (FCFA)</Text>
           </View>
           
           <View style={styles.tableRow}>
             <Text style={styles.tableCol}>Factures d'eau</Text>
             <Text style={styles.tableCol}>{summary?.stats?.invoiceRevenue || 0}</Text>
             <Text style={styles.tableCol}>-</Text>
           </View>
           
           <View style={styles.tableRow}>
             <Text style={styles.tableCol}>Dons</Text>
             <Text style={styles.tableCol}>{summary?.stats?.donationRevenue || 0}</Text>
             <Text style={styles.tableCol}>-</Text>
           </View>
           
           <View style={styles.tableRow}>
             <Text style={styles.tableCol}>Opérationnelles</Text>
             <Text style={styles.tableCol}>-</Text>
             <Text style={styles.tableCol}>{summary?.stats?.operationalExpense || 0}</Text>
           </View>
           
           <View style={styles.tableRow}>
             <Text style={styles.tableCol}>Salaires</Text>
             <Text style={styles.tableCol}>-</Text>
             <Text style={styles.tableCol}>{summary?.stats?.salaryExpense || 0}</Text>
           </View>
           
           <View style={styles.tableRow}>
             <Text style={styles.tableCol}>TOTAL</Text>
             <Text style={styles.tableCol}>{summary?.stats?.totalRevenue || 0}</Text>
             <Text style={styles.tableCol}>{summary?.stats?.totalExpense || 0}</Text>
           </View>
         </View>
         
         <Text>Bénéfice Net: {summary?.stats?.profit || 0} FCFA</Text>
         <Text>Ratio Dépenses/Revenus: {summary?.stats?.expenseRatio || 0}%</Text>
       </View>
       
       {/* Section Consommation */}
       <View style={styles.section} break>
         <Text style={styles.sectionTitle}>Consommation</Text>
         
         <Text>Consommation Totale: {consumption?.stats?.totalConsumption || 0} m³</Text>
         <Text>Consommation Moyenne par Compteur: {consumption?.stats?.averageConsumption || 0} m³</Text>
         
         <Text style={{ marginTop: 10, marginBottom: 5, fontWeight: 'bold' }}>Top 5 Quartiers par Consommation</Text>
         <View style={styles.table}>
           <View style={styles.tableRow}>
             <Text style={styles.tableColHeader}>Quartier</Text>
             <Text style={styles.tableColHeader}>Consommation (m³)</Text>
             <Text style={styles.tableColHeader}>% du Total</Text>
           </View>
           
           {consumption?.byZone?.slice(0, 5).map((zone, index) => (
             <View style={styles.tableRow} key={index}>
               <Text style={styles.tableCol}>{zone.name}</Text>
               <Text style={styles.tableCol}>{zone.total_consumption}</Text>
               <Text style={styles.tableCol}>
                 {consumption.stats.totalConsumption ? 
                   ((zone.total_consumption / consumption.stats.totalConsumption) * 100).toFixed(1) + '%' : 
                   '0%'
                 }
               </Text>
             </View>
           ))}
         </View>
       </View>
       
       {/* Section Consommateurs */}
       <View style={styles.section} break>
         <Text style={styles.sectionTitle}>Consommateurs</Text>
         
         <Text>Total Consommateurs: {consumers?.stats?.totalConsumers || 0}</Text>
         <Text>Consommateurs Actifs: {consumers?.stats?.activeConsumers || 0} ({consumers?.stats?.activeRate?.toFixed(1) || 0}%)</Text>
         <Text>Nouveaux Consommateurs: {consumers?.stats?.newConsumers || 0}</Text>
         
         <Text style={{ marginTop: 10, marginBottom: 5, fontWeight: 'bold' }}>Distribution par Quartier</Text>
         <View style={styles.table}>
           <View style={styles.tableRow}>
             <Text style={styles.tableColHeader}>Quartier</Text>
             <Text style={styles.tableColHeader}>Nombre</Text>
             <Text style={styles.tableColHeader}>% du Total</Text>
           </View>
           
           {consumers?.distribution?.slice(0, 5).map((zone, index) => (
             <View style={styles.tableRow} key={index}>
               <Text style={styles.tableCol}>{zone.name}</Text>
               <Text style={styles.tableCol}>{zone.consumer_count}</Text>
               <Text style={styles.tableCol}>
                 {consumers.stats.totalConsumers ? 
                   ((zone.consumer_count / consumers.stats.totalConsumers) * 100).toFixed(1) + '%' : 
                   '0%'
                 }
               </Text>
             </View>
           ))}
         </View>
       </View>
       
       {/* Pied de page */}
       <View style={styles.footer}>
         <Text>Rapport généré le {format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}</Text>
         <Text>GesVillage - Module Analytique</Text>
       </View>
     </Page>
   </Document>
 );
};

export default AnalyticsPDF;
           