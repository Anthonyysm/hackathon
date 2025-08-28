import {  useState, useEffect  } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Download, 
  Filter, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getPsychologistReports, createReport } from '../../services/psychologistService';
import { useAuth } from '../../contexts/AuthContext';

const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showAddReport, setShowAddReport] = useState(false);
  const [expandedReport, setExpandedReport] = useState(null);
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'patient-progress',
    patientId: '',
    patientName: '',
    content: '',
    recommendations: '',
    nextSteps: ''
  });

  // Carregar relatórios
  useEffect(() => {
    loadReports();
  }, [user?.uid]);

  // Filtrar relatórios
  useEffect(() => {
    let filtered = reports;
    
    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }
    
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(report => new Date(report.createdAt) >= oneWeekAgo);
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(report => new Date(report.createdAt) >= oneMonthAgo);
    }
    
    setFilteredReports(filtered);
  }, [reports, searchQuery, typeFilter, dateFilter]);

  const loadReports = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getPsychologistReports(user.uid);
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      const reportData = {
        ...newReport,
        psychologistId: user.uid
      };
      
      const result = await createReport(reportData);
      if (result.success) {
        setShowAddReport(false);
        setNewReport({
          title: '',
          type: 'patient-progress',
          patientId: '',
          patientName: '',
          content: '',
          recommendations: '',
          nextSteps: ''
        });
        loadReports();
      }
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
    }
  };

  const toggleReportExpansion = (reportId) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'patient-progress':
        return <Users className="w-4 h-4" />;
      case 'session-summary':
        return <Clock className="w-4 h-4" />;
      case 'treatment-plan':
        return <CheckCircle className="w-4 h-4" />;
      case 'assessment':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'patient-progress':
        return 'Progresso do Paciente';
      case 'session-summary':
        return 'Resumo da Sessão';
      case 'treatment-plan':
        return 'Plano de Tratamento';
      case 'assessment':
        return 'Avaliação';
      default:
        return 'Relatório';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'patient-progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'session-summary':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'treatment-plan':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'assessment':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-white/60">Analise dados e gere relatórios detalhados</p>
        </div>
        <button
          onClick={() => setShowAddReport(true)}
          className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Novo Relatório
        </button>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar relatórios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
        >
          <option value="all">Todos os tipos</option>
          <option value="patient-progress">Progresso do Paciente</option>
          <option value="session-summary">Resumo da Sessão</option>
          <option value="treatment-plan">Plano de Tratamento</option>
          <option value="assessment">Avaliação</option>
        </select>
        
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
        >
          <option value="all">Todas as datas</option>
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
        </select>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {reports.length}
              </div>
              <div className="text-sm text-white/60">Total de Relatórios</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {reports.filter(r => r.type === 'patient-progress').length}
              </div>
              <div className="text-sm text-white/60">Progresso de Pacientes</div>
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
                {reports.filter(r => r.type === 'session-summary').length}
              </div>
              <div className="text-sm text-white/60">Resumos de Sessões</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {reports.filter(r => r.type === 'treatment-plan').length}
              </div>
              <div className="text-sm text-white/60">Planos de Tratamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de relatórios */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="p-6">
              {/* Cabeçalho do relatório */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    {getTypeIcon(report.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(report.type)}`}>
                        {getTypeText(report.type)}
                      </span>
                    </div>
                    {report.patientName && (
                      <p className="text-white/60 text-sm">Paciente: {report.patientName}</p>
                    )}
                    <p className="text-white/40 text-xs">Criado em {formatDate(report.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleReportExpansion(report.id)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    {expandedReport === report.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo expandido */}
              {expandedReport === report.id && (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  {report.content && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">Conteúdo</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{report.content}</p>
                    </div>
                  )}
                  
                  {report.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">Recomendações</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{report.recommendations}</p>
                    </div>
                  )}
                  
                  {report.nextSteps && (
                    <div>
                      <h4 className="text-sm font-medium text-white/80 mb-2">Próximos Passos</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{report.nextSteps}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3 pt-4">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Visualizar</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Exportar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-white/40">Comece criando seu primeiro relatório</p>
          </div>
        )}
      </div>

      {/* Modal para adicionar relatório */}
      {showAddReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Novo Relatório</h2>
              <button
                onClick={() => setShowAddReport(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Título do Relatório
                </label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Título do relatório"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Tipo de Relatório
                  </label>
                  <select
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  >
                    <option value="patient-progress">Progresso do Paciente</option>
                    <option value="session-summary">Resumo da Sessão</option>
                    <option value="treatment-plan">Plano de Tratamento</option>
                    <option value="assessment">Avaliação</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Nome do Paciente
                  </label>
                  <input
                    type="text"
                    value={newReport.patientName}
                    onChange={(e) => setNewReport({...newReport, patientName: e.target.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                    placeholder="Nome do paciente (opcional)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Conteúdo do Relatório
                </label>
                <textarea
                  value={newReport.content}
                  onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Descreva o conteúdo do relatório..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Recomendações
                </label>
                <textarea
                  value={newReport.recommendations}
                  onChange={(e) => setNewReport({...newReport, recommendations: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Recomendações baseadas no relatório..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Próximos Passos
                </label>
                <textarea
                  value={newReport.nextSteps}
                  onChange={(e) => setNewReport({...newReport, nextSteps: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Próximos passos a serem tomados..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddReport(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors duration-300"
                >
                  Criar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
