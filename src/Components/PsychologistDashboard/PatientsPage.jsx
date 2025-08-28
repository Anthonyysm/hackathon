import {  useState, useEffect  } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { getPsychologistPatients, createPatient } from '../../services/psychologistService';
import { useAuth } from '../../contexts/AuthContext';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    diagnosis: '',
    notes: ''
  });

  // Carregar pacientes
  useEffect(() => {
    loadPatients();
  }, [user?.uid]);

  // Filtrar pacientes
  useEffect(() => {
    let filtered = patients;
    
    if (searchQuery) {
      filtered = filtered.filter(patient => 
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }
    
    setFilteredPatients(filtered);
  }, [patients, searchQuery, statusFilter]);

  const loadPatients = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getPsychologistPatients(user.uid);
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      const result = await createPatient(user.uid, newPatient);
      if (result.success) {
        setShowAddPatient(false);
        setNewPatient({
          name: '',
          email: '',
          phone: '',
          birthDate: '',
          diagnosis: '',
          notes: ''
        });
        loadPatients();
      }
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'urgent':
        return 'Urgente';
      default:
        return 'Pendente';
    }
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
          <h1 className="text-2xl font-bold text-white">Pacientes</h1>
          <p className="text-white/60">Gerencie seus pacientes e acompanhe o progresso</p>
        </div>
        <button
          onClick={() => setShowAddPatient(true)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar pacientes..."
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
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="urgent">Urgentes</option>
        </select>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-white/60">Pacientes Ativos</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {patients.filter(p => p.status === 'urgent').length}
              </div>
              <div className="text-sm text-white/60">Casos Urgentes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {patients.filter(p => p.lastSession && new Date(p.lastSession) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-white/60">Sessões Esta Semana</div>
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
                {patients.filter(p => !p.lastSession || new Date(p.lastSession) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-white/60">Pendentes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Última Sessão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-white/5 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{patient.name}</div>
                        <div className="text-sm text-white/60">{patient.diagnosis || 'Sem diagnóstico'}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(patient.status)}`}>
                      {getStatusIcon(patient.status)}
                      <span className="ml-1">{getStatusText(patient.status)}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                    {patient.lastSession ? new Date(patient.lastSession).toLocaleDateString('pt-BR') : 'Nunca'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-white/20 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-white"
                          style={{ width: `${patient.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-white/60">{patient.progress || 0}%</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
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
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">Nenhum paciente encontrado</h3>
            <p className="text-white/40">Comece adicionando seu primeiro paciente</p>
          </div>
        )}
      </div>

      {/* Modal para adicionar paciente */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Novo Paciente</h2>
              <button
                onClick={() => setShowAddPatient(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Nome do paciente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={newPatient.birthDate}
                  onChange={(e) => setNewPatient({...newPatient, birthDate: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Diagnóstico Inicial
                </label>
                <textarea
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Descreva o diagnóstico inicial..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Observações
                </label>
                <textarea
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Observações adicionais..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors duration-300"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
