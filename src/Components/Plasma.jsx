import React, { useEffect, useRef, useCallback, useMemo } from "react";

// Componente Plasma simplificado usando CSS
const Plasma = ({ color = "#4f46e5", opacity = 0.1 }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Gradiente animado como background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 20% 80%, ${color}40 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${color}30 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, ${color}20 0%, transparent 50%)`,
          animation: 'plasma-float 20s ease-in-out infinite'
        }}
      />
      
      {/* Partículas flutuantes */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Plasma;
