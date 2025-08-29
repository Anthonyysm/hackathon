import React, { useState } from 'react';
import { Bell, Check, Trash2, X, MessageCircle, Heart, UserPlus, Calendar, BookOpen, UserCheck, UserMinus } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { friendService } from '../services/firebaseService'; // Import friendService
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useFriendship } from '../contexts/FriendshipContext'; // Import useFriendship

const Notifications = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const { user } = useAuth(); // Get authenticated user
  const { setFriendshipStatusChanged } = useFriendship(); // Get setter for friendship status
  const navigate = useNavigate(); // Initialize navigate
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return { icon: Heart, color: 'text-red-400' };
      case 'comment':
        return { icon: MessageCircle, color: 'text-blue-400' };
      case 'follow':
        return { icon: UserPlus, color: 'text-green-400' };
      case 'friend_request': // New case for friend requests
        return { icon: UserPlus, color: 'text-purple-400' };
      case 'session':
        return { icon: Calendar, color: 'text-yellow-400' };
      case 'mood':
        return { icon: Heart, color: 'text-pink-400' };
      case 'diary':
        return { icon: BookOpen, color: 'text-purple-400' };
      case 'welcome':
        return { icon: Bell, color: 'text-blue-400' };
      default:
        return { icon: Bell, color: 'text-gray-400' };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Agora mesmo';
    
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const handleAcceptFriendRequest = async (notificationId, senderId) => {
    if (!user?.uid) return;
    try {
      await friendService.acceptFriendRequest(notificationId, user.uid); // notificationId is the requestId
      await markAsRead(notificationId);
      setFriendshipStatusChanged(prev => !prev); // Trigger update in FriendsList
      navigate(`/profile/${senderId}`); // Navigate to sender's profile
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade pela notificação:', error);
      // Optionally show error toast
    }
  };

  const handleRejectFriendRequest = async (notificationId, senderId) => {
    if (!user?.uid) return;
    try {
      await friendService.rejectFriendRequest(notificationId, user.uid); // notificationId is the requestId
      await markAsRead(notificationId);
      setFriendshipStatusChanged(prev => !prev); // Trigger update in FriendsList
      navigate(`/profile/${senderId}`); // Navigate to sender's profile
    } catch (error) {
      console.error('Erro ao rejeitar solicitação de amizade pela notificação:', error);
      // Optionally show error toast
    }
  };

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    if (notification.type === 'friend_request' && notification.senderId) {
      navigate(`/profile/${notification.senderId}`);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-white/70">Carregando notificações...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Bell className="w-16 h-16 text-white/30 mb-4" />
        <h3 className="text-xl font-semibold text-white/70 mb-2">Nenhuma notificação</h3>
        <p className="text-white/50">Você está em dia com tudo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">
            Notificações
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Marcar todas como lidas</span>
            </button>
          )}
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar todas</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const { icon: Icon, color } = getNotificationIcon(notification.type);
          
          return (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                notification.read
                  ? 'bg-white/5 border-white/10 text-white/70'
                  : 'bg-blue-500/10 border-blue-500/30 text-white'
              }`}
              onClick={() => handleNotificationClick(notification)} // Make entire card clickable
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">{notification.title}</p>
                      <p className="text-sm opacity-80 mb-2">{notification.message}</p>
                      <span className="text-xs opacity-60">{formatTime(notification.createdAt)}</span>
                    </div>
                    
                    {notification.type === 'friend_request' && !notification.read && (
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleAcceptFriendRequest(notification.requestId, notification.senderId);
                          }}
                          className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                          title="Aceitar solicitação"
                        >
                          <UserCheck className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleRejectFriendRequest(notification.requestId, notification.senderId);
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                          title="Rejeitar solicitação"
                        >
                          <UserMinus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                    
                    {!notification.read && notification.type !== 'friend_request' && (
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Marcar como lida"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                          title="Deletar notificação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {notification.read && (
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400"
                          title="Deletar notificação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Limpar todas as notificações?
            </h3>
            <p className="text-white/70 mb-6">
              Esta ação não pode ser desfeita. Todas as notificações serão removidas permanentemente.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearAllNotifications();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Limpar todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;