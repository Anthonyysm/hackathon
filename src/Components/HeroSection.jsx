import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart } from 'lucide-react';

const HeroSection = ({ scrollToSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-20 pb-16 min-h-screen flex items-center z-20 bg-black">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge Minimalista */}
          <div className={`inline-flex items-center space-x-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-6 py-3 mb-8 md:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm md:text-base font-light tracking-wider uppercase">Saúde Mental • Comunidade • Apoio</span>
          </div>

          {/* Título Principal com Animação de Digitação */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight mb-4 md:mb-6 leading-[0.9] md:leading-[0.85] tracking-tight">
              <span className={`block text-white transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}>
                Compartilhe,
              </span>
              <span className={`block text-white transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}>
                Entenda-se, <span className='font-semibold'>Evolua.</span> 
              </span>
            </h1>
          </div>

          {/* Subtítulo com Fade In */}
          <p className={`text-lg md:text-xl text-white/70 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Conecte-se com uma comunidade acolhedora, compartilhe suas experiências sem julgamentos e tenha acesso a profissionais de saúde mental verificados.
          </p>

          {/* CTA Buttons Minimalistas */}
          <div className={`flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center transition-all duration-1000 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Primary Button */}
            <button 
              onClick={() => { window.location.hash = '#/login'; }}
              className="group relative bg-white text-black px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 text-base md:text-lg font-light tracking-wide hover:bg-white/90 w-full sm:w-auto border border-white/20 backdrop-blur-md"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 md:space-x-3">
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover:translate-x-1" />
              </span>
            </button>

            {/* Secondary Button */}
            <button 
              onClick={() => scrollToSection('services')}
              className="group relative bg-transparent border border-white/30 text-white px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 text-base md:text-lg font-light tracking-wide hover:bg-white/5 w-full sm:w-auto backdrop-blur-md"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 md:space-x-3">
                <span>Explorar Recursos</span>
                <Heart className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover:scale-110" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
