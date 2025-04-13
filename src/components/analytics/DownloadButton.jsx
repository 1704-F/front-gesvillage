// src/components/analytics/DownloadButton.jsx
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Download } from 'lucide-react';
import { useToast } from "../ui/toast/use-toast";
import { format } from 'date-fns';
import { generateAnalyticsPDF } from './AnalyticsPDF';

const DownloadButton = ({ data, period }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // Générer le PDF côté client
      const blob = await generateAnalyticsPDF(data, period);
      
      // Créer un URL temporaire et déclencher le téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Analytique_${format(period[0], 'dd-MM-yyyy')}_${format(period[1], 'dd-MM-yyyy')}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: "Succès",
        description: "Rapport analytique téléchargé avec succès"
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le rapport analytique"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline"
      className="flex items-center gap-2 whitespace-nowrap"
      disabled={loading}
      onClick={handleDownload}
    >
      <Download className="h-4 w-4" />
      {loading ? 'Génération...' : 'Télécharger le rapport'}
    </Button>
  );
};

export default DownloadButton;