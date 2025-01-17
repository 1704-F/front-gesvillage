// services/PDFService.js
const PDFDocument = require('pdfkit');
const moment = require('moment');

class PDFService {
  static COLORS = {
    primary: '#2563EB', // Blue 600
    secondary: '#64748B', // Slate 500
    success: '#059669', // Emerald 600
    text: '#1F2937', // Gray 800
    lightGray: '#E5E7EB' // Gray 200
  };

  static generateInvoicePDF(invoice) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Utilisation de la police par défaut
      doc.font('Helvetica');
      
      this._addHeaderWithStyle(doc, invoice);
      this._addBillingInfo(doc, invoice);
      this._addConsumptionTable(doc, invoice);
      this._addPaymentInfo(doc, invoice);
      this._addTermsAndConditions(doc);
      
      doc.end();
    });
  }

  static _addHeaderWithStyle(doc, invoice) {
    // En-tête avec style amélioré
    doc.fillColor(this.COLORS.primary)
       .fontSize(24)
       .text('FACTURE D\'EAU', 50, 50)
       .moveDown(0.5);

    // Infos service en haut à droite
    doc.fontSize(10)
       .fillColor(this.COLORS.secondary)
       .text(invoice.service.name, 400, 50, { align: 'right' })
       .text('Contact: ' + invoice.service.phone, { align: 'right' })
       .text('Email: ' + invoice.service.email, { align: 'right' });

    // Numéro de facture et dates
    doc.moveDown(2)
       .fillColor(this.COLORS.text)
       .fontSize(12);

    this._addKeyValueLine(doc, 'N° Facture:', invoice.invoice_number);
    this._addKeyValueLine(doc, 'Date d\'émission:', 
      moment(invoice.created_at).format('DD/MM/YYYY'));
    this._addKeyValueLine(doc, 'Date d\'échéance:', 
      moment(invoice.due_date).format('DD/MM/YYYY'));
  }

  static _addBillingInfo(doc, invoice) {
    // Encadré des informations client
    doc.moveDown(2)
       .fontSize(14)
       .fillColor(this.COLORS.primary)
       .text('Informations Client')
       .moveDown(0.5);

    const clientInfo = {
      'Nom': `${invoice.meter.user.first_name} ${invoice.meter.user.last_name}`,
      'N° Compteur': invoice.meter.meter_number,
      'Adresse': invoice.meter.location || 'N/A',
      'Période': `${moment(invoice.start_date).format('DD/MM/YYYY')} au ${moment(invoice.end_date).format('DD/MM/YYYY')}`
    };

    doc.fontSize(10)
       .fillColor(this.COLORS.text);
       
    Object.entries(clientInfo).forEach(([key, value]) => {
      this._addKeyValueLine(doc, key + ':', value);
    });
  }

  static _addConsumptionTable(doc, invoice) {
    // Tableau de consommation
    doc.moveDown(2)
       .fontSize(14)
       .fillColor(this.COLORS.primary)
       .text('Détails de la Consommation')
       .moveDown(0.5);

    const startX = 50;
    const startY = doc.y;
    const colWidth = (doc.page.width - 100) / 4;

    // En-têtes du tableau
    const headers = ['Description', 'Quantité', 'Prix unitaire', 'Montant'];
    this._drawTableRow(doc, headers, startX, startY, colWidth, true);

    // Données du tableau
    const reading = invoice.reading;
    const consumption = reading.consumption;
    const unitPrice = invoice.amount_due / consumption;

    const data = [{
      description: 'Consommation d\'eau',
      quantity: `${consumption.toFixed(2)} m³`,
      price: `${Math.round(unitPrice).toLocaleString()} FCFA`,
      amount: `${Math.round(invoice.amount_due).toLocaleString()} FCFA`
    }];

    let currentY = startY + 30;
    data.forEach(row => {
      this._drawTableRow(doc, [
        row.description,
        row.quantity,
        row.price,
        row.amount
      ], startX, currentY, colWidth);
      currentY += 25;
    });

    // Total
    doc.moveDown(2)
       .fontSize(12)
       .fillColor(this.COLORS.primary)
       .text(`Total à payer: ${Math.round(invoice.amount_due).toLocaleString()} FCFA`, 
        { align: 'right' });
  }

  static _addPaymentInfo(doc, invoice) {
    // Informations de paiement
    doc.moveDown(2)
       .fontSize(12)
       .fillColor(this.COLORS.primary)
       .text('Modalités de Paiement')
       .moveDown(0.5);

    doc.fontSize(10)
       .fillColor(this.COLORS.text)
       .text('Veuillez effectuer votre paiement avant la date d\'échéance indiquée.');
  }

  static _addTermsAndConditions(doc) {
    doc.moveDown(2)
       .fontSize(8)
       .fillColor(this.COLORS.secondary)
       .text('Conditions de paiement : Cette facture doit être réglée dans son intégralité avant la date d\'échéance.', 
        { align: 'justify' });
  }

  // Méthodes utilitaires
  static _addKeyValueLine(doc, key, value) {
    doc.fillColor(this.COLORS.secondary)
       .text(key, { continued: true })
       .fillColor(this.COLORS.text)
       .text(` ${value}`);
  }

  static _drawTableRow(doc, cells, x, y, colWidth, isHeader = false) {
    doc.fontSize(10)
       .fillColor(isHeader ? this.COLORS.primary : this.COLORS.text);

    cells.forEach((cell, i) => {
      doc.text(cell, 
        x + (i * colWidth), 
        y,
        { width: colWidth - 10, align: i > 0 ? 'right' : 'left' }
      );
    });

    // Ligne de séparation
    if (isHeader) {
      doc.moveTo(x, y + 20)
         .lineTo(x + (colWidth * 4), y + 20)
         .strokeColor(this.COLORS.lightGray)
         .stroke();
    }
  }
}

module.exports = PDFService;