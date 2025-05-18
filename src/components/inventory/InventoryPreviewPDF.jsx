// src/components/inventory/InventoryPreviewPDF.jsx
import React, { useState } from 'react';
import { 

  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2, Download, Printer, X } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InventoryPDF, { generateInventoryPDF } from './InventoryPDF';

const InventoryPreviewPDF = ({ 
  isOpen, 
  onClose, 
  data, 
  serviceInfo, 
  activeTab 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Générer le PDF quand le dialogue s'ouvre
  React.useEffect(() => {
    if (isOpen) {
      generateInventoryPDF(data, serviceInfo, activeTab)
        .then(blob => {
          setPdfBlob(blob);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors de la génération du PDF:", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, data, serviceInfo, activeTab]);

  // Télécharger le PDF
  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventaire_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Imprimer le PDF
  const handlePrint = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.print();
      };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle>Aperçu du rapport d'inventaire</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Prévisualisez le PDF avant de le télécharger ou de l'imprimer
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-0 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Génération du PDF en cours...</span>
            </div>
          ) : pdfBlob ? (
            <iframe 
              src={URL.createObjectURL(pdfBlob)} 
              className="w-full h-full border-0"
              title="Aperçu du PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-destructive">
              Une erreur est survenue lors de la génération du PDF
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isLoading || !pdfBlob}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isLoading || !pdfBlob}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryPreviewPDF;