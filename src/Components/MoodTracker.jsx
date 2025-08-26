import React, { useRef, useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

const MoodTracker = ({ onOpenHumorTab }) => {
  const weeklyData = [
    { day: 'Seg', mood: 6, energy: 7 },
    { day: 'Ter', mood: 4, energy: 5 },
    { day: 'Qua', mood: 7, energy: 8 },
    { day: 'Qui', mood: 5, energy: 6 },
    { day: 'Sex', mood: 8, energy: 9 },
    { day: 'Sáb', mood: 7, energy: 7 },
    { day: 'Dom', mood: 6, energy: 6 }
  ];

  const maxValue = 10;

  const trendsRef = useRef(null);
  const [highlightTrends, setHighlightTrends] = useState(false);

  const handleSaveCheckin = () => {
    // Se a função onOpenHumorTab foi fornecida, abre a aba de humor
    if (onOpenHumorTab) {
      onOpenHumorTab();
    } else {
      // Fallback: Scroll até a seção de estatísticas (Tendência Semanal) e destaca rapidamente
      if (trendsRef.current) {
        trendsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHighlightTrends(true);
        setTimeout(() => setHighlightTrends(false), 1600);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Check-in */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Check-in Diário</h2>
        </div>
        
        <div className="space-y-6">
          {/* Mood Metrics */}
          {[
            { label: 'Vontade', value: 7, color: 'white' },
            { label: 'Estabilidade', value: 6, color: 'gray' },
            { label: 'Atenção', value: 8, color: 'white' }
          ].map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">{metric.label}</span>
                <span className="text-sm text-gray-400">{metric.value}/10</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500 ${
                    metric.color === 'white' ? 'from-white to-gray-200' :
                    metric.color === 'gray' ? 'from-gray-400 to-gray-500' :
                    'from-white to-gray-200'
                  }`}
                  style={{ width: `${(metric.value / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          <button onClick={handleSaveCheckin} className="w-full bg-gradient-to-r from-white to-gray-200 text-black text-sm font-medium py-3 px-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200">
            Salvar Check-in
          </button>
        </div>
      </div>

      {/* Weekly Trends */}
      <div ref={trendsRef} className={`bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl transition ${highlightTrends ? 'ring-2 ring-white/50' : ''}`}>
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Tendência Semanal</h2>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 px-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                <div className="relative w-full max-w-[20px] flex flex-col items-center space-y-1">
                  {/* Energy Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-gray-400/70 to-gray-300/70 rounded-sm transition-all duration-500 hover:from-gray-400 hover:to-gray-300"
                    style={{
                      height: `${(day.energy / maxValue) * 80}px`,
                      minHeight: '8px'
                    }}
                  ></div>
                  {/* Mood Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-white/70 to-gray-200/70 rounded-sm transition-all duration-500 hover:from-white hover:to-gray-200"
                    style={{
                      height: `${(day.mood / maxValue) * 80}px`,
                      minHeight: '8px'
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-700/30">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-white to-gray-200 rounded-sm"></div>
              <span className="text-xs text-gray-400">Humor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-sm"></div>
              <span className="text-xs text-gray-400">Energia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;