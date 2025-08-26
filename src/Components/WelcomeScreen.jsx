import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Heart } from 'lucide-react';

const WelcomeScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const motivationalMessages = [
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
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % motivationalMessages.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [motivationalMessages.length]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: "Bom dia, Gabrielly!", icon: Sun };
    if (hour < 18) return { text: "Boa tarde, Gabrielly!", icon: Sun };
    return { text: "Boa noite, Gabrielly!", icon: Moon };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % motivationalMessages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + motivationalMessages.length) % motivationalMessages.length);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl mb-8">
      {/* Greeting */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <GreetingIcon className="w-6 h-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-white">{greeting.text}</h2>
        </div>
        <p className="text-gray-400">
          {currentTime.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Motivational Carousel */}
      <div className="relative bg-white/5 rounded-xl p-6 border border-gray-200/20">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">SM</span>
          </div>
        </div>
        
        <div className="text-center min-h-[100px] flex flex-col justify-center">
          <p className="text-white text-lg leading-relaxed mb-3">
            "{motivationalMessages[currentSlide].message}"
          </p>
          <p className="text-gray-300 text-sm font-medium">
            - {motivationalMessages[currentSlide].author}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prevSlide}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex space-x-2">
            {motivationalMessages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-white' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-300">
            Ajudando na construção da sua própria história!
          </p>
          <div className="flex justify-center space-x-1 mt-2">
            <Heart className="w-4 h-4 text-gray-400 fill-current" />
            <Heart className="w-4 h-4 text-gray-400 fill-current" />
            <Heart className="w-4 h-4 text-gray-400 fill-current" />
          </div>
        </div>
      </div>

      {/* Psychologist Recommendations */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Psicólogos Recomendados</h2>
        <div className="space-y-4">
          {/* Sample Psychologist 1 */}
          <div className="flex items-center space-x-4 bg-white/5 rounded-xl p-4 border border-gray-200/20">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">DR.</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Dr. Alberto Mendes</h3>
              <p className="text-gray-300 text-sm">Especialista em Terapia Cognitivo-Comportamental</p>
              <p className="text-gray-400 text-xs mt-1">Experiência: 15 anos</p>
            </div>
            <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">Ver Perfil</button>
          </div>

          {/* Sample Psychologist 2 */}
          <div className="flex items-center space-x-4 bg-white/5 rounded-xl p-4 border border-gray-200/20">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">DRA.</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Dra. Clara Ribeiro</h3>
              <p className="text-gray-300 text-sm">Especialista em Psicologia Analítica</p>
              <p className="text-gray-400 text-xs mt-1">Experiência: 10 anos</p>
            </div>
            <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200">Ver Perfil</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;