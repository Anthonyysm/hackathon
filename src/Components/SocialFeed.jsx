import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, User, EyeOff } from 'lucide-react';

const SocialFeed = () => {
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const toggleExpanded = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const posts = [
    {
      id: 1,
      author: 'Maria Santos',
      isAnonymous: false,
      avatar: null,
      mood: { emoji: '😌', label: 'Calmo' },
      time: '2 horas atrás',
      content: 'Hoje consegui fazer minha primeira sessão de meditação completa. Ainda é difícil, mas sinto que estou progredindo aos poucos. Alguém mais está tentando meditar regularmente?',
      likes: 12,
      comments: 4,
      shares: 2,
      isLiked: false
    },
    {
      id: 2,
      author: 'Usuário Anônimo',
      isAnonymous: true,
      avatar: null,
      mood: { emoji: '😔', label: 'Triste' },
      time: '4 horas atrás',
      content: 'Tem dias que parece que nada faz sentido. Estou tentando lembrar que isso também passa, mas hoje está particularmente difícil. Obrigado por existirem.',
      likes: 28,
      comments: 15,
      shares: 3,
      isLiked: true
    },
    {
      id: 3,
      author: 'João Silva',
      isAnonymous: false,
      avatar: null,
      mood: { emoji: '😊', label: 'Feliz' },
      time: '6 horas atrás',
      content: 'Pequenas vitórias merecem ser celebradas! Hoje consegui sair de casa sem ansiedade. Para quem está lutando: vocês são mais fortes do que imaginam! 💪',
      likes: 45,
      comments: 8,
      shares: 12,
      isLiked: true
    }
  ];

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                {post.isAnonymous ? (
                  <EyeOff className="w-6 h-6 text-gray-300" />
                ) : (
                  <User className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {post.isAnonymous ? 'Usuário Anônimo' : post.author}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{post.time}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <span>{post.mood.emoji}</span>
                    <span>{post.mood.label}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-full transition-all duration-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-200 leading-relaxed">{post.content}</p>
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
            <div className="flex items-center space-x-6">
              <button
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  post.isLiked
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes}</span>
              </button>
              
              <button
                onClick={() => toggleExpanded(post.id)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Share className="w-5 h-5" />
                <span className="text-sm">{post.shares}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedPosts.has(post.id) && (
            <div className="mt-6 pt-4 border-t border-gray-700/30 space-y-4 animate-in slide-in-from-top duration-300">
              <div className="space-y-3">
                {/* Sample Comments */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-sm text-gray-200">Você não está sozinho! Continue firme, um dia de cada vez. 🤗</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                      <span>Ana Costa</span>
                      <span>•</span>
                      <span>1h atrás</span>
                      <button className="hover:text-white">❤️</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comment Input */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Escreva um comentário de apoio..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default SocialFeed;