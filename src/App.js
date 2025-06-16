//App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout/Layout';

import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import ZoneManagementPage from './pages/ZoneManagementPage';
import InventoryPage from './pages/InventoryPage';

import AdminDashboard from './components/Dashboard/AdminDashboard';
import SupervisorDashboard from './components/Dashboard/SupervisorDashboard';
import ConsumerDashboard from './components/Dashboard/ConsumerDashboard';
import Profile from './components/Profile/Profile';
import Login from './pages/Login';
import ServiceTable from './components/Service/ServiceTable';
import ServiceForm from './components/Service/ServiceForm';
import AdminForm from './components/Admin/AdminForm';
import ServiceBillingPage from "./components/Facture/ServiceBillingPage";
import ServicePricing from "./components/Settings/ServicePricing"
import InvoicePage from "./components/Facture/InvoicePage";
import MapService from "./components/Map/Map";
import SettingsPage from './components/Settings/SettingsPage';
import WaterQuality from './components/Settings/WaterQuality';
import ServiceInfoPage from './components/Service/ServiceInfo';
import ManagementPage from './components/Gestion/Management';
import ExpensePage from './components/Expense/ExpensePage';
import AnalyticsPage from './components/analytics/AnalyticsPage'

import ConsumerPage from './components/Consumer/ConsumerPage';
import MeterPage from './components/Meter/MeterPage';
import ConsumerConsumption from './components/Consumer/ConsumerConsumption';
import ConsumerInvoices from './components/Consumer/ConsumerInvoices';
import ConsumerMeters from './components/Consumer/ConsumerMeters';
import ConsumerProfile from './components/Consumer/ConsumerProfile';
import ReadingPage from './components/Relever/ReadingPage';

import SuperAdminReadingsPage from './components/SuperAdmin/SuperAdminReadingsPage';

import { axiosPrivate } from './utils/axios';
import { Toaster } from "./components/ui/toast/toaster"; 
import { ToastProvider } from "./components/ui/toast/use-toast"

import './styles.css';


// Composant wrapper pour les routes authentifiées
const ProtectedLayout = ({ role }) => {
  if (!role) return null; // Protection supplémentaire 

  return (
    <Layout role={role}>
      <Outlet />
    </Layout>
  );
};

const App = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axiosPrivate.get('/auth/me');
        setRole(response.data.role);
      } catch (error) {
        console.error('Erreur lors de la récupération du rôle utilisateur :', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('token');
    if (token) {
      fetchRole();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
    <ToastProvider>
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </>
        ) : (
          <>

            <Route element={<ProtectedLayout role={role} />}>
              {/* Routes SuperAdmin */}
              {role === 'SuperAdmin' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard/superadmin" replace />} />
                  <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
                  <Route path="/services" element={<ServiceTable />} />
                  <Route path="/services/new" element={<ServiceForm />} />
                  <Route path="/admins/new" element={<AdminForm />} />
                  <Route path="/superadmin/readings" element={<SuperAdminReadingsPage />} />
                  <Route path="/service-billing" element={<ServiceBillingPage />} />
                  <Route path="/zones" element={<ZoneManagementPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                </>
              )}

              {/* Routes Admin */}
              {role === 'Admin' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                  <Route path="/consumers" element={<ConsumerPage />} />
                  <Route path="/meters" element={<MeterPage />} />
                  <Route path="/readings" element={<ReadingPage />} />
                  <Route path="/invoices" element={<InvoicePage />} />
                  <Route path="/map" element={<MapService />} />
                  <Route path="/service-pricing" element={<ServicePricing />} />
                  <Route path="/water-quality" element={<WaterQuality />} />
                  <Route path="/service-info" element={<ServiceInfoPage />} />
                  <Route path="/management" element={<ManagementPage />} />
                  <Route path="/expenses" element={<ExpensePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />

                </>
              )}

              {/* Routes Superviseur */}
              {role === 'Superviseur' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard/superviseur" replace />} />
                  <Route path="/dashboard/superviseur" element={<SupervisorDashboard />} />
                </>
              )}

              {/* Routes Consommateur */}
              {role === 'Consommateur' && (
                <>
                  <Route path="/" element={<Navigate to="/dashboard/consommateur" replace />} />
                  <Route path="/dashboard/consommateur" element={<ConsumerDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ConsumerConsumptions" element={<ConsumerConsumption />} />
                  <Route path="/ConsumerInvoices" element={<ConsumerInvoices />} />
                  <Route path="/ConsumerMeters" element={<ConsumerMeters />} />
                  <Route path="/ConsumerProfiles" element={<ConsumerProfile />} />
                </>
              )}

              {/* Route de fallback pour les URLs non trouvées */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </Router>
    <Toaster />
    </ToastProvider>
    </>
  );
};

export default App; 