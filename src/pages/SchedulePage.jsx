// src/pages/SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast/use-toast";
import { Input } from "../components/ui/input";
import { format } from 'date-fns';
import { Calendar, Download } from 'lucide-react';
import { axiosPrivate as api } from '../utils/axios';

// Importer les composants
import PlanningCalendarView from '../components/schedule/PlanningCalendarView';
import { ScheduleForm } from '../components/schedule/ScheduleForm';
import { generateSchedulePDF } from '../components/schedule/SchedulePDF';

const SchedulePage = () => {
  // États
  const [schedules, setSchedules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, editing: null });
  const [serviceInfo, setServiceInfo] = useState(null);
  
  // État pour les dates
  const [dateRange, setDateRange] = useState([
    (() => {
      const date = new Date();
      date.setDate(1); // Premier jour du mois
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1, 0); // Dernier jour du mois
      date.setHours(23, 59, 59, 999);
      return date;
    })()
  ]);

  const { toast } = useToast();

  // Chargement initial des données
  useEffect(() => {
    Promise.all([
      fetchSchedules(),
      fetchEmployees(),
      fetchServiceInfo()
    ]).finally(() => setLoading(false));
  }, [dateRange[0], dateRange[1]]);

  // Récupérer les événements planifiés
  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules', {
        params: {
          start_date: format(dateRange[0], 'yyyy-MM-dd'),
          end_date: format(dateRange[1], 'yyyy-MM-dd')
        }
      });
      setSchedules(response.data.data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les plannings",
        variant: "destructive"
      });
    }
  };

  // Récupérer les employés
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les employés", 
        variant: "destructive"
      });
    }
  };

  // Récupérer les informations du service
  const fetchServiceInfo = async () => {
    try {
      // Essayer de récupérer les informations du service
      const response = await api.get('/services/current');
      if (response.data && response.data.success) {
        setServiceInfo(response.data.data);
      } else {
        // Si le service n'existe pas, afficher une notification
        toast({
          title: "Attention",
          description: "Impossible de récupérer les informations du service",
          variant: "warning"
        });
        setServiceInfo(null); // Définir à null au lieu de valeurs par défaut
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations du service",
        variant: "destructive"
      });
      setServiceInfo(null); // Définir à null au lieu de valeurs par défaut
    }
  };

  // Ajouter/modifier un événement
  const handleScheduleSubmit = async (data) => {
    try {
      if (scheduleModal.editing) {
        await api.put(`/schedules/${scheduleModal.editing.id}`, data);
        toast({
          title: "Succès",
          description: "Planning modifié avec succès"
        });
      } else {
        await api.post('/schedules', data);
        toast({
          title: "Succès",
          description: "Événement ajouté au planning avec succès"
        });
      }
      setScheduleModal({ isOpen: false, editing: null });
      fetchSchedules();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  // Changer le statut (terminé/planifié)
  const handleToggleStatus = async (scheduleId) => {
    try {
      await api.patch(`/schedules/${scheduleId}/toggle-status`);
      toast({
        title: "Succès",
        description: "Statut modifié avec succès"
      });
      fetchSchedules();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  // Exporter le PDF
  const handleExportPDF = async () => {
    try {
      // Option 1: Utiliser la génération côté client (React-PDF)
      if (window.ReactPDF) {
        const pdfBlob = await generateSchedulePDF(schedules, serviceInfo, dateRange);
        
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `planning_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Succès",
          description: "PDF généré avec succès"
        });
      } 
      // Option 2: Utiliser la génération côté serveur
      else {
        const response = await api.get('/schedules/export-pdf', {
          params: {
            start_date: format(dateRange[0], 'yyyy-MM-dd'),
            end_date: format(dateRange[1], 'yyyy-MM-dd')
          },
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `planning_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        toast({
          title: "Succès",
          description: "PDF généré avec succès"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Planning des activités</h1>
        <div className="flex items-center gap-4">
          {/* Sélecteur de dates */}
          <div className="flex gap-2">
            <div className="relative">
              <Input
                type="date"
                className="pl-10 pr-3 py-2"
                value={format(dateRange[0], 'yyyy-MM-dd')}
                onChange={(e) => setDateRange([
                  e.target.value ? new Date(e.target.value) : null,
                  dateRange[1]
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                type="date"
                className="pl-10 pr-3 py-2"
                value={format(dateRange[1], 'yyyy-MM-dd')}
                onChange={(e) => setDateRange([
                  dateRange[0],
                  e.target.value ? new Date(e.target.value) : null
                ])}
              />
              <Calendar className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <Button onClick={() => setScheduleModal({ isOpen: true, editing: null })}>
            Ajouter au planning
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <PlanningCalendarView
          schedules={schedules}
          employees={employees}
          onExportPDF={handleExportPDF}
          onEditSchedule={(schedule) => setScheduleModal({ isOpen: true, editing: schedule })}
          onToggleStatus={handleToggleStatus}
        />
      </Card>

      {/* Formulaire d'ajout/modification d'événement */}
      <ScheduleForm
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, editing: null })}
        editingSchedule={scheduleModal.editing}
        employees={employees.filter(e => e.status === 'active')}
        onSubmit={handleScheduleSubmit}
      />
    </div>
  );
};

export default SchedulePage;