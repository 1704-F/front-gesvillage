// src/components/inventory/InventoryPDF.jsx
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
import { fr } from 'date-fns/locale';
import { BASE_URL } from '../../utils/axios';

// Fonction helper pour formater correctement les montants
const formatCurrency = (value) => {
  // Vérifier si la valeur est un nombre
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "0,00 F";
  
  // Formater la valeur avec un espace comme séparateur de milliers et une virgule pour les décimales
  return numValue
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
};

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
    marginBottom: 15,
    textAlign: 'center',
    color: '#2081E2',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 25,
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
    marginTop: 3,
  },
  emitterDetail: {
    fontSize: 9,
    color: '#4B5563',
    marginBottom: 2,
  },
  tableContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    width: 'auto',
    textAlign: 'center',
    fontSize: 8,
  },
  badgeLow: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  badgeNormal: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  badgeHigh: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  section: {
    margin: 10,
    padding: 10,
    borderTop: '1px solid #E5E7EB',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2081E2',
  },
  noData: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2081E2',
  },
  pieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: 150,
    height: 150,
  },
  categoriesTable: {
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryName: {
    width: '40%',
    fontSize: 10,
  },
  categoryCount: {
    width: '20%',
    fontSize: 10,
    textAlign: 'center',
  },
  categoryQty: {
    width: '20%',
    fontSize: 10,
    textAlign: 'center',
  },
  categoryValue: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
  // Pour les badges de stock
  stockBadge: {
    width: 'auto',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 8,
  },
  lowStock: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  warningStock: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  goodStock: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  // Pour les colonnes des tableaux
  colName: { width: '25%' },
  colCategory: { width: '15%' },
  colStock: { width: '10%' },
  colThreshold: { width: '10%' },
  colPrice: { width: '15%' },
  colValue: { width: '15%' },
  colExpiration: { width: '10%' },
  // Colonnes pour mouvements
  colDate: { width: '15%' },
  colType: { width: '10%' },
  colItem: { width: '20%' },
  colQuantity: { width: '10%' },
  colEmployee: { width: '20%' },
  colReason: { width: '25%' },
  // Badge mouvements
  movementBadgeIn: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  movementBadgeOut: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  // Infos service additionnelles
  serviceInfoRow: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  }
});

// Composant pour la section Articles
const ItemsSection = ({ items }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Inventaire des Articles</Text>
    {items.length > 0 ? (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Nom</Text>
          <Text style={[styles.tableHeaderCell, styles.colCategory]}>Catégorie</Text>
          <Text style={[styles.tableHeaderCell, styles.colStock]}>Stock</Text>
          <Text style={[styles.tableHeaderCell, styles.colThreshold]}>Seuil</Text>
          <Text style={[styles.tableHeaderCell, styles.colPrice]}>Prix unitaire</Text>
          <Text style={[styles.tableHeaderCell, styles.colValue]}>Valeur totale</Text>
          <Text style={[styles.tableHeaderCell, styles.colExpiration]}>Expiration</Text>
        </View>
        
        {items.map((item) => {
          // Calcul de la valeur totale
          const totalValue = parseFloat(item.quantity) * parseFloat(item.unit_price);
          
          // Déterminer le statut du stock
          let stockStatus = 'normal';
          if (item.alert_threshold > 0) {
            if (item.quantity <= item.alert_threshold) {
              stockStatus = 'low';
            } else if (item.quantity <= item.alert_threshold * 1.5) {
              stockStatus = 'warning';
            }
          }
          
          return (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colName]}>{item.name}</Text>
              <Text style={[styles.tableCell, styles.colCategory]}>
                {item.category ? item.category.name : 'Non catégorisé'}
              </Text>
              <View style={[styles.colStock]}>
                <View style={[
                  styles.stockBadge,
                  stockStatus === 'low' ? styles.lowStock :
                  stockStatus === 'warning' ? styles.warningStock : styles.goodStock
                ]}>
                  <Text>{parseFloat(item.quantity).toFixed(2)}</Text>
                </View>
              </View>
              <Text style={[styles.tableCell, styles.colThreshold]}>
                {parseFloat(item.alert_threshold).toFixed(2)}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colValue]}>
                {formatCurrency(totalValue)}
              </Text>
              <Text style={[styles.tableCell, styles.colExpiration]}>
                {item.expiration_date ? format(new Date(item.expiration_date), 'dd/MM/yy') : '-'}
              </Text>
            </View>
          );
        })}
      </View>
    ) : (
      <Text style={styles.noData}>Aucun article à afficher</Text>
    )}
  </View>
);

// Composant pour la section Catégories
const CategoriesSection = ({ categories }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Catégories d'inventaire</Text>
    {categories.length > 0 ? (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '50%' }]}>Catégorie</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Nombre d'articles</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Description</Text>
        </View>
        
        {categories.map((category) => (
          <View key={category.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '50%' }]}>{category.name}</Text>
            <Text style={[styles.tableCell, { width: '25%', textAlign: 'center' }]}>
              {category.itemCount || 0}
            </Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>
              {category.description || '-'}
            </Text>
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.noData}>Aucune catégorie à afficher</Text>
    )}
  </View>
);

// Composant pour la section Mouvements
const MovementsSection = ({ movements }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Mouvements récents</Text>
    {movements.length > 0 ? (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
          <Text style={[styles.tableHeaderCell, styles.colType]}>Type</Text>
          <Text style={[styles.tableHeaderCell, styles.colItem]}>Article</Text>
          <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Quantité</Text>
          <Text style={[styles.tableHeaderCell, styles.colEmployee]}>Employé</Text>
          <Text style={[styles.tableHeaderCell, styles.colReason]}>Raison</Text>
        </View>
        
        {/* Limiter à 30 mouvements pour éviter un PDF trop long */}
        {movements.slice(0, 30).map((movement) => (
          <View key={movement.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colDate]}>
              {format(new Date(movement.movement_date), 'dd/MM/yy HH:mm')}
            </Text>
            <View style={[styles.colType]}>
              <View style={[
                styles.stockBadge,
                movement.movement_type === 'in' ? styles.movementBadgeIn : styles.movementBadgeOut
              ]}>
                <Text>{movement.movement_type === 'in' ? 'Entrée' : 'Sortie'}</Text>
              </View>
            </View>
            <Text style={[styles.tableCell, styles.colItem]}>
              {movement.item ? movement.item.name : 'Inconnu'}
            </Text>
            <Text style={[styles.tableCell, styles.colQuantity]}>
              {parseFloat(movement.quantity).toFixed(2)}
            </Text>
            <Text style={[styles.tableCell, styles.colEmployee]}>
              {movement.employee 
                ? `${movement.employee.first_name} ${movement.employee.last_name}` 
                : 'Non assigné'}
            </Text>
            <Text style={[styles.tableCell, styles.colReason]}>
              {movement.reason || '-'}
            </Text>
          </View>
        ))}
        
        {movements.length > 30 && (
          <Text style={{fontSize: 9, fontStyle: 'italic', marginTop: 5, color: '#6B7280'}}>
            Note: Seuls les 30 mouvements les plus récents sont affichés. L'inventaire complet contient {movements.length} mouvements.
          </Text>
        )}
      </View>
    ) : (
      <Text style={styles.noData}>Aucun mouvement à afficher</Text>
    )}
  </View>
);

// Composant pour la section Statistiques
const StatsSection = ({ stats }) => {
  // Calcul des principales statistiques
  const totalItems = stats?.categoryCounts?.reduce((acc, cat) => acc + parseInt(cat.itemCount || 0), 0) || 0;
  const totalValue = stats?.categoryCounts?.reduce((acc, cat) => acc + parseFloat(cat.totalValue || 0), 0) || 0;
  const lowStockCount = stats?.lowStockItems?.length || 0;
  const expiringCount = stats?.nearExpiryItems?.length || 0;
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Statistiques de l'inventaire</Text>
      
      {/* Cartes de statistiques principales */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total des articles</Text>
          <Text style={styles.statValue}>{totalItems}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Valeur totale du stock</Text>
          <Text style={styles.statValue}>
            {formatCurrency(totalValue)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Articles en alerte de stock</Text>
          <Text style={[styles.statValue, lowStockCount > 0 ? {color: '#DC2626'} : {}]}>
            {lowStockCount}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Articles proche expiration</Text>
          <Text style={[styles.statValue, expiringCount > 0 ? {color: '#D97706'} : {}]}>
            {expiringCount}
          </Text>
        </View>
      </View>
      
      {/* Tableau des catégories avec valeurs */}
      <Text style={[styles.sectionTitle, {fontSize: 12, marginTop: 20}]}>
        Répartition par catégorie
      </Text>
      
      {stats?.categoryCounts?.length > 0 ? (
        <View style={styles.categoriesTable}>
          <View style={[styles.categoryRow, {backgroundColor: '#F9FAFB', fontWeight: 'bold'}]}>
            <Text style={[styles.tableHeaderCell, styles.categoryName]}>Catégorie</Text>
            <Text style={[styles.tableHeaderCell, styles.categoryCount]}>Articles</Text>
            <Text style={[styles.tableHeaderCell, styles.categoryQty]}>Quantité</Text>
            <Text style={[styles.tableHeaderCell, styles.categoryValue]}>Valeur</Text>
          </View>
          
          {stats.categoryCounts.map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category.category?.name || 'Non catégorisé'}</Text>
              <Text style={styles.categoryCount}>{category.itemCount || 0}</Text>
              <Text style={styles.categoryQty}>
                {parseFloat(category.totalQuantity || 0).toFixed(2)}
              </Text>
              <Text style={styles.categoryValue}>
                {formatCurrency(category.totalValue)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noData}>Aucune donnée de catégorie disponible</Text>
      )}
      
      {/* Articles en alerte de stock */}
      {stats?.lowStockItems?.length > 0 && (
        <View style={{marginTop: 20}}>
          <Text style={[styles.sectionTitle, {fontSize: 12, color: '#DC2626'}]}>
            Articles en alerte de stock
          </Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, {width: '40%'}]}>Article</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Catégorie</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Stock actuel</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Seuil d'alerte</Text>
            </View>
            
            {stats.lowStockItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '40%'}]}>{item.name}</Text>
                <Text style={[styles.tableCell, {width: '20%'}]}>
                  {item.category?.name || 'Non catégorisé'}
                </Text>
                <Text style={[styles.tableCell, {width: '20%', color: '#DC2626', fontWeight: 'bold'}]}>
                  {parseFloat(item.quantity).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, {width: '20%'}]}>
                  {parseFloat(item.alert_threshold).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Articles proche de l'expiration */}
      {stats?.nearExpiryItems?.length > 0 && (
        <View style={{marginTop: 20}}>
          <Text style={[styles.sectionTitle, {fontSize: 12, color: '#D97706'}]}>
            Articles proche de l'expiration (30 jours)
          </Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, {width: '40%'}]}>Article</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Catégorie</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Stock</Text>
              <Text style={[styles.tableHeaderCell, {width: '20%'}]}>Date d'expiration</Text>
            </View>
            
            {stats.nearExpiryItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, {width: '40%'}]}>{item.name}</Text>
                <Text style={[styles.tableCell, {width: '20%'}]}>
                  {item.category?.name || 'Non catégorisé'}
                </Text>
                <Text style={[styles.tableCell, {width: '20%'}]}>
                  {parseFloat(item.quantity).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, {width: '20%', color: '#D97706', fontWeight: 'bold'}]}>
                  {format(new Date(item.expiration_date), 'dd/MM/yyyy')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// Entête simplifiée - Titre uniquement, sans infos du service
const Header = () => (
  <View style={{marginBottom: 20}}>
    <Text style={styles.title}>RAPPORT D'INVENTAIRE</Text>
  </View>
);

// Composant Footer à réutiliser sur chaque page
const Footer = ({ formattedDate, pageNumber }) => (
  <>
    <Text style={styles.footer}>
      Rapport généré le {formattedDate}
    </Text>
    <Text style={styles.pageNumber}>Page {pageNumber}</Text>
  </>
);

// Composant principal pour le PDF
const InventoryPDF = ({ data, activeTab }) => {
  const { items, categories, movements, stats } = data || {};
  const formattedDate = format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr });

  // Planifier le contenu des pages en fonction de l'onglet actif
  let pages = [];
  
  // Première page avec les statistiques (toujours incluse)
  pages.push(
    <Page size="A4" style={styles.page} key="stats">
      <Header />
      <Text style={styles.subtitle}>
        Généré le {formattedDate}
      </Text>
      <StatsSection stats={stats} />
      <Footer formattedDate={formattedDate} pageNumber={1} />
    </Page>
  );

  // Page des articles (si tab=items ou tab=all)
  if (activeTab === 'items' || activeTab === 'all') {
    pages.push(
      <Page size="A4" style={styles.page} key="items">
        <Header />
        <ItemsSection items={items || []} />
        <Footer formattedDate={formattedDate} pageNumber={pages.length + 1} />
      </Page>
    );
  }
  
  // Page des catégories et mouvements (si tab=categories, tab=movements ou tab=all)
  if (activeTab === 'categories' || activeTab === 'movements' || activeTab === 'all') {
    pages.push(
      <Page size="A4" style={styles.page} key="cat-mov">
        <Header />
        {(activeTab === 'categories' || activeTab === 'all') && 
          <CategoriesSection categories={categories || []} />}
        {(activeTab === 'movements' || activeTab === 'all') && 
          <MovementsSection movements={movements || []} />}
        <Footer formattedDate={formattedDate} pageNumber={pages.length + 1} />
      </Page>
    );
  }

  return (
    <Document>
      {pages}
    </Document>
  );
};

// Fonction pour générer le PDF de manière asynchrone
export const generateInventoryPDF = async (data, serviceInfo, activeTab = 'all') => {
  try {
    // Vérification et préparation des données
    if (!data) {
      console.error("Données manquantes pour la génération du PDF");
      return null;
    }
    
    return pdf(
      <InventoryPDF 
        data={data}
        activeTab={activeTab}
      />
    ).toBlob();
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
};

export default InventoryPDF;