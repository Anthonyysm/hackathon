import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Heart, Star, User, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGreeting } from '../hooks/useGreeting';
import Card from './ui/Card';
import psychologistService from '../services/psychologistService';

const WelcomeScreen = React.memo(({ showWelcomeMessage = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true); // Sempre mostrar por padrão
  const [psychologists, setPsychologists] = useState([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(true);
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

  const [motivationalPhrase, setMotivationalPhrase] = useState(null);
  const [loadingPhrase, setLoadingPhrase] = useState(false);

  // Frases motivacionais locais em vez de API externa
  const motivationalPhrases = useMemo(() => [
    {
      frase: "A jornada de mil milhas começa com um único passo.",
      autor: "Lao Tzu"
    },
    {
      frase: "A felicidade não é algo pronto. Ela vem das suas próprias ações.",
      autor: "Dalai Lama"
    },
    {
      frase: "Cada dia é uma nova oportunidade para ser melhor.",
      autor: "Desconhecido"
    },
    {
      frase: "A mente é como um paraquedas. Só funciona quando está aberta.",
      autor: "Frank Zappa"
    },
    {
      frase: "O bem-estar começa com a aceitação de quem você é.",
      autor: "Desconhecido"
    }
  ], []);

  // Buscar psicólogos recomendados do Firebase
  const fetchRecommendedPsychologists = useCallback(async () => {
    try {
      setLoadingPsychologists(true);
      const psychologistsList = await psychologistService.getRecommendedPsychologists(4);
      // Temporary mock for profile image testing
      const mockPsychologists = psychologistsList.map(p => ({
        ...p,
        profileImage: p.id === 'psychologist1' ? 'https://via.placeholder.com/150/0000FF/FFFFFF?text=PS' : null
      }));
      setPsychologists(mockPsychologists);
    } catch (error) {
      console.error('Erro ao buscar psicólogos recomendados:', error);
      setPsychologists([]);
    } finally {
      setLoadingPsychologists(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendedPsychologists();
  }, [fetchRecommendedPsychologists]);

  const fetchPhrase = useCallback(async () => {
    setLoadingPhrase(true);
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Selecionar frase aleatória
      const randomIndex = Math.floor(Math.random() * motivationalPhrases.length);
      setMotivationalPhrase(motivationalPhrases[randomIndex]);
    } catch (_) {
      setMotivationalPhrase(null);
    } finally {
      setLoadingPhrase(false);
    }
  }, [motivationalPhrases]);

  useEffect(() => {
    fetchPhrase();
  }, [fetchPhrase]);

  const refreshPhrase = useCallback(() => {
    fetchPhrase();
  }, [fetchPhrase]);

  const handlePsychologistClick = useCallback((psychologist) => {
    // Navegar para o perfil do psicólogo
    navigate(`/home/profile/${psychologist.id}`);
  }, [navigate]);

  const handleKeyDown = useCallback(() => {}, []);

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
        {/* Motivational from Backend */}
        <Card variant="glass" padding="lg" className="mb-6 animation-initial animate-fade-in-up animation-delay-200">
          <div 
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Mensagem motivacional"
            aria-live="polite"
          >
            {/* removed decorative circle above the phrase to keep UI clean */}
            
            {/* Motivational Card */}
            <div className="text-center min-h-[100px] flex flex-col justify-center">
              {loadingPhrase ? (
                <div className="text-white/70">Carregando frase...</div>
              ) : motivationalPhrase ? (
                <>
                  <blockquote className="text-white text-lg leading-relaxed mb-3">
                    "{motivationalPhrase.frase}"
                  </blockquote>
                  <cite className="text-gray-300 text-sm font-medium not-italic">
                    - {motivationalPhrase.autor}
                  </cite>
                </>
              ) : (
                <div className="text-white/70">Não foi possível carregar a frase agora.</div>
              )}
            </div>

            <div className="flex items-center justify-center mt-6">
              <button
                onClick={refreshPhrase}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors focus-ring"
                aria-label="Atualizar frase"
              >
                Nova frase
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
            {loadingPsychologists ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-white/70 ml-3">Carregando psicólogos...</span>
              </div>
            ) : psychologists.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/70 text-sm">Nenhum psicólogo disponível no momento</p>
                <p className="text-white/50 text-xs mt-1">Tente novamente mais tarde</p>
              </div>
            ) : (
              <div className="space-y-4">
                {psychologists.map((psychologist) => (
                  <article 
                    key={psychologist.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 group cursor-pointer"
                    onClick={() => handlePsychologistClick(psychologist)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Avatar com iniciais */}
                      {psychologist.profileImage ? (
                        <img
                          src={psychologist.profileImage}
                          alt={psychologist.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white font-bold text-sm">
                            {psychologist.initials}
                          </span>
                        </div>
                      )}
                      
                      {/* Informações do psicólogo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white font-semibold text-base group-hover:text-white/90 transition-colors duration-200">
                              {psychologist.name}
                            </h3>
                            <p className="text-gray-300 text-sm mt-1">
                              {psychologist.specialty}
                            </p>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 text-xs font-medium">
                              {psychologist.rating}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-xs mb-3">
                          Experiência: {psychologist.experience}
                        </p>
                        
                        {/* Badges de funcionalidades */}
                        <div className="flex flex-wrap gap-2">
                          {psychologist.acceptsOnline && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/20">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Online
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/20">
                            <Calendar className="w-3 h-3 mr-1" />
                            Disponível
                          </span>
                        </div>
                      </div>
                      
                      {/* Botão de ação */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePsychologistClick(psychologist);
                        }}
                        className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex-shrink-0 group-hover:scale-105 transform"
                        aria-label={`Ver perfil de ${psychologist.name}`}
                      >
                        Ver Perfil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </Card.Content>
    </Card>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

export default WelcomeScreen;