import React, { useState } from 'react';
import { Users, TrendingUp, Plus, Check, MessageCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from './Confetti';

const SuggestedGroups = ({ setActiveTab }) => {
  const navigate = useNavigate();
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  // const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data para desenvolvimento
  const communities = [
    {
      id: 1,
      name: "Ansiedade",
      icon: "🧘‍♀️",
      memberCount: 1250,
      description: "Compartilhe experiências e dicas para lidar com ansiedade"
    },
    {
      id: 2,
      name: "Estresse",
      icon: "🌿",
      memberCount: 980,
      description: "Um espaço seguro para falar sobre depressão"
    },
    {
      id: 3,
      name: "Autoestima",
      icon: "✨",
      memberCount: 820,
      description: "Construindo confiança e amor próprio"
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
      name: "Meditação Diária",
      icon: "🕯️",
      memberCount: 750,
      description: "Pratique meditação em grupo"
    }
  ];

  const [userCommunities, setUserCommunities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const joinCommunity = (communityId) => {
    setUserCommunities(prev => [...prev, communityId]);
    setConfettiTrigger(prev => prev + 1);
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

  // Filter friends based on search
  // const filteredFriends = []; // This will be populated dynamically

  // const handleSearchChange = (e) => {
  //   setSearchTerm(e.target.value);
  // };
  //
  // const clearSearch = () => {
  //   setSearchTerm('');
  // };
  
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
    <>
      <Confetti trigger={confettiTrigger} />
      <div className="space-y-6 animation-initial animate-fade-in-left animation-delay-100">
        {/* Popular Communities */}
        <div className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:from-white/10 hover:to-white/15 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative">
              <div className="w-5 h-5 text-white/80">
                <Users className="w-5 h-5" />
              </div>
              <div className="absolute -inset-1 bg-white/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Grupos Sugeridos
            </h2>
          </div>
          
          <div className="space-y-4">
            {popularCommunities.slice(0, 3).map((community) => {
              const isMember = userCommunities.includes(community.id);
              
              return (
                <div 
                  key={community.id} 
                  className="group/item relative flex items-center justify-between p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:from-white/10 hover:to-white/15 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-white/90 flex items-center justify-center text-black font-bold text-xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                        {community.icon}
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-xl blur opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm group-hover/item:text-white/90 transition-colors">
                        {community.name}
                      </h4>
                      <p className="text-white/50 text-xs font-medium">
                        {community.memberCount.toLocaleString()} membros
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => isMember ? leaveCommunity(community.id) : joinCommunity(community.id)}
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer transform hover:scale-110 hover:rotate-3 ${
                      isMember 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 shadow-lg shadow-green-500/25' 
                        : 'bg-gradient-to-br from-white to-white/90 hover:from-white/80 hover:to-white shadow-lg shadow-white/25'
                    }`}
                    title={isMember ? 'Sair da comunidade' : 'Entrar na comunidade'}
                  >
                    {isMember ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-black" />
                    )}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Explore More Button - Enhanced with animations */}
          <div className="text-center pt-6">
            <button 
              onClick={() => navigate('/home/groups')}
              className="px-6 py-3 bg-white text-black font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 hover:shadow-lg hover:scale-105 transform"
            >
              Ver Comunidades
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuggestedGroups;