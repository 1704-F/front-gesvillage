// src/components/layout/Navbar.jsx
import React from 'react';


const Navbar = ({ role }) => {
    return (
      <nav className="bg-[#2081E2] text-white h-16 flex items-center px-6 fixed w-full top-0 z-50">
        <div className="flex items-center space-x-4">
          <svg width="120" viewBox="0 0 280 87" fill="currentColor" className="text-white">
            {/* Logo SVG content */}
          </svg>
        </div>
      </nav>
    );
  };

  export default Navbar ;