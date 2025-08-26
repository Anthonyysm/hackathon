import React from 'react';
import { Brain, Frown, Zap, HelpCircle, Calendar, MessageSquare } from 'lucide-react';

const TherapySessions = () => {
  const sessions = [
    {
      id: 1,
      title: 'Ansiedade',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      description: 'Técnicas para gerenciar ansiedade'
    },
    {
      id: 2,
      title: 'Depressão',
      icon: Frown,
      color: 'from-purple-500 to-purple-600',
      description: 'Apoio para momentos difíceis'
    },
    {
      id: 3,
      title: 'Estresse',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      description: 'Relaxamento e controle do estresse'
    },
    {
      id: 4,
      title: 'Síndrome do Pânico',
      icon: HelpCircle,
      color: 'from-orange-500 to-orange-600',
      description: 'Estratégias para crises de pânico'
    },
    {
      id: 5,
      title: 'Como Apoiar?',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      description: 'Aprenda a ajudar outras pessoas'
    },
    {
      id: 6,
      title: 'Diário Interativo',
      icon: Calendar,
      color: 'from-teal-500 to-teal-600',
      description: 'Reflexões e autoconhecimento'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center space-x-2 mb-6">
        <Brain className="w-6 h-6 text-gray-400" />
        <h2 className="text-xl font-semibold text-white">Sessões</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {sessions.map((session) => {
          const IconComponent = session.icon;
          return (
            <button
              key={session.id}
              className="bg-white/5 border border-gray-200/20 rounded-xl p-4 hover:bg-white/10 hover:border-gray-300/20 hover:scale-105 transition-all duration-200 group"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-white text-sm">{session.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{session.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TherapySessions;