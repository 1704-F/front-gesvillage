"use client"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { axiosPublic, axiosPrivate } from '../../utils/axios';
const api = axiosPrivate;

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => notif.status === 'unread').length);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Modification de l'appel API pour correspondre à la route backend
      await api.patch(`/notifications/${notificationId}`, {
        status: 'read'
      });
      
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, status: 'read' } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const NotificationItem = ({ notification }) => (
    <div 
      className={`p-3 border-b last:border-b-0 ${notification.status === 'read' ? 'bg-white' : 'bg-blue-50'}`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <header 
      className="fixed right-0 top-0 h-16 bg-white border-b z-40 flex items-center px-6 transition-all duration-300"
      style={{ left: 'var(--sidebar-width, 16rem)' }}
    >
      {/* Menu button */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-md hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Notifications et déconnexion */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 px-2 bg-red-500 text-white"
                  >
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
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                    />
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

        <button 
          onClick={handleLogout} 
          className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;