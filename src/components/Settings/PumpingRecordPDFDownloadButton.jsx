// Composant pour l'export PDF des enregistrements de pompage

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from "../ui/button";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Styles pour le PDF
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
  mediumCell: {
    flex: 1,
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
  }
});

// Fonctions utilitaires
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

// Composant PDF pour les enregistrements de pompage
const PumpingRecordsPDF = ({ pumpingRecords, sources }) => {
  // Organiser les enregistrements par source
  const recordsBySource = {};
  
  // Initialiser chaque source avec un tableau vide
  sources.forEach(source => {
    recordsBySource[source.id] = {
      name: source.name,
      records: []
    };
  });
  
  // Ajouter un groupe pour les enregistrements sans source assignée
  recordsBySource['unassigned'] = {
    name: 'Non assigné',
    records: []
  };
  
  // Classer les enregistrements par source
  pumpingRecords.forEach(record => {
    const sourceId = record.source?.id || 'unassigned';
    if (recordsBySource[sourceId]) {
      recordsBySource[sourceId].records.push(record);
    } else {
      recordsBySource['unassigned'].records.push(record);
    }
  });
  
  // Trier les enregistrements par date dans chaque source
  Object.keys(recordsBySource).forEach(sourceId => {
    recordsBySource[sourceId].records.sort((a, b) => 
      new Date(b.pumping_date) - new Date(a.pumping_date)
    );
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.header}>Suivi des Enregistrements de Pompage</Text>
        <Text style={styles.dateInfo}>Date d'export: {format(new Date(), 'dd/MM/yyyy', { locale: fr })}</Text>

        {/* Table d'en-tête */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.smallCell}>Source</Text>
          <Text style={styles.smallCell}>Date</Text>
          <Text style={styles.mediumCell}>Employé</Text>
          <Text style={styles.smallCell}>Heure début</Text>
          <Text style={styles.smallCell}>Heure fin</Text>
          <Text style={styles.smallCell}>Volume (m³)</Text>
          <Text style={styles.smallCell}>Durée</Text>
          <Text style={styles.smallCell}>Statut</Text>
          <Text style={styles.largeCell}>Commentaires</Text>
        </View>

        {/* Contenu par source */}
        {Object.keys(recordsBySource)
          .filter(sourceId => recordsBySource[sourceId].records.length > 0) // Ne montrer que les sources avec des enregistrements
          .sort((a, b) => recordsBySource[a].name.localeCompare(recordsBySource[b].name)) // Trier les sources par nom
          .map((sourceId) => {
            const sourceData = recordsBySource[sourceId];
            return (
              <View key={sourceId}>
                <Text style={styles.subHeader}>
                  {sourceData.name} ({sourceData.records.length} enregistrement{sourceData.records.length > 1 ? 's' : ''})
                </Text>
                
                {sourceData.records.map((record) => {
                  // Déterminer le style de la ligne en fonction du statut
                  const rowStyle = record.status === 'validated' 
                    ? styles.tableRow 
                    : { ...styles.tableRow, backgroundColor: '#fff8e1' }; // Fond jaune clair pour les records en attente

                  return (
                    <View key={record.id} style={rowStyle}>
                      <Text style={styles.smallCell}>{record.source?.name || 'N/A'}</Text>
                      <Text style={styles.smallCell}>
                        {format(new Date(record.pumping_date), 'dd/MM/yyyy', { locale: fr })}
                      </Text>
                      <Text style={styles.mediumCell}>
                        {record.employee 
                          ? `${record.employee.first_name} ${record.employee.last_name}`
                          : 'Non assigné'}
                      </Text>
                      <Text style={styles.smallCell}>{record.start_time || 'N/A'}</Text>
                      <Text style={styles.smallCell}>{record.end_time || 'N/A'}</Text>
                      <Text style={styles.smallCell}>{record.volume_pumped} m³</Text>
                      <Text style={styles.smallCell}>{formatDuration(record.pumping_duration)}</Text>
                      <Text style={styles.smallCell}>
                        {record.status === 'validated' ? 'Validé' : 'En attente'}
                      </Text>
                      <Text style={styles.largeCell}>{record.comments || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
      </Page>
    </Document>
  );
};

// Bouton de téléchargement PDF
const PumpingRecordPDFDownloadButton = ({ pumpingRecords, sources, filterStatus, sourceFilter }) => {
  let fileNameParts = ['pompage'];
  
  // Ajouter le statut au nom de fichier
  if (filterStatus && filterStatus !== 'all') {
    fileNameParts.push(filterStatus);
  }
  
  // Ajouter l'indication du filtre de source
  if (sourceFilter) {
    const source = sources.find(s => s.id.toString() === sourceFilter);
    if (source) {
      fileNameParts.push(source.name.toLowerCase().replace(/\s+/g, '-'));
    }
  }
  
  // Assembler le nom du fichier
  const filename = `${fileNameParts.join('-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  
  return (
    <PDFDownloadLink 
      document={<PumpingRecordsPDF pumpingRecords={pumpingRecords} sources={sources} />} 
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

export default PumpingRecordPDFDownloadButton;