import { useState, useEffect, useCallback } from 'react';
import { Post } from '../types';

// Mock data para desenvolvimento - será substituído pelo backend
const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    author: 'Maria Silva',
    isAnonymous: false,
    avatar: '/avatars/user1.jpg',
    content: 'Hoje foi um dia desafiador, mas consegui manter minha calma. Estou orgulhosa de mim mesma! 💪',
    mood: { emoji: '😌', label: 'Calma', value: 7, timestamp: new Date() },
    tags: ['autoestima', 'superação'],
    likes: 12,
    comments: 3,
    shares: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    communityId: 'ansiedade'
  },
  {
    id: '2',
    userId: 'user2',
    author: 'João Santos',
    isAnonymous: true,
    content: 'Alguém mais tem dificuldade para dormir? Queria compartilhar algumas técnicas que me ajudaram.',
    mood: { emoji: '😴', label: 'Cansado', value: 4, timestamp: new Date() },
    tags: ['insônia', 'dicas'],
    likes: 8,
    comments: 5,
    shares: 2,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    communityId: 'sono'
  },
  {
    id: '3',
    userId: 'user3',
    author: 'Ana Costa',
    isAnonymous: false,
    avatar: '/avatars/user3.jpg',
    content: 'Primeira sessão de terapia hoje! Estou ansiosa mas esperançosa de que vai me ajudar.',
    mood: { emoji: '🤗', label: 'Esperançosa', value: 8, timestamp: new Date() },
    tags: ['terapia', 'primeira-vez'],
    likes: 15,
    comments: 7,
    shares: 3,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    communityId: 'terapia'
  }
];

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Simular carregamento inicial
  useEffect(() => {
    const loadInitialPosts = async () => {
      try {
        setLoading(true);
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPosts(mockPosts);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar posts');
        console.error('Erro ao carregar posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialPosts();
  }, []);

  // Criar novo post
  const createPost = useCallback(async (postData: Omit<Post, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      
      // Simular criação no backend
      const newPost: Post = {
        ...postData,
        id: `post-${Date.now()}`,
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        shares: 0
      };

      // Adicionar à lista local
      setPosts(prev => [newPost, ...prev]);
      
      // Aqui seria feita a chamada para o backend
      // await api.createPost(postData);
      
      return newPost;
    } catch (err) {
      setError('Erro ao criar post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar post
  const updatePost = useCallback(async (id: string, updates: Partial<Post>) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, ...updates, updatedAt: new Date(), isEdited: true }
          : post
      ));
      
      // Aqui seria feita a chamada para o backend
      // await api.updatePost(id, updates);
    } catch (err) {
      setError('Erro ao atualizar post');
      throw err;
    }
  }, []);

  // Deletar post
  const deletePost = useCallback(async (id: string) => {
    try {
      setPosts(prev => prev.filter(post => post.id !== id));
      
      // Aqui seria feita a chamada para o backend
      // await api.deletePost(id);
    } catch (err) {
      setError('Erro ao deletar post');
      throw err;
    }
  }, []);

  // Curtir/descurtir post
  const likePost = useCallback(async (id: string) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
      
      // Aqui seria feita a chamada para o backend
      // await api.likePost(id);
    } catch (err) {
      setError('Erro ao curtir post');
      throw err;
    }
  }, []);

  // Descurtir post
  const unlikePost = useCallback(async (id: string) => {
    try {
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, likes: Math.max(0, post.likes - 1) }
          : post
      ));
      
      // Aqui seria feita a chamada para o backend
      // await api.unlikePost(id);
    } catch (err) {
      setError('Erro ao descurtir post');
      throw err;
    }
  }, []);

  // Carregar mais posts (pagination)
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      // Simular carregamento de mais posts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aqui seria feita a chamada para o backend
      // const newPosts = await api.getPosts(page + 1);
      // setPosts(prev => [...prev, ...newPosts]);
      
      setPage(prev => prev + 1);
      setHasMore(false); // Mock: não há mais posts
    } catch (err) {
      setError('Erro ao carregar mais posts');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Filtrar posts por comunidade
  const filterPostsByCommunity = useCallback((communityId: string) => {
    return posts.filter(post => post.communityId === communityId);
  }, [posts]);

  // Buscar posts por tag
  const searchPostsByTag = useCallback((tag: string) => {
    return posts.filter(post => 
      post.tags.some(postTag => 
        postTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }, [posts]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    loadMorePosts,
    filterPostsByCommunity,
    searchPostsByTag,
    clearError
  };
};
