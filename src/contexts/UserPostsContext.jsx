import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { postService } from '../services/firebaseService';

const UserPostsContext = createContext();

export const UserPostsProvider = ({ children }) => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar posts do usuário
  const loadUserPosts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar todos os posts do usuário (públicos e privados)
      const posts = await postService.getUserPosts(user.uid, 100, user.uid);
      setUserPosts(posts);
    } catch (err) {
      setError('Erro ao carregar posts do usuário');
      console.error('Erro ao carregar posts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Adicionar novo post
  const addUserPost = useCallback((newPost) => {
    setUserPosts(prev => [newPost, ...prev]);
  }, []);

  // Atualizar post existente
  const updateUserPost = useCallback((postId, updates) => {
    setUserPosts(prev => 
      prev.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  // Remover post
  const removeUserPost = useCallback((postId) => {
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  // Recarregar posts
  const refreshUserPosts = useCallback(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  // Carregar posts na inicialização e quando o usuário mudar
  useEffect(() => {
    if (user) {
      loadUserPosts();
    } else {
      setUserPosts([]);
    }
  }, [user, loadUserPosts]);

  const value = {
    userPosts,
    loading,
    error,
    addUserPost,
    updateUserPost,
    removeUserPost,
    refreshUserPosts,
    loadUserPosts
  };

  return (
    <UserPostsContext.Provider value={value}>
      {children}
    </UserPostsContext.Provider>
  );
};

export const useUserPosts = () => {
  const context = useContext(UserPostsContext);
  if (!context) {
    throw new Error('useUserPosts deve ser usado dentro de UserPostsProvider');
  }
  return context;
};

export default UserPostsContext;
