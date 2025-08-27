import { useState, useEffect, useCallback } from 'react';
import { CommunityGroup } from '../types';

// Mock data para desenvolvimento - será substituído pelo backend
const mockCommunities: CommunityGroup[] = [
  {
    id: 'ansiedade',
    name: 'Ansiedade & Estresse',
    description: 'Grupo de apoio para gerenciar ansiedade e estresse do dia a dia',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-500',
    memberCount: 1247,
    posts: [],
    rules: [
      'Respeite todos os membros',
      'Não julgue as experiências dos outros',
      'Mantenha a confidencialidade',
      'Seja gentil e empático'
    ],
    isPrivate: false,
    moderators: ['mod1', 'mod2'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'autoconfianca',
    name: 'Autoconfiança',
    description: 'Desenvolvimento pessoal e construção de autoestima',
    icon: '✨',
    color: 'from-purple-500 to-pink-500',
    memberCount: 892,
    posts: [],
    rules: [
      'Celebre as conquistas dos outros',
      'Compartilhe suas vitórias',
      'Ofereça apoio construtivo',
      'Mantenha um ambiente positivo'
    ],
    isPrivate: false,
    moderators: ['mod3', 'mod4'],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'tdah',
    name: 'TDAH & Foco',
    description: 'Estratégias e suporte para pessoas com TDAH',
    icon: '🎯',
    color: 'from-green-500 to-emerald-500',
    memberCount: 567,
    posts: [],
    rules: [
      'Compartilhe estratégias que funcionam',
      'Seja paciente com os outros',
      'Respeite as diferenças',
      'Ofereça dicas práticas'
    ],
    isPrivate: false,
    moderators: ['mod5', 'mod6'],
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'sono',
    name: 'Qualidade do Sono',
    description: 'Dicas e técnicas para melhorar a qualidade do sono',
    icon: '😴',
    color: 'from-indigo-500 to-purple-500',
    memberCount: 423,
    posts: [],
    rules: [
      'Compartilhe técnicas que funcionaram',
      'Respeite os horários dos outros',
      'Ofereça suporte para insônia',
      'Mantenha o foco no tema'
    ],
    isPrivate: false,
    moderators: ['mod7'],
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'terapia',
    name: 'Jornada da Terapia',
    description: 'Experiências e reflexões sobre o processo terapêutico',
    icon: '🤗',
    color: 'from-orange-500 to-red-500',
    memberCount: 756,
    posts: [],
    rules: [
      'Respeite a privacidade das sessões',
      'Não dê conselhos médicos',
      'Compartilhe experiências pessoais',
      'Ofereça suporte emocional'
    ],
    isPrivate: false,
    moderators: ['mod8', 'mod9'],
    createdAt: new Date('2024-03-01')
  }
];

export const useCommunities = () => {
  const [communities, setCommunities] = useState<CommunityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCommunities, setUserCommunities] = useState<string[]>([]);

  // Simular carregamento inicial
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        setCommunities(mockCommunities);
        
        // Simular comunidades do usuário
        setUserCommunities(['ansiedade', 'autoconfianca']);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar comunidades');
        console.error('Erro ao carregar comunidades:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  // Entrar em uma comunidade
  const joinCommunity = useCallback(async (communityId: string) => {
    try {
      if (!userCommunities.includes(communityId)) {
        setUserCommunities(prev => [...prev, communityId]);
        
        // Atualizar contador de membros
        setCommunities(prev => prev.map(community => 
          community.id === communityId 
            ? { ...community, memberCount: community.memberCount + 1 }
            : community
        ));
        
        // Aqui seria feita a chamada para o backend
        // await api.joinCommunity(communityId);
      }
    } catch (err) {
      setError('Erro ao entrar na comunidade');
      throw err;
    }
  }, [userCommunities]);

  // Sair de uma comunidade
  const leaveCommunity = useCallback(async (communityId: string) => {
    try {
      setUserCommunities(prev => prev.filter(id => id !== communityId));
      
      // Atualizar contador de membros
      setCommunities(prev => prev.map(community => 
        community.id === communityId 
          ? { ...community, memberCount: Math.max(0, community.memberCount - 1) }
          : community
      ));
      
      // Aqui seria feita a chamada para o backend
      // await api.leaveCommunity(communityId);
    } catch (err) {
      setError('Erro ao sair da comunidade');
      throw err;
    }
  }, []);

  // Verificar se usuário está em uma comunidade
  const isUserInCommunity = useCallback((communityId: string) => {
    return userCommunities.includes(communityId);
  }, [userCommunities]);

  // Buscar comunidade por ID
  const getCommunityById = useCallback((communityId: string) => {
    return communities.find(community => community.id === communityId);
  }, [communities]);

  // Filtrar comunidades por categoria
  const filterCommunitiesByCategory = useCallback((category: string) => {
    return communities.filter(community => 
      community.description.toLowerCase().includes(category.toLowerCase()) ||
      community.name.toLowerCase().includes(category.toLowerCase())
    );
  }, [communities]);

  // Obter comunidades populares (ordenadas por número de membros)
  const getPopularCommunities = useCallback((limit = 5) => {
    return [...communities]
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, limit);
  }, [communities]);

  // Obter comunidades do usuário
  const getUserCommunities = useCallback(() => {
    return communities.filter(community => 
      userCommunities.includes(community.id)
    );
  }, [communities, userCommunities]);

  // Criar nova comunidade (apenas para moderadores/admin)
  const createCommunity = useCallback(async (communityData: Omit<CommunityGroup, 'id' | 'createdAt' | 'memberCount' | 'posts' | 'moderators'>) => {
    try {
      const newCommunity: CommunityGroup = {
        ...communityData,
        id: `community-${Date.now()}`,
        memberCount: 1, // Criador é o primeiro membro
        posts: [],
        moderators: ['current-user-id'], // ID do usuário atual
        createdAt: new Date()
      };

      setCommunities(prev => [newCommunity, ...prev]);
      setUserCommunities(prev => [...prev, newCommunity.id]);
      
      // Aqui seria feita a chamada para o backend
      // await api.createCommunity(communityData);
      
      return newCommunity;
    } catch (err) {
      setError('Erro ao criar comunidade');
      throw err;
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    communities,
    userCommunities,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
    isUserInCommunity,
    getCommunityById,
    filterCommunitiesByCategory,
    getPopularCommunities,
    getUserCommunities,
    createCommunity,
    clearError
  };
};
