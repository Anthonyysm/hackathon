import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

const HeroSection = React.memo(({ scrollToSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Iniciar animação de digitação após um delay
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 500);

    return () => clearTimeout(typingTimer);
  }, []);

  const handleExploreClick = useCallback(() => {
    scrollToSection('services');
  }, [scrollToSection]);

  const handleLoginClick = useCallback(() => {
    // Navegar para login com fallback para hash
    try {
      window.location.hash = '#/login';
    } catch (error) {
      console.warn('Fallback para navegação por hash');
    }
  }, []);

  // Dados memoizados para evitar recriações
  const features = useMemo(() => [
    { icon: Heart, text: "Comunidade Segura" },
    { icon: Sparkles, text: "Apoio Profissional" },
    { icon: Heart, text: "Crescimento Pessoal" }
  ], []);

  return (
    <section 
      className="relative pt-20 pb-16 min-h-screen flex items-center z-20 bg-black"
      aria-labelledby="hero-title"
      role="banner"
    >
      <div className="container-responsive relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge Minimalista com animação melhorada */}
          <div className={`inline-flex items-center space-x-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-6 py-3 mb-8 md:mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm md:text-base font-light tracking-wider uppercase">
              Saúde Mental • Comunidade • Apoio
            </span>
          </div>

          {/* Título Principal com Animação de Digitação Melhorada */}
          <div className="mb-8 md:mb-12">
            <h1 
              id="hero-title"
              className="text-4xl md:text-6xl lg:text-7xl font-extralight mb-4 md:mb-6 leading-[0.9] md:leading-[0.85] tracking-tight"
            >
              <span className={`block text-white transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}>
                Compartilhe,
              </span>
              <span className={`block text-white transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}>
                Entenda-se,{' '}
                <span 
                  className={`font-semibold transition-all duration-1000 delay-700 ${
                    isTyping ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  Evolua.
                </span>
              </span>
            </h1>
          </div>

          {/* Subtítulo com Fade In Melhorado */}
          <p className={`text-lg md:text-xl text-white/70 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Conecte-se com uma comunidade acolhedora, compartilhe suas experiências sem julgamentos e tenha acesso a profissionais de saúde mental verificados.
          </p>

          {/* Features flutuantes */}
          <div className={`flex justify-center items-center space-x-8 mb-8 transition-all duration-1000 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 text-white/60 text-sm"
                style={{ animationDelay: `${1200 + index * 200}ms` }}
              >
                <feature.icon className="w-4 h-4" aria-hidden="true" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons Minimalistas com Melhor Acessibilidade */}
          <div className={`flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center transition-all duration-1000 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Primary Button */}
            <button 
              onClick={handleLoginClick}
              className="group relative bg-white text-black px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 text-base md:text-lg font-light tracking-wide hover:bg-white/90 w-full sm:w-auto border border-white/20 backdrop-blur-md focus-ring hover:scale-105"
              aria-label="Fazer login na plataforma Sereno"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 md:space-x-3">
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </button>

            {/* Secondary Button */}
            <button 
              onClick={handleExploreClick}
              className="group relative bg-transparent border border-white/30 text-white px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 text-base md:text-lg font-light tracking-wide hover:bg-white/5 w-full sm:w-auto backdrop-blur-md focus-ring hover:scale-105"
              aria-label="Explorar recursos e funcionalidades da plataforma"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 md:space-x-3">
                <span>Explorar Recursos</span>
                <Heart className="w-4 h-4 md:w-5 md:h-5 transition-all duration-300 group-hover:scale-110" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Indicador de scroll */}
          <div className={`mt-16 transition-all duration-1000 delay-1500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex flex-col items-center space-y-2 text-white/40 text-sm">
              <span>Role para descobrir mais</span>
              <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full transition-all duration-2000 delay-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
        <div className={`absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full transition-all duration-2000 delay-700 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
        <div className={`absolute bottom-40 left-20 w-1.5 h-1.5 bg-white/25 rounded-full transition-all duration-2000 delay-900 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}></div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
