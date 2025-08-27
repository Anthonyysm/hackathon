import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, User, EyeOff, Trash2, Flag, Edit3, X, Copy, ExternalLink } from 'lucide-react';
import CommentsThread from './CommentsThread';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

const SocialFeed = React.memo(() => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [showCommentsFor, setShowCommentsFor] = useState(new Set());
  const [showShareModal, setShowShareModal] = useState(null);

  // Mock data para desenvolvimento
  const mockPosts = useMemo(() => [
    {
      id: 1,
      author: "Maria Silva",
      avatar: null,
      content: "Hoje foi um dia desafiador, mas consegui superar minha ansiedade matinal com algumas técnicas de respiração que aprendi aqui na comunidade. Gratidão por esse espaço seguro! 🌱",
      mood: { emoji: "😊", label: "Esperançoso" },
      tags: ["ansiedade", "respiracao", "gratidao"],
      likes: 24,
      comments: 8,
      shares: 3,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      isAnonymous: false,
      userId: "user1",
      communityId: "ansiedade-bem-estar"
    },
    {
      id: 2,
      author: "Anônimo",
      avatar: null,
      content: "Às vezes me sinto perdido e sem direção. É normal ter esses momentos? Como vocês lidam com a sensação de vazio? Preciso de algumas palavras de apoio...",
      mood: { emoji: "😔", label: "Melancólico" },
      tags: ["apoio", "vazio", "direcao"],
      likes: 15,
      comments: 12,
      shares: 1,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      isAnonymous: true,
      userId: "user2",
      communityId: null
    },
    {
      id: 3,
      author: "João Santos",
      avatar: null,
      content: "Compartilhando uma vitória pessoal: consegui falar em público hoje sem ter um ataque de pânico! Foram meses de terapia e exercícios, mas valeu cada esforço. Para quem está passando por algo similar, não desistam! 💪",
      mood: { emoji: "🎉", label: "Orgulhoso" },
      tags: ["vitoria", "panico", "terapia", "superacao"],
      likes: 45,
      comments: 18,
      shares: 12,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      isAnonymous: false,
      userId: "user3",
      communityId: "ansiedade-bem-estar"
    }
  ], []);

  useEffect(() => {
    setPosts(mockPosts);
  }, [mockPosts]);

  const formatTimeAgo = useCallback((date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  }, []);

  const handleToggleLike = useCallback((post) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(post.id)) {
      newLikedPosts.delete(post.id);
      setPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, likes: p.likes - 1 } : p
      ));
    } else {
      newLikedPosts.add(post.id);
      setPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, likes: p.likes + 1 } : p
      ));
    }
    setLikedPosts(newLikedPosts);
  }, [likedPosts]);

  const handleDeletePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setShowMenuFor(null);
  }, []);

  const toggleExpanded = useCallback((postId) => {
    const newExpanded = new Set(expandedPosts);
    if (expandedPosts.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  }, [expandedPosts]);

  const toggleMenu = useCallback((postId) => {
    setShowMenuFor(showMenuFor === postId ? null : postId);
  }, [showMenuFor]);

  const closeMenu = useCallback(() => {
    setShowMenuFor(null);
  }, []);

  const toggleComments = useCallback((postId) => {
    const newShowComments = new Set(showCommentsFor);
    if (showCommentsFor.has(postId)) {
      newShowComments.delete(postId);
    } else {
      newShowComments.add(postId);
    }
    setShowCommentsFor(newShowComments);
  }, [showCommentsFor]);

  const handleShare = useCallback((post) => {
    setShowShareModal(post);
  }, []);

  const closeShareModal = useCallback(() => {
    setShowShareModal(null);
  }, []);

  const copyPostLink = useCallback(async () => {
    try {
      const postUrl = `${window.location.origin}/post/${showShareModal.id}`;
      await navigator.clipboard.writeText(postUrl);
      // Aqui você pode adicionar um toast de sucesso
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  }, [showShareModal]);

  const openPostLink = useCallback(() => {
    if (showShareModal) {
      const postUrl = `${window.location.origin}/post/${showShareModal.id}`;
      window.open(postUrl, '_blank');
    }
  }, [showShareModal]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.post-menu')) {
        closeMenu();
      }
    };

    if (showMenuFor) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showMenuFor, closeMenu]);

  // Fechar modal de compartilhamento ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareModal && !event.target.closest('.share-modal')) {
        closeShareModal();
      }
    };

    if (showShareModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showShareModal, closeShareModal]);

  if (loading) {
    return (
      <Card variant="glass" padding="lg">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-white/70">Carregando posts...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card 
          key={post.id} 
          variant="glass" 
          hover 
          className="overflow-hidden"
        >
          {/* Post Header */}
          <Card.Header>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  {post.avatar ? (
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white/70" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">
                      {post.isAnonymous ? 'Anônimo' : post.author}
                    </span>
                    {post.isAnonymous && (
                      <EyeOff className="w-4 h-4 text-white/50" aria-label="Post anônimo" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-white/50">
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatTimeAgo(post.createdAt)}
                    </time>
                    {post.communityId && (
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {post.communityId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Menu */}
              <div className="relative post-menu">
                <button
                  onClick={() => toggleMenu(post.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Opções do post"
                  aria-expanded={showMenuFor === post.id}
                  aria-haspopup="true"
                >
                  <MoreHorizontal className="w-4 h-4 text-white/70" aria-hidden="true" />
                </button>

                {showMenuFor === post.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg py-1 z-50" role="menu">
                    <button
                      onClick={() => toggleMenu(null)}
                      className="w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left flex items-center "
                      role="menuitem"
                      aria-label="Editar post"
                    >
                      <Edit3 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left flex items-center "
                      role="menuitem"
                      aria-label="Deletar post"
                    >
                      <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                      Deletar
                    </button>
                    <button
                      onClick={() => toggleMenu(null)}
                      className="w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors text-left flex items-center "
                      role="menuitem"
                      aria-label="Reportar post"
                    >
                      <Flag className="w-4 h-4 mr-2" aria-hidden="true" />
                      Reportar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card.Header>

          {/* Post Content */}
          <Card.Content>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl" role="img" aria-label={`Humor: ${post.mood.label}`}>
                {post.mood.emoji}
              </span>
              <span className="text-sm text-white/70">{post.mood.label}</span>
            </div>

            <p className="text-white leading-relaxed mb-4">
              {expandedPosts.has(post.id)
                ? post.content
                : post.content.length > 200
                  ? `${post.content.substring(0, 200)}...`
                  : post.content
              }
            </p>

            {post.content.length > 200 && (
              <button
                onClick={() => toggleExpanded(post.id)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors "
                aria-label={expandedPosts.has(post.id) ? 'Ver menos do post' : 'Ver mais do post'}
              >
                {expandedPosts.has(post.id) ? 'Ver menos' : 'Ver mais'}
              </button>
            )}

            {/* Post Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70 border border-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </Card.Content>

          {/* Post Actions */}
          <Card.Footer>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleToggleLike(post)}
                  className={`flex items-center space-x-2 transition-colors  ${
                    likedPosts.has(post.id)
                      ? 'text-red-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                  aria-label={likedPosts.has(post.id) ? 'Descurtir post' : 'Curtir post'}
                  aria-pressed={likedPosts.has(post.id)}
                >
                  <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} aria-hidden="true" />
                  <span className="text-sm">{post.likes}</span>
                </button>

                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors "
                  aria-label={`Ver ${post.comments} comentários`}
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">{post.comments}</span>
                </button>

                <button 
                  onClick={() => handleShare(post)}
                  className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors "
                  aria-label={`Compartilhar post`}
                >
                  <Share className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">{post.shares}</span>
                </button>
              </div>
            </div>
          </Card.Footer>

          {/* Comments Section */}
          {showCommentsFor.has(post.id) && (
            <CommentsThread postId={post.id} />
          )}
        </Card>
      ))}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-md w-full share-modal">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-lg">Compartilhar Post</h3>
              <button
                onClick={closeShareModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-4">
                Compartilhe este post com outras pessoas usando o link abaixo:
              </p>
              <div className="bg-white/5 border border-white/20 rounded-lg p-3 mb-4">
                <p className="text-white/60 text-xs break-all">
                  {`${window.location.origin}/post/${showShareModal.id}`}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={copyPostLink}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Link</span>
              </button>
              <button
                onClick={openPostLink}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <EmptyState
          icon={() => <span className="text-6xl">📝</span>}
          title="Nenhum post ainda"
          description="Seja o primeiro a compartilhar algo com a comunidade!"
          action={
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ">
              Criar Primeiro Post
            </button>
          }
        />
      )}
    </div>
  );
});

SocialFeed.displayName = 'SocialFeed';

export default SocialFeed;