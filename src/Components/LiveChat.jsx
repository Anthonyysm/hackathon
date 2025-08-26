import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Send, Paperclip, Search, Filter, MoreVertical, Clock, Check, CheckCheck, ArrowLeft } from 'lucide-react';

const LiveChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showChatList, setShowChatList] = useState(true);

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

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);
  const selectedPsychologist = psychologists.find(psych => psych.id === selectedChat);

  const handleSendMessage = () => {
    if (!message.trim() || (!selectedConversation && !selectedPsychologist)) return;
    
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

  const getCurrentChatData = () => {
    if (selectedConversation) return selectedConversation;
    if (selectedPsychologist) return selectedPsychologist;
    return null;
  };

  const currentChat = getCurrentChatData();

  return (
    <div className="space-y-6">
      {/* Chat Options */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Conversas em Tempo Real</h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowChatList(true)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                showChatList
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Conversas
            </button>
            <button
              onClick={() => setShowChatList(false)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                !showChatList
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              Psicólogos
            </button>
          </div>
        </div>

        {showChatList ? (
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Pesquisar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all">Todas</option>
                <option value="psychologist">Psicólogos</option>
                <option value="support">Apoio</option>
              </select>
            </div>

            {/* Conversations List */}
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Psychologist Chat */}
            <button
              onClick={() => setSelectedChat('psychologist')}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                selectedChat === 'psychologist'
                  ? 'bg-white/10 border-white/20'
                  : 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-700/30'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-white">Psicólogo Online</h3>
                  <p className="text-sm text-gray-400">Profissionais disponíveis</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 text-left">
                Converse com psicólogos licenciados para apoio profissional
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Psychologist List */}
      {selectedChat === 'psychologist' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Psicólogos Disponíveis</h3>
          <div className="space-y-4">
            {psychologists.map((psychologist) => (
              <div
                key={psychologist.id}
                className="bg-white/5 border border-gray-200/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                      {psychologist.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{psychologist.name}</h4>
                      <p className="text-sm text-gray-400">{psychologist.specialty}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-400">Online</span>
                        <span className="text-xs text-gray-400">• ⭐ {psychologist.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handlePsychologistChat(psychologist.id)}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {currentChat && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/5 p-4 border-b border-gray-200/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  {currentChat.avatar ? (
                    <img src={currentChat.avatar} alt="" className="w-full h-full rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{currentChat.name}</h3>
                  <p className="text-sm text-gray-400">
                    {currentChat.status === 'online' ? 'Online' : 'Offline'}
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
                      : 'bg-gray-700/50 text-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${msg.isOwn ? 'text-gray-700' : 'text-gray-400'}`}>
                      {msg.time}
                    </span>
                    {msg.isOwn && getMessageStatus(msg.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200/20">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;