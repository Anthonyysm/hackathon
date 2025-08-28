import {  useState, useEffect  } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  Video, 
  Phone,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  X
} from 'lucide-react';
import { getPsychologistSessions, createSession, updateSession } from '../../services/psychologistService';
import { useAuth } from '../../contexts/AuthContext';

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddSession, setShowAddSession] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newSession, setNewSession] = useState({
    patientId: '',
    patientName: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 50,
    type: 'online',
    notes: '',
    status: 'scheduled'
  });

  // Carregar sessões
  useEffect(() => {
    loadSessions();
  }, [user?.uid]);

  // Filtrar sessões
  useEffect(() => {
    let filtered = sessions;
    
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }
    
    if (dateFilter === 'today') {
      const today = new Date();
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate.toDateString() === today.toDateString();
      });
    } else if (dateFilter === 'week') {
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate >= today && sessionDate <= weekFromNow;
      });
    }
    
    setFilteredSessions(filtered);
  }, [sessions, searchQuery, statusFilter, dateFilter]);

  const loadSessions = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getPsychologistSessions(user.uid);
      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      const sessionData = {
        ...newSession,
        psychologistId: user.uid,
        scheduledDate: new Date(newSession.scheduledDate + 'T' + newSession.scheduledTime)
      };
      
      const result = await createSession(sessionData);
      if (result.success) {
        setShowAddSession(false);
        setNewSession({
          patientId: '',
          patientName: '',
          scheduledDate: '',
          scheduledTime: '',
          duration: 50,
          type: 'online',
          notes: '',
          status: 'scheduled'
        });
        loadSessions();
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  };

  const handleUpdateSessionStatus = async (sessionId, newStatus) => {
    try {
      const result = await updateSession(sessionId, { status: newStatus });
      if (result.success) {
        loadSessions();
      }
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'scheduled':
        return <ClockIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'scheduled':
        return 'Agendada';
      case 'cancelled':
        return 'Cancelada';
      case 'in-progress':
        return 'Em Andamento';
      default:
        return 'Pendente';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'online':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in-person':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'online':
        return 'Online';
      case 'phone':
        return 'Telefone';
      case 'in-person':
        return 'Presencial';
      default:
        return 'Online';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessões</h1>
          <p className="text-white/60">Gerencie sua agenda de sessões de terapia</p>
        </div>
        <button
          onClick={() => setShowAddSession(true)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Nova Sessão
        </button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar sessões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
        >
          <option value="all">Todos os status</option>
          <option value="scheduled">Agendadas</option>
          <option value="in-progress">Em Andamento</option>
          <option value="completed">Concluídas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
        >
          <option value="all">Todas as datas</option>
          <option value="today">Hoje</option>
          <option value="week">Esta semana</option>
        </select>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {sessions.filter(s => s.status === 'scheduled').length}
              </div>
              <div className="text-sm text-white/60">Agendadas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {sessions.filter(s => s.status === 'in-progress').length}
              </div>
              <div className="text-sm text-white/60">Em Andamento</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {sessions.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-sm text-white/60">Concluídas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledDate) > new Date()).length}
              </div>
              <div className="text-sm text-white/60">Próximas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de sessões */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Data & Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {session.patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{session.patientName}</div>
                        <div className="text-sm text-white/60">{session.notes || 'Sem observações'}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {formatDate(session.scheduledDate)}
                    </div>
                    <div className="text-sm text-white/60">
                      {formatTime(session.scheduledDate)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20">
                      {getTypeIcon(session.type)}
                      <span className="ml-1">{getTypeText(session.type)}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {session.duration} min
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1">{getStatusText(session.status)}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {session.status === 'scheduled' && (
                        <>
                          <button 
                            onClick={() => handleUpdateSessionStatus(session.id, 'in-progress')}
                            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors duration-200"
                            title="Iniciar sessão"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateSessionStatus(session.id, 'cancelled')}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                            title="Cancelar sessão"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {session.status === 'in-progress' && (
                        <button 
                          onClick={() => handleUpdateSessionStatus(session.id, 'completed')}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors duration-200"
                          title="Finalizar sessão"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-white/40">Comece agendando sua primeira sessão</p>
          </div>
        )}
      </div>

      {/* Modal para adicionar sessão */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Nova Sessão</h2>
              <button
                onClick={() => setShowAddSession(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome do Paciente
                </label>
                <input
                  type="text"
                  required
                  value={newSession.patientName}
                  onChange={(e) => setNewSession({...newSession, patientName: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Nome do paciente"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={newSession.scheduledDate}
                    onChange={(e) => setNewSession({...newSession, scheduledDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={newSession.scheduledTime}
                    onChange={(e) => setNewSession({...newSession, scheduledTime: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Duração (min)
                  </label>
                  <select
                    value={newSession.duration}
                    onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={50}>50 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newSession.type}
                    onChange={(e) => setNewSession({...newSession, type: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  >
                    <option value="online">Online</option>
                    <option value="phone">Telefone</option>
                    <option value="in-person">Presencial</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Observações
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Observações sobre a sessão..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSession(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors duration-300"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
