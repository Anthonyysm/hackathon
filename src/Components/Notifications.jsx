import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  Settings
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ uid: 'current-user', displayName: 'Usuário Atual' });
  const [filter, setFilter] = useState('all'); // all, unread, likes, comments, follows
  const [showSettings, setShowSettings] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'like',
      title: 'Curtida no seu post',
      message: 'Maria Silva curtiu seu post sobre ansiedade e bem-estar',
      avatar: null,
      userName: 'Maria Silva',
      userId: 'user123',
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
      read: false,
      postId: 'post123',
      icon: Heart,
      iconColor: 'text-red-400'
    },
    {
      id: 2,
      type: 'comment',
      title: 'Novo comentário',
      message: 'Carlos Santos comentou em seu post: "Muito inspirador! Obrigado por compartilhar."',
      avatar: null,
      userName: 'Carlos Santos',
      userId: 'user456',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h atrás
      read: false,
      postId: 'post123',
      icon: MessageCircle,
      iconColor: 'text-blue-400'
    },
    {
      id: 3,
      type: 'follow',
      title: 'Novo seguidor',
      message: 'Ana Costa começou a te seguir',
      avatar: null,
      userName: 'Ana Costa',
      userId: 'user789',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      read: true,
      icon: UserPlus,
      iconColor: 'text-green-400'
    },
    {
      id: 4,
      type: 'group',
      title: 'Atividade no grupo',
      message: 'Novo post no grupo "Ansiedade e Bem-estar" que você participa',
      avatar: null,
      userName: 'Dr. João Silva',
      userId: 'user101',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
      read: true,
      groupId: 'group123',
      groupName: 'Ansiedade e Bem-estar',
      icon: Bell,
      iconColor: 'text-purple-400'
    },
    {
      id: 5,
      type: 'session',
      title: 'Lembrete de sessão',
      message: 'Sua sessão de terapia está agendada para hoje às 15:00',
      avatar: null,
      userName: 'Dra. Laura Santos',
      userId: 'therapist123',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
      read: false,
      sessionId: 'session123',
      icon: Bell,
      iconColor: 'text-orange-400'
    },
    {
      id: 6,
      type: 'mood',
      title: 'Registro de humor',
      message: 'Não se esqueça de registrar como você está se sentindo hoje',
      avatar: null,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
      read: true,
      icon: Heart,
      iconColor: 'text-pink-400'
    }
  ];

  useEffect(() => {
    // Simular carregamento de notificações
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'likes':
        return notif.type === 'like';
      case 'comments':
        return notif.type === 'comment';
      case 'follows':
        return notif.type === 'follow';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-white/70">Carregando notificações...</span>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Notificações</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-4">
          {[
            { id: 'all', name: 'Todas', icon: Bell },
            { id: 'unread', name: 'Não Lidas', icon: Eye },
            { id: 'likes', name: 'Curtidas', icon: Heart },
            { id: 'comments', name: 'Comentários', icon: MessageCircle },
            { id: 'follows', name: 'Seguidores', icon: UserPlus }
          ].map((filterOption) => {
            const IconComponent = filterOption.icon;
            return (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  filter === filterOption.id
                    ? 'bg-white text-black'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{filterOption.name}</span>
              </button>
            );
          })}
        </div>

                    {/* Actions */}
        <div className="flex justify-end gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Marcar Todas</span>
            </button>
          )}
          
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

              {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const IconComponent = notification.icon;
            
            return (
              <div
                key={notification.id}
                className={`bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:bg-white/15 transition-all duration-200 ${
                  !notification.read ? 'border-blue-500/30' : ''
                }`}
              >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 ${notification.iconColor}`}>
                      <IconComponent className="w-5 h-5" />
                  </div>
                  
                    {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <h3 className="text-white font-medium text-sm">
                            {notification.title}
                          </h3>
                          <p className="text-white/70 text-sm mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-3 mt-3 text-xs text-white/50">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            {notification.userName && (
                              <span>• {notification.userName}</span>
                            )}
                            {notification.groupName && (
                              <span>• {notification.groupName}</span>
                            )}
                          </div>
                      </div>
                      
                        {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Marcar como lida"
                          >
                              <Eye className="w-4 h-4 text-white/50 hover:text-white/70" />
                          </button>
                        )}
                        
                        <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Deletar notificação"
                          >
                            <Trash2 className="w-4 h-4 text-white/50 hover:text-red-400" />
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 shadow-2xl text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-medium text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-white/70 mb-6">
                {filter === 'all' 
                  ? 'Você não tem notificações no momento'
                  : `Nenhuma notificação encontrada para o filtro "${filter}"`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ver Todas as Notificações
                </button>
              )}
          </div>
        )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-6">Configurações de Notificação</h3>
              
              <div className="space-y-4">
              {[
                { key: 'likes', label: 'Curtidas em posts', description: 'Notificar quando alguém curtir seus posts' },
                { key: 'comments', label: 'Comentários', description: 'Notificar sobre novos comentários' },
                { key: 'follows', label: 'Novos seguidores', description: 'Notificar quando alguém te seguir' },
                { key: 'groups', label: 'Atividade em grupos', description: 'Notificar sobre atividades nos grupos' },
                { key: 'sessions', label: 'Lembretes de sessão', description: 'Lembrar sobre sessões agendadas' },
                { key: 'mood', label: 'Lembretes de humor', description: 'Lembrar de registrar humor diário' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{setting.label}</h4>
                    <p className="text-white/60 text-sm">{setting.description}</p>
                </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

export default Notifications;