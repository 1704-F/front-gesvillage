"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { axiosPrivate } from "../../utils/axios";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
   const [service, setService] = useState(null);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const fetchProfile = async () => {
    try {
      const response = await axiosPrivate.get("/profile");
      setAdminProfile(response.data.data); // Profil admin récupéré
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // 1. D'abord, obtenir l'ID du service actuel
      const serviceResponse = await axiosPrivate.get("/services/info-optimized");
      const serviceId = serviceResponse.data.data.service.id;
      
      // 2. Récupérer les notifications standard
      const notificationsResponse = await axiosPrivate.get("/notifications");
      
      // 3. Récupérer les factures en attente UNIQUEMENT pour ce service
      const invoicesResponse = await axiosPrivate.get("/service-billing", {
        params: {
          status: "pending",
          service_id: serviceId // Important: filtrer par service_id
        }
      });
      
      // 4. Transformer les factures en format notification
      let invoiceNotifications = [];
      if (invoicesResponse.data.data && invoicesResponse.data.data.billings) {
        invoiceNotifications = invoicesResponse.data.data.billings.map(invoice => {
          const periodStart = new Date(invoice.billing_period_start);
          const month = periodStart.toLocaleString('fr-FR', { month: 'long' });
          
          return {
            id: `invoice-${invoice.id}`,
            message: `Votre facture de ${month} est disponible (Réf: ${invoice.reference})`,
            status: "unread",
            created_at: invoice.created_at,
            type: "invoice",
            invoice_id: invoice.id
          };
        });
      }
      
      // 5. Fusionner les notifications
      const allNotifications = [...invoiceNotifications, ...notificationsResponse.data];
      allNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(notif => notif.status === "unread").length);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error);
    }
  };

  const navigateToInvoice = (invoiceId) => {
    navigate("/service-info?tab=billing");
  };
  

 
  useEffect(() => {  
    fetchProfile();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
 <header
  className={`fixed top-0 h-16 bg-white border-b z-40 flex items-center transition-all duration-300`}
  style={{
    transform: isSidebarOpen ? 'translateX(196px)' : 'translateX(0px)',
    right: 0,
    width: isSidebarOpen ? "calc(100% - 61px)" : "calc(100% - 80px)" // Le header se rétrécit
  }}
>
 
  <div 
    className="flex items-center justify-between w-full"
    style={{
      paddingLeft: '1.5rem',
      paddingRight: isSidebarOpen ? '13.5rem' : '1.5rem',
    }}
  >

      {/* Menu button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center space-x-4">

      {/* Profil admin */}
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 flex items-center gap-2 rounded-full hover:bg-gray-100">
              {adminProfile ? (
                <>
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full">
                    {adminProfile.first_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {adminProfile.first_name}
                  </span>
                </>
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            {adminProfile ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700">
                  {adminProfile.first_name} {adminProfile.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Téléphone :</span>{" "}
                  {adminProfile.phone_number}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Date de naissance :</span>{" "}
                  {new Date(adminProfile.date_of_birth).toLocaleDateString(
                    "fr-FR"
                  )}
                </p>
                <button
                  onClick={handleLogout}
                  className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Chargement...</p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Notifications */}
      <div className="relative ml-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-2 bg-red-500 text-white">
                  {unreadCount}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <ScrollArea className="h-80">

            {notifications.length > 0 ? (
  notifications.map((notification) => (
    <div
      key={notification.id}
      className={`p-3 border-b last:border-b-0 cursor-pointer ${
        notification.status === "read"
          ? "bg-white"
          : notification.type === "invoice" 
            ? "bg-red-50" // Style spécial pour les factures
            : "bg-blue-50"
      }`}
      onClick={() => {
        // Si c'est une notification de facture, naviguer vers la page de facturation
        if (notification.type === "invoice") {
          navigateToInvoice(notification.invoice_id);
        }
        // Sinon, marquer comme lue (à implémenter si nécessaire)
      }}
    >
      <div className="flex items-start">
        {notification.type === "invoice" && (
          <FileText className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.created_at).toLocaleDateString(
              "fr-FR",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="p-4 text-center text-gray-500">
    Aucune notification
  </div>
)}
             
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>

    </header>
  );
};

export default Header;