import axios from "axios";

// Créer une instance Axios
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Intercepteur pour inclure le token dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Récupérer le token JWT depuis le stockage local
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Méthodes pour les paramètres (Settings)
export const fetchSettings = () => api.get("/settings");
export const updateSetting = (key, data) => api.patch(`/settings/${key}`, data);
export const createSetting = (data) => api.post("/settings", data);
export const getSettings = () => api.get("/settings");
export const fetchSettingById = (id) => api.get(`/settings/${id}`);




// Méthodes API existantes
export const fetchInvoices = () => api.get("/service-billing");
export const generateAllInvoices = () => api.post("/service-billing/generate-all");
export const markInvoiceAsPaid = (id) => api.patch(`/service-billing/${id}/mark-as-paid`);
export const exportInvoicePDF = (id) =>
  api.get(`/service-billing/${id}/export`, { responseType: "blob" });
export const filterInvoices = (params) => api.get("/service-billing/filter", { params });
export const updateInvoice = (id, data) => api.patch(`/service-billing/${id}`, data);
// Supprimer une facture
export const deleteInvoice = (id) => api.delete(`/service-billing/${id}`);

// Gérer les utilisateurs


// Regrouper toutes les méthodes
const apiMethods = {
  fetchSettings,
  updateSetting,
  createSetting,
  fetchInvoices,
  generateAllInvoices,
  markInvoiceAsPaid,
  exportInvoicePDF,
  filterInvoices,
  updateInvoice,
  deleteInvoice,
  getSettings,
  fetchSettingById
  
};

// Export par défaut
export default apiMethods;
