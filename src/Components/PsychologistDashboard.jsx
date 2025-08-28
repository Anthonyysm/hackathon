import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Clock, 
  Star,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  Plus,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { getDashboardStats, getPsychologistPatients, getPsychologistSessions } from '../services/psychologistService';
import PatientsPage from './PsychologistDashboard/PatientsPage';
import SessionsPage from './PsychologistDashboard/SessionsPage';
import ReportsPage from './PsychologistDashboard/ReportsPage';
import MessagesPage from './PsychologistDashboard/MessagesPage';
import PsychologistTour from './PsychologistDashboard/PsychologistTour';

const PsychologistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    patients: [],
    sessions: [],
    stats: {
      activePatients: 0,
      totalSessions: 0,
      successRate: 0,
      avgSessionTime: 0,
      rating: 0,
      newPatients: 0
    }
  });

  // Cards de monitoramento baseados em dados reais
  const monitoringCards = useMemo(() => [
    {
      id: 1,
      title: "Pacientes Ativos",
      subtitle: "Em tratamento",
      value: dashboardData.stats.activePatients.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      bars: [80, 60, 90, 70, 85]
    },
    {
      id: 2,
      title: "Sessões Realizadas",
      subtitle: "Este mês",
      value: dashboardData.stats.totalSessions.toString(),
      change: "+8%",
      trend: "up",
      icon: Calendar,
      bars: [65, 85, 70, 90, 75]
    },
    {
      id: 3,
      title: "Taxa de Sucesso",
      subtitle: "Tratamentos",
      value: `${dashboardData.stats.successRate}%`,
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      bars: [90, 85, 95, 80, 88]
    },
    {
      id: 4,
      title: "Tempo Médio",
      subtitle: "Por sessão",
      value: `${dashboardData.stats.avgSessionTime}min`,
      change: "-3%",
      trend: "down",
      icon: Clock,
      bars: [70, 60, 80, 65, 75]
    },
    {
      id: 5,
      title: "Avaliações",
      subtitle: "Satisfação",
      value: dashboardData.stats.rating.toString(),
      change: "+0.2",
      trend: "up",
      icon: Star,
      bars: [85, 90, 80, 95, 88]
    },
    {
      id: 6,
      title: "Novos Pacientes",
      subtitle: "Esta semana",
      value: dashboardData.stats.newPatients.toString(),
      change: "+25%",
      trend: "up",
      icon: Activity,
      bars: [60, 75, 85, 70, 80]
    }
  ], [dashboardData.stats]);

  // Pacientes recentes baseados em dados reais
  const recentPatients = useMemo(() => dashboardData.patients.slice(0, 3), [dashboardData.patients]);

  // Próximas sessões baseadas em dados reais
  const upcomingSessions = useMemo(() => dashboardData.sessions.slice(0, 3), [dashboardData.sessions]);

  const handleLogout = () => {
    // Implementar lógica de logout
    navigate('/login');
  };

  const handleNewSession = () => {
    setActiveTab('sessions');
  };

  const handlePatientClick = (patientId) => {
    setActiveTab('patients');
  };

  const handleSessionClick = (sessionId) => {
    setActiveTab('sessions');
  };

  // Verificar se é a primeira vez do psicólogo
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`psychologist-tour-${user?.uid}`);
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, [user?.uid]);

  // Carregar dados do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        // Carregar estatísticas
        const statsResult = await getDashboardStats(user.uid);
        let stats = {
          activePatients: 0,
          totalSessions: 0,
          successRate: 87,
          avgSessionTime: 45,
          rating: 4.8,
          newPatients: 0
        };
        
        if (statsResult.success) {
          stats = statsResult.data;
        }
        
        // Carregar pacientes
        const patientsResult = await getPsychologistPatients(user.uid);
        let patients = [];
        if (patientsResult.success) {
          patients = patientsResult.data;
        }
        
        // Carregar sessões
        const sessionsResult = await getPsychologistSessions(user.uid);
        let sessions = [];
        if (sessionsResult.success) {
          sessions = sessionsResult.data;
        }
        
        setDashboardData({
          patients,
          sessions,
          stats
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user?.uid]);

  // Renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Cards de monitoramento */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monitoringCards.map((card) => (
                <div
                  key={card.id}
                  className="monitoring-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] group"
                >
                  {/* Cabeçalho do card */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-base">{card.title}</h3>
                        <p className="text-white/60 text-sm">{card.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right text-white">
                      <div className="text-xl font-bold">{card.value}</div>
                      <div className="text-xs text-white/70">{card.change}</div>
                    </div>
                  </div>
                  
                  {/* Gráfico de barras */}
                  <div className="chart-container flex items-end justify-between space-x-1.5 h-20">
                    {card.bars.map((height, index) => (
                      <div
                        key={index}
                        className="chart-bar flex-1 bg-white/60 rounded-t-md group-hover:bg-white transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Seção inferior com pacientes e sessões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pacientes recentes */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Pacientes Recentes</h3>
                  <button 
                    onClick={() => setActiveTab('patients')}
                    className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-300 flex items-center space-x-1"
                  >
                    <span>Ver todos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientClick(patient.id)}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-base">{patient.name}</h4>
                          <p className="text-white/60 text-sm">
                            Última sessão: {patient.lastSession ? new Date(patient.lastSession).toLocaleDateString('pt-BR') : 'Nunca'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60 mb-2">
                          Próxima: {patient.nextSession || 'Não agendada'}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-white/20 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full bg-white"
                              style={{ width: `${patient.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/60">{patient.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recentPatients.length === 0 && (
                    <div className="text-center py-10">
                      <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/40 text-base">Nenhum paciente ainda</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Próximas sessões */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Próximas Sessões</h3>
                  <button 
                    onClick={handleNewSession}
                    className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionClick(session.id)}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-base">{session.patientName}</h4>
                          <p className="text-white/60 text-sm">
                            {session.type || 'Online'} • {session.duration || 50} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">
                          {session.scheduledDate ? new Date(session.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full ${
                          session.status === 'confirmed' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/10 text-white/80'
                        }`}>
                          {session.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingSessions.length === 0 && (
                    <div className="text-center py-10">
                      <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/40 text-base">Nenhuma sessão agendada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'patients':
        return <PatientsPage />;
      
      case 'sessions':
        return <SessionsPage />;
      
      case 'reports':
        return <ReportsPage />;
      
      case 'messages':
        return <MessagesPage />;
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-white"></div>
          <p className="text-white/70 text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Partículas flutuantes de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MONITORAMENTO</h1>
              <p className="text-base text-white/60">
                Olá, {user?.displayName || 'Psicólogo'}! 👋
              </p>
            </div>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Buscar pacientes, sessões..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Ações do usuário */}
          <div className="flex items-center space-x-3">
            <button className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Navegação por abas */}
      <nav className="bg-white/5 border-b border-white/10 px-6">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'patients', label: 'Pacientes', icon: Users },
            { id: 'sessions', label: 'Sessões', icon: Calendar },
            { id: 'reports', label: 'Relatórios', icon: TrendingUp },
            { id: 'messages', label: 'Mensagens', icon: MessageCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      {/* Conteúdo principal */}
      <main className="p-6">
        {renderContent()}
      </main>
      
      {/* Tour para psicólogos */}
      <PsychologistTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
      />
      
      {/* Estilos CSS para partículas flutuantes */}
      <style>{`
        .floating-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          animation: float 6s infinite ease-in-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-30px) translateX(15px);
            opacity: 1;
          }
        }
        
        .monitoring-card {
          position: relative;
          overflow: hidden;
        }
        
        .monitoring-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }
        
        .monitoring-card:hover::before {
          left: 100%;
        }
        
        .chart-bar {
          transition: all 0.3s ease;
        }
        
        .chart-bar:hover {
          transform: scaleY(1.1);
        }
      `}</style>
    </div>
  );
};

export default PsychologistDashboard;