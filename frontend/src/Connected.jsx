import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, Sparkles } from 'lucide-react';
import LightRays from './Components/LightRays';

const Connected = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // Redireciona para a página inicial Home.jsx
    }, 3000); // Redireciona após 3 segundos

    // Contador regressivo
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <LightRays />
      
      <div className="relative w-full max-w-lg z-10 text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Ícone de sucesso */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl font-light mb-3 text-white">
            Perfil Completo!
          </h1>
          
          {/* Mensagem de sucesso */}
          <p className="text-white/70 text-lg mb-6">
            Seu perfil foi criado com sucesso. Bem-vindo ao Sereno!
          </p>

          {/* Informações adicionais */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center space-x-2 text-white/60">
              <User className="w-4 h-4" />
              <span>Perfil personalizado configurado</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white/60">
              <Sparkles className="w-4 h-4" />
              <span>Pronto para explorar a plataforma</span>
            </div>
          </div>

          {/* Contador regressivo */}
          <div className="text-center">
            <p className="text-white/50 text-sm mb-2">Redirecionando automaticamente em:</p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              {countdown} segundos
            </div>
          </div>

          {/* Botão para ir imediatamente */}
          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 px-6 bg-white text-black hover:bg-white/90 font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            Ir para Home Agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connected;


