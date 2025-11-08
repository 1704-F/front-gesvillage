// src/components/dashboard/NotesPDFDownload.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5
  },
  filterInfo: {
    fontSize: 9,
    color: '#999',
    marginTop: 5
  },
  noteCard: {
    marginBottom: 15,
    padding: 12,
    border: '1 solid #ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9'
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottom: '1 solid #eee',
    paddingBottom: 5
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  noteCategory: {
    fontSize: 9,
    color: '#666',
    backgroundColor: '#e0e0e0',
    padding: '3 6',
    borderRadius: 3
  },
  noteMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 8,
    color: '#999'
  },
  noteContent: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
    marginBottom: 8
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 5
  },
  tag: {
    fontSize: 8,
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '2 6',
    borderRadius: 3
  },
  attachmentsSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 3
  },
  attachmentTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4
  },
  attachment: {
    fontSize: 8,
    color: '#666',
    marginBottom: 2
  },
  pinnedBadge: {
    fontSize: 8,
    backgroundColor: '#ffd54f',
    color: '#f57f17',
    padding: '2 6',
    borderRadius: 3,
    marginLeft: 5
  },
  archivedBadge: {
    fontSize: 8,
    backgroundColor: '#e0e0e0',
    color: '#616161',
    padding: '2 6',
    borderRadius: 3,
    marginLeft: 5
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1 solid #ddd',
    paddingTop: 10
  },
  pageNumber: {
    fontSize: 8,
    color: '#999'
  }
});

// Composant PDF
const NotesPDF = ({ notes, filters }) => {
  // Debug : vérifier les dates
  console.log('Notes pour PDF:', notes.map(n => ({ 
    id: n.id, 
    title: n.title, 
    created_at: n.created_at,
    created_at_type: typeof n.created_at
  })));

  const getColorLabel = (color) => {
    const colors = {
      blue: 'Bleu',
      yellow: 'Jaune',
      green: 'Vert',
      red: 'Rouge',
      purple: 'Violet',
      pink: 'Rose',
      gray: 'Gris'
    };
    return colors[color] || color;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Export des Notes</Text>
          <Text style={styles.subtitle}>
            {format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </Text>
          <Text style={styles.filterInfo}>
            {notes.length} note{notes.length > 1 ? 's' : ''} exportée{notes.length > 1 ? 's' : ''}
            {filters.search && ` • Recherche: "${filters.search}"`}
            {filters.category && filters.category !== 'all' && ` • Catégorie: ${filters.category}`}
            {filters.color && filters.color !== 'all' && ` • Couleur: ${getColorLabel(filters.color)}`}
            {filters.showArchived && ' • Archivées incluses'}
          </Text>
        </View>

        {/* Liste des notes */}
        {notes.map((note, index) => (
          <View key={note.id} style={styles.noteCard}>
            {/* Titre et catégorie */}
            <View style={styles.noteHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.noteTitle}>{note.title || 'Sans titre'}</Text>
                {note.is_pinned && (
                  <Text style={styles.pinnedBadge}>📌 Épinglé</Text>
                )}
                {note.is_archived && (
                  <Text style={styles.archivedBadge}>📦 Archivé</Text>
                )}
              </View>
              {note.category && (
                <Text style={styles.noteCategory}>{note.category}</Text>
              )}
            </View>

            {/* Métadonnées */}
            <View style={styles.noteMetadata}>
              <Text>
                {(note.created_at || note.createdAt)
                  ? `Créée le ${format(new Date(note.created_at || note.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}`
                  : 'Date inconnue'
                }
              </Text>
            </View>

            {/* Contenu */}
            {note.content && (
              <Text style={styles.noteContent}>{note.content}</Text>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {note.tags.map((tag, idx) => (
                  <Text key={idx} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            )}

            {/* Pièces jointes */}
            {note.attachments && note.attachments.length > 0 && (
              <View style={styles.attachmentsSection}>
                <Text style={styles.attachmentTitle}>
                  📎 Pièces jointes ({note.attachments.length})
                </Text>
                {note.attachments.map((att, idx) => (
                  <Text key={idx} style={styles.attachment}>
                    • {att.filename} ({att.file_type})
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Pied de page */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} sur ${totalPages}`
          )} 
          fixed 
        />
        <View style={styles.footer} fixed>
          <Text>
            Document généré automatiquement par GesVillage • {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Composant bouton de téléchargement
const NotesPDFDownload = ({ notes, filters }) => {
  const filename = `notes_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;

  if (!notes || notes.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="w-4 h-4 mr-2" />
        Aucune note à exporter
      </Button>
    );
  }

  return (
    <PDFDownloadLink 
      document={<NotesPDF notes={notes} filters={filters} />} 
      fileName={filename}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Génération...' : `Télécharger (${notes.length})`}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default NotesPDFDownload;