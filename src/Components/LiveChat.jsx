import React, { useState } from 'react';
import { MessageCircle, Video, Phone, User, Send, Paperclip } from 'lucide-react';

const LiveChat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  const psychologists = [
    {
      id: 1,
      name: 'Dra. Ana Silva',
      specialty: 'Psicóloga Clínica',
      status: 'online',
      avatar: '👩‍⚕️',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Dr. Carlos Santos',
      specialty: 'Psicólogo',
      status: 'online',
      avatar: '👨‍⚕️',
      rating: 4.8
    }
  ];

  const supportMessages = [
    {
      id: 1,
      sender: 'Gabrielly',
      message: 'Olá, não se preocupe com as faltas. Preocupe-se com as pessoas que estão com você quando você não se atreve.',
      time: '14:30',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Você',
      message: 'Existe algo que você gostaria de fazer mas não se atreve?',
      time: '14:32',
      isOwn: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Chat Options */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Conversas em Tempo Real</h2>
        </div>

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

          {/* Peer Support */}
          <button
            onClick={() => setSelectedChat('support')}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              selectedChat === 'support'
                ? 'bg-white/10 border-white/20'
                : 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-700/30'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Apoio da Comunidade</h3>
                <p className="text-sm text-gray-400">Pessoas como você</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 text-left">
              Conecte-se com outras pessoas que entendem sua jornada
            </p>
          </button>
        </div>
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
                    <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Chat */}
      {selectedChat === 'support' && (
        <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-white/5 p-4 border-b border-gray-200/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Apoio da Comunidade</h3>
                <p className="text-sm text-gray-400">Gabrielly está online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {supportMessages.map((msg) => (
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
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-gray-700' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
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
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
              />
              <button className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-200">
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