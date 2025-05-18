// src/components/schedule/SchedulePDF.jsx - version améliorée
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

// Styles améliorés pour le PDF
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
    marginTop: 10,
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
  tableCol1: {
    width: '15%',
    fontSize: 10,
  },
  tableCol2: {
    width: '20%',
    fontSize: 10,
  },
  tableCol3: {
    width: '25%',
    fontSize: 10,
  },
  tableCol4: {
    width: '15%',
    fontSize: 10,
  },
  tableCol5: {
    width: '15%',
    fontSize: 10,
  },
  tableCol6: {
    width: '10%',
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
  badgeMaintenance: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  badgeReading: {
    backgroundColor: '#D1FAE5',
    color: '#059669',
  },
  badgePlanned: {
    backgroundColor: '#E5E7EB',
    color: '#374151',
  },
  badgeCompleted: {
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
    bottom: 30,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  emitterInfo: {
    marginTop: 10,
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
  filterInfo: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2081E2',
  },
  noData: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  // Nouveaux styles pour le calendrier
  calendar: {
    marginTop: 15,
    marginBottom: 15,
  },
  calendarHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  dayHeader: {
    width: '14.28%',
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B5563',
  },
  week: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
  day: {
    width: '14.28%',
    height: 70,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  dayNumber: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: '#4B5563',
  },
  otherMonthDay: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  todayDay: {
    backgroundColor: '#EFF6FF',
  },
  eventItem: {
    marginTop: 14, // Pour laisser de la place au numéro du jour
    marginBottom: 2,
    padding: 2,
    borderRadius: 2,
    fontSize: 6,
    color: 'white',
  },
  maintenanceEvent: {
    backgroundColor: '#F59E0B',
  },
  readingEvent: {
    backgroundColor: '#10B981',
  },
  completedEvent: {
    opacity: 1,
  },
  plannedEvent: {
    opacity: 0.7,
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    gap: 15, // Ce ne sera pas supporté dans react-pdf, voir implementation
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15, // Utilisé à la place de gap
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 8,
  }
});

// Rendu du type sous forme de badge
const TypeBadge = ({ type }) => (
  <View style={[
    styles.badge,
    type === 'maintenance' ? styles.badgeMaintenance : styles.badgeReading
  ]}>
    <Text>{type === 'maintenance' ? 'Maintenance' : 'Relevé'}</Text>
  </View>
);

// Rendu du statut sous forme de badge
const StatusBadge = ({ status }) => (
  <View style={[
    styles.badge,
    status === 'completed' ? styles.badgeCompleted : styles.badgePlanned
  ]}>
    <Text>{status === 'completed' ? 'Terminé' : 'Planifié'}</Text>
  </View>
);

// Composant pour le tableau des événements (version simplifiée pour économiser de l'espace)
const ScheduleTable = ({ schedules }) => (
  <View style={styles.tableContainer}>
    <View style={styles.tableHeader}>
      <Text style={[styles.tableCol1, styles.tableHeaderCell]}>Date</Text>
      <Text style={[styles.tableCol2, styles.tableHeaderCell]}>Titre</Text>
      <Text style={[styles.tableCol3, styles.tableHeaderCell]}>Employé</Text>
      <Text style={[styles.tableCol4, styles.tableHeaderCell]}>Type</Text>
      <Text style={[styles.tableCol6, styles.tableHeaderCell]}>Statut</Text>
    </View>
    
    {schedules.length > 0 ? (
      schedules.map((schedule) => (
        <View key={schedule.id} style={styles.tableRow}>
          <Text style={styles.tableCol1}>
            {format(new Date(schedule.start_date), 'dd/MM/yy')}
          </Text>
          <Text style={styles.tableCol2}>{schedule.title}</Text>
          <Text style={styles.tableCol3}>
            {schedule.employee ? 
              `${schedule.employee.first_name} ${schedule.employee.last_name}` : 
              'Non assigné'}
          </Text>
          <View style={styles.tableCol4}>
            <TypeBadge type={schedule.type} />
          </View>
          <View style={styles.tableCol6}>
            <StatusBadge status={schedule.status} />
          </View>
        </View>
      ))
    ) : (
      <View style={styles.tableRow}>
        <Text style={{ flex: 1, textAlign: 'center', color: '#6B7280' }}>
          Aucun événement à afficher
        </Text>
      </View>
    )}
  </View>
);

// Légende pour le calendrier
const CalendarLegend = () => (
  <View wrap={false} style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10}}>
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
      <View style={{width: 12, height: 12, marginRight: 5, borderRadius: 2, backgroundColor: '#F59E0B'}} />
      <Text style={{fontSize: 8}}>Maintenance</Text>
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
      <View style={{width: 12, height: 12, marginRight: 5, borderRadius: 2, backgroundColor: '#10B981'}} />
      <Text style={{fontSize: 8}}>Relevé</Text>
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 15}}>
      <Text style={{fontSize: 8, fontWeight: 'bold'}}>Texte gras</Text>
      <Text style={{fontSize: 8, marginLeft: 3}}>= Terminé</Text>
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Text style={{fontSize: 8, opacity: 0.7}}>Texte léger</Text>
      <Text style={{fontSize: 8, marginLeft: 3}}>= Planifié</Text>
    </View>
  </View>
);

// Composant pour le calendrier
const CalendarView = ({ schedules, period }) => {
  // Calculer le premier et le dernier jour à afficher
  const startDate = new Date(period[0]);
  const endDate = new Date(period[1]);
  
  // Trouver le premier jour de la semaine pour le premier jour du mois
  const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const firstDayToShow = new Date(firstDayOfMonth);
  firstDayToShow.setDate(firstDayToShow.getDate() - firstDayToShow.getDay()); // Premier jour de la semaine
  
  // Trouver le dernier jour du mois + les jours restants pour compléter la dernière semaine
  const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
  const lastDayToShow = new Date(lastDayOfMonth);
  lastDayToShow.setDate(lastDayToShow.getDate() + (6 - lastDayToShow.getDay())); // Dernier jour de la semaine
  
  // Générer les semaines
  const weeks = [];
  const currentDay = new Date(firstDayToShow);
  
  while (currentDay <= lastDayToShow) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    weeks.push(week);
  }
  
  // Fonction pour vérifier si un événement doit apparaître dans une journée donnée
  const isEventInDay = (event, day) => {
    const eventStart = new Date(event.start_date);
    const eventEnd = new Date(event.end_date);
    
    // Normaliser pour comparer seulement les dates
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(0, 0, 0, 0);
    day.setHours(0, 0, 0, 0);
    
    return day >= eventStart && day <= eventEnd;
  };
  
  // Fonction pour vérifier si une journée est dans le mois en cours
  const isCurrentMonth = (day) => {
    return day.getMonth() === startDate.getMonth();
  };
  
  // Fonction pour vérifier si c'est aujourd'hui
  const isToday = (day) => {
    const today = new Date();
    return day.getDate() === today.getDate() && 
           day.getMonth() === today.getMonth() && 
           day.getFullYear() === today.getFullYear();
  };
  
  // Jours de la semaine
  const weekDays = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  
  return (
    <View style={styles.calendar}>
      {/* En-tête avec les jours de la semaine */}
      <View style={styles.calendarHeader}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.dayHeader}>{day}</Text>
        ))}
      </View>
      
      {/* Grille du calendrier */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((day, dayIndex) => {
            // Filtrer les événements pour cette journée
            const dayEvents = schedules.filter(event => isEventInDay(event, new Date(day)));
            
            // Déterminer le style de la journée
            const dayStyle = [
              styles.day,
              !isCurrentMonth(day) && styles.otherMonthDay,
              isToday(day) && styles.todayDay
            ];
            
            return (
              <View key={dayIndex} style={dayStyle}>
                <Text style={styles.dayNumber}>{day.getDate()}</Text>
                
                {/* Afficher les événements de la journée (limités à 3 max pour l'espace) */}
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <View key={eventIndex} style={[
                    styles.eventItem,
                    event.type === 'maintenance' ? styles.maintenanceEvent : styles.readingEvent,
                    event.status === 'completed' ? styles.completedEvent : styles.plannedEvent
                  ]}>
                    <Text style={{
                      color: 'white', 
                      fontSize: 6,
                      fontWeight: event.status === 'completed' ? 'bold' : 'normal'
                    }}>
                      {event.title.length > 10 ? event.title.substring(0, 10) + '...' : event.title}
                    </Text>
                  </View>
                ))}
                
                {/* Indicateur s'il y a plus d'événements */}
                {dayEvents.length > 3 && (
                  <Text style={{
                    fontSize: 6, 
                    color: '#4B5563', 
                    textAlign: 'center',
                    marginTop: 2
                  }}>
                    +{dayEvents.length - 3} plus
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

// Composant principal pour le PDF
const SchedulePDF = ({ schedules, serviceInfo, period, filters }) => {
  // Grouper les événements par type pour les statistiques
  const maintenanceEvents = schedules.filter(s => s.type === 'maintenance');
  const readingEvents = schedules.filter(s => s.type === 'reading');
  const completedEvents = schedules.filter(s => s.status === 'completed');
  const plannedEvents = schedules.filter(s => s.status === 'planned');
  
  // Fonction pour afficher les filtres appliqués
  const getFilterDescription = () => {
    const filterParts = [];
    
    if (filters.employeeId && filters.employeeId !== 'all') {
      const employee = schedules.find(s => s.employee_id === parseInt(filters.employeeId))?.employee;
      if (employee) {
        filterParts.push(`Employé: ${employee.first_name} ${employee.last_name}`);
      }
    }
    
    if (filters.type && filters.type !== 'all') {
      filterParts.push(`Type: ${filters.type === 'maintenance' ? 'Maintenance' : 'Relevé'}`);
    }
    
    if (filters.status && filters.status !== 'all') {
      filterParts.push(`Statut: ${filters.status === 'completed' ? 'Terminé' : 'Planifié'}`);
    }
    
    return filterParts.length > 0 
      ? `Filtres appliqués: ${filterParts.join(', ')}` 
      : 'Aucun filtre appliqué';
  };

  return (
    <Document>
      {/* Page en format paysage */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* En-tête avec logo et info service */}
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

        {/* Titre et période */}
        <Text style={styles.title}>PLANNING</Text>
        <Text style={styles.subtitle}>
          Période: {format(new Date(period[0]), 'dd MMMM yyyy', { locale: fr })} - {format(new Date(period[1]), 'dd MMMM yyyy', { locale: fr })}
        </Text>
        
        {/* Info sur les filtres */}
        <Text style={styles.filterInfo}>{getFilterDescription()}</Text>
        
        {/* Statistiques */}
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          {/* Colonne de gauche: Résumé */}
          <View style={{flex: 1, padding: 10}}>
            <Text style={styles.sectionTitle}>Résumé</Text>
            <View style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 10 }}>Total des événements: {schedules.length}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontSize: 10 }}>Maintenances: {maintenanceEvents.length}</Text>
              <Text style={{ fontSize: 10 }}>Relevés: {readingEvents.length}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10 }}>Terminés: {completedEvents.length}</Text>
              <Text style={{ fontSize: 10 }}>Planifiés: {plannedEvents.length}</Text>
            </View>
            <View style={{ marginTop: 5 }}>
              <Text style={{ fontSize: 10 }}>Taux de complétion: {schedules.length > 0 ? Math.round((completedEvents.length / schedules.length) * 100) : 0}%</Text>
            </View>
          </View>
          
          {/* Colonne de droite: Légende */}
          <View style={{flex: 1, padding: 10}}>
            <Text style={styles.sectionTitle}>Légende</Text>
            <CalendarLegend />
          </View>
        </View>
        
        {/* Vue calendrier */}
        <CalendarView schedules={schedules} period={period} />
        
        {/* Tableau des événements (version compacte) */}
        <ScheduleTable schedules={schedules} />
        
        {/* Pied de page */}
        <Text style={styles.footer}>
          Rapport généré le {format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}
        </Text>
        <Text style={styles.pageNumber}>1</Text>
      </Page>
    </Document>
  );
};

// Fonction pour générer le PDF de manière asynchrone
export const generateSchedulePDF = async (schedules, serviceInfo, period, filters = {}) => {
  return pdf(<SchedulePDF 
    schedules={schedules} 
    serviceInfo={serviceInfo} 
    period={period} 
    filters={filters} 
  />).toBlob();
};

export default SchedulePDF;