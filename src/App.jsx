import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users, Target, Sparkles, Brain, MessageCircle, Shield, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import Navbar from './Components/Navbar';
import LightRays from './Components/LightRays';
import ScrollIndicator from './Components/ScrollIndicator';
import HeroSection from './Components/HeroSection';
import FeatureCard from './Components/FeatureCard';
import CommunityCard from './Components/CommunityCard';
import TestimonialCard from './Components/TestimonialCard';
import Footer from './Components/Footer'; 

// Hook otimizado para detectar elementos em view com threshold personalizado
const useInView = (threshold = 0.1, rootMargin = '0px 0px -100px 0px') => {
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

// Importar serviço de limpeza para execução automática
import './services/cleanupService';

function App() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroInView, setHeroInView] = useState(false);
  const [servicesRef, servicesInView] = useInView(0.15, '0px 0px -50px 0px');
  const [communityRef, communityInView] = useInView(0.15, '0px 0px -50px 0px');
  const [testimonialsRef, testimonialsInView] = useInView(0.15, '0px 0px -50px 0px');
  const [aboutRef, aboutInView] = useInView(0.15, '0px 0px -50px 0px');
  const [contactRef, contactInView] = useInView(0.15, '0px 0px -50px 0px');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const testimonialInterval = useRef(null);

  // Mouse tracking para efeitos parallax sutis
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Dados memoizados para evitar recriações
  const testimonials = useMemo(() => [
    {
      name: "Eduardo Silva Pimenta da Mota",
      role: "Usuário do Sereno",
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
    { title: "Ansiedade", desc: "Grupo de apoio para gerenciar ansiedade", icon: Brain, color: "from-white to-gray-200" },
    { title: "Autoconfiança", desc: "Desenvolvimento pessoal e autoestima", icon: Sparkles, color: "from-white to-gray-200" },
    { title: "TDAH & Foco", desc: "Estratégias e suporte para TDAH", icon: Target, color: "from-white to-gray-200" }
  ], []);

  // Callbacks otimizados
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrolled(currentScrollY > 50);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;
      
      // Scroll suave com easing personalizado
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Melhor controle do testimonial rotation
  const handleTestimonialChange = useCallback((index) => {
    setActiveTestimonial(index);
    if (testimonialInterval.current) {
      clearInterval(testimonialInterval.current);
      testimonialInterval.current = setInterval(() => {
        setActiveTestimonial(prev => (prev + 1) % testimonials.length);
      }, 8000);
    }
  }, [testimonials.length]);

  useEffect(() => {
    setHeroInView(true);
    document.documentElement.style.scrollBehavior = 'smooth';
    
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    testimonialInterval.current = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      document.documentElement.style.scrollBehavior = 'auto';
      if (testimonialInterval.current) {
        clearInterval(testimonialInterval.current);
      }
    };
  }, [handleScroll, testimonials.length]);

  // Componente de Divider com efeitos aprimorados
  const SectionDivider = React.memo(() => (
    <div className="relative z-10 py-8">
      <div className="relative mx-8 md:mx-16 lg:mx-32">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent blur-sm"></div>
        {/* Floating particles */}
        <div className="absolute left-1/4 -top-1 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute left-3/4 -top-0.5 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <ScrollIndicator />
      {/* Subtle background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-1/4 left-1/4 w-48 h-48 bg-white/[0.01] rounded-full blur-2xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
            animationDuration: '6s'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/[0.005] rounded-full blur-2xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -8}px, ${mousePosition.y * -8}px)`,
            animationDuration: '8s',
            animationDelay: '3s'
          }}
        ></div>
      </div>

      <Navbar scrolled={scrolled} scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center">
        {/* LightRays como background */}
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.8}
            lightSpread={1.5}
            rayLength={2.0}
            followMouse={true}
            mouseInfluence={0.08}
            noiseAmount={0.05}
            distortion={0.008}
            className="w-full h-full"
          />
        </div>
        
        {/* Conteúdo do Hero */}
        <div className="relative z-10">
          <HeroSection scrollToSection={scrollToSection} inView={heroInView} />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" ref={servicesRef} className="relative z-10 py-24 md:py-24 min-h-screen flex items-center">
        <div className="container mx-auto mb-24 px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12 md:mb-16 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white transition-all duration-1000 transform ${
              servicesInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}>
              Como Funciona
            </h2>
            <p className={`text-lg md:text-xl text-white/70 max-w-2xl mx-auto transition-all duration-1000 transform ${
              servicesInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`} style={{ transitionDelay: '0.2s' }}>
              Descubra como o Sereno pode transformar sua jornada de saúde mental através da tecnologia e comunidade.
            </p>
            
            {/* Subtle floating dots */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative"
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 150 + 400}
                  inView={servicesInView}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Community Section */}
      <section id="projects" ref={communityRef} className="relative z-10 py-16 md:py-24 min-h-screen flex items-center">
        <div className="container mx-auto mb-24 px-4 md:px-6 max-w-6xl">
          <div className="text-center mb-12 md:mb-16 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8">
              <div className="w-12 h-px bg-white/20"></div>
            </div>
            
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white transition-all duration-1000 transform ${
              communityInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}>
              Nossa Comunidade
            </h2>
            <p className={`text-lg md:text-xl text-white/70 max-w-2xl mx-auto transition-all duration-1000 transform ${
              communityInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`} style={{ transitionDelay: '0.2s' }}>
              Conheça os grupos de apoio e espaços de conexão que fazem do Sereno um lugar especial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 lg:gap-12 mb-16">
            {communityGroups.map((item, index) => (
              <div
                key={item.title}
                className={`group relative transition-all duration-700 transform hover:scale-105 ${
                  communityInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
                style={{ 
                  transitionDelay: `${index * 200 + 400}ms`
                }}
              >
                {/* Simple background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                {/* Main card */}
                <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 lg:p-12 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer min-h-[280px] md:min-h-[320px] flex flex-col overflow-hidden">
                  
                  {/* Icon container */}
                  <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 border border-white/20 mb-8 backdrop-blur-md group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500 mx-auto">
                    <item.icon className="w-10 h-10 md:w-12 md:h-12 text-white/80 group-hover:text-white transition-all duration-500" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative text-center flex-1 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-light mb-4 text-white group-hover:text-white/95 transition-colors duration-500">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-base md:text-lg leading-relaxed group-hover:text-white/85 transition-colors duration-500 mb-6">
                      {item.desc}
                    </p>
                    
                    {/* Simple action indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <div className="inline-flex items-center text-white/60 text-sm font-light group-hover:text-white/80 transition-colors duration-300">
                        <span className="mr-2">Participar</span>
                        <svg className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simple decorative elements */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse"></div>
                  <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-white/15 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 group-hover:animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="relative z-10 py-16 md:py-24 min-h-screen flex items-center">
        <div className="container mb-24 mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-11 md:mb-16 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
              <div className="w-8 h-8 border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white transition-all duration-1000 transform ${
              testimonialsInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}>
              O Que Nossos Usuários Dizem
            </h2>
            <p className={`text-lg md:text-xl text-white/70 max-w-2xl mx-auto transition-all duration-1000 transform ${
              testimonialsInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`} style={{ transitionDelay: '0.2s' }}>
              Histórias reais de pessoas que encontraram apoio e transformação através do Sereno.
            </p>
          </div>
          
          <div className={`max-w-4xl mx-auto relative transition-all duration-700 transform ${
            testimonialsInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`} style={{ transitionDelay: '0.4s' }}>
            <div className="relative">
              <TestimonialCard {...testimonials[activeTestimonial]} />
              
              {/* Simple quote marks */}
              <div className="absolute -top-4 -left-4 text-4xl text-white/10 font-serif">"</div>
              <div className="absolute -bottom-4 -right-4 text-4xl text-white/10 font-serif rotate-180">"</div>
            </div>
            
            <div className="flex justify-center mt-10 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTestimonialChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                    index === activeTestimonial 
                      ? 'bg-white scale-125 shadow-lg shadow-white/30' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Ver depoimento ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* About Section */}
      <section id="about" ref={aboutRef} className="relative z-10 py-16 md:py-24 min-h-screen flex items-center">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
            <div className={`flex-1 transition-all duration-1000 transform ${
              aboutInView ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
            }`}>
              <div className="relative">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white">
                  Nossa Missão
                </h2>
                <div className="absolute -left-4 top-0 w-0.5 h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
              </div>
              
              <p className="text-lg md:text-xl text-white/70 mb-6 leading-relaxed hover:text-white/80 transition-colors duration-300">
                O Sereno nasceu da necessidade de democratizar o acesso à saúde mental. 
                Acreditamos que todos merecem ter um espaço seguro para compartilhar, 
                se conectar e receber apoio especializado quando necessário.
              </p>
              <p className="text-lg md:text-xl text-white/70 mb-8 leading-relaxed hover:text-white/80 transition-colors duration-300">
                Nossa plataforma combina tecnologia, comunidade e profissionais verificados 
                para criar um ecossistema completo de cuidado mental, onde cada pessoa 
                pode encontrar o suporte que precisa para evoluir.
              </p>
              
              <button 
                onClick={() => scrollToSection('contact')}
                className="group bg-white text-black px-6 py-3 rounded-xl font-light transition-all duration-300 hover:bg-white/90 text-base tracking-wide hover:scale-105 hover:shadow-lg hover:shadow-white/20 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative group-hover:mr-2 transition-all duration-300">Saiba Mais</span>
                <span className="relative opacity-0 group-hover:opacity-100 transition-all duration-300">→</span>
              </button>
            </div>
            
            <div className={`flex-1 transition-all duration-700 transform ${
              aboutInView ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
            }`} style={{ transitionDelay: '0.3s' }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: "Segurança" },
                  { icon: Heart, label: "Cuidado" },
                  { icon: Brain, label: "Inteligência" },
                  { icon: Users, label: "Comunidade" }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="group aspect-square rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/10 cursor-pointer"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <item.icon className="w-12 h-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-2" />
                    <span className="text-white/60 group-hover:text-white/80 text-sm font-light transition-all duration-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="relative z-10 py-16 md:py-24 min-h-screen flex items-center">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="text-center mb-12 md:mb-16 relative">
            {/* Simple contact icons */}
            <div className="absolute -top-8 left-1/4 opacity-10">
              <Mail className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -top-6 right-1/4 opacity-10">
              <Phone className="w-2 h-2 text-white" />
            </div>
            
            <h2 className={`text-3xl md:text-5xl lg:text-6xl font-extralight mb-6 text-white transition-all duration-1000 transform ${
              contactInView ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}>
              Vamos Conversar?
            </h2>
            <p className={`text-lg md:text-xl text-white/70 max-w-2xl mx-auto transition-all duration-1000 transform ${
              contactInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`} style={{ transitionDelay: '0.2s' }}>
              Entre em contato e vamos conversar sobre como o Sereno pode ajudar você ou sua organização.
            </p>
          </div>

          <div className={`max-w-2xl mx-auto transition-all duration-700 transform ${
            contactInView ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`} style={{ transitionDelay: '0.4s' }}>
            <div className="group relative bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md hover:bg-white/10 transition-all duration-500">
              <div className="relative z-10">
                <h3 className="text-2xl font-light mb-6 text-white text-center transition-all duration-300 group-hover:text-white/95">
                  Acesse sua Conta
                </h3>
                
                <div className="space-y-4">
                  <button 
                    className="w-full bg-white text-black py-4 rounded-xl font-light transition-all duration-300 hover:bg-white/90 text-base tracking-wide backdrop-blur-md hover:scale-105 hover:shadow-lg hover:shadow-white/20"
                    onClick={() => navigate('/login')}
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
                    className="w-full bg-transparent border border-white/30 text-white py-4 rounded-xl font-light transition-all duration-300 hover:bg-white/5 text-base tracking-wide backdrop-blur-md hover:scale-105 hover:border-white/50 hover:shadow-lg hover:shadow-white/10"
                    onClick={() => navigate('/register')}
                  >
                    Criar Conta
                  </button>
                </div>
                
                <p className="text-white/50 text-sm text-center mt-6 font-light transition-colors duration-300 group-hover:text-white/60">
                  Comece sua jornada de saúde mental hoje mesmo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      

    </div>
  );
}

export default App;