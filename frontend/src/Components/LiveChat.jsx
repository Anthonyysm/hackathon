import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, User, Send, Paperclip, Search, Filter, Clock, Check, CheckCheck, ArrowLeft, Users, Plus, X } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [partnerId, setPartnerId] = useState('');
  const wsRef = useRef(null);
  const [wsMessages, setWsMessages] = useState([]);
  const { user } = useAuth();
  const [roomFromPath, setRoomFromPath] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('conversas'); // 'conversas', 'psicologos', 'grupos'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    category: 'saude-mental',
    isPrivate: false,
    maxMembers: 100
  });

  // Arrays vazios para dados reais
  const psychologists = [];
  const groups = [];
  const conversations = [];

  // Build stable room name from two IDs
  const getRoomName = useCallback(() => {
    if (roomFromPath) return roomFromPath; // usa /chat/<sala>
    const me = user?.uid;
    if (!me || !partnerId) return null;
    const [a, b] = [me, partnerId].sort();
    return `${a}_${b}`;
  }, [roomFromPath, user?.uid, partnerId]);

  // Detecta /chat/<sala> na URL e usa como room
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = window.location.pathname.match(/\/chat\/([A-Za-z0-9_\-]+)\/?$/);
    if (match && match[1]) {
      setRoomFromPath(match[1]);
      setWsMessages([]);
    } else {
      setRoomFromPath(null);
    }
  }, [location.pathname]);

  // Connect websocket whenever room changes and panel is open
  useEffect(() => {
    const room = getRoomName();
    if (!room) return;
    const wsBase = typeof window !== 'undefined' ? window.location.origin.replace(/^http/, 'ws') : 'ws://localhost:8000';
    const url = `${wsBase}/ws/chat/${room}/`;

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.message) {
          setWsMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              message: data.message,
              isOwn: false,
              time: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } catch (_) {}
    };
    socket.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      try {
        socket.close();
      } catch (_) {}
    };
  }, [getRoomName, isOpen]);

  // Close panel with ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-white/40" />;
      case 'delivered':
        return <Check className="w-3 h-3 text-white/60" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  // If a room code exists in URL, render the dedicated chat screen
  if (roomFromPath) {
    return (
      <div className="min-h-screen bg-black py-8 animation-initial animate-fade-in-up animation-delay-100">
        <Card variant="glass" className="overflow-hidden max-w-3xl mx-auto">
          {/* Chat Header */}
          <div className="bg-white/5 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Sala: {roomFromPath}</h3>
                </div>
              </div>
              <button onClick={() => navigate('/live-chat')} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg" aria-label="Sair do chat">Sair</button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {wsMessages.length > 0 ? (
              wsMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.isOwn ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${msg.isOwn ? 'text-gray-700' : 'text-white/50'}`}>{msg.time}</span>
                      {msg.isOwn && getMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Nenhuma mensagem ainda</p>
                <p className="text-sm text-white/30">Envie a primeira mensagem</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus-ring">
                <Paperclip className="w-5 h-5" />
              </button>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={"Digite sua mensagem..."}
                variant="glass"
                size="sm"
                className="flex-1"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || conv.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || group.category === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const selectedPsychologist = psychologists.find(psych => psych.id === selectedChat);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message }));
      setWsMessages(prev => [...prev, { id: Date.now(), message, isOwn: true, time: new Date().toLocaleTimeString(), status: 'sent' }]);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePsychologistChat = (psychologistId) => {
    setSelectedChat(psychologistId);
    setPartnerId(psychologistId);
  };

  const handleGroupChat = (group) => {
    setSelectedGroup(group);
    setSelectedChat(null);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
    setNewGroupData({
      name: '',
      description: '',
      category: 'saude-mental',
      isPrivate: false,
      maxMembers: 100
    });
  };

  const handleCloseCreateGroupModal = () => {
    setShowCreateGroupModal(false);
  };

  const handleSaveGroup = () => {
    if (!newGroupData.name.trim() || !newGroupData.description.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.warn('Criação de grupos desativada neste build.');
    handleCloseCreateGroupModal();
  };

  const getCurrentChatData = () => {
    if (selectedConversation) return selectedConversation;
    if (selectedPsychologist) return selectedPsychologist;
    if (selectedGroup) return selectedGroup;
    return null;
  };

  const currentChat = getCurrentChatData();

  const renderTabButton = (tabKey, label, Icon) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        activeTab === tabKey
          ? 'bg-white/20 text-white'
          : 'bg-white/10 text-white/70 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black py-8 animation-initial animate-fade-in-up animation-delay-100">
      <div className="flex justify-end max-w-7xl mx-auto px-4">
        <button onClick={() => setIsOpen(v => !v)} className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white">
          {isOpen ? 'Fechar' : 'Abrir'} Conversas
        </button>
      </div>
      {/* Chat Options */}
      {isOpen && (
      <Card variant="glass" padding="lg">
        <Card.Header>
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Conversas em Tempo Real</h2>
            <button onClick={() => setIsOpen(false)} className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Fechar conversas">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Entrar em sala via código -> redireciona para /chat/<codigo> */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Digite o código da sala (ex: sala1208)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              variant="glass"
              size="sm"
              className="flex-1"
            />
            <button
              onClick={() => {
                if (!roomCode.trim()) return;
                navigate(`/chat/${roomCode.trim()}`);
              }}
              disabled={!roomCode.trim()}
              className="px-3 py-2 bg-white text-black rounded-lg disabled:opacity-50"
            >
              Entrar
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {renderTabButton('conversas', 'Conversas', MessageCircle)}
              {renderTabButton('psicologos', 'Psicólogos', User)}
              {renderTabButton('grupos', 'Grupos', Users)}
            </div>
          </div>
        </Card.Header>

        <Card.Content>
          {/* Search and Filter */}
          <div className="flex space-x-3 mb-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={
                  activeTab === 'conversas' ? "Pesquisar conversas..." :
                  activeTab === 'psicologos' ? "Pesquisar psicólogos..." :
                  "Pesquisar grupos..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="glass"
                size="sm"
                leftIcon={Search}
                onLeftIconClick={() => {}}
                className="w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all">Todas</option>
              {activeTab === 'conversas' && (
                <>
                  <option value="psychologist">Psicólogos</option>
                  <option value="support">Apoio</option>
                </>
              )}
              {activeTab === 'grupos' && (
                <>
                  <option value="saude-mental">Saúde Mental</option>
                  <option value="bem-estar">Bem-estar</option>
                  <option value="familia">Família</option>
                </>
              )}
            </select>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'conversas' && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/70 mb-2">Nenhuma conversa</h3>
                  <p className="text-white/50">Comece uma conversa com psicólogos ou outros usuários</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                      selectedChat === conversation.id
                        ? 'bg-white/20 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                          {conversation.avatar ? (
                            <img src={conversation.avatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <User className="w-6 h-6 text-white/70" />
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                          conversation.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white truncate">{conversation.name}</h3>
                          <span className="text-xs text-white/50">{conversation.time}</span>
                        </div>
                        <p className="text-sm text-white/70 truncate">{conversation.lastMessage}</p>
                        {conversation.unread > 0 && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-blue-400">{conversation.type === 'psychologist' ? 'Profissional' : 'Apoio'}</span>
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'psicologos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {psychologists.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/70 mb-2">Nenhum psicólogo disponível</h3>
                  <p className="text-white/50">Em breve teremos profissionais disponíveis para atendimento</p>
                </div>
              ) : (
                psychologists.map((psychologist) => (
                  <button
                    key={psychologist.id}
                    onClick={() => handlePsychologistChat(psychologist.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      selectedChat === psychologist.id
                        ? 'bg-white/20 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                        {psychologist.avatar}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-white">{psychologist.name}</h3>
                        <p className="text-sm text-gray-400">{psychologist.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">Online</span>
                      <span className="text-xs text-gray-400">• ⭐ {psychologist.rating}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'grupos' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Create Group Button */}
              <button
                onClick={handleCreateGroup}
                className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-200 text-center group"
              >
                <div className="flex items-center justify-center space-x-2 text-white/70 group-hover:text-white">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Crie Seu Grupo</span>
                </div>
                <p className="text-sm text-white/50 mt-1">Comece uma nova comunidade de apoio</p>
              </button>

              {groups.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/70 mb-2">Nenhum grupo criado</h3>
                  <p className="text-white/50">Seja o primeiro a criar um grupo de apoio</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupChat(group)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                      selectedGroup?.id === group.id
                        ? 'bg-white/20 border-white/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
                        {group.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-white truncate">{group.name}</h3>
                          <span className="text-xs text-white/50">{group.lastActivity}</span>
                        </div>
                        <p className="text-sm text-white/70 mb-2">{group.description}</p>
                        <div className="flex items-center justify-between text-xs text-white/50">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{group.memberCount} membros</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>{group.onlineCount} online</span>
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                            {group.category === 'saude-mental' ? 'Saúde Mental' :
                             group.category === 'bem-estar' ? 'Bem-estar' : 'Família'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </Card.Content>
      </Card>
      )}

      {/* Chat Interface */}
      {isOpen && partnerId && (
        <Card variant="glass" className="overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/5 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedChat(null);
                    setSelectedGroup(null);
                    setPartnerId('');
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors focus-ring"
                  aria-label="Voltar para lista"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Conversa</h3>
                  <p className="text-sm text白/70">Direta: {partnerId}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors" aria-label="Fechar chat">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {wsMessages.length > 0 ? (
              wsMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.isOwn ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${msg.isOwn ? 'text-gray-700' : 'text-white/50'}`}>{msg.time}</span>
                      {msg.isOwn && getMessageStatus(msg.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/50">Nenhuma mensagem ainda</p>
                <p className="text-sm text-white/30">Comece a conversa!</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus-ring">
                <Paperclip className="w-5 h-5" />
              </button>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  "Digite sua mensagem..."
                }
                variant="glass"
                size="sm"
                className="flex-1"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="glass" padding="lg" className="w-full max-w-md">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Criar Novo Grupo</h3>
                <button
                  onClick={handleCloseCreateGroupModal}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Nome do Grupo *
                  </label>
                  <Input
                    value={newGroupData.name}
                    onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                    placeholder="Ex: Ansiedade & Bem-estar"
                    variant="glass"
                    size="sm"
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={newGroupData.description}
                    onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                    placeholder="Descreva o propósito do grupo"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Categoria
                  </label>
                  <select
                    value={newGroupData.category}
                    onChange={(e) => setNewGroupData({ ...newGroupData, category: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="saude-mental">Saúde Mental</option>
                    <option value="bem-estar">Bem-estar</option>
                    <option value="familia">Família</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Número Máximo de Membros
                  </label>
                  <input
                    type="number"
                    value={newGroupData.maxMembers}
                    onChange={(e) => setNewGroupData({ ...newGroupData, maxMembers: parseInt(e.target.value) || 100 })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="100"
                    min="1"
                    max="1000"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newGroupData.isPrivate}
                    onChange={(e) => setNewGroupData({ ...newGroupData, isPrivate: e.target.checked })}
                    className="w-4 h-4 text-blue-400 focus:ring-blue-400 border-white/20 rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-white/70">
                    Grupo Privado (apenas membros convidados podem entrar)
                  </label>
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseCreateGroupModal}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={!newGroupData.name.trim() || !newGroupData.description.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Grupo
                </button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LiveChat;
