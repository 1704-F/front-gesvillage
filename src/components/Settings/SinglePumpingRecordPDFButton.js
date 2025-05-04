// SinglePumpingRecordPDFButton.js
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { Button } from "../ui/button";
import { format } from 'date-fns';
import SinglePumpingRecordPDF from './SinglePumpingRecordPDF';

const SinglePumpingRecordPDFButton = ({ record, size = "sm" }) => {
  if (!record) return null;

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch (error) {
      return 'date-invalide';
    }
  };

  const fileName = `pompage-${record.source?.name.toLowerCase().replace(/\s+/g, '-') || 'source'}-${formatDate(record.pumping_date)}.pdf`;

  return (
    <PDFDownloadLink 
      document={<SinglePumpingRecordPDF record={record} />} 
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => (
        <Button 
          disabled={loading} 
          variant="outline" 
          size={size}
          title="Télécharger les détails en PDF"
        >
          <Download className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default SinglePumpingRecordPDFButton;