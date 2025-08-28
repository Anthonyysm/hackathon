import React from 'react';
import PostCreation from './PostCreation';

// Componente wrapper que adiciona sincronização quando o contexto estiver disponível
const PostCreationWithSync = (props) => {
  // Tentar usar o contexto de posts do usuário
  let addUserPost = null;
  let userPostsContext = null;
  
  try {
    const { useUserPosts } = require('../contexts/UserPostsContext');
    userPostsContext = useUserPosts();
    addUserPost = userPostsContext?.addUserPost;
  } catch (error) {
    // Contexto não disponível, continuar sem sincronização
    console.log('UserPostsContext não disponível, sincronização desabilitada');
  }

  // Wrapper para o callback onPostCreated que adiciona sincronização
  const handlePostCreated = (postData) => {
    // Adicionar post ao contexto para sincronização (se disponível)
    if (addUserPost) {
      const newPost = {
        id: Date.now().toString(), // ID temporário, será atualizado pelo contexto
        ...postData,
        createdAt: new Date(),
        likes: [],
        commentCount: 0,
        shares: 0,
        isEdited: false
      };
      addUserPost(newPost);
    }
    
    // Chamar callback original se fornecido
    if (props.onPostCreated) {
      props.onPostCreated(postData);
    }
  };

  return (
    <PostCreation
      {...props}
      onPostCreated={handlePostCreated}
    />
  );
};

export default PostCreationWithSync;
