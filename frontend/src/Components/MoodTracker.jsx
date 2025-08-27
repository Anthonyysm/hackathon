import React, { useRef, useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { moodService } from '../services/firebaseService';

const MoodTracker = ({ onOpenHumorTab }) => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Seg', mood: 0, energy: 0 },
    { day: 'Ter', mood: 0, energy: 0 },
    { day: 'Qua', mood: 0, energy: 0 },
    { day: 'Qui', mood: 0, energy: 0 },
    { day: 'Sex', mood: 0, energy: 0 },
    { day: 'Sáb', mood: 0, energy: 0 },
    { day: 'Dom', mood: 0, energy: 0 }
  ]);
  const [intensity, setIntensity] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stability, setStability] = useState(5);

  const maxValue = 10;

  const trendsRef = useRef(null);
  const [highlightTrends, setHighlightTrends] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const history = await moodService.getUserMoodHistory(user.uid, 7);
      const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      const now = new Date();
      const mapped = [0,0,0,0,0,0,0].map((_, idx) => {
        const d = (idx + 1) % 7; // Seg a Dom
        const label = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][idx];
        const moods = history.filter(h => {
          const dt = h.recordedAt?.toDate ? h.recordedAt.toDate() : new Date(h.recordedAt);
          return dt && dt.getDay() === (idx+1)%7;
        });
        const avgMood = moods.length ? Math.round(moods.reduce((s, m) => s + (m.intensity||0), 0) / moods.length) : 0;
        const avgEnergy = moods.length ? Math.round(moods.reduce((s, m) => s + (m.energy||0), 0) / moods.length) : 0;
        return { day: label, mood: avgMood, energy: avgEnergy };
      });
      setWeeklyData(mapped);
    };
    load();
  }, [user]);

  const handleSaveCheckin = async () => {
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    try {
      const moodData = {
        intensity,
        energy,
        stability,
        notes: 'Check-in diário',
        tags: ['daily', 'checkin']
      };

      await moodService.recordMood(user.uid, moodData);
      alert('Check-in salvo com sucesso!');
      
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
      // refresh history after save
      const history = await moodService.getUserMoodHistory(user.uid, 7);
      const mapped = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((label, idx) => {
        const moods = history.filter(h => {
          const dt = h.recordedAt?.toDate ? h.recordedAt.toDate() : new Date(h.recordedAt);
          return dt && dt.getDay() === (idx+1)%7;
        });
        const avgMood = moods.length ? Math.round(moods.reduce((s, m) => s + (m.intensity||0), 0) / moods.length) : 0;
        const avgEnergy = moods.length ? Math.round(moods.reduce((s, m) => s + (m.energy||0), 0) / moods.length) : 0;
        return { day: label, mood: avgMood, energy: avgEnergy };
      });
      setWeeklyData(mapped);
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
      alert('Erro ao salvar check-in. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6 animation-initial animate-fade-in-right animation-delay-200">
      {/* Daily Check-in */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Check-in Diário</h2>
        </div>
        
        <div className="space-y-6">
          {/* Mood Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Intensidade</span>
              <span className="text-sm text-gray-400">{intensity}/10</span>
            </div>
            <input type="range" min="0" max="10" value={intensity} onChange={(e)=>setIntensity(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Energia</span>
              <span className="text-sm text-gray-400">{energy}/10</span>
            </div>
            <input type="range" min="0" max="10" value={energy} onChange={(e)=>setEnergy(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Estabilidade</span>
              <span className="text-sm text-gray-400">{stability}/10</span>
            </div>
            <input type="range" min="0" max="10" value={stability} onChange={(e)=>setStability(parseInt(e.target.value))} className="w-full" />
          </div>
          
          <button onClick={handleSaveCheckin} className="w-full bg-gradient-to-r from-white to-gray-200 text-black text-sm font-medium py-3 px-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200">
            Salvar Check-in
          </button>
        </div>
      </div>

      {/* Weekly Trends */}
      <div ref={trendsRef} className={`bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl transition ${highlightTrends ? 'ring-2 ring-white/50' : ''}`}>
        <div className="flex items-center space-x-2 mb-12">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Tendência Semanal</h2>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32 px-2">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
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