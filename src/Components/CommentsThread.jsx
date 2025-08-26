import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Send, Trash2, Smile, MoreVertical, EyeOff, MessageSquare } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, increment, updateDoc } from 'firebase/firestore';

const CommentsThread = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedComments, setLikedComments] = useState(new Set());
  const [showMenuFor, setShowMenuFor] = useState(null);

  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setComments(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    const user = auth.currentUser;
    if (!user || !newComment.trim()) return;
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: user.uid,
        authorName: user.displayName || 'Usuário',
        authorAvatar: user.photoURL || null,
        content: newComment.trim(),
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
      // Optionally bump post comment count
      try { await updateDoc(doc(db, 'posts', postId), { comments: increment(1) }); } catch {}
    } catch (e) {
      // no-op
    }
  };

  const handleDelete = async (comment) => {
    const user = auth.currentUser;
    if (!user || user.uid !== comment.userId) return;
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', comment.id));
      try { await updateDoc(doc(db, 'posts', postId), { comments: increment(-1) }); } catch {}
    } catch (e) {
      // no-op
    }
  };

  const handleLikeComment = async (comment) => {
    const user = auth.currentUser;
    if (!user) return;

    const commentId = comment.id;
    const isLiked = likedComments.has(commentId);

    if (isLiked) {
      // Remove like
      setLikedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
      
      // Update comment likes count
      setComments(prev => 
        prev.map(c => 
          c.id === commentId 
            ? { ...c, likes: Math.max(0, (c.likes || 0) - 1) }
            : c
        )
      );

      // Update Firebase
      try {
        await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
          likes: increment(-1)
        });
      } catch (e) {
        console.error('Erro ao remover like:', e);
      }
    } else {
      // Add like
      setLikedComments(prev => new Set(prev).add(commentId));
      
      // Update comment likes count
      setComments(prev => 
        prev.map(c => 
          c.id === commentId 
            ? { ...c, likes: (c.likes || 0) + 1 }
            : c
        )
      );

      // Update Firebase
      try {
        await updateDoc(doc(db, 'posts', postId, 'comments', commentId), {
          likes: increment(1)
        });
      } catch (e) {
        console.error('Erro ao adicionar like:', e);
      }
    }
  };

  const handleHideComment = (commentId) => {
    // TODO: Implement hide comment functionality
    console.log('Ocultar comentário:', commentId);
    setShowMenuFor(null);
  };

  const handleStartConversation = (comment) => {
    // TODO: Implement start conversation functionality
    console.log('Iniciar conversa com:', comment.authorName);
    setShowMenuFor(null);
  };

  const toggleMenu = (commentId) => {
    setShowMenuFor(showMenuFor === commentId ? null : commentId);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <h3 className="text-xl font-light mb-6">Comentários ({comments.length})</h3>

      {/* Form */}
      <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-6">
        <textarea
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="w-full bg-transparent border-none text-white placeholder-white/50 focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <button className="text-white/50 hover:text-white p-2" type="button">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="bg-white text-black px-4 py-2 rounded-lg font-light hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Comentar
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-white/50 py-8">Carregando comentários...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-white/50 py-8">Nenhum comentário ainda. Seja o primeiro!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  {c.authorAvatar ? (
                    <img src={c.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {c.authorName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{c.authorName || 'Usuário'}</span>
                    <div className="flex items-center space-x-2">
                      {/* Like Button */}
                      <button 
                        onClick={() => handleLikeComment(c)}
                        className={`flex items-center space-x-1 transition-all duration-200 ${
                          likedComments.has(c.id) 
                            ? 'text-white' 
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedComments.has(c.id) ? 'fill-current' : ''}`} />
                        <span className="text-sm">{c.likes || 0}</span>
                      </button>
                      
                      {/* Menu Button */}
                      <div className="relative">
                        <button 
                          onClick={() => toggleMenu(c.id)}
                          className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {showMenuFor === c.id && (
                          <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[160px]">
                            {auth.currentUser && auth.currentUser.uid === c.userId ? (
                              // User's own comment - can delete
                              <button
                                onClick={() => handleDelete(c)}
                                className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Excluir</span>
                              </button>
                            ) : (
                              // Other user's comment - can hide or start conversation
                              <>
                                <button
                                  onClick={() => handleHideComment(c.id)}
                                  className="w-full text-left px-4 py-2 text-white/70 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  <span>Ocultar</span>
                                </button>
                                <button
                                  onClick={() => handleStartConversation(c)}
                                  className="w-full text-left px-4 py-2 text-white/70 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Conversar</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 mb-3 leading-relaxed">{c.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsThread;


