import React from 'react';
import { Users, TrendingUp, Sparkles, Plus, Check } from 'lucide-react';

const SuggestedGroups = () => {
  // Mock data para desenvolvimento
  const communities = [
    {
      id: 1,
      name: "Ansiedade e Bem-estar",
      icon: "🧘",
      memberCount: 1250,
      description: "Compartilhe experiências e dicas para lidar com ansiedade"
    },
    {
      id: 2,
      name: "Depressão - Apoio",
      icon: "🌱",
      memberCount: 980,
      description: "Um espaço seguro para falar sobre depressão"
    },
    {
      id: 3,
      name: "Meditação Diária",
      icon: "🕯️",
      memberCount: 750,
      description: "Pratique meditação em grupo"
    },
    {
      id: 4,
      name: "Relacionamentos",
      icon: "💝",
      memberCount: 650,
      description: "Discussões sobre relacionamentos saudáveis"
    },
    {
      id: 5,
      name: "Autoestima",
      icon: "⭐",
      memberCount: 820,
      description: "Construindo confiança e amor próprio"
    }
  ];

  const [userCommunities, setUserCommunities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const joinCommunity = (communityId) => {
    setUserCommunities(prev => [...prev, communityId]);
  };

  const leaveCommunity = (communityId) => {
    setUserCommunities(prev => prev.filter(id => id !== communityId));
  };

  const getPopularCommunities = (limit) => {
    return [...communities]
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, limit);
  };

  const popularCommunities = getPopularCommunities(5);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-white/70">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">
          Comunidades Sugeridas
        </h2>
        <p className="text-white/70 text-sm">
          Descubra grupos que podem te interessar
        </p>
      </div>

      {/* Popular Communities */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-medium text-white">Em Alta</h3>
        </div>
        
        <div className="space-y-4">
          {popularCommunities.slice(0, 3).map((community) => {
            const isMember = userCommunities.includes(community.id);
            
            return (
              <div key={community.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {community.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">
                      {community.name}
                    </h4>
                    <p className="text-white/60 text-xs">
                      {community.memberCount.toLocaleString()} membros
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => isMember ? leaveCommunity(community.id) : joinCommunity(community.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isMember 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-white hover:bg-white/90'
                  }`}
                  title={isMember ? 'Sair da comunidade' : 'Entrar na comunidade'}
                >
                  {isMember ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-black" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Communities */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-medium text-white">Novidades</h3>
        </div>
        
        <div className="space-y-4">
          {communities
            .filter(community => !userCommunities.includes(community.id))
            .slice(0, 2)
            .map((community) => (
              <div key={community.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    {community.icon}
                  </div>
                  <h4 className="font-medium text-white text-sm">
                    {community.name}
                  </h4>
                </div>
                
                <p className="text-white/60 text-xs mb-3 line-clamp-2">
                  {community.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">
                    {community.memberCount} membros
                  </span>
                  
                  <button
                    onClick={() => joinCommunity(community.id)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-white/90 flex items-center justify-center transition-all duration-200 cursor-pointer"
                    title="Entrar na comunidade"
                  >
                    <Plus className="w-4 h-4 text-black" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Your Communities */}
      {userCommunities.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Suas Comunidades</h3>
          </div>
          
          <div className="space-y-3">
            {userCommunities.slice(0, 3).map((communityId) => {
              const community = communities.find(c => c.id === communityId);
              if (!community) return null;
              
              return (
                <div key={community.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    {community.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">
                      {community.name}
                    </h4>
                    <p className="text-white/60 text-xs">
                      {community.memberCount} membros
                    </p>
                  </div>
                  
                  <button
                    onClick={() => leaveCommunity(community.id)}
                    className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer"
                    title="Sair da comunidade"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
          
          {userCommunities.length > 3 && (
            <div className="text-center pt-3">
              <button className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors text-sm">
                Ver Todas ({userCommunities.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explore More Button */}
      <div className="text-center">
        <button 
          onClick={() => window.location.href = '/explore-communities'}
          className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200"
        >
          Explorar Mais Comunidades
        </button>
      </div>
    </div>
  );
};

export default SuggestedGroups;
