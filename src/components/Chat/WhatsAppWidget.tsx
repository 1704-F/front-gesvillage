// src/components/Chat/WhatsAppChat.tsx
"use client"

import React, { useEffect } from 'react';

const WhatsAppChat = () => {
  useEffect(() => {
    // Création et injection du script WhatsApp
    const script = document.createElement("script");
    script.src = "https://apps.elfsight.com/p/platform.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Nettoyage du script quand le composant est démonté
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="elfsight-app-c9533e91-e3c2-4e3b-908e-71ef41d7aa6f"></div>

    
  );
};

export default WhatsAppChat;