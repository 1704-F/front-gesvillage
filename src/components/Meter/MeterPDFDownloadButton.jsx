// Composant pour l'export PDF des compteurs

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from "../ui/button";

// Définition des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    orientation: 'landscape',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subHeader: {
    backgroundColor: '#f3f4f6',
    padding: 6,
    marginTop: 15,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  smallCell: {
    flex: 0.8,
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  largeCell: {
    flex: 1.5,
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  dateInfo: {
    fontSize: 10,
    marginBottom: 10,
  },
  emptyCell: {
    flex: 0.8,
    padding: 4,
    fontSize: 8,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 20,
  }
});

// Composant PDF pour les compteurs
const MetersPDF = ({ meters, quartiers }) => {
  // Organiser les compteurs par quartier
  const metersByQuartier = {};
  
  // Initialiser chaque quartier avec un tableau vide
  quartiers.forEach(quartier => {
    metersByQuartier[quartier.id] = {
      name: quartier.name,
      meters: []
    };
  });
  
  // Ajouter un groupe pour les compteurs sans quartier assigné
  metersByQuartier['unassigned'] = {
    name: 'Non assigné',
    meters: []
  };
  
  // Classer les compteurs par quartier
  meters.forEach(meter => {
    const quartierId = meter.quartier?.id || 'unassigned';
    if (metersByQuartier[quartierId]) {
      metersByQuartier[quartierId].meters.push(meter);
    } else {
      metersByQuartier['unassigned'].meters.push(meter);
    }
  });
  
  // Trier les compteurs par numéro dans chaque quartier
  Object.keys(metersByQuartier).forEach(quartierId => {
    metersByQuartier[quartierId].meters.sort((a, b) => 
      a.meter_number.localeCompare(b.meter_number)
    );
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>Liste des Compteurs</Text>
        <Text style={styles.dateInfo}>Date d'export: {new Date().toLocaleDateString()}</Text>

        {/* Table d'en-tête */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.smallCell}>Numéro</Text>
          <Text style={styles.smallCell}>N° Série</Text>
          <Text style={styles.largeCell}>Consommateur</Text>
          <Text style={styles.largeCell}>Emplacement</Text>
          <Text style={styles.smallCell}>Facturation</Text>
          <Text style={styles.smallCell}>Statut</Text>
          <Text style={styles.emptyCell}>Ancien Index</Text>
          <Text style={styles.emptyCell}>Nouvel Index</Text>
          <Text style={styles.emptyCell}>Observations</Text>
        </View>

        {/* Contenu par quartier */}
        {Object.keys(metersByQuartier)
          .filter(quartierId => metersByQuartier[quartierId].meters.length > 0) // Ne montrer que les quartiers avec des compteurs
          .sort((a, b) => metersByQuartier[a].name.localeCompare(metersByQuartier[b].name)) // Trier les quartiers par nom
          .map((quartierId, index) => {
            const quartierData = metersByQuartier[quartierId];
            return (
              <View key={quartierId}>
                <Text style={styles.subHeader}>
                  {quartierData.name} ({quartierData.meters.length} compteur{quartierData.meters.length > 1 ? 's' : ''})
                </Text>
                
                {quartierData.meters.map((meter, meterIndex) => (
                  <View key={meter.id} style={styles.tableRow}>
                    <Text style={styles.smallCell}>{meter.meter_number}</Text>
                    <Text style={styles.smallCell}>{meter.serial_number || 'N/A'}</Text>
                    <Text style={styles.largeCell}>
                      {meter.user 
                        ? `${meter.user.first_name} ${meter.user.last_name}`
                        : 'Non assigné'}
                    </Text>
                    <Text style={styles.largeCell}>{meter.quartier?.name || 'Non spécifié'}</Text>
                    <Text style={styles.smallCell}>
                      {meter.billing_type === 'premium' ? 'Premium' : 
                       meter.billing_type === 'free' ? 'Gratuit' : 
                       'Standard'}
                    </Text>
                    <Text style={styles.smallCell}>
                      {meter.status === 'active' ? 'Actif' : 'Inactif'}
                    </Text>
                    <Text style={styles.emptyCell}></Text>
                    <Text style={styles.emptyCell}></Text>
                    <Text style={styles.emptyCell}></Text>
                  </View>
                ))}
              </View>
            );
          })}
      </Page>
    </Document>
  );
};

// Bouton de téléchargement PDF
const MeterPDFDownloadButton = ({ meters, quartiers, filterStatus }) => {
  const filename = `compteurs-${filterStatus === 'all' ? 'tous' : filterStatus}-${new Date().toISOString().split('T')[0]}.pdf`;
  
  return (
    <PDFDownloadLink 
      document={<MetersPDF meters={meters} quartiers={quartiers} />} 
      fileName={filename}
    >
      {({ blob, url, loading, error }) => (
        <Button disabled={loading} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Génération...' : 'Télécharger PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default MeterPDFDownloadButton;