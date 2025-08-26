import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageCircle, 
  Users, 
  Calendar, 
  Heart, 
  ArrowLeft,
  Settings,
  Check,
  X,
  Filter,
  Search
} from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Mock notifications for now - replace with real data from Firebase
  const mockNotifications = [
    {
      id: 1,
      type: 'message',
      title: 'Nova mensagem de João Silva',
      message: 'Olá! Como você está se sentindo hoje?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      sender: {
        name: 'João Silva',
        avatar: null
      }
    },
    {
      id: 2,
      type: 'group',
      title: 'Novo membro no grupo Ansiedade & Estresse',
      message: 'Maria Santos entrou no grupo',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      group: {
        name: 'Ansiedade & Estresse',
        avatar: null
      }
    },
    {
      id: 3,
      type: 'session',
      title: 'Lembrete de sessão',
      message: 'Sua sessão com Dr. Carlos está marcada para amanhã às 14h',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      session: {
        therapist: 'Dr. Carlos',
        time: '14:00',
        date: 'Amanhã'
      }
    },
    {
      id: 4,
      type: 'like',
      title: 'João Silva curtiu sua postagem',
      message: 'João Silva curtiu sua postagem sobre ansiedade',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      read: true,
      post: {
        content: 'Postagem sobre ansiedade...',
        avatar: null
      }
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Lembrete do Humor Tracker',
      message: 'Não se esqueça de registrar seu humor hoje',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: false
    }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        // Set mock notifications for now
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'group':
        return <Users className="w-5 h-5 text-green-400" />;
      case 'session':
        return <Calendar className="w-5 h-5 text-purple-400" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-white/50" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'group':
        return 'border-green-500/20 bg-green-500/5';
      case 'session':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'like':
        return 'border-red-500/20 bg-red-500/5';
      case 'reminder':
        return 'border-yellow-500/20 bg-yellow-500/5';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days} dias atrás`;
    
    return timestamp.toLocaleDateString('pt-BR');
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl font-light">Notificações</h1>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Pesquisar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all">Todas</option>
                <option value="message">Mensagens</option>
                <option value="group">Grupos</option>
                <option value="session">Sessões</option>
                <option value="like">Curtidas</option>
                <option value="reminder">Lembretes</option>
              </select>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white/10 border border-white/30 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-lg">Nenhuma notificação encontrada</p>
              <p className="text-white/30 text-sm mt-2">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você está em dia com suas notificações!'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-2xl p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/5 ${
                  notification.read 
                    ? 'border-white/10 bg-white/5' 
                    : `border-white/20 bg-white/10 ${getNotificationColor(notification.type)}`
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium mb-1 ${
                          notification.read ? 'text-white/80' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          notification.read ? 'text-white/60' : 'text-white/80'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Additional info based on type */}
                        {notification.type === 'message' && notification.sender && (
                          <div className="flex items-center space-x-2 text-xs text-white/50">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                              {notification.sender.avatar ? (
                                <img src={notification.sender.avatar} alt="" className="w-full h-full rounded-full" />
                              ) : (
                                <span className="text-white/70">{notification.sender.name.charAt(0)}</span>
                              )}
                            </div>
                            <span>De: {notification.sender.name}</span>
                          </div>
                        )}

                        {notification.type === 'group' && notification.group && (
                          <div className="flex items-center space-x-2 text-xs text-white/50">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-white/70">G</span>
                            </div>
                            <span>Grupo: {notification.group.name}</span>
                          </div>
                        )}

                        {notification.type === 'session' && notification.session && (
                          <div className="flex items-center space-x-2 text-xs text-white/50">
                            <Calendar className="w-3 h-3" />
                            <span>{notification.session.date} às {notification.session.time}</span>
                            <span>•</span>
                            <span>{notification.session.therapist}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-white/40">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-all duration-300"
                              >
                                Marcar como lida
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-white/50 hover:text-red-400 px-2 py-1 rounded transition-all duration-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preferences Modal */}
        {showPreferences && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/95 border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-light">Preferências de Notificação</h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Notificações de mensagens</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Atividade de grupos</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Lembretes de sessões</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Curtidas e interações</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Lembretes do Humor Tracker</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Notificações por e-mail</span>
                  <input
                    type="checkbox"
                    defaultChecked={false}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Notificações push</span>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/30"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="bg-white text-black px-4 py-2 rounded-xl font-light hover:bg-white/90 transition-all duration-300 flex-1"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="bg-transparent border border-white/30 text-white px-4 py-2 rounded-xl font-light hover:bg-white/10 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
