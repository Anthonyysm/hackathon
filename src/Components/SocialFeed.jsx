import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, MoreHorizontal, User, EyeOff } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const SocialFeed = () => {
  const navigate = useNavigate();
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);

  const toggleExpanded = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          author: data.author || 'Usuário',
          isAnonymous: data.isAnonymous || false,
          avatar: data.avatar || null,
          mood: data.mood
            ? data.mood
            : { emoji: '🙂', label: 'Humor' },
          time: data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : 'agora',
          content: data.content,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          isLiked: false,
        };
      });
      setPosts(loaded);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleLike = async (post) => {
    try {
      const updated = posts.map((p) =>
        p.id === post.id
          ? { ...p, isLiked: !p.isLiked, likes: (p.likes || 0) + (p.isLiked ? -1 : 1) }
          : p
      );
      setPosts(updated);
      await updateDoc(doc(db, 'posts', post.id), {
        likes: increment(post.isLiked ? -1 : 1),
      });
    } catch (e) {
      // ignore errors for now
    }
  };

  const handleShare = async (post) => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      // Simple modal via prompt for now
      window.prompt('Copie o link para compartilhar:', url);
      const updated = posts.map((p) => (p.id === post.id ? { ...p, shares: (p.shares || 0) + 1 } : p));
      setPosts(updated);
      await updateDoc(doc(db, 'posts', post.id), { shares: increment(1) });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.id}
          className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                {post.isAnonymous ? (
                  <EyeOff className="w-6 h-6 text-gray-300" />
                ) : (
                  <User className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {post.isAnonymous ? 'Usuário Anônimo' : post.author}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{post.time}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <span>{post.mood.emoji}</span>
                    <span>{post.mood.label}</span>
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-full transition-all duration-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-200 leading-relaxed">{post.content}</p>
            {post.image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                <img src={post.image} alt="" className="w-full max-h-[500px] object-cover" />
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleToggleLike(post)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  post.isLiked
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.likes}</span>
              </button>
              
              <button
                onClick={() => navigate(`/post/${post.id}`)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.comments}</span>
              </button>
              
              <button onClick={() => handleShare(post)} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Share className="w-5 h-5" />
                <span className="text-sm">{post.shares}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedPosts.has(post.id) && (
            <div className="mt-6 pt-4 border-t border-gray-700/30 space-y-4 animate-in slide-in-from-top duration-300">
              <div className="space-y-3">
                {/* Sample Comments */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-sm text-gray-200">Você não está sozinho! Continue firme, um dia de cada vez. 🤗</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                      <span>Ana Costa</span>
                      <span>•</span>
                      <span>1h atrás</span>
                      <button className="hover:text-white">❤️</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comment Input */}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Escreva um comentário de apoio..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

export default SocialFeed;