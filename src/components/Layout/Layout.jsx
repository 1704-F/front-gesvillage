import React, { useState } from 'react';
import { Toaster } from "../ui/toast/toaster";
import Sidebar from './Sidebar';  
import Header from './Header';    

const Layout = ({ children, role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar 
          role={role} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
        />
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          <Header 
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isSidebarOpen={sidebarOpen}  
          />
          <main className="p-6 mt-16">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;