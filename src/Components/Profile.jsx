import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Importar useParams
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { useImages } from '../hooks/useImages';
import { useFriendship } from '../contexts/FriendshipContext'; // Importar useFriendship
import { useToast } from '../contexts/ToastContext'; // Import useToast
import { Edit3, Plus, FileText, User, Calendar, Phone, AtSign, Camera, Image, X, Save, Trash2, Eye, EyeOff, UserPlus, UserCheck, UserMinus } from 'lucide-react';
import PostCreation from './PostCreation';
import { profileImageService } from '../services/profileImageService';
import { postService, userService } from '../services/firebaseService';
import { friendService } from '../services/firebaseService'; // Import friendService

const Profile = () => {
  const { userId: profileUserIdParam } = useParams(); // Obter userId da URL, se existir
  const { user, loading } = useAuth();
  const { setFriendshipStatusChanged } = useFriendship(); // Use context here
  // Usar profileUserIdParam se existir, caso contrário, usar o user.uid autenticado
  const currentProfileId = profileUserIdParam || user?.uid;

  const { createPost, deletePost } = usePosts();
  const [editing, setEditing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    bio: '',
    phone: '',
    birthDate: ''
  });
  
  // Friendship states
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [sentRequestId, setSentRequestId] = useState(null); // New state to store sent request ID
  
  // Novo estado para o perfil que está sendo visualizado (se não for o próprio)
  const [viewedUserProfile, setViewedUserProfile] = useState(null);
  const [viewedProfileLoading, setViewedProfileLoading] = useState(false);
  
  // Refs para os inputs de arquivo
  const profilePhotoInputRef = useRef(null);
  const bannerPhotoInputRef = useRef(null);
  
  // Estados para preview das imagens
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [bannerPhotoPreview, setBannerPhotoPreview] = useState(null);
  
  // Hook para gerenciar imagens do Firestore
  const { 
    profilePhoto: profilePhotoFromHook, // Renomear para evitar conflito
    bannerPhoto: bannerPhotoFromHook, // Renomear para evitar conflito
    loading: imagesLoading,
    loadUserImages, 
    updateImage 
  } = useImages(currentProfileId);

  const { showAppToast } = useToast(); // Use the hook

  // Determinar qual URL de imagem usar
  const profilePhotoData = profileUserIdParam ? viewedUserProfile?.profilePhotoUrl || profilePhotoFromHook : profilePhotoFromHook;
  const bannerPhotoData = profileUserIdParam ? viewedUserProfile?.bannerPhotoUrl || bannerPhotoFromHook : bannerPhotoFromHook;

  // Efeito para carregar o perfil do usuário visualizado
  useEffect(() => {
    if (profileUserIdParam && user?.uid !== profileUserIdParam) {
      const fetchViewedUserProfile = async () => {
        setViewedProfileLoading(true);
        try {
          const profile = await userService.getUserProfile(profileUserIdParam);
          setViewedUserProfile(profile);
          // Definir editForm com os dados do perfil visualizado para preencher os campos de exibição
          setEditForm({
            displayName: profile?.displayName || '',
            username: profile?.username || '',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
            birthDate: profile?.birthDate || ''
          });
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário visualizado:', error);
          showAppToast('Erro ao carregar perfil. Tente novamente.', 'error');
        } finally {
          setViewedProfileLoading(false);
        }
      };
      fetchViewedUserProfile();
    } else if (user && !profileUserIdParam) {
      // Se não há profileUserIdParam, é o próprio perfil, então buscar os dados completos do Firestore
      const fetchOwnUserProfile = async () => {
        setViewedProfileLoading(true);
        try {
          const profile = await userService.getUserProfile(user.uid);
          setViewedUserProfile(profile);
          setEditForm({
            displayName: profile?.displayName || '',
            username: profile?.username || '',
            bio: profile?.bio || '',
            phone: profile?.phone || '',
            birthDate: profile?.birthDate || ''
          });
        } catch (error) {
          console.error('Erro ao buscar o próprio perfil do usuário:', error);
          showAppToast('Erro ao carregar seu perfil. Tente novamente.', 'error');
        } finally {
          setViewedProfileLoading(false);
        }
      };
      fetchOwnUserProfile();
    }
  }, [profileUserIdParam, user]);
  
  // Filtrar posts do usuário (apenas posts públicos aparecem no perfil)
  useEffect(() => {
    if (currentProfileId && viewedUserProfile) { // Apenas buscar posts se o perfil a ser exibido já estiver carregado
      const fetchUserPosts = async () => {
        setPostsLoading(true);
        try {
          const posts = await postService.getUserPosts(currentProfileId);
          // Garantir que os posts exibam o avatar e nome do perfil atual do usuário
          const postsWithUserAvatar = posts.map(post => ({
            ...post,
            avatar: profilePhotoPreview || profilePhotoData || viewedUserProfile?.profilePhotoUrl || null, 
            author: viewedUserProfile?.displayName || viewedUserProfile?.username || 'Usuário' 
          }));
          setUserPosts(postsWithUserAvatar);
        } catch (error) {
          console.error('Erro ao buscar posts do usuário:', error);
          showAppToast('Erro ao carregar posts do perfil. Tente novamente.', 'error');
        } finally {
          setPostsLoading(false);
        }
      };
      fetchUserPosts();
    }
  }, [currentProfileId, profilePhotoData, profilePhotoPreview, viewedUserProfile]); // Adicionar viewedUserProfile como dependência

  // Efeito para verificar status de amizade
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (user?.uid && currentProfileId && user.uid !== currentProfileId) {
        try {
          const isCurrentlyFriend = await friendService.isFriend(user.uid, currentProfileId);
          setIsFriend(isCurrentlyFriend);

          if (!isCurrentlyFriend) {
            const sent = await friendService.hasSentFriendRequest(user.uid, currentProfileId);
            setFriendRequestSent(sent.exists);
            if (sent.exists) {
              setSentRequestId(sent.requestId); // Store the request ID
            }

            const received = await friendService.hasReceivedFriendRequest(currentProfileId, user.uid); // Check if THIS profile sent a request to ME
            setFriendRequestReceived(received.exists);
          }
        } catch (error) {
          console.error('Erro ao verificar status de amizade:', error);
        }
      } else {
        setIsFriend(false);
        setFriendRequestSent(false);
        setFriendRequestReceived(false);
        setSentRequestId(null); // Clear request ID if not applicable
      }
    };
    checkFriendshipStatus();
  }, [user?.uid, currentProfileId]);

  // Inicializar formulário de edição e carregar imagens
  useEffect(() => {
    if (currentProfileId) {
      setEditForm({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        phone: user?.phone || '',
        birthDate: user?.birthDate || ''
      });
      
      // Carregar imagens do usuário
      loadUserImages();
    }
  }, [currentProfileId, loadUserImages, user]); // Adicionar user ao array de dependências para reações a mudanças no usuário autenticado

  // Recarregar dados do usuário quando o perfil for atualizado
  useEffect(() => {
    if (currentProfileId && !editing) {
      // Recarregar dados do usuário para mostrar as atualizações
      const refreshUserData = async () => {
        try {
          const updatedProfile = await userService.getUserProfile(currentProfileId);
          if (updatedProfile) {
            // Atualizar o estado local com os novos dados
            setEditForm({
              displayName: updatedProfile.displayName || '',
              username: updatedProfile.username || '',
              bio: updatedProfile.bio || '',
              phone: updatedProfile.phone || '',
              birthDate: updatedProfile.birthDate || ''
            });
          }
        } catch (error) {
          console.error('Erro ao recarregar dados do usuário:', error);
        }
      };
      
      refreshUserData();
    }
  }, [currentProfileId, editing]); // Usar currentProfileId para depender do ID correto

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      console.log('Salvando perfil:', editForm);
      
      // Processar substituição de imagens se necessário
      if (profilePhotoPreview || bannerPhotoPreview) {
        console.log('Processando novas imagens...');
        
        // Substituir foto de perfil se há nova
        if (profilePhotoPreview) {
          try {
            // Obter o arquivo do input
            const profilePhotoFile = profilePhotoInputRef.current?.files[0];
            if (profilePhotoFile) {
              const currentProfilePhotoId = user?.profilePhotoId; // Acessar diretamente
              await updateImage(profilePhotoFile, 'profilePhoto', currentProfilePhotoId, currentProfileId); // Passar currentProfileId
              showAppToast('Foto de perfil atualizada com sucesso!', 'success');
            }
          } catch (error) {
            console.error('Erro ao substituir foto de perfil:', error);
            showAppToast('Erro ao atualizar foto de perfil. Tente novamente.', 'error');
            return;
          }
        }
        
        // Substituir banner se há novo
        if (bannerPhotoPreview) {
          try {
            // Obter o arquivo do input
            const bannerPhotoFile = bannerPhotoInputRef.current?.files[0];
            if (bannerPhotoFile) {
              const currentBannerId = user?.bannerPhotoId; // Acessar diretamente
              await updateImage(bannerPhotoFile, 'bannerPhoto', currentBannerId, currentProfileId); // Passar currentProfileId
              showAppToast('Banner atualizado com sucesso!', 'success');
            }
          } catch (error) {
            console.error('Erro ao substituir banner:', error);
            showAppToast('Erro ao substituir banner. Tente novamente.', 'error');
            return;
          }
        }
      }
      
      // Salvar dados básicos do perfil
      try {
        await userService.updateUserBasicProfile(currentProfileId, editForm); // Usar currentProfileId
        showAppToast('Perfil básico atualizado com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao atualizar perfil básico:', error);
        showAppToast('Erro ao atualizar dados do perfil. Tente novamente.', 'error');
        return;
      }
      
      setEditing(false);
      // Limpar previews
      setProfilePhotoPreview(null);
      setBannerPhotoPreview(null);
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      showAppToast('Erro ao salvar perfil. Tente novamente.', 'error');
    }
  };

  const handleCancelEdit = () => {
    if (profileUserIdParam) {
      setEditing(false);
      setProfilePhotoPreview(null);
      setBannerPhotoPreview(null);
      loadUserImages();
      return;
    }
    setEditForm({
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || ''
    });
    setEditing(false);
    // Limpar previews das imagens
    setProfilePhotoPreview(null);
    setBannerPhotoPreview(null);
    // Recarregar imagens originais
    loadUserImages();
  };

  // Não permitir edição se não for o perfil do usuário autenticado
  const isOwnProfile = user?.uid === currentProfileId;

  const handleAddFriend = async () => {
    if (!user?.uid || !currentProfileId) return;
    try {
      await friendService.sendFriendRequest(user.uid, user.displayName || 'Usuário Sereno', user.photoURL || null, currentProfileId);
      setFriendRequestSent(true);
      showAppToast('Pedido de amizade enviado!', 'success');
      setFriendshipStatusChanged(prev => !prev); // Notificar mudança no status de amizade
    } catch (error) {
      console.error('Erro ao enviar pedido de amizade:', error);
      showAppToast(error.message || 'Erro ao enviar pedido de amizade. Tente novamente.', 'error');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!user?.uid || !currentProfileId || !sentRequestId) return;
    try {
      await friendService.cancelFriendRequest(sentRequestId);
      setFriendRequestSent(false);
      setSentRequestId(null);
      showAppToast('Pedido de amizade cancelado.', 'info');
      setFriendshipStatusChanged(prev => !prev); // Notificar mudança no status de amizade
    } catch (error) {
      console.error('Erro ao cancelar pedido de amizade:', error);
      showAppToast(error.message || 'Erro ao cancelar pedido de amizade. Tente novamente.', 'error');
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!user?.uid || !currentProfileId) return;
    try {
      // Before accepting, we need to get the requestId. If friendRequestReceived is true, it means currentProfileId is the sender and user.uid is the recipient.
      const receivedRequest = await friendService.hasReceivedFriendRequest(currentProfileId, user.uid);
      if (!receivedRequest.exists || !receivedRequest.requestId) {
        throw new Error("Solicitação de amizade não encontrada para aceitar.");
      }
      await friendService.acceptFriendRequest(receivedRequest.requestId, user.uid); 
      setIsFriend(true);
      setFriendRequestReceived(false);
      showAppToast('Solicitação de amizade aceita!', 'success');
      setFriendshipStatusChanged(prev => !prev); // Notificar mudança no status de amizade
    } catch (error) {
      console.error('Erro ao aceitar pedido de amizade:', error);
      showAppToast(error.message || 'Erro ao aceitar solicitação. Tente novamente.', 'error');
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!user?.uid || !currentProfileId) return;
    try {
      // Before rejecting, we need to get the requestId.
      const receivedRequest = await friendService.hasReceivedFriendRequest(currentProfileId, user.uid);
      if (!receivedRequest.exists || !receivedRequest.requestId) {
        throw new Error("Solicitação de amizade não encontrada para rejeitar.");
      }
      await friendService.rejectFriendRequest(receivedRequest.requestId, user.uid); 
      setFriendRequestReceived(false);
      showAppToast('Solicitação de amizade rejeitada.', 'info');
      setFriendshipStatusChanged(prev => !prev); // Notificar mudança no status de amizade
    } catch (error) {
      console.error('Erro ao rejeitar pedido de amizade:', error);
      showAppToast(error.message || 'Erro ao rejeitar solicitação. Tente novamente.', 'error');
    }
  };

  const handleProfilePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validar arquivo usando o serviço
        profileImageService.validateFileType(file);
        profileImageService.validateFileSize(file, 2); // 2MB para foto de perfil
        
        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        showAppToast(error.message, 'error');
        // Limpar o input
        event.target.value = '';
      }
    }
  };

  const handleBannerPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validar arquivo usando o serviço
        profileImageService.validateFileType(file);
        profileImageService.validateFileSize(file, 5); // 5MB para banner
        
        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setBannerPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        showAppToast(error.message, 'error');
        // Limpar o input
        event.target.value = '';
      }
    }
  };

  const triggerProfilePhotoInput = () => {
    profilePhotoInputRef.current?.click();
  };

  const triggerBannerPhotoInput = () => {
    bannerPhotoInputRef.current?.click();
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handlePostCreated = async (postData) => {
    try {
      const newPost = await createPost(postData);
      if (newPost) {
        setShowCreatePost(false);
        
        // Adicionar o post recém-criado ao estado local do perfil
        // E garantir que a imagem de perfil do usuário seja usada como avatar
        const postWithAvatar = {
          ...newPost,
          avatar: profilePhotoPreview || profilePhotoData || viewedUserProfile?.profilePhotoUrl || null, // Usar photoURL do perfil sendo exibido
          author: viewedUserProfile?.displayName || viewedUserProfile?.username || 'Usuário' // Usar displayName, depois username, depois fallback
        };
        setUserPosts(prev => [postWithAvatar, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      showAppToast('Erro ao criar post. Tente novamente.', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      try {
        const success = await deletePost(postId);
        if (success) {
          // Remover o post do estado local do perfil
          setUserPosts(prev => prev.filter(post => post.id !== postId));
          showAppToast('Post deletado com sucesso!', 'success');
        }
      } catch (error) {
        console.error('Erro ao deletar post:', error);
        showAppToast('Erro ao deletar post. Tente novamente.', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      let date;
      
      // Converter Firestore Timestamp para Date se necessário
      if (dateString && typeof dateString === 'object' && dateString.toDate) {
        // É um Firestore Timestamp
        date = dateString.toDate();
      } else if (dateString instanceof Date) {
        // Já é um Date
        date = dateString;
      } else if (typeof dateString === 'string' || typeof dateString === 'number') {
        // É uma string ou número, tentar converter para Date
        date = new Date(dateString);
      } else {
        return 'Data inválida';
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    // Converter Firestore Timestamp para Date se necessário
    let date;
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      // É um Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Já é um Date
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      // É uma string ou número, tentar converter para Date
      date = new Date(timestamp);
    } else {
      return 'Data inválida';
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  // Loading state
  if (loading || imagesLoading || viewedProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-white ml-3">Carregando perfil...</div>
      </div>
    );
  }

  // Se não há usuário e não estamos visualizando um perfil específico, mostrar erro
  if (!user && !profileUserIdParam) {
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

  // Dados do perfil a serem exibidos
  const profileToDisplay = viewedUserProfile; 
  // Fallback para quando viewedUserProfile ainda está carregando ou não encontrado
  if (!profileToDisplay && profileUserIdParam) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white/30" />
          </div>
          <h3 className="text-xl text-white/60 mb-2">Perfil não encontrado</h3>
          <p className="text-white/40">O perfil que você está procurando não existe ou não está disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Banner Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {(bannerPhotoPreview || bannerPhotoData) && (
          <img 
            src={bannerPhotoPreview || bannerPhotoData} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Botão de edição do banner */}
        {editing && isOwnProfile && ( // Apenas permitir edição no próprio perfil
          <button 
            onClick={triggerBannerPhotoInput}
            className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Alterar Banner</span>
          </button>
        )}
      </div>

      {/* Profile Photo */}
      <div className="relative -mt-20 px-8">
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-4 border-white bg-white/10 flex items-center justify-center overflow-hidden">
            {(profilePhotoPreview || profileToDisplay?.profilePhotoUrl) ? (
              <img 
                src={profilePhotoPreview || profileToDisplay?.profilePhotoUrl} 
                alt="Foto de perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-20 h-20 text-white/50" />
            )}
          </div>
          
          {/* Botão de edição da foto de perfil */}
          {editing && isOwnProfile && ( // Apenas permitir edição no próprio perfil
            <button 
              onClick={triggerProfilePhotoInput}
              className="absolute bottom-2 right-2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Camera className="w-6 h-6 text-white" />
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
                <h1 className="text-2xl font-bold mt-5 text-white mb-2">
                  {profileToDisplay?.displayName || 'Usuário'}
                </h1>
                
                <p className="text-white/80 text-lg mb-3"> {/* Added mt-1 here */}
                  @{profileToDisplay?.username || 'usuario'}
                </p>
                
                <p className="text-white/70 mb-3">
                  {profileToDisplay?.bio || 'Nenhuma biografia adicionada'}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-white/60">
                  {profileToDisplay?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{profileToDisplay.phone}</span>
                    </div>
                  )}
                  
                  {profileToDisplay?.birthDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(profileToDisplay.birthDate)}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {!editing && isOwnProfile && ( // Apenas mostrar o botão de editar no próprio perfil
            <button
              onClick={handleEditProfile}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>
          )}
          
          {!editing && !isOwnProfile && (
            <div className="flex items-center space-x-3">
              {isFriend ? (
                <button
                  disabled
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/50 flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Amigos</span>
                </button>
              ) : friendRequestSent ? (
                <>
                  <button
                    disabled
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/50 flex items-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelFriendRequest}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-colors flex items-center space-x-2"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </>
              ) : friendRequestReceived ? (
                <>
                  <button
                    onClick={handleAcceptFriendRequest}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 border border-green-400 rounded-full text-white transition-colors flex items-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRejectFriendRequest}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 border border-red-400 rounded-full text-white transition-colors flex items-center space-x-2"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddFriend}
                  className="px-6 py-3 mt-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-colors flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Posts</h2>
          {isOwnProfile && ( // Apenas mostrar o botão de criar post no próprio perfil
            <button
              onClick={handleCreatePost}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Post</span>
            </button>
          )}
        </div>
        
        {postsLoading ? (
          <div className="text-center py-16">
            <div className="loading-spinner"></div>
            <p className="text-white/60 mt-4">Carregando posts...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-xl text-white/60 mb-2">Nenhum post ainda</h3>
            <p className="text-white/40 mb-6">
              Seus posts públicos aparecerão aqui. Posts anônimos não são exibidos no perfil.
            </p>
            {isOwnProfile && ( // Apenas mostrar o botão de criar post no próprio perfil
              <button
                onClick={handleCreatePost}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Primeiro Post</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {post.avatar && (post.avatar.startsWith('http://') || post.avatar.startsWith('https://')) ? (
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-md">
                          {post.author ? post.author.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white">{post.author}</h4>
                      <p className="text-sm text-white/50">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  
                  {isOwnProfile && ( // Apenas mostrar o botão de deletar post no próprio perfil
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-white/50 hover:text-red-400 transition-colors rounded-full hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
      {showCreatePost && isOwnProfile && ( // Apenas mostrar o modal de criar post no próprio perfil
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

      {/* Hidden file inputs */}
      {isOwnProfile && ( // Apenas mostrar inputs de arquivo no próprio perfil
        <input
          ref={profilePhotoInputRef}
          type="file"
          accept="image/*"
          onChange={handleProfilePhotoChange}
          className="hidden"
        />
      )}
      {isOwnProfile && (
        <input
          ref={bannerPhotoInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerPhotoChange}
          className="hidden"
        />
      )}
    </div>
  );
};

export default Profile;