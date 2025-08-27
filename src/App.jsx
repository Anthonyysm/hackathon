import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { Heart, Users, Target, Sparkles, Brain, MessageCircle, Shield, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import Navbar from './Components/Navbar'; 
import HeroSection from './Components/HeroSection';
import FeatureCard from './Components/FeatureCard';
import CommunityCard from './Components/CommunityCard';
import TestimonialCard from './Components/TestimonialCard';
import Footer from './Components/Footer'; 
import LightRays from './Components/LightRays';
import { useNavigate } from 'react-router-dom';

// Lazy loading para componentes pesados
const LazyLightRays = lazy(() => import('./Components/LightRays'));

// Hook otimizado para detectar elementos em view com Intersection Observer
const useInView = (threshold = 0.1, rootMargin = '50px') => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return [setRef, inView];
};

// Componente de loading otimizado
const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="loading-spinner"></div>
    <span className="ml-3 text-white/70">Carregando...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Componente principal otimizado
const App = React.memo(() => {
  const [scrolled, setScrolled] = useState(false);
  const [servicesRef, servicesInView] = useInView(0.2);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialInterval = useRef(null);
  const navigate = useNavigate();

  // Dados memoizados para evitar recriações
  const testimonials = useMemo(() => [
    {
      name: "Eduardo Silva Pimenta da Mota",
      role: "Usuária do Sereno",
      content: "O Sereno me ajudou a encontrar uma comunidade que entende o que estou passando. É incrível poder compartilhar sem medo de julgamentos."
    },
    {
      name: "Bruno de Medeiros Rodrigues",
      role: "Aluno de Sistemas da Informação",
      content: "O Sereno me permite alcançar mais pessoas que precisam de ajuda. A plataforma é intuitiva e segura."
    },
    {
      name: "Pedro Henrique Cavalcante dos Santos",
      role: "Membro da Comunidade",
      content: "Os grupos de apoio me deram força para enfrentar a ansiedade. Encontrei pessoas que realmente me entendem."
    }
  ], []);

  const features = useMemo(() => [
    {
      icon: Heart,
      title: "Compartilhamento Seguro",
      description: "Compartilhe seus sentimentos de forma anônima ou pública, em um ambiente livre de julgamentos e acolhedor."
    },
    {
      icon: Users,
      title: "Grupos de Apoio",
      description: "Participe de comunidades temáticas focadas em desafios específicos como ansiedade, TDAH, autoconfiança e mais."
    },
    {
      icon: MessageCircle,
      title: "Chat com Profissionais",
      description: "Conecte-se diretamente com psicólogos verificados para atendimento personalizado e orientação especializada."
    },
    {
      icon: Brain,
      title: "Autoavaliação Diária",
      description: "Acompanhe seu bem-estar mental através de questionários diários e gráficos de evolução personalizados."
    }
  ], []);

  const communityGroups = useMemo(() => [
    { title: "Ansiedade & Estresse", desc: "Grupo de apoio para gerenciar ansiedade", icon: Brain, color: "from-blue-500 to-cyan-500" },
    { title: "Autoconfiança", desc: "Desenvolvimento pessoal e autoestima", icon: Sparkles, color: "from-purple-500 to-pink-500" },
    { title: "TDAH & Foco", desc: "Estratégias e suporte para TDAH", icon: Target, color: "from-green-500 to-emerald-500" }
  ], []);

  // Callbacks otimizados
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleTestimonialChange = useCallback((index) => {
    setActiveTestimonial(index);
  }, []);

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleRegisterClick = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  useEffect(() => {
    // Configurar scroll suave apenas se suportado
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Auto-rotate testimonials com intervalo maior para melhor performance
    testimonialInterval.current = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'auto';
      }
      if (testimonialInterval.current) {
        clearInterval(testimonialInterval.current);
      }
    };
  }, [handleScroll, testimonials.length]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Skip link para acessibilidade */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Pular para o conteúdo principal
      </a>

      {/* LightRays Background com lazy loading */}
      <Suspense fallback={<LoadingSpinner />}>
        <LazyLightRays />
      </Suspense>

      {/* Navbar Component */}
      <Navbar scrolled={scrolled} scrollToSection={scrollToSection} />

      {/* Hero Section Component */}
      <HeroSection scrollToSection={scrollToSection} />

      {/* Main Content */}
      <main id="main-content" className="relative z-10">
        {/* Services Section */}
        <section id="services" ref={servicesRef} className="section-padding">
          <div className="container-responsive">
            <div className="text-center mb-12 md:mb-16">
              <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white transition-all duration-700 transform ${
                servicesInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
                Como Funciona
              </h2>
              <p className={`text-lg md:text-xl text-white/70 max-w-2xl mx-auto transition-all duration-700 transform ${
                servicesInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`} style={{ transitionDelay: '0.3s' }}>
                Descubra como o Sereno pode transformar sua jornada de saúde mental através da tecnologia e comunidade.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 200 + 300}
                  inView={servicesInView}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-8 md:mx-16 lg:mx-32"></div>
        </div>

        {/* Community Section */}
        <section id="projects" className="section-padding">
          <div className="container-responsive">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white">
                Nossa Comunidade
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Conheça os grupos de apoio e espaços de conexão que fazem do Sereno um lugar especial.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {communityGroups.map((item, index) => (
                <CommunityCard
                  key={index}
                  title={item.title}
                  desc={item.desc}
                  icon={item.icon}
                  index={index}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <button 
                className="btn-secondary px-8 py-3 text-base font-light tracking-wide backdrop-blur-md"
                aria-label="Ver todos os grupos de apoio disponíveis"
              >
                Ver Todos os Grupos
              </button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-8 md:mx-16 lg:mx-32"></div>
        </div>

        {/* Testimonials Section */}
        <section id="testimonials" className="section-padding">
          <div className="container-responsive">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white">
                O Que Nossos Usuários Dizem
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Histórias reais de pessoas que encontraram apoio e transformação através do Sereno.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto relative">
              <TestimonialCard {...testimonials[activeTestimonial]} />
              
              <div className="flex justify-center mt-8 space-x-3" role="tablist" aria-label="Navegação de depoimentos">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestimonialChange(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      index === activeTestimonial ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`Ver depoimento ${index + 1} de ${testimonials.length}`}
                    aria-selected={index === activeTestimonial}
                    role="tab"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-8 md:mx-16 lg:mx-32"></div>
        </div>

        {/* About Section */}
        <section id="about" className="section-padding">
          <div className="container-responsive">
            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white">
                  Nossa Missão
                </h2>
                <p className="text-lg md:text-xl text-white/70 mb-6 leading-relaxed">
                  O Sereno nasceu da necessidade de democratizar o acesso à saúde mental. 
                  Acreditamos que todos merecem ter um espaço seguro para compartilhar, 
                  se conectar e receber apoio especializado quando necessário.
                </p>
                <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed">
                  Nossa plataforma combina tecnologia, comunidade e profissionais verificados 
                  para criar um ecossistema completo de cuidado mental, onde cada pessoa 
                  pode encontrar o suporte que precisa para evoluir.
                </p>
                <button 
                  className="btn-secondary px-8 py-3 text-base font-light tracking-wide backdrop-blur-md"
                  aria-label="Conhecer a história completa do Sereno"
                >
                  Conheça Nossa História
                </button>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                    <Shield className="w-12 h-12 text-white/80" aria-hidden="true" />
                  </div>
                  <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white/80" aria-hidden="true" />
                  </div>
                  <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white/80" aria-hidden="true" />
                  </div>
                  <div className="aspect-square rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                    <Users className="w-12 h-12 text-white/80" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-8 md:mx-16 lg:mx-32"></div>
        </div>

        {/* Contact Section */}
        <section id="contact" className="section-padding">
          <div className="container-responsive">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white">
                Vamos Conversar
              </h2>
              <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                Entre em contato e vamos conversar sobre como o Sereno pode ajudar você ou sua organização.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="glass-card p-8">
                <h3 className="text-2xl font-light mb-6 text-white text-center">Acesse sua Conta</h3>
                
                {/* Botão de Login */}
                <div className="space-y-4">
                  <button 
                    className="w-full bg-white text-black py-4 rounded-xl font-light transition-all duration-300 hover:bg-white/90 text-base tracking-wide backdrop-blur-md focus-ring"
                    onClick={handleLoginClick}
                    aria-label="Fazer login na plataforma Sereno"
                  >
                    Fazer Login
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-black text-white/50 font-light">ou</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-transparent border border-white/30 text-white py-4 rounded-xl font-light transition-all duration-300 hover:bg-white/5 text-base tracking-wide backdrop-blur-md focus-ring"
                    onClick={handleRegisterClick}
                    aria-label="Criar nova conta na plataforma Sereno"
                  >
                    Criar Conta
                  </button>
                </div>
                
                <p className="text-white/50 text-sm text-center mt-6 font-light">
                  Comece sua jornada de saúde mental hoje mesmo
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
});

App.displayName = 'App';

export default App;