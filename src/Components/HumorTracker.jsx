import React, { useState } from 'react';
import { Calendar, BarChart3 } from 'lucide-react';

const HumorTracker = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedCause, setSelectedCause] = useState('');

  const moods = [
    { emoji: '😊', label: 'Feliz', value: 'happy' },
    { emoji: '😔', label: 'Triste', value: 'sad' },
    { emoji: '😡', label: 'Raiva', value: 'angry' },
    { emoji: '😰', label: 'Medo', value: 'fear' },
    { emoji: '😌', label: 'Paz', value: 'peace' },
    { emoji: '❤️', label: 'Amor', value: 'love' }
  ];

  const causes = [
    'Sono', 'Eu Mesmo(a)', 'Família',
    'Saúde', 'Amizades', 'Estudos',
    'Lazer', 'Trabalho', 'Relação',
    'Luto', 'Finanças', 'Outras'
  ];

  const monthlyStats = [
    { mood: 'Raiva', percentage: 32.5, color: 'bg-red-500' },
    { mood: 'Gratidão', percentage: 32.5, color: 'bg-green-500' },
    { mood: 'Família', percentage: 32.5, color: 'bg-blue-500' }
  ];

  // Calendar data (simplified)
  const calendarDays = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    mood: i === 17 ? 'happy' : null // Highlight day 18 as example
  }));

  return (
    <div className="space-y-6">
      {/* Mood Registration */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Registro de Humor</h2>
        </div>

        <div className="space-y-6">
          {/* Mood Selection */}
          <div>
            <p className="text-sm text-gray-300 mb-3">Escolha uma Opção:</p>
            <div className="grid grid-cols-3 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200 ${
                    selectedMood === mood.value
                      ? 'bg-white/10 border border-white/20 scale-105'
                      : 'bg-gray-800/30 hover:bg-gray-700/30 hover:scale-105'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-300">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cause Selection */}
          <div>
            <p className="text-sm text-gray-300 mb-3">Principal Causa:</p>
            <div className="grid grid-cols-3 gap-2">
              {causes.map((cause) => (
                <button
                  key={cause}
                  onClick={() => setSelectedCause(cause)}
                  className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                    selectedCause === cause
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-300'
                  }`}
                >
                  {cause}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-white to-gray-200 text-black py-3 px-4 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200">
            REGISTRAR
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Janeiro de 2024</h3>
          <div className="flex space-x-2">
            <button className="p-1 text-gray-400 hover:text-white">‹</button>
            <button className="p-1 text-gray-400 hover:text-white">›</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day) => (
            <div key={day} className="text-center text-xs text-gray-400 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => (
            <button
              key={day.day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200 ${
                day.day === 18
                  ? 'bg-white text-black font-bold'
                  : day.mood
                  ? 'bg-white/10 text-white'
                  : 'text-gray-300 hover:bg-gray-700/30'
              }`}
            >
              {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Estatísticas</h3>
        </div>

        <div className="space-y-3">
          {monthlyStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${stat.color}`}></div>
                <span className="text-sm text-gray-300">{stat.mood}</span>
              </div>
              <span className="text-sm text-gray-400">{stat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HumorTracker;