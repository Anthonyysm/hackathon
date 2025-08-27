import React, { useEffect, useState, useRef } from 'react';
import { Heart, Send, Trash2, MoreVertical, EyeOff, Reply, Edit3, Flag, User } from 'lucide-react';

const CommentsThread = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const [showMenuFor, setShowMenuFor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [user, setUser] = useState({ uid: 'current-user', displayName: 'Usuário Atual' });
  const commentInputRef = useRef(null);

  // Mock comments data
  const mockComments = [
    {
      id: 1,
      content: "Muito inspirador! Parabéns pela conquista! 👏",
      author: "Ana Costa",
      authorId: "user123",
      avatar: null,
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
      likes: 5,
      isAnonymous: false,
      replies: []
    },
    {
      id: 2,
      content: "Passei por algo similar. A terapia realmente ajuda muito!",
      author: "Anônimo",
      authorId: "user456",
      avatar: null,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h atrás
      likes: 3,
      isAnonymous: true,
      replies: [
        {
          id: 3,
          content: "Concordo! E ter esse espaço para compartilhar é fundamental.",
          author: "Carlos Silva",
          authorId: "user789",
          avatar: null,
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min atrás
          likes: 2,
          isAnonymous: false
        }
      ]
    }
  ];

  useEffect(() => {
    // Simular carregamento de comentários
    setComments(mockComments);
  }, [postId]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      content: newComment,
      author: user.displayName || 'Usuário',
      authorId: user.uid,
      avatar: null,
      timestamp: new Date(),
      likes: 0,
      isAnonymous: false,
      replies: []
    };

    if (replyingTo) {
      setComments(prev => prev.map(c => 
        c.id === replyingTo 
          ? { ...c, replies: [...c.replies, comment] }
          : c
      ));
      setReplyingTo(null);
    } else {
      setComments(prev => [comment, ...prev]);
    }

    setNewComment('');
  };

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    const newLikedComments = new Set(likedComments);
    
    if (likedComments.has(commentId)) {
      newLikedComments.delete(commentId);
      // Decrementar like
      if (isReply) {
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { 
                ...c, 
                replies: c.replies.map(r => 
                  r.id === commentId ? { ...r, likes: r.likes - 1 } : r
                ) 
              }
            : c
        ));
      } else {
        setComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, likes: c.likes - 1 } : c
        ));
      }
    } else {
      newLikedComments.add(commentId);
      // Incrementar like
      if (isReply) {
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { 
                ...c, 
                replies: c.replies.map(r => 
                  r.id === commentId ? { ...r, likes: r.likes + 1 } : r
                ) 
              }
            : c
        ));
      } else {
        setComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        ));
      }
    }
    
    setLikedComments(newLikedComments);
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
          ? { ...c, replies: c.replies.filter(r => r.id !== commentId) }
          : c
      ));
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
    setShowMenuFor(null);
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setNewComment('');
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const renderComment = (comment, isReply = false, parentId = null) => (
    <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {comment.avatar ? (
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white/70" />
          )}
        </div>

        <div className="flex-1">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">
                  {comment.isAnonymous ? 'Anônimo' : comment.author}
                </span>
                {comment.isAnonymous && (
                  <EyeOff className="w-3 h-3 text-white/50" />
                )}
                <span className="text-white/50 text-xs">
                  {formatTimeAgo(comment.timestamp)}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenuFor(showMenuFor === comment.id ? null : comment.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <MoreVertical className="w-3 h-3 text-white/50" />
                </button>

                {showMenuFor === comment.id && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-black/90 border border-white/10 rounded-lg shadow-lg py-1 z-50">
                    {user?.uid === comment.authorId && (
                      <>
                        <button
                          onClick={() => setShowMenuFor(null)}
                          className="w-full px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition-colors text-left flex items-center"
                        >
                          <Edit3 className="w-3 h-3 mr-2" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                          className="w-full px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left flex items-center"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Deletar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowMenuFor(null)}
                      className="w-full px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition-colors text-left flex items-center"
                    >
                      <Flag className="w-3 h-3 mr-2" />
                      Reportar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-white/90 text-sm leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-2 ml-3">
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                likedComments.has(comment.id)
                  ? 'text-red-400'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <Heart className={`w-3 h-3 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
              <span>{comment.likes}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id)}
                className="flex items-center space-x-1 text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Responder</span>
              </button>
            )}
          </div>

          {/* Replies */}
          {!isReply && comment.replies?.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, true, comment.id))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-t border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium text-sm">
          Comentários ({comments.length})
        </h4>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white/70" />
          </div>
          <div className="flex-1">
            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Escreva uma resposta..." : "Escreva um comentário..."}
                className="w-full bg-transparent text-white placeholder-white/50 text-sm resize-none outline-none"
                rows="2"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-white/50 hover:text-white/70 text-xs transition-colors"
                >
                  Cancelar resposta
                </button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/50 text-white rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{replyingTo ? 'Responder' : 'Comentar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-0">
        {comments.map(comment => renderComment(comment))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/50 text-sm">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsThread;