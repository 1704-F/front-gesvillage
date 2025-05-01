// components/WaterLoader.js
import React from 'react';

const WaterLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-40 my-8">
      <svg width="60" height="60" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#e0f2fe" strokeWidth="4" fill="none" />
        <path
          d="M12 2 A10 10 0 0 1 12 22 A10 10 0 0 1 12 2"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeDasharray="45 100"
          className="animate-spin-slow"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <p className="mt-4 text-blue-600 font-medium">Chargement des données...</p>
    </div>
  );
};

export default WaterLoader;