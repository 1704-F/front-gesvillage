// SingleDistributionRecordPDF.js
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 5,
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  column: {
    width: '50%',
    paddingRight: 10,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  value: {
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  }
});

// Fonctions utilitaires
const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

// Composant PDF pour un seul enregistrement de distribution
const SingleDistributionRecordPDF = ({ record }) => {
  if (!record) return null;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Détails de l'enregistrement de distribution</Text>
        
        {/* Section d'informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.label}>Source d'eau</Text>
              <Text style={styles.value}>{record.source?.name || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Date de distribution</Text>
              <Text style={styles.value}>{format(new Date(record.distribution_date), 'dd/MM/yyyy', { locale: fr })}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Responsable</Text>
              <Text style={styles.value}>
                {record.employee ? `${record.employee.first_name} ${record.employee.last_name}` : 'N/A'}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Statut</Text>
              <Text style={styles.value}>
                {record.status === 'validated' ? 'Validé' : 'En attente'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Section des détails de distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails de la distribution</Text>
          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.label}>Heure de début</Text>
              <Text style={styles.value}>{record.start_time || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Heure de fin</Text>
              <Text style={styles.value}>{record.end_time || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Compteur début (m³)</Text>
              <Text style={styles.value}>{record.start_meter_reading || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Compteur fin (m³)</Text>
              <Text style={styles.value}>{record.end_meter_reading || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Volume distribué (m³)</Text>
              <Text style={styles.value}>{record.volume_distributed || 'N/A'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Durée de distribution</Text>
              <Text style={styles.value}>{formatDuration(record.distribution_duration)}</Text>
            </View>
          </View>
        </View>
        
        {/* Section zone et bénéficiaires */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zone et bénéficiaires</Text>
          <View style={styles.grid}>

            <View style={styles.column}>
  <Text style={styles.label}>Zone de distribution</Text>
  <Text style={styles.value}>
    {record.quartiers && record.quartiers.length > 0 
      ? record.quartiers.map(q => q.name).join(', ')
      : 'N/A'
    }
  </Text>
</View>

            <View style={styles.column}>
              <Text style={styles.label}>Nombre de bénéficiaires</Text>
              <Text style={styles.value}>{record.beneficiaries > 0 ? record.beneficiaries : 'Non spécifié'}</Text>
            </View>
          </View>
        </View>
        
        {/* Commentaires */}
        {record.comments && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commentaires</Text>
            <Text>{record.comments}</Text>
          </View>
        )}
        
        {/* Informations de validation */}
        {record.status === 'validated' && record.validator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validation</Text>
            <Text>
              Validé par {record.validator.first_name} {record.validator.last_name}
              {record.updatedat && ` le ${format(new Date(record.updatedat), 'dd/MM/yyyy', { locale: fr })}`}
            </Text>
          </View>
        )}
        
        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Document généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default SingleDistributionRecordPDF;