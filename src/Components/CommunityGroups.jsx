import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Lock, Globe, Search, Filter, Star, MessageCircle, Calendar, Heart, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from './ui/Input';
import Card from './ui/Card';
import Confetti from './Confetti';

const CommunityGroups = () => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const { user } = useAuth();

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 50
  });

  // Mock data - substituir por dados reais do Firebase
  useEffect(() => {
    const mockGroups = [
      {
        id: '1',
        name: 'Ansiedade e Bem-estar',
        description: 'Grupo de apoio para pessoas que lidam com ansiedade. Compartilhe experiências e aprenda técnicas de relaxamento.',
        memberCount: 127,
        maxMembers: 200,
        isPrivate: false,
        category: 'Saúde Mental',
        tags: ['ansiedade', 'bem-estar', 'apoio'],
        createdAt: '2024-01-15',
        lastActivity: '2024-01-20',
        isMember: false,
        isFeatured: true,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Psicólogos em Ação',
        description: 'Comunidade exclusiva para psicólogos trocarem experiências e discutirem casos clínicos.',
        memberCount: 45,
        maxMembers: 100,
        isPrivate: true,
        category: 'Profissional',
        tags: ['psicologia', 'casos clínicos', 'profissional'],
        createdAt: '2024-01-10',
        lastActivity: '2024-01-19',
        isMember: true,
        isFeatured: false,
        rating: 4.9
      },
      {
        id: '3',
        name: 'Meditação e Mindfulness',
        description: 'Aprenda técnicas de meditação e mindfulness para melhorar sua saúde mental e qualidade de vida.',
        memberCount: 89,
        maxMembers: 150,
        isPrivate: false,
        category: 'Bem-estar',
        tags: ['meditação', 'mindfulness', 'bem-estar'],
        createdAt: '2024-01-12',
        lastActivity: '2024-01-18',
        isMember: false,
        isFeatured: true,
        rating: 4.7
      },
      {
        id: '4',
        name: 'Depressão - Juntos Somos Mais Fortes',
        description: 'Espaço seguro para compartilhar experiências sobre depressão e encontrar apoio mútuo.',
        memberCount: 203,
        maxMembers: 300,
        isPrivate: false,
        category: 'Saúde Mental',
        tags: ['depressão', 'apoio', 'comunidade'],
        createdAt: '2024-01-05',
        lastActivity: '2024-01-21',
        isMember: false,
        isFeatured: true,
        rating: 4.9
      },
      {
        id: '5',
        name: 'Relacionamentos Saudáveis',
        description: 'Discussões sobre como construir e manter relacionamentos saudáveis e equilibrados.',
        memberCount: 156,
        maxMembers: 250,
        isPrivate: false,
        category: 'Relacionamentos',
        tags: ['relacionamentos', 'saudável', 'comunicação'],
        createdAt: '2024-01-08',
        lastActivity: '2024-01-20',
        isMember: false,
        isFeatured: false,
        rating: 4.6
      }
    ];

    const mockUserGroups = mockGroups.filter(group => group.isMember);
    
    setGroups(mockGroups);
    setUserGroups(mockUserGroups);
  }, []);

  const handleJoinGroup = useCallback(async () => {
    // Lógica de entrada em grupos será movida para o backend; desativada aqui
    console.warn('Entrada em grupos desativada neste build.');
  }, []);

  const handleLeaveGroup = useCallback(async () => {
    console.warn('Saída de grupos desativada neste build.');
  }, []);

  const handleCreateGroup = useCallback(async (e) => {
    e.preventDefault();
    try {
      const groupData = {
        ...newGroup,
        id: Date.now().toString(),
        memberCount: 1,
        isMember: true,
        category: 'Personalizado',
        tags: [],
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        isFeatured: false,
        rating: 0
      };

      setGroups(prev => [groupData, ...prev]);
      setUserGroups(prev => [groupData.id, ...prev]);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', isPrivate: false, maxMembers: 50 });
      setConfettiTrigger(prev => prev + 1);
      console.log('Grupo criado:', groupData);
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
    }
  }, [newGroup]);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && !group.isPrivate) ||
                         (filterType === 'private' && group.isPrivate) ||
                         (filterType === 'member' && group.isMember) ||
                         (filterType === 'featured' && group.isFeatured);

    return matchesSearch && matchesFilter;
  });

  const featuredGroups = groups.filter(group => group.isFeatured);

  return (
    <>
      <Confetti trigger={confettiTrigger} />
      <div className="min-h-screen bg-black py-8 animation-initial animate-fade-in-up animation-delay-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2 section-header">
              Explorar Grupos da Comunidade
            </h1>
            <p className="text-white/70 text-lg">
              Conecte-se com pessoas que compartilham interesses similares e participe de grupos de apoio
            </p>
          </div>

          {/* Featured Groups */}
          {featuredGroups.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-semibold text-white">Grupos em Destaque</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={handleJoinGroup}
                    onLeave={handleLeaveGroup}
                    isUserGroup={group.isMember}
                    isFeatured={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Pesquisar grupos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Search}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Grupos</option>
                <option value="featured">Em Destaque</option>
                <option value="public">Grupos Públicos</option>
                <option value="private">Grupos Privados</option>
                <option value="member">Meus Grupos</option>
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300"
              >
                <Plus className="w-5 h-5" />
                Criar Grupo
              </button>
            </div>
          </div>

          {/* User Groups Section */}
          {userGroups.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 section-header">Meus Grupos</h2>
              <div className="gap-6">
                {userGroups.map(groupId => {
                  const group = groups.find(g => g.id === groupId);
                  if (!group) return null;
                  return (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onLeave={handleLeaveGroup}
                      isUserGroup={true}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* All Groups Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4 section-header">
              {filterType === 'member' ? 'Meus Grupos' : 'Todos os Grupos'}
            </h2>
            <div className="gap-6">
              {filteredGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                  isUserGroup={group.isMember}
                />
              ))}
            </div>
          </div>

          {/* Create Group Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">Criar Novo Grupo</h3>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Nome do Grupo
                    </label>
                    <Input
                      type="text"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome do grupo"
                      required
                      className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o propósito do grupo"
                      className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center text-white/70">
                      <input
                        type="checkbox"
                        checked={newGroup.isPrivate}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                        className="mr-2 form-checkbox h-5 w-5 text-blue-600 bg-white/10 border-white/20 rounded"
                      />
                      Grupo Privado
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Máximo de Membros
                    </label>
                    <Input
                      type="number"
                      value={newGroup.maxMembers}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                      min="2"
                      max="1000"
                      className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-white/70 hover:bg-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Criar Grupo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Componente do Card do Grupo
const GroupCard = ({ group, onJoin, onLeave, isUserGroup, isFeatured = false }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-white/5 border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white/50" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-white/60">
                {group.isPrivate ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Privado</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Público</span>
                  </>
                )}
                {isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
          
          {group.isMember && (
            <span className="px-2 py-1 bg-green-800 text-green-200 text-xs font-medium rounded-full">
              Membro
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-white/80 mb-4 line-clamp-3">
          {group.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-white/60 mb-4">
          <span>{group.memberCount}/{group.maxMembers} membros</span>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{group.rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {group.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {isUserGroup ? (
            <button
              onClick={() => onLeave(group.id)}
              className="flex-1 px-4 py-2 bg-red-800 text-red-200 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sair do Grupo
            </button>
          ) : (
            <button
              onClick={() => onJoin(group.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Entrar no Grupo
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommunityGroups;
