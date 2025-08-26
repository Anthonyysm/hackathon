import React, { useEffect } from 'react';
import LightRays from './Components/LightRays';

const Connected = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.hash = '#/'; // Redireciona para a página inicial
    }, 3000); // Redireciona após 3 segundos

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <LightRays />
      <div className="relative w-full max-w-md z-10 text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-light mb-2">Você se conectou</h1>
          <p className="text-white/70">Login/Registro concluído com sucesso. Redirecionando...</p>
        </div>
      </div>
    </div>
  );
};

export default Connected;


