// config/cron.js
const cron = require('node-cron');
const InvoicesController = require('../controllers/InvoicesController');

const setupCronJobs = () => {
  // Vérification quotidienne des échéances à 1h du matin
  cron.schedule('0 1 * * *', async () => {
    console.log('Vérification des échéances de factures...');
    await InvoicesController.checkDueInvoices();
  });
};

module.exports = setupCronJobs;