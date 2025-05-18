// src/components/schedule/PlanningCalendarView.jsx
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Calendar,
  Views,
  momentLocalizer
} from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';


import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { format } from 'date-fns';
import { Download, List, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { fr } from 'date-fns/locale';

// Configuration du localizer pour le calendrier
moment.locale('fr');
const localizer = momentLocalizer(moment);

const PlanningCalendarView = forwardRef(({ 
  schedules, 
  employees, 
  onExportPDF,
  onEditSchedule,
  onToggleStatus 
}, ref) => {
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    employeeId: 'all',
    type: 'all',
    status: 'all'
  });

  // Exposer les filtres via la ref
  useImperativeHandle(ref, () => ({
    filters
  }));
  

  // Transformer les schedules en événements pour le calendrier
  useEffect(() => {
    if (schedules && schedules.length > 0) {
      const formattedEvents = schedules
        .filter(schedule => {
          if (filters.employeeId !== 'all' && schedule.employee_id !== parseInt(filters.employeeId)) return false;
          if (filters.type !== 'all' && schedule.type !== filters.type) return false;
          if (filters.status !== 'all' && schedule.status !== filters.status) return false;
          return true;
        })
        .map(schedule => ({
          id: schedule.id,
          title: schedule.title,
          start: new Date(schedule.start_date),
          end: new Date(schedule.end_date),
          type: schedule.type,
          status: schedule.status,
          employee: schedule.employee ? 
            `${schedule.employee.first_name} ${schedule.employee.last_name}` : 
            'Non assigné',
          description: schedule.description,
          allDay: true,
          resource: schedule
        }));
      setEvents(formattedEvents);
    }
  }, [schedules, filters]);

  // Fonction pour styliser les événements
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3B82F6'; // Bleu par défaut
    let borderColor = '#2563EB';
    
    // Couleur selon le type
    if (event.type === 'maintenance') {
      backgroundColor = '#F59E0B'; // Jaune pour maintenance
      borderColor = '#D97706';
    } else if (event.type === 'reading') {
      backgroundColor = '#10B981'; // Vert pour relevé
      borderColor = '#059669';
    }
    
    // Ajuster l'opacité selon le statut
    const opacity = event.status === 'completed' ? 1 : 0.7;
    
    return {
      style: {
        backgroundColor,
        borderColor,
        opacity,
        color: '#FFFFFF',
        borderRadius: '4px',
        border: '1px solid ' + borderColor,
        display: 'block',
        cursor: 'pointer'
      }
    };
  };

  // Afficher les détails d'un événement au clic
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // Fermer la modal des détails
  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  // Gérer le changement de filtre
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Barre d'outils supérieure */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={view === 'list' ? 'default' : 'outline'} 
            onClick={() => setView('list')}
            size="sm"
          >
            <List className="h-4 w-4 mr-2" />
            Liste
          </Button>
          <Button 
            variant={view === 'month' ? 'default' : 'outline'} 
            onClick={() => setView('month')}
            size="sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Mois
          </Button>
          <Button 
            variant={view === 'week' ? 'default' : 'outline'} 
            onClick={() => setView('week')}
            size="sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Semaine
          </Button>
          <Button 
            variant={view === 'day' ? 'default' : 'outline'} 
            onClick={() => setView('day')}
            size="sm"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Jour
          </Button>
        </div>
        
        <Button onClick={onExportPDF} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter PDF
        </Button>
      </div>
      
      {/* Filtres */}
      <div className="flex space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>
        
        <div className="flex-1 grid grid-cols-3 gap-4">
          <Select
            value={filters.employeeId}
            onValueChange={(value) => handleFilterChange('employeeId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="reading">Relevé</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="planned">Planifié</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Vue Calendrier */}
      {view !== 'list' && (
        <Card className="p-4">
          <div style={{ height: 700 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={{
                month: true,
                week: true,
                day: true,
              }}
              view={view}
              onView={(newView) => setView(newView)}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              messages={{
                today: "Aujourd'hui",
                previous: "Précédent",
                next: "Suivant",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                noEventsInRange: "Aucun événement dans cette période."
              }}
              formats={{
                dateFormat: 'D',
                dayFormat: 'ddd DD/MM',
                monthHeaderFormat: 'MMMM YYYY',
                dayHeaderFormat: 'dddd DD MMMM YYYY',
                dayRangeHeaderFormat: ({ start, end }) => `${moment(start).format('DD MMM YYYY')} - ${moment(end).format('DD MMM YYYY')}`
              }}
            />
          </div>
        </Card>
      )}
      
      {/* Vue Liste (si sélectionnée) */}
      {view === 'list' && (
        <Card>
          <div className="divide-y">
            {events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.employee}</p>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant={event.type === 'maintenance' ? 'warning' : 'success'}>
                          {event.type === 'maintenance' ? 'Maintenance' : 'Relevé'}
                        </Badge>
                        <Badge variant={event.status === 'completed' ? 'success' : 'secondary'}>
                          {event.status === 'completed' ? 'Terminé' : 'Planifié'}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="mt-2 text-sm">{event.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(event.start, 'dd/MM/yyyy')}
                      </p>
                      {!moment(event.start).isSame(event.end, 'day') && (
                        <p className="text-sm text-gray-500">
                          au {format(event.end, 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Aucun événement ne correspond aux critères sélectionnés.
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* Modal de détails d'événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{selectedEvent.title}</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Assigné à</p>
                  <p className="font-medium">{selectedEvent.employee}</p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={selectedEvent.type === 'maintenance' ? 'warning' : 'success'}>
                    {selectedEvent.type === 'maintenance' ? 'Maintenance' : 'Relevé'}
                  </Badge>
                  <Badge variant={selectedEvent.status === 'completed' ? 'success' : 'secondary'}>
                    {selectedEvent.status === 'completed' ? 'Terminé' : 'Planifié'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Période</p>
                <p className="font-medium">
                  Du {format(selectedEvent.start, 'dd/MM/yyyy')} 
                  au {format(selectedEvent.end, 'dd/MM/yyyy')}
                </p>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{selectedEvent.description}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleCloseDetails}
                >
                  Fermer
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    onEditSchedule(selectedEvent.resource);
                    handleCloseDetails();
                  }}
                >
                  Modifier
                </Button>
                <Button 
                  onClick={() => {
                    onToggleStatus(selectedEvent.id);
                    handleCloseDetails();
                  }}
                >
                  {selectedEvent.status === 'completed' ? 'Marquer comme planifié' : 'Marquer comme terminé'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PlanningCalendarView;