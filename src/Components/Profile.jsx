import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { Edit3, Plus, FileText, User, Calendar, Phone, AtSign, Camera, Image, X, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import PostCreation from './PostCreation';

const Profile = () => {
  const { user, loading } = useAuth();
  const { posts, createPost, deletePost } = usePosts();
  const [editing, setEditing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    phone: '',
    birthDate: ''
  });

  // Filtrar posts do usuário (apenas posts públicos aparecem no perfil)
  useEffect(() => {
    if (posts && user) {
      const filteredPosts = posts.filter(post => 
        post.userId === user.uid && 
        !post.isAnonymous && 
        post.visibility === 'public'
      );
      setUserPosts(filteredPosts);
    }
  }, [posts, user]);

  // Inicializar formulário de edição
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || user.profileData?.displayName || '',
        username: user.profileData?.username || '',
        bio: user.profileData?.bio || '',
        phone: user.profileData?.phone || '',
        birthDate: user.profileData?.birthDate || ''
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implementar atualização do perfil no Firebase
      console.log('Salvando perfil:', editForm);
      setEditing(false);
      // Atualizar dados locais
      // await updateUserProfile(editForm);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      displayName: user?.displayName || user?.profileData?.displayName || '',
      username: user?.profileData?.username || '',
      bio: user?.profileData?.bio || '',
      phone: user?.profileData?.phone || '',
      birthDate: user?.profileData?.birthDate || ''
    });
    setEditing(false);
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handlePostCreated = async (postData) => {
    try {
      const success = await createPost(postData);
      if (success) {
        setShowCreatePost(false);
        // O post será automaticamente adicionado ao estado através do hook usePosts
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      try {
        const success = await deletePost(postId);
        if (success) {
          // O post será automaticamente removido do estado através do hook usePosts
        }
      } catch (error) {
        console.error('Erro ao deletar post:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return timestamp.toLocaleDateString('pt-BR');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-white ml-3">Carregando perfil...</div>
      </div>
    );
  }

  // Se não há usuário, mostrar erro
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Usuário não autenticado</h2>
          <p className="text-white/60">Faça login para acessar seu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Banner Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {user?.profileData?.bannerPhotoURL && (
          <img 
            src={user.profileData.bannerPhotoURL} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Photo */}
      <div className="relative -mt-20 px-8">
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-4 border-white bg-white/10 flex items-center justify-center overflow-hidden">
            {user?.profileData?.profilePhotoURL ? (
              <img 
                src={user.profileData.profilePhotoURL} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-20 h-20 text-white/50" />
            )}
          </div>
          
          {editing && (
            <button className="absolute bottom-2 right-2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Camera className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-8 pb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Nome</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      placeholder="seu_username"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Biografia</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Telefone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                      <input
                        type="date"
                        value={editForm.birthDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user?.displayName || user?.profileData?.displayName || 'Usuário'}
                </h1>
                
                <p className="text-white/80 text-lg mb-3">
                  @{user?.profileData?.username || 'usuario'}
                </p>
                
                <p className="text-white/70 mb-3">
                  {user?.profileData?.bio || 'Nenhuma biografia adicionada'}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-white/60">
                  {user?.profileData?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.profileData.phone}</span>
                    </div>
                  )}
                  
                  {user?.profileData?.birthDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(user.profileData.birthDate)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {!editing && (
            <button
              onClick={handleEditProfile}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Posts</h2>
          <button
            onClick={handleCreatePost}
            className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Post</span>
          </button>
        </div>
        
        {userPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-xl text-white/60 mb-2">Nenhum post ainda</h3>
            <p className="text-white/40 mb-6">
              Seus posts públicos aparecerão aqui. Posts anônimos não são exibidos no perfil.
            </p>
            <button
              onClick={handleCreatePost}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Post</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      {post.avatar ? (
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="w-5 h-5 text-white/70" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white">{post.author}</h4>
                      <p className="text-sm text-white/50">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-white/50 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-white/90 leading-relaxed mb-4">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm"
                      >
                        <span>#{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">Criar Novo Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <PostCreation 
              onPostCreated={handlePostCreated}
              onCancel={() => setShowCreatePost(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;