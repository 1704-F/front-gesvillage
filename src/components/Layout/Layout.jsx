import React, { useState } from 'react';
import Sidebar from './Sidebar';  // Import par défaut
import Header from './Header';    // Import par défaut

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
          />
          <main className="p-6 mt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;