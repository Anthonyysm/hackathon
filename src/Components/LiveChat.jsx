import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Send, Paperclip, Search, Filter, MoreVertical, Clock, Check, CheckCheck, ArrowLeft, Users, Hash } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';

const LiveChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('conversas'); // 'conversas', 'psicologos', 'grupos'
  const [selectedGroup, setSelectedGroup] = useState(null);

  const psychologists = [
    {
      id: 1,
      name: 'Dra. Ana Silva',
      specialty: 'Psicóloga Clínica',
      status: 'online',
      avatar: '👩‍⚕️',
      rating: 4.9,
      messages: [
        {
          id: 1,
          sender: 'Dra. Ana Silva',
          message: 'Olá! Sou a Dra. Ana Silva, psicóloga clínica. Como posso ajudá-lo hoje?',
          time: 'Agora',
          isOwn: false,
          status: 'delivered'
        }
      ]
    },
    {
      id: 2,
      name: 'Dr. Carlos Santos',
      specialty: 'Psicólogo',
      status: 'online',
      avatar: '👨‍⚕️',
      rating: 4.8,
      messages: [
        {
          id: 1,
          sender: 'Dr. Carlos Santos',
          message: 'Oi! Sou o Dr. Carlos Santos. Estou aqui para conversar e ajudar. Como você está se sentindo?',
          time: 'Agora',
          isOwn: false,
          status: 'delivered'
        }
      ]
    }
  ];

  const groups = [
    {
      id: 1,
      name: 'Ansiedade & Bem-estar',
      description: 'Grupo de apoio para pessoas que lidam com ansiedade',
      memberCount: 156,
      onlineCount: 23,
      lastActivity: '2 min atrás',
      avatar: '🧘‍♀️',
      category: 'saude-mental',
      messages: [
        {
          id: 1,
          sender: 'Maria Silva',
          message: 'Alguém mais está se sentindo ansioso hoje?',
          time: '2 min atrás',
          isOwn: false,
          avatar: null
        },
        {
          id: 2,
          sender: 'João Santos',
          message: 'Sim, estou aqui para conversar se precisar!',
          time: '1 min atrás',
          isOwn: false,
          avatar: null
        }
      ]
    },
    {
      id: 2,
      name: 'Depressão - Juntos Somos Mais Fortes',
      description: 'Espaço seguro para compartilhar experiências e receber apoio',
      memberCount: 89,
      onlineCount: 12,
      lastActivity: '5 min atrás',
      avatar: '💙',
      category: 'saude-mental',
      messages: [
        {
          id: 1,
          sender: 'Ana Costa',
          message: 'Obrigada a todos pelo apoio ontem!',
          time: '5 min atrás',
          isOwn: false,
          avatar: null
        }
      ]
    },
    {
      id: 3,
      name: 'Mindfulness & Meditação',
      description: 'Técnicas e práticas para uma vida mais consciente',
      memberCount: 234,
      onlineCount: 45,
      lastActivity: 'Agora',
      avatar: '🧘‍♂️',
      category: 'bem-estar',
      messages: [
        {
          id: 1,
          sender: 'Pedro Lima',
          message: 'Alguém quer fazer uma sessão de meditação guiada?',
          time: 'Agora',
          isOwn: false,
          avatar: null
        }
      ]
    },
    {
      id: 4,
      name: 'Pais & Cuidadores',
      description: 'Apoio para pais e cuidadores de pessoas com necessidades especiais',
      memberCount: 67,
      onlineCount: 8,
      lastActivity: '10 min atrás',
      avatar: '👨‍👩‍👧‍👦',
      category: 'familia',
      messages: [
        {
          id: 1,
          sender: 'Carla Mendes',
          message: 'Dicas para lidar com o estresse dos cuidados?',
          time: '10 min atrás',
          isOwn: false,
          avatar: null
        }
      ]
    }
  ];

  const conversations = [
    {
      id: 1,
      name: 'Gabrielly Silva',
      lastMessage: 'Olá, não se preocupe com as faltas. Preocupe-se com as pessoas que estão com você quando você não se atreve.',
      time: '14:30',
      unread: 2,
      status: 'online',
      avatar: null,
      type: 'support',
      messages: [
        {
          id: 1,
          sender: 'Gabrielly',
          message: 'Olá, não se preocupe com as faltas. Preocupe-se com as pessoas que estão com você quando você não se atreve.',
          time: '14:30',
          isOwn: false,
          status: 'delivered'
        },
        {
          id: 2,
          sender: 'Você',
          message: 'Existe algo que você gostaria de fazer mas não se atreve?',
          time: '14:32',
          isOwn: true,
          status: 'read'
        },
        {
          id: 3,
          sender: 'Gabrielly',
          message: 'Sim, tenho medo de falar em público. Mas estou trabalhando nisso!',
          time: '14:35',
          isOwn: false,
          status: 'delivered'
        }
      ]
    },
    {
      id: 2,
      name: 'Dra. Ana Silva',
      lastMessage: 'Como você está se sentindo hoje?',
      time: '12:45',
      unread: 0,
      status: 'online',
      avatar: null,
      type: 'psychologist',
      messages: [
        {
          id: 1,
          sender: 'Dra. Ana Silva',
          message: 'Olá! Como você está se sentindo hoje?',
          time: '12:30',
          isOwn: false,
          status: 'delivered'
        },
        {
          id: 2,
          sender: 'Você',
          message: 'Oi Dra. Ana, estou me sentindo um pouco ansioso hoje.',
          time: '12:35',
          isOwn: true,
          status: 'read'
        },
        {
          id: 3,
          sender: 'Dra. Ana Silva',
          message: 'Entendo. Pode me contar mais sobre essa ansiedade?',
          time: '12:40',
          isOwn: false,
          status: 'delivered'
        },
        {
          id: 4,
          sender: 'Você',
          message: 'Como você está se sentindo hoje?',
          time: '12:45',
          isOwn: true,
          status: 'read'
        }
      ]
    },
    {
      id: 3,
      name: 'João Mendes',
      lastMessage: 'Obrigado pelo apoio ontem!',
      time: 'Ontem',
      unread: 0,
      status: 'offline',
      avatar: null,
      type: 'support',
      messages: [
        {
          id: 1,
          sender: 'João',
          message: 'Oi! Preciso de uma conversa.',
          time: 'Ontem 15:00',
          isOwn: false,
          status: 'delivered'
        },
        {
          id: 2,
          sender: 'Você',
          message: 'Claro! Estou aqui para conversar. O que está acontecendo?',
          time: 'Ontem 15:05',
          isOwn: true,
          status: 'read'
        },
        {
          id: 3,
          sender: 'João',
          message: 'Obrigado pelo apoio ontem!',
          time: 'Ontem 15:10',
          isOwn: false,
          status: 'delivered'
        }
      ]
    }
  ];

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
    if (!message.trim() || (!selectedConversation && !selectedPsychologist && !selectedGroup)) return;
    
    // TODO: Implement message sending to Firebase
    console.log('Enviando mensagem:', message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePsychologistChat = (psychologistId) => {
    setSelectedChat(psychologistId);
  };

  const handleGroupChat = (group) => {
    setSelectedGroup(group);
    setSelectedChat(null);
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
    <div className="space-y-6">
      {/* Chat Options */}
      <Card variant="glass" padding="lg">
        <Card.Header>
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Conversas em Tempo Real</h2>
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
              {filteredConversations.map((conversation) => (
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
              ))}
            </div>
          )}

          {activeTab === 'psicologos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {psychologists.map((psychologist) => (
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
              ))}
            </div>
          )}

          {activeTab === 'grupos' && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredGroups.map((group) => (
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
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Chat Interface */}
      {currentChat && (
        <Card variant="glass" className="overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/5 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedChat(null);
                    setSelectedGroup(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors focus-ring"
                  aria-label="Voltar para lista"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  {currentChat.avatar ? (
                    <img src={currentChat.avatar} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{currentChat.name}</h3>
                  <p className="text-sm text-white/70">
                    {selectedGroup ? (
                      `${currentChat.memberCount} membros • ${currentChat.onlineCount} online`
                    ) : (
                      currentChat.status === 'online' ? 'Online' : 'Offline'
                    )}
                    {currentChat.type === 'psychologist' && ' • Profissional'}
                    {selectedPsychologist && ' • Psicólogo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {currentChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    msg.isOwn
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {!msg.isOwn && selectedGroup && (
                    <div className="text-xs text-white/70 mb-1 font-medium">
                      {msg.sender}
                    </div>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${msg.isOwn ? 'text-gray-700' : 'text-white/50'}`}>
                      {msg.time}
                    </span>
                    {msg.isOwn && !selectedGroup && getMessageStatus(msg.status)}
                  </div>
                </div>
              </div>
            ))}
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
                  selectedGroup 
                    ? "Digite sua mensagem para o grupo..." 
                    : "Digite sua mensagem..."
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
    </div>
  );
};

export default LiveChat;
