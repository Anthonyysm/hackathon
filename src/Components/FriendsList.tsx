import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X, Check, Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { friendService, userService } from '../services/firebaseService';
import NotificationToast from './NotificationToast';
import { Friend, FriendRequest, UserProfile } from '../types';

const FriendsList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests' or 'find'
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });

  // Função utilitária para formatar o status "último visto"
  const formatLastSeen = (lastSeen: Date | undefined | null) => {
    if (!lastSeen) return 'Offline';

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Online agora';
    if (diffInSeconds < 3600) return `Online há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Online há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `Visto há ${Math.floor(diffInSeconds / 86400)} dias`; // Aproximadamente 30 dias
    return `Visto em ${lastSeenDate.toLocaleDateString()}`;
  };

  const fetchFriendData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const [requests, userFriends] = await Promise.all([
        friendService.getPendingFriendRequests(user.uid),
        friendService.getFriends(user.uid)
      ]);
      setPendingRequests(requests);
      setFriends(userFriends);
    } catch (err: any) {
      console.error("Erro ao buscar dados de amigos:", err);
      setError(err.message || "Erro ao carregar dados de amizade.");
      showToast(err.message || "Erro ao carregar dados de amizade.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendData();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 5000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      if (user) {
        await friendService.acceptFriendRequest(requestId, user.uid);
        showToast("Solicitação de amizade aceita!", 'success');
        fetchFriendData(); // Recarregar dados
      }
    } catch (err: any) {
      console.error("Erro ao aceitar solicitação:", err);
      showToast(err.message || "Erro ao aceitar solicitação.", 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      if (user) {
        await friendService.rejectFriendRequest(requestId, user.uid);
        showToast("Solicitação de amizade rejeitada.", 'info');
        fetchFriendData(); // Recarregar dados
      }
    } catch (err: any) {
      console.error("Erro ao rejeitar solicitação:", err);
      showToast(err.message || "Erro ao rejeitar solicitação.", 'error');
    }
  };

  const handleSearchUsers = async () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const results = await friendService.searchUsers(searchTerm, user?.uid);
      setSearchResults(results);
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);
      showToast(err.message || "Erro ao buscar usuários.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (recipientId: string) => {
    if (!user) {
      showToast("Você precisa estar logado para enviar solicitações.", 'error');
      return;
    }
    try {
      await friendService.sendFriendRequest(user.uid, user.displayName || 'Usuário Sereno', user.photoURL || null, recipientId);
      showToast("Solicitação de amizade enviada!", 'success');
      // Optionally update UI without refetching all requests
    } catch (err: any) {
      console.error("Erro ao enviar solicitação:", err);
      showToast(err.message || "Erro ao enviar solicitação.", 'error');
    }
  };

  const isAlreadyFriend = (targetUid: string) => {
    return friends.some(friend => friend.uid === targetUid);
  };

  const hasPendingRequestTo = (targetUid: string) => {
    return pendingRequests.some(req => (req.recipientId === targetUid || (req.senderId === user?.uid && req.recipientId === targetUid)) && req.status === 'pending');
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-lg border border-gray-700/50 animation-initial animate-fade-in animation-delay-100">
      <NotificationToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Rede de Amigos</h2>

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform ${activeTab === 'friends' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg text-white scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          Meus Amigos
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform ${activeTab === 'requests' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg text-white scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          Solicitações {pendingRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{pendingRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`px-6 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform ${activeTab === 'find' ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg text-white scale-105' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
        >
          Encontrar Amigos
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-400">Carregando...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}

      {!loading && !error && activeTab === 'friends' && (
        <div className="animation-initial animate-fade-in-up">
          {friends.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Você ainda não tem amigos. Que tal encontrar alguns?</p>
              <button
                onClick={() => setActiveTab('find')}
                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors duration-300"
              >
                Encontrar Amigos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map(friend => (
                <div key={friend.uid} className="bg-gray-800 p-5 rounded-xl shadow-md flex items-center space-x-4 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
                  <div className="relative">
                    {friend.photoURL ? (
                      <img src={friend.photoURL} alt={friend.displayName} className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black text-xl font-bold border-2 border-purple-500 group-hover:scale-105 transition-transform">
                        {friend.displayName[0].toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-300 group-hover:text-purple-200 transition-colors">{friend.displayName}</h3>
                    <p className="text-sm text-gray-400">{formatLastSeen(friend.lastSeen)}</p>
                  </div>
                  <button className="p-2 bg-purple-700 hover:bg-purple-800 rounded-full transition-colors">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'requests' && (
        <div className="animation-initial animate-fade-in-up">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl">
              <UserPlus className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Você não tem solicitações de amizade pendentes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="bg-gray-800 p-4 rounded-xl shadow-md flex items-center justify-between border border-gray-700 hover:border-pink-500 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    {request.senderPhotoURL ? (
                      <img src={request.senderPhotoURL} alt={request.senderName} className="w-12 h-12 rounded-full object-cover border-2 border-pink-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-pink-700 flex items-center justify-center text-white text-lg font-bold border-2 border-pink-500">
                        {request.senderName[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-pink-300">{request.senderName}</p>
                      <p className="text-sm text-gray-400">Enviou uma solicitação de amizade</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition-colors flex items-center justify-center shadow-lg transform hover:scale-105"
                      title="Aceitar"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors flex items-center justify-center shadow-lg transform hover:scale-105"
                      title="Rejeitar"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'find' && (
        <div className="animation-initial animate-fade-in-up">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar usuários por nome..."
                className="w-full px-5 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
              />
              <button
                onClick={handleSearchUsers}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                title="Buscar"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
            {searchTerm && searchResults.length === 0 && (
              <p className="mt-3 text-gray-400 text-center">Nenhum usuário encontrado com o nome "{searchTerm}".</p>
            )}
          </div>

          <div className="space-y-4">
            {searchResults.map(result => (
              <div key={result.uid} className="bg-gray-800 p-4 rounded-xl shadow-md flex items-center justify-between border border-gray-700 hover:border-purple-500 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  {result.photoURL ? (
                    <img src={result.photoURL} alt={result.displayName} className="w-12 h-12 rounded-full object-cover border-2 border-purple-500" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white text-lg font-bold border-2 border-purple-500">
                      {result.displayName[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-purple-300">{result.displayName}</p>
                    <p className="text-sm text-gray-400">@{result.username}</p>
                  </div>
                </div>
                {!isAlreadyFriend(result.uid) && !hasPendingRequestTo(result.uid) && (
                  <button
                    onClick={() => handleSendFriendRequest(result.uid)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center space-x-2 transition-colors duration-300 shadow-lg transform hover:scale-105"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                )}
                {isAlreadyFriend(result.uid) && (
                  <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Amigo</span>
                  </span>
                )}
                {hasPendingRequestTo(result.uid) && !isAlreadyFriend(result.uid) && (
                  <span className="px-4 py-2 bg-yellow-600 text-white rounded-full text-sm flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Pendente</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
