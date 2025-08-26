import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical,
  User,
  Clock,
  Hash,
  Send,
  Flag,
  Edit3,
  Trash2,
  X,
  Smile
} from 'lucide-react';
import { auth, db } from '../firebase';
import CommentsThread from './CommentsThread';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Mock data for now - replace with real Firebase data
  const mockPost = {
    id: postId,
    author: {
      id: 'user1',
      name: 'Maria Santos',
      avatar: null
    },
    content: 'Hoje foi um dia difícil no trabalho. A ansiedade estava muito alta durante uma reunião importante. Alguém tem alguma técnica de respiração que funcione bem para vocês? Estou tentando algumas coisas mas queria ouvir experiências de outras pessoas que passam por situações similares.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 23,
    comments: 8,
    liked: false,
    tags: ['ansiedade', 'trabalho', 'técnicas', 'bem-estar'],
    group: {
      name: 'Ansiedade & Estresse',
      id: 'group1'
    },
    images: []
  };

  const mockComments = [
    {
      id: 1,
      author: {
        id: 'user2',
        name: 'João Silva',
        avatar: null
      },
      content: 'Oi Maria! Eu também sofro com ansiedade no trabalho. Uma técnica que me ajuda muito é a respiração 4-7-8: inspire por 4 segundos, segure por 7 e expire por 8. Tenta fazer isso algumas vezes antes das reuniões!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      likes: 12,
      liked: false,
      replies: []
    },
    {
      id: 2,
      author: {
        id: 'user3',
        name: 'Ana Costa',
        avatar: null
      },
      content: 'Concordo com o João! Também recomendo meditação rápida de 5 minutos antes de situações estressantes. Tem alguns apps ótimos para isso.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      likes: 8,
      liked: true,
      replies: [
        {
          id: 1,
          author: {
            id: 'user1',
            name: 'Maria Santos',
            avatar: null
          },
          content: 'Obrigada Ana! Vou procurar por esses apps. Qual você mais gosta?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          likes: 3
        }
      ]
    },
    {
      id: 3,
      author: {
        id: 'user4',
        name: 'Carlos Mendes',
        avatar: null
      },
      content: 'Eu uso uma técnica diferente: visualizo um lugar calmo e seguro antes de entrar em reuniões. Parece bobo mas funciona para mim!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      likes: 5,
      liked: false,
      replies: []
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);
        
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          
          // Check if user is the author
          setIsAuthor(mockPost.author.id === currentUser.uid);
        }

        // Set mock data for now
        setPost(mockPost);
        setComments(mockComments);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, navigate]);

  const handleLikePost = () => {
    setPost(prev => ({
      ...prev,
      liked: !prev.liked,
      likes: prev.liked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleLikeComment = (commentId) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, liked: !comment.liked, likes: comment.liked ? comment.likes - 1 : comment.likes + 1 }
          : comment
      )
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // TODO: Implement real comment creation with Firebase
      const comment = {
        id: Date.now(),
        author: {
          id: user.uid,
          name: userData?.displayName || user.displayName || 'Usuário',
          avatar: user.photoURL
        },
        content: newComment,
        timestamp: new Date(),
        likes: 0,
        liked: false,
        replies: []
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setShowCommentForm(false);
      
      // Update post comment count
      setPost(prev => ({
        ...prev,
        comments: prev.comments + 1
      }));
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleReplyToComment = (commentId) => {
    // TODO: Implement reply functionality
    console.log('Reply to comment:', commentId);
  };

  const handleDeleteComment = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleDeletePost = () => {
    // TODO: Implement post deletion
    navigate('/home');
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days} dias atrás`;
    
    return timestamp.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando post...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl font-light">Post</h1>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-md shadow-lg py-1 z-50">
                  {isAuthor ? (
                    <>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                      <button 
                        onClick={handleDeletePost}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </button>
                    </>
                  ) : (
                    <button className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                      <Flag className="w-4 h-4 mr-2" />
                      Reportar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Post */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md">
          {/* Post Header */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="" className="w-full h-full rounded-full" />
              ) : (
                <span className="text-white/70">{post.author.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-white">{post.author.name}</span>
                {post.group && (
                  <span className="text-white/50 text-sm">
                    • em {post.group.name}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-white/50">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(post.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <p className="text-white/90 text-lg leading-relaxed mb-4">{post.content}</p>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white/10 px-3 py-1 rounded-full text-sm text-white/60 flex items-center space-x-1"
                  >
                    <Hash className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLikePost}
                className={`flex items-center space-x-2 transition-colors ${
                  post.liked ? 'text-red-400' : 'text-white/60 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <button 
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section (shared) */}
        <CommentsThread postId={postId} />
      </div>
    </div>
  );
};

export default PostDetail;
