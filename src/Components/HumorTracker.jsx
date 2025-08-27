import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter,
  Search,
  Clock,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';


const HumorTracker = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedCause, setSelectedCause] = useState('');
  const [activeTab, setActiveTab] = useState('track');
  const [userData, setUserData] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('week');

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

  // Mock mood entries
  const mockMoodEntries = [
    {
      id: 1,
      date: new Date('2024-01-15'),
      mood: 'happy',
      cause: 'Família',
      notes: 'Dia muito bom com a família, almoço especial.',
      intensity: 8
    },
    {
      id: 2,
      date: new Date('2024-01-14'),
      mood: 'sad',
      cause: 'Trabalho',
      notes: 'Estresse no trabalho, reunião difícil.',
      intensity: 6
    },
    {
      id: 3,
      date: new Date('2024-01-13'),
      mood: 'peace',
      cause: 'Lazer',
      notes: 'Meditação matinal, sentindo-me calmo.',
      intensity: 9
    }
  ];

  const monthlyStats = [
    { mood: 'Feliz', percentage: 45, color: 'bg-green-500', trend: 'up' },
    { mood: 'Triste', percentage: 25, color: 'bg-blue-500', trend: 'down' },
    { mood: 'Paz', percentage: 20, color: 'bg-purple-500', trend: 'up' },
    { mood: 'Raiva', percentage: 10, color: 'bg-red-500', trend: 'down' }
  ];

  // Calendar data (simplified)
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const entry = mockMoodEntries.find(entry => 
      entry.date.getDate() === day && entry.date.getMonth() === 0
    );
    return {
      day,
      mood: entry ? entry.mood : null,
      intensity: entry ? entry.intensity : null
    };
  });

  const handleMoodSubmit = () => {
    // TODO: Implement mood submission
    console.log('Mood submitted:', { selectedMood, selectedCause });
    setShowMoodForm(false);
    setSelectedMood('');
    setSelectedCause('');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    fetchUserData();
    setMoodEntries(mockMoodEntries);
  }, []);

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'happy': return 'bg-green-500';
      case 'sad': return 'bg-blue-500';
      case 'angry': return 'bg-red-500';
      case 'fear': return 'bg-yellow-500';
      case 'peace': return 'bg-purple-500';
      case 'love': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😔';
      case 'angry': return '😡';
      case 'fear': return '😰';
      case 'peace': return '😌';
      case 'love': return '❤️';
      default: return '😐';
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 animation-initial animate-fade-in-up animation-delay-100">
      {/* Header with Tabs */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Rastreador de Humor</h2>
          </div>
          <button
            onClick={() => setShowMoodForm(!showMoodForm)}
            className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Registrar Humor
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'track'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Rastreamento
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'bg-white text-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Análises
          </button>
        </div>
      </div>

      {/* Mood Registration Form */}
      {showMoodForm && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Registrar Humor</h3>
            <button
              onClick={() => setShowMoodForm(false)}
              className="text-white/50 hover:text-white"
            >
              ✕
            </button>
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

            <button 
              onClick={handleMoodSubmit}
              disabled={!selectedMood || !selectedCause}
              className="w-full bg-gradient-to-r from-white to-gray-200 text-black py-3 px-4 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              REGISTRAR
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'track' && (
        <>
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
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center text-xs text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => (
                <button
                  key={day.day}
                  className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all duration-200 ${
                    day.mood
                      ? `${getMoodColor(day.mood)} text-white`
                      : 'text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  <span className="text-xs">{day.day}</span>
                  {day.mood && (
                    <span className="text-xs opacity-75">{day.intensity}/10</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Resumo da Semana</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl mb-2">😊</div>
                <div className="text-white font-medium">Humor Médio</div>
                <div className="text-white/70 text-sm">7.5/10</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-white font-medium">Entradas</div>
                <div className="text-white/70 text-sm">5 esta semana</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Histórico de Humor</h3>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar entradas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                />
              </div>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="year">Este ano</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {moodEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMoodColor(entry.mood)}`}>
                      <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{entry.cause}</h4>
                      <p className="text-sm text-white/70">{entry.notes}</p>
                      <div className="flex items-center space-x-2 text-xs text-white/50 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{entry.date.toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>Intensidade: {entry.intensity}/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-white/50 hover:text-white p-1">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="text-white/50 hover:text-white p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <>
          {/* Statistics */}
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Estatísticas Mensais</h3>
              </div>
            </div>

            <div className="space-y-3">
              {monthlyStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${stat.color}`}></div>
                    <span className="text-sm text-gray-300">{stat.mood}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{stat.percentage}%</span>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals and Insights */}
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">Metas e Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Target className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Meta: 7 dias consecutivos</div>
                  <div className="text-white/70 text-sm">Progresso: 5/7 dias</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">Melhor humor da semana</div>
                  <div className="text-white/70 text-sm">Quinta-feira: 9/10</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HumorTracker;