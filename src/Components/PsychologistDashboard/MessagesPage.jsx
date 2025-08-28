import {  useState, useEffect  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Input from '../ui/Input';
import firebaseService from '../../services/firebaseService';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Send, 
  MoreVertical, 
  Phone, 
  Video,
  Mail,
  Clock,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Archive,
  Trash2,
  Edit,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar
} from 'lucide-react';
import { getPsychologistMessages, createMessage, markMessageAsRead } from '../../services/psychologistService';
import { useAuth } from '../../contexts/AuthContext';

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    content: '',
  });
  const [showJoinChatModal, setShowJoinChatModal] = useState(false);
  const [joinChatRoomCode, setJoinChatRoomCode] = useState('');
  const [sessionRequests, setSessionRequests] = useState([]);

  // Carregar mensagens e solicitações de sessão
  useEffect(() => {
    loadMessages();
    loadSessionRequests();
  }, [user?.uid]);

  // Filtrar mensagens
  useEffect(() => {
    let filtered = messages;
    
    if (searchQuery) {
      filtered = filtered.filter(message => 
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter === 'unread') {
      filtered = filtered.filter(message => !message.read);
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(message => message.read);
    }
    
    setFilteredMessages(filtered);
  }, [messages, searchQuery, statusFilter]);

  const loadMessages = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getPsychologistMessages(user.uid);
      if (result.success) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionRequests = async () => {
    if (!user?.uid) return;

    try {
      const result = await firebaseService.therapyService.getSessionRequests(user.uid, 'psychologist');
      if (result) {
        setSessionRequests(result.filter(req => req.status === 'pending'));
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações de sessão:', error);
    }
  };

  const handleConfirmSession = async (requestId, clientId, clientName, psychologistId, psychologistName, date, time, sessionType, notes) => {
    try {
      await firebaseService.therapyService.updateSessionRequestStatus(requestId, 'confirmed');
      await firebaseService.therapyService.createTherapySession({
        clientId,
        clientName,
        psychologistId,
        psychologistName,
        date,
        time,
        sessionType,
        notes,
        status: 'confirmed'
      });
      // Notify user
      await firebaseService.notificationService.createNotification({
        recipientId: clientId,
        senderId: psychologistId,
        senderName: psychologistName,
        type: 'session_update',
        title: 'Sessão Confirmada!',
        message: `Sua sessão com ${psychologistName} em ${new Date(date).toLocaleDateString('pt-BR')} às ${time} foi confirmada.`,
        actionUrl: '/home/sessions'
      });
      loadSessionRequests();
    } catch (error) {
      console.error('Erro ao confirmar sessão:', error);
      alert('Erro ao confirmar sessão. Tente novamente.');
    }
  };

  const handleRejectSession = async (requestId, clientId, clientName, psychologistName, date, time) => {
    try {
      await firebaseService.therapyService.updateSessionRequestStatus(requestId, 'rejected');
      // Notify user
      await firebaseService.notificationService.createNotification({
        recipientId: clientId,
        senderId: user.uid,
        senderName: psychologistName,
        type: 'session_update',
        title: 'Sessão Rejeitada',
        message: `Sua solicitação de sessão com ${psychologistName} em ${new Date(date).toLocaleDateString('pt-BR')} às ${time} foi rejeitada. Por favor, agende outro horário.`,
        actionUrl: '/home/sessions'
      });
      loadSessionRequests();
    } catch (error) {
      console.error('Erro ao rejeitar sessão:', error);
      alert('Erro ao rejeitar sessão. Tente novamente.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      const messageData = {
        ...newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Psicólogo'
      };
      
      const result = await createMessage(messageData);
      if (result.success) {
        setShowCompose(false);
        setNewMessage({
          recipientId: '',
          content: '',
        });
        loadMessages();
        // Navigate to the new chat room after creating a message
        if (messageData.recipientId) {
          navigate(`/home/chat/${messageData.recipientId}`);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const result = await markMessageAsRead(messageId);
      if (result.success) {
        loadMessages();
      }
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
    }
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getMessageTypeText = (type) => {
    switch (type) {
      case 'phone':
        return 'Chamada';
      case 'video':
        return 'Vídeo';
      case 'email':
        return 'Email';
      default:
        return 'Mensagem';
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'phone':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'video':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'email':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const handleJoinChat = () => {
    if (!joinChatRoomCode.trim()) return;
    navigate(`/home/chat/${joinChatRoomCode.trim()}`);
    setShowJoinChatModal(false);
    setJoinChatRoomCode('');
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
          <h1 className="text-2xl font-bold text-white">Mensagens</h1>
          <p className="text-white/60">Gerencie suas comunicações com pacientes e colegas</p>
        </div>
        <div className="flex space-x-2">
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Criar Novo Chat
                </button>
                <button
                  onClick={() => setShowJoinChatModal(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  Entrar em um Chat
                </button>
              </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Buscar mensagens..."
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
          <option value="all">Todas as mensagens</option>
          <option value="unread">Não lidas</option>
          <option value="read">Lidas</option>
        </select>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.length}
              </div>
              <div className="text-sm text-white/60">Total de Mensagens</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.filter(m => !m.read).length}
              </div>
              <div className="text-sm text-white/60">Não Lidas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.filter(m => m.read).length}
              </div>
              <div className="text-sm text-white/60">Lidas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {messages.filter(m => m.type === 'phone' || m.type === 'video').length}
              </div>
              <div className="text-sm text-white/60">Chamadas/Vídeos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mensagens */}
      <div className="space-y-4">
        {/* Session Requests */}
        {sessionRequests.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-4">
            <h3 className="text-xl font-semibold text-white mb-4">Solicitações de Sessão Pendentes</h3>
            <div className="space-y-4">
              {sessionRequests.map((request) => (
                <div key={request.id} className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">Solicitação de Sessão de {request.sessionType === 'individual' ? 'Individual' : request.sessionType === 'couple' ? 'Casal' : request.sessionType === 'family' ? 'Familiar' : 'Grupo'}</p>
                        <p className="text-white/70 text-sm">Cliente: {request.clientName}</p>
                        <p className="text-white/70 text-sm">Data: {new Date(request.date).toLocaleDateString('pt-BR')} às {request.time}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pendente</span>
                  </div>
                  {request.notes && (
                    <p className="text-white/60 text-sm mt-2">Obs: {request.notes}</p>
                  )}
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleConfirmSession(
                        request.id,
                        request.clientId,
                        request.clientName,
                        request.psychologistId,
                        request.psychologistName,
                        request.date,
                        request.time,
                        request.sessionType,
                        request.notes
                      )}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-300"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleRejectSession(
                        request.id,
                        request.clientId,
                        request.clientName,
                        request.psychologistName,
                        request.date,
                        request.time
                      )}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-300"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-all duration-300 ${
              !message.read ? 'bg-white/10 border-white/30' : ''
            }`}
          >
            <div className="p-6">
              {/* Cabeçalho da mensagem */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    {getMessageTypeIcon(message.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${!message.read ? 'text-white' : 'text-white/80'}`}>
                        {message.subject || 'Sem assunto'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMessageTypeColor(message.type)}`}>
                        {getMessageTypeText(message.type)}
                      </span>
                      {!message.read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          Nova
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm">De: {message.senderName}</p>
                    <p className="text-white/40 text-xs">{formatDate(message.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!message.read && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors duration-300"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => toggleMessageExpansion(message.id)}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                  >
                    {expandedMessage === message.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300">
                    <Reply className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conteúdo expandido */}
              {expandedMessage === message.id && (
                <div className="border-t border-white/10 pt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-2">Mensagem</h4>
                    <p className="text-white/70 text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Reply className="w-4 h-4" />
                      <span className="text-sm">Responder</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Forward className="w-4 h-4" />
                      <span className="text-sm">Encaminhar</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <Archive className="w-4 h-4" />
                      <span className="text-sm">Arquivar</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors duration-300">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Excluir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60 mb-2">Nenhuma mensagem encontrada</h3>
            <p className="text-white/40">Comece enviando sua primeira mensagem</p>
          </div>
        )}
      </div>

      {/* Modal para compor mensagem */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Criar Novo Chat</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  ID do Destinatário (Paciente)
                </label>
                <input
                  type="text"
                  required
                  value={newMessage.recipientId}
                  onChange={(e) => setNewMessage({...newMessage, recipientId: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="ID do paciente"
                />
              </div>
              
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Conteúdo da Mensagem
                </label>
                <textarea
                  required
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  rows="6"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300"
                  placeholder="Digite sua mensagem..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors duration-300"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Entrar em um Chat */}
      {showJoinChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass" padding="lg" className="w-full max-w-md mx-4">
            <Card.Header>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-semibold text-white">Entrar em um Chat</h2>
                </div>
                <button
                  onClick={() => setShowJoinChatModal(false)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="text-center py-6">
                <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/70 mb-2">Digite um código de sala para começar</h3>
                <p className="text-white/50 mb-4">Ou use a URL diretamente: /home/chat/nomeddasala</p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Digite o código da sala (ex: sala1208)"
                    value={joinChatRoomCode}
                    onChange={(e) => setJoinChatRoomCode(e.target.value)}
                    variant="glass"
                    size="sm"
                    className="flex-1"
                  />
                  <button
                    onClick={handleJoinChat}
                    disabled={!joinChatRoomCode.trim()}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
