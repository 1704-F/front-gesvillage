// src/components/analytics/AnalyticsPDF.jsx
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  Font, 
  pdf 
} from '@react-pdf/renderer';
import { format } from 'date-fns';

// Sections PDF spécifiques
import PDFOverviewSection from './pdf-sections/PDFOverviewSection';
import PDFConsumersSection from './pdf-sections/PDFConsumersSection';
import PDFMetersSection from './pdf-sections/PDFMetersSection';
import PDFConsumptionSection from './pdf-sections/PDFConsumptionSection';
import PDFInvoicesSection from './pdf-sections/PDFInvoicesSection';
import PDFExpensesSection from './pdf-sections/PDFExpensesSection';
import PDFSummarySection from './pdf-sections/PDFSummarySection';
import { BASE_URL } from '../../utils/axios';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#2081E2',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#4B5563',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2081E2',
  },
  serviceInfo: {
    fontSize: 10,
    color: '#4B5563',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2081E2',
  },
  // Ajoutez ces styles dans la section StyleSheet.create
emitterInfo: {
  marginTop: 20,
  marginBottom: 15,
  padding: 10,
  backgroundColor: '#F9FAFB',
  borderRadius: 5,
},
emitterTitle: {
  fontSize: 11,
  fontWeight: 'bold',
  marginBottom: 5,
},
emitterName: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#2081E2',
  marginBottom: 5,
},
emitterDetail: {
  fontSize: 9,
  color: '#4B5563',
  marginBottom: 2,
},
});

// Composant principal pour le PDF
const AnalyticsPDF = ({ data, period }) => {
  const { 
    consumers, 
    meters, 
    consumption, 
    invoices, 
    expenses, 
    summary, 
    serviceInfo 
  } = data || {};

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={styles.page}>

     
<View style={styles.header}>
  <View style={styles.headerLeft}>
  {serviceInfo?.logo && (
  <Image 
    src={`${BASE_URL}/uploads/logos/${serviceInfo.logo}`} 
    style={styles.logo} 
  />
)}
  </View>
  <View style={styles.headerRight}>
    <Text style={styles.serviceName}>{serviceInfo?.name || 'GesVillage'}</Text>
    <Text style={styles.emitterDetail}>Adresse : {serviceInfo?.location || 'N/A'}</Text>
  <Text style={styles.emitterDetail}>Région : {serviceInfo?.region?.name || 'N/A'}</Text>
  <Text style={styles.emitterDetail}>Commune : {serviceInfo?.commune?.name || 'N/A'}</Text>
  <Text style={styles.emitterDetail}>{serviceInfo?.zone?.type || 'Village'} : {serviceInfo?.zone?.name || 'N/A'}</Text>
    <Text style={styles.serviceInfo}>{serviceInfo?.contact_info || ''}</Text>
  </View>
</View>



        <Text style={styles.title}>RAPPORT ANALYTIQUE</Text>
        <Text style={styles.subtitle}>
          Période: {format(period[0], 'dd MMMM yyyy')} - {format(period[1], 'dd MMMM yyyy')}
        </Text>



        <PDFOverviewSection data={data} />
        
        <Text style={styles.footer}>
          Rapport généré le {format(new Date(), 'dd MMMM yyyy à HH:mm')}
        </Text>
        <Text style={styles.pageNumber}>1</Text>
      </Page>

      {/* Page Consommateurs */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Analyse des Consommateurs</Text>
        <PDFConsumersSection data={consumers} />
        <Text style={styles.pageNumber}>2</Text>
      </Page>

      {/* Page Compteurs */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Analyse des Compteurs</Text>
        <PDFMetersSection data={meters} />
        <Text style={styles.pageNumber}>3</Text>
      </Page>

      {/* Page Consommation */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Analyse de la Consommation</Text>
        <PDFConsumptionSection data={consumption} />
        <Text style={styles.pageNumber}>4</Text>
      </Page>

      {/* Page Factures */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Analyse des Factures</Text>
        <PDFInvoicesSection data={invoices} />
        <Text style={styles.pageNumber}>5</Text>
      </Page>

      {/* Page Dépenses */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Analyse des Dépenses</Text>
        <PDFExpensesSection data={expenses} />
        <Text style={styles.pageNumber}>6</Text>
      </Page>

      {/* Page Bilan */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Bilan Financier</Text>
        <PDFSummarySection data={summary} />
        <Text style={styles.footer}>
          GesVillage - Module Analytique
        </Text>
        <Text style={styles.pageNumber}>7</Text>
      </Page>
    </Document>
  );
};

// Fonction pour générer le PDF de manière asynchrone
export const generateAnalyticsPDF = async (data, period) => {
  return pdf(<AnalyticsPDF data={data} period={period} />).toBlob();
};

export default AnalyticsPDF;