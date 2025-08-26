import React from 'react';

const Footer = () => {
  return (
    <footer className="relative z-10 py-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </div>
            <span className="text-lg font-light text-white tracking-wide">
              Sereno
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6 md:mb-0">
            <a href="#" className="text-white/50 hover:text-white transition-all duration-300 text-sm font-light tracking-wide">Termos de Uso</a>
            <a href="#" className="text-white/50 hover:text-white transition-all duration-300 text-sm font-light tracking-wide">Política de Privacidade</a>
            <a href="#" className="text-white/50 hover:text-white transition-all duration-300 text-sm font-light tracking-wide">Cookies</a>
          </div>
          
          <p className="text-white/50 text-sm font-light tracking-wide">© {new Date().getFullYear()} Sereno. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
