import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, User, Clock, Hash, Edit3, Trash2, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import { useAuth } from '../contexts/AuthContext';

const SocialFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showActionsFor, setShowActionsFor] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const {
    posts,
    loading,
    error,
    hasMore,
    loadMorePosts,
    togglePostLike,
    isPostLiked,
    deletePost
  } = usePosts();

  const handleLikePost = async (postId) => {
    await togglePostLike(postId);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      setDeletingPostId(postId);
      try {
        const success = await deletePost(postId);
        if (success) {
          setShowActionsFor(null);
        }
      } catch (error) {
        console.error('Erro ao deletar post:', error);
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  const handleEditPost = (postId) => {
    // TODO: Implement edit functionality
    console.log('Edit post:', postId);
    setShowActionsFor(null);
  };

  const formatTimestamp = (timestamp) => {
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

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-white/70">Carregando posts...</span>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Flag className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-xl text-white/60 mb-2">Erro ao carregar posts</h3>
        <p className="text-white/40 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-12 h-12 text-white/30" />
        </div>
        <h3 className="text-xl text-white/60 mb-2">Nenhum post ainda</h3>
        <p className="text-white/40">
          Seja o primeiro a compartilhar algo!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animation-initial animate-fade-in-up animation-delay-400">
      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                {post.avatar ? (
                  <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-white/70" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-white truncate">{post.author}</h4>
                  {post.isAnonymous && (
                    <span className="text-xs bg-white/20 text-white/70 px-2 py-1 rounded-full">
                      Anônimo
                    </span>
                  )}
                  {post.visibility === 'private' && (
                    <span className="text-xs bg-white/20 text-white/70 px-2 py-1 rounded-full">
                      Privado
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-white/50">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(post.createdAt)}</span>
                  {post.isEdited && (
                    <span className="text-white/30">(editado)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Post Actions Menu */}
            {user && post.userId === user.uid && (
              <div className="relative">
                <button
                  onClick={() => setShowActionsFor(showActionsFor === post.id ? null : post.id)}
                  className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showActionsFor === post.id && (
                  <div className="absolute right-0 top-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-10 min-w-[140px]">
                    <div className="py-1">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>
                          {deletingPostId === post.id ? 'Deletando...' : 'Deletar'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-white/90 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-white/10 text-white/70 px-3 py-1 rounded-full text-sm"
                >
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center space-x-2 transition-colors ${
                  isPostLiked(post.id)
                    ? 'text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isPostLiked(post.id) ? 'fill-current' : ''}`} />
                <span>{post.likes?.length || 0}</span>
              </button>
              
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.commentCount || 0}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-white/50 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span>{post.shares || 0}</span>
              </button>
            </div>
            
            {user && post.userId !== user.uid && (
              <button className="p-2 text-white/30 hover:text-white/60 transition-colors rounded-full hover:bg-white/10">
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : 'Carregar mais posts'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;