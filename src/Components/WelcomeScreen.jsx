import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGreeting } from '../hooks/useGreeting';
import Card from './ui/Card';

const WelcomeScreen = React.memo(({ showWelcomeMessage = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true); // Sempre mostrar por padrão
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { text: greetingText, icon: GreetingIcon, formattedDate } = useGreeting(user?.username || user?.displayName);

  // Controla a exibição do texto de boas-vindas
  useEffect(() => {
    if (showWelcomeMessage) {
      // Para usuários de primeira vez, reinicia a exibição
      setShowGreeting(true);
      
      // Esconde o texto após 1.5 segundos
      const timer = setTimeout(() => {
        setShowGreeting(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [showWelcomeMessage]);

  // Estado para controlar a animação de fade-out
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Controla a animação de fade-out apenas quando showWelcomeMessage for true
  useEffect(() => {
    if (showWelcomeMessage && showGreeting) {
      // Inicia o fade-out após 1 segundo (deixa 0.5s para a animação)
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 1000);
      
      return () => clearTimeout(fadeTimer);
    } else {
      setIsFadingOut(false);
    }
  }, [showWelcomeMessage, showGreeting]);

  const motivationalMessages = useMemo(() => [
    {
      message: "Toda pessoa deveria ser aplaudida de pé pelo menos uma vez na vida, porque todos nós vencemos o mundo.",
      author: "Augusto Cury"
    },
    {
      message: "A vida é 10% do que acontece com você e 90% de como você reage a isso.",
      author: "Charles Swindoll"
    },
    {
      message: "Você é mais corajoso do que acredita, mais forte do que parece e mais inteligente do que pensa.",
      author: "A.A. Milne"
    }
  ], []);

  const psychologists = useMemo(() => [
    {
      name: "Dr. Alberto Mendes",
      specialty: "Especialista em Terapia Cognitivo-Comportamental",
      experience: "15 anos",
      initials: "DR."
    },
    {
      name: "Dra. Clara Ribeiro", 
      specialty: "Especialista em Psicologia Analítica",
      experience: "10 anos",
      initials: "DRA."
    }
  ], []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % motivationalMessages.length);
  }, [motivationalMessages.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + motivationalMessages.length) % motivationalMessages.length);
  }, [motivationalMessages.length]);

  const handleSlideSelect = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const handlePsychologistClick = useCallback((name) => {
    const slug = encodeURIComponent(name).toLowerCase().replace(/%20/g, '-');
    navigate(`/user/${slug}`);
  }, [navigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  }, [prevSlide, nextSlide]);

  return (
    <Card variant="glass" padding="lg" className="mb-8 animation-initial animate-fade-in-up">
      {/* Greeting */}
      {showGreeting && (
        <Card.Header>
          <div className={`text-center mb-6 animation-initial animate-fade-in-up animation-delay-100 ${
            showWelcomeMessage && isFadingOut ? 'welcome-greeting-fade-out' : ''
          }`}>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <GreetingIcon className="w-6 h-6 text-gray-400" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">{greetingText}</h2>
            </div>
            <time className="text-gray-400" dateTime={new Date().toISOString()}>
              {formattedDate}
            </time>
          </div>
        </Card.Header>
      )}

      <Card.Content>
        {/* Motivational Carousel */}
        <Card variant="glass" padding="lg" className="mb-6 animation-initial animate-fade-in-up animation-delay-200">
          <div 
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Mensagens motivacionais"
            aria-live="polite"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SM</span>
              </div>
            </div>
            
            {/* Motivational Card */}
            <div className="text-center min-h-[100px] flex flex-col justify-center">
              <blockquote className="text-white text-lg leading-relaxed mb-3">
                "{motivationalMessages[currentSlide].message}"
              </blockquote>
              <cite className="text-gray-300 text-sm font-medium not-italic">
                - {motivationalMessages[currentSlide].author}
              </cite>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prevSlide}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 focus-ring"
                aria-label="Mensagem anterior"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              
              <div className="flex space-x-2" role="tablist" aria-label="Navegação de mensagens">
                {motivationalMessages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideSelect(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 focus-ring ${
                      index === currentSlide ? 'bg-white' : 'bg-gray-600'
                    }`}
                    aria-label={`Ir para mensagem ${index + 1}`}
                    aria-selected={index === currentSlide}
                    role="tab"
                  />
                ))}
              </div>
              
              <button
                onClick={nextSlide}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 focus-ring"
                aria-label="Próxima mensagem"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-300">
                Ajudando na construção da sua própria história!
              </p>
              <div className="flex justify-center space-x-1 mt-2" role="img" aria-label="Corações de apoio">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} className="w-4 h-4 text-gray-400 fill-current" aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Psychologist Recommendations */}
        <Card variant="glass" padding="lg">
          <Card.Header>
            <h2 className="text-xl font-semibold text-white mb-6">
              Psicólogos Recomendados
            </h2>
          </Card.Header>
          
          <Card.Content>
            <div className="space-y-4">
              {psychologists.map((psychologist) => (
                <article key={psychologist.name} className="card-user">
                  <div className="avatar-large">
                    <span className="text-xl font-bold text-white">{psychologist.initials}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{psychologist.name}</h3>
                    <p className="text-gray-300 text-sm">{psychologist.specialty}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Experiência: {psychologist.experience}
                    </p>
                  </div>
                  <button 
                    onClick={() => handlePsychologistClick(psychologist.name)}
                    className="btn-primary focus-ring"
                    aria-label={`Ver perfil de ${psychologist.name}`}
                  >
                    Ver Perfil
                  </button>
                </article>
              ))}
            </div>
          </Card.Content>
        </Card>
      </Card.Content>
    </Card>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;