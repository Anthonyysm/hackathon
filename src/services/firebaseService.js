import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { mockPosts, mockGroups, mockUsers, mockNotifications, mockComments } from '../data/mockData';

// ===== SERVIÇOS DE USUÁRIOS =====

export const userService = {
  // Criar perfil de usuário
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, userId };
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  },

  // Buscar perfil de usuário
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        throw new Error('Perfil do usuário não encontrado no Firebase.');
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      throw error;
    }
  },

  // Atualizar perfil de usuário
  async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  // Atualizar dados básicos do perfil (nome, username, bio, etc.)
  async updateUserBasicProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        username: profileData.username,
        bio: profileData.bio,
        phone: profileData.phone,
        birthDate: profileData.birthDate,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil básico:', error);
      throw error;
    }
  },

  // Buscar usuários por tipo (psicólogos, clientes)
  async getUsersByRole(role) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar usuários por função:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE POSTS =====

export const postService = {
  // Criar novo post
  async createPost(postData) {
    try {
      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        commentCount: 0,
        shares: 0,
        isEdited: false
      });
      
      return { success: true, postId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  },

  // Deletar post
  async deletePost(postId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        
        // Deletar o post
        await deleteDoc(postRef);
        
        // Deletar todos os comentários relacionados
        const commentsRef = collection(db, 'comments');
        const commentsQuery = query(commentsRef, where('postId', '==', postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const deletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  },

  // Buscar posts
  async getPosts(limitCount = 20, startAfter = 0) {
    try {
      // Tenta usar Firebase primeiro
      const postsRef = collection(db, 'posts');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      let q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar posts públicos no lado do cliente para evitar problemas de índice
      const publicPosts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(post => post.visibility === 'public');
      
      return publicPosts;
      
    } catch (error) {
      // Se for erro de índice, usar dados mockados
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando dados mockados');
        return mockPosts
          .filter(post => post.visibility === 'public')
          .slice(startAfter, startAfter + limitCount);
      }
      
      // Para outros erros, logar e usar dados mockados
      console.warn('Erro ao buscar posts do Firebase, usando dados mockados:', error);
      return mockPosts
        .filter(post => post.visibility === 'public')
        .slice(startAfter, startAfter + limitCount);
    }
  },

  // Buscar posts de um usuário específico
  async getUserPosts(userId, limitCount = 50, currentUserId = null) {
    try {
      // Tenta usar Firebase primeiro
      const postsRef = collection(db, 'posts');
      
      // Consulta para posts do usuário específico
      let q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar posts do usuário específico
      const userPosts = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(post => {
          // Se for o próprio usuário, mostrar todos os posts (públicos e privados)
          if (currentUserId === userId) {
            return post.userId === userId;
          }
          // Se for outro usuário, mostrar apenas posts públicos
          return post.userId === userId && 
                 post.visibility === 'public';
        });
      
      return userPosts;
      
    } catch (error) {
      // Se for erro de índice, usar dados mockados
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando dados mockados');
        return mockPosts
          .filter(post => {
            if (currentUserId === userId) {
              return post.userId === userId;
            }
            return post.userId === userId && 
                   post.visibility === 'public';
          })
          .slice(0, limitCount);
      }
      
      // Para outros erros, logar e usar dados mockados
      console.warn('Erro ao buscar posts do usuário no Firebase, usando dados mockados:', error);
      return mockPosts
        .filter(post => {
          if (currentUserId === userId) {
            return post.userId === userId;
          }
          return post.userId === userId && 
                 post.visibility === 'public';
        })
        .slice(0, limitCount);
    }
  },

  // Curtir/descurtir post
  async togglePostLike(postId, userId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const likes = postData.likes || [];
        const isLiked = likes.includes(userId);
        
        if (isLiked) {
          // Remover like
          await updateDoc(postRef, {
            likes: likes.filter(id => id !== userId),
            updatedAt: serverTimestamp()
          });
        } else {
          // Adicionar like
          await updateDoc(postRef, {
            likes: [...likes, userId],
            updatedAt: serverTimestamp()
          });
          
          // Criar notificação de curtida (se não for o próprio autor)
          if (postData.userId !== userId) {
            try {
              await notificationService.createLikeNotification(
                postId, 
                postData.userId, 
                userId, 
                'Usuário' // TODO: Buscar nome real do usuário
              );
            } catch (error) {
              console.warn('Erro ao criar notificação de curtida:', error);
            }
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao curtir post:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE GRUPOS/COMUNIDADES =====

export const groupService = {
  // Criar novo grupo
  async createGroup(groupData) {
    try {
      const groupsRef = collection(db, 'groups');
      const docRef = await addDoc(groupsRef, {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: [groupData.creatorId],
        memberCount: 1,
        onlineCount: 0,
        posts: [],
        rules: groupData.rules || []
      });
      return { success: true, groupId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  },

  // Buscar grupos
  async getGroups(limitCount = 20) {
    try {
      // Tenta usar Firebase primeiro
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.warn('Firebase não disponível, usando dados mockados:', error);
      // Retorna dados mockados se Firebase falhar
      return mockGroups.slice(0, limitCount).map(group => ({
        ...group,
        members: Array.isArray(group.members) ? group.members : [],
        posts: Array.isArray(group.posts) ? group.posts : [],
        rules: Array.isArray(group.rules) ? group.rules : []
      }));
    }
  },

  // Buscar grupos por categoria
  async getGroupsByCategory(category) {
    try {
      // Tenta usar Firebase primeiro
      const groupsRef = collection(db, 'groups');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        groupsRef, 
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar grupos por categoria no lado do cliente
      const categoryGroups = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(group => group.category === category);
      
      return categoryGroups;
      
    } catch (error) {
      // Se for erro de índice, usar dados mockados
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando dados mockados');
        return mockGroups.filter(group => group.category === category);
      }
      
      console.warn('Firebase não disponível, usando dados mockados:', error);
      return mockGroups.filter(group => group.category === category);
    }
  },

  // Entrar em um grupo
  async joinGroup(groupId, userId) {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        memberCount: increment(1)
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      throw error;
    }
  },

  // Sair de um grupo
  async leaveGroup(groupId, userId) {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayRemove(userId),
        memberCount: increment(-1)
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE HUMOR/MOOD =====

export const moodService = {
  // Registrar humor do usuário
  async recordMood(userId, moodData) {
    try {
      const moodsRef = collection(db, 'moods');
      const docRef = await addDoc(moodsRef, {
        userId,
        ...moodData,
        recordedAt: serverTimestamp()
      });
      return { success: true, moodId: docRef.id };
    } catch (error) {
      console.error('Erro ao registrar humor:', error);
      throw error;
    }
  },

  // Buscar histórico de humor
  async getUserMoodHistory(userId, days = 30) {
    try {
      const moodsRef = collection(db, 'moods');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        moodsRef,
        orderBy('recordedAt', 'desc'),
        limit(days)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar registros do usuário no lado do cliente
      const userMoods = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(mood => mood.userId === userId);
      
      return userMoods;
      
    } catch (error) {
      // Se for erro de índice, usar array vazio
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando array vazio');
        return [];
      }
      
      console.error('Erro ao buscar histórico de humor:', error);
      return [];
    }
  },

  // Calcular estatísticas de humor
  async getMoodStats(userId, period = 'week') {
    try {
      const moodsRef = collection(db, 'moods');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        moodsRef,
        orderBy('recordedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar registros do usuário no lado do cliente
      const userMoods = querySnapshot.docs
        .map(doc => doc.data())
        .filter(mood => mood.userId === userId);
      
      // Calcular estatísticas baseadas no período
      const now = new Date();
      let filteredMoods = [];
      
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredMoods = userMoods.filter(mood => mood.recordedAt?.toDate() > weekAgo);
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredMoods = userMoods.filter(mood => mood.recordedAt?.toDate() > monthAgo);
      }
      
      // Calcular médias e tendências
      const totalMood = filteredMoods.reduce((sum, mood) => sum + (mood.intensity || 0), 0);
      const averageMood = filteredMoods.length > 0 ? totalMood / filteredMoods.length : 0;
      
      return {
        totalEntries: filteredMoods.length,
        averageMood: Math.round(averageMood * 10) / 10,
        period,
        moods: filteredMoods
      };
      
    } catch (error) {
      // Se for erro de índice, usar dados vazios
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando dados vazios');
        return {
          totalEntries: 0,
          averageMood: 0,
          period,
          moods: []
        };
      }
      
      console.error('Erro ao calcular estatísticas de humor:', error);
      return {
        totalEntries: 0,
        averageMood: 0,
        period,
        moods: []
      };
    }
  }
};

// ===== SERVIÇOS DE NOTIFICAÇÕES =====

export const notificationService = {
  // Criar notificação
  async createNotification(notificationData) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false
      });
      return { success: true, notificationId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  // Buscar notificações do usuário
  async getUserNotifications(userId, limitCount = 50) {
    try {
      // Tenta usar Firebase primeiro
      const notificationsRef = collection(db, 'notifications');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        notificationsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar notificações do usuário no lado do cliente
      const userNotifications = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(notification => notification.recipientId === userId);
      
      return userNotifications;
      
    } catch (error) {
      // Se for erro de índice, usar array vazio
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando array vazio');
        return [];
      }
      
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  },

  // Marcar notificação como lida
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  // Marcar todas as notificações como lidas
  async markAllNotificationsAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        notificationsRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      // Filtrar notificações não lidas do usuário no lado do cliente
      const unreadNotifications = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.recipientId === userId && !data.read;
      });
      
      unreadNotifications.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      return true;
      
    } catch (error) {
      // Se for erro de índice, usar array vazio
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando array vazio');
        return true;
      }
      
      console.error('Erro ao marcar todas como lidas:', error);
      return false;
    }
  },

  // Deletar notificação
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  },

  // Limpar todas as notificações do usuário
  async clearAllNotifications(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      // Filtrar notificações do usuário no lado do cliente
      const userNotifications = querySnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.recipientId === userId;
      });
      
      userNotifications.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return true;
      
    } catch (error) {
      // Se for erro de índice, usar array vazio
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando array vazio');
        return true;
      }
      
      console.error('Erro ao limpar notificações:', error);
      return false;
    }
  },

  // Criar notificação de curtida
  async createLikeNotification(postId, postAuthorId, likerId, likerName) {
    if (postAuthorId === likerId) return; // Não notificar curtidas próprias
    
    try {
      await this.createNotification({
        type: 'like',
        title: 'Curtida no seu post',
        message: `${likerName} curtiu seu post`,
        recipientId: postAuthorId,
        senderId: likerId,
        senderName: likerName,
        postId: postId,
        actionUrl: `/post/${postId}`
      });
    } catch (error) {
      console.error('Erro ao criar notificação de curtida:', error);
    }
  },

  // Criar notificação de comentário
  async createCommentNotification(postId, postAuthorId, commenterId, commenterName, commentContent) {
    if (postAuthorId === commenterId) return; // Não notificar comentários próprios
    
    try {
      await this.createNotification({
        type: 'comment',
        title: 'Novo comentário',
        message: `${commenterName} comentou: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
        recipientId: postAuthorId,
        senderId: commenterId,
        senderName: commenterName,
        postId: postId,
        commentContent: commentContent,
        actionUrl: `/post/${postId}`
      });
    } catch (error) {
      console.error('Erro ao criar notificação de comentário:', error);
    }
  },

  // Criar notificação de novo seguidor
  async createFollowNotification(followerId, followerName, followedId) {
    try {
      await this.createNotification({
        type: 'follow',
        title: 'Novo seguidor',
        message: `${followerName} começou a te seguir`,
        recipientId: followedId,
        senderId: followerId,
        senderName: followerName,
        actionUrl: `/user-profile/${followerId}`
      });
    } catch (error) {
      console.error('Erro ao criar notificação de seguidor:', error);
    }
  }
};

// ===== SERVIÇOS DE COMENTÁRIOS =====

export const commentService = {
  // Adicionar comentário
  async addComment(postId, commentData) {
    try {
      const commentsRef = collection(db, 'comments');
      const docRef = await addDoc(commentsRef, {
        postId,
        ...commentData,
        createdAt: serverTimestamp(),
        likes: [],
        isHidden: false,
        isReported: false,
        reportedBy: [],
        reportReasons: []
      });
      
      // Atualizar contador de comentários no post
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        
        await updateDoc(postRef, {
          commentCount: increment(1)
        });
        
        // Criar notificação de comentário (se não for o próprio autor)
        if (postData.userId !== commentData.userId) {
          try {
            await notificationService.createCommentNotification(
              postId,
              postData.userId,
              commentData.userId,
              'Usuário', // TODO: Buscar nome real do usuário
              commentData.content
            );
          } catch (error) {
            console.warn('Erro ao criar notificação de comentário:', error);
          }
        }
      }
      
      return { success: true, commentId: docRef.id };
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  },

  // Editar comentário
  async editComment(commentId, newContent) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: newContent,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      throw error;
    }
  },

  // Deletar comentário
  async deleteComment(commentId) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();
        
        // Deletar o comentário
        await deleteDoc(commentRef);
        
        // Atualizar contador de comentários no post
        const postRef = doc(db, 'posts', commentData.postId);
        await updateDoc(postRef, {
          commentCount: increment(-1)
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      throw error;
    }
  },

  // Ocultar/Mostrar comentário
  async toggleCommentVisibility(commentId) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const currentHidden = commentDoc.data().isHidden || false;
        await updateDoc(commentRef, {
          isHidden: !currentHidden,
          updatedAt: serverTimestamp()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao alterar visibilidade do comentário:', error);
      throw error;
    }
  },

  // Reportar comentário
  async reportComment(commentId, reason) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();
        const reportedBy = commentData.reportedBy || [];
        const reportReasons = commentData.reportReasons || [];
        
        await updateDoc(commentRef, {
          isReported: true,
          reportedBy: [...reportedBy, auth.currentUser?.uid],
          reportReasons: [...reportReasons, reason],
          updatedAt: serverTimestamp()
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao reportar comentário:', error);
      throw error;
    }
  },

  // Curtir/Descurtir comentário
  async toggleCommentLike(commentId, userId) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();
        const likes = commentData.likes || [];
        const isLiked = likes.includes(userId);
        
        if (isLiked) {
          // Remover like
          await updateDoc(commentRef, {
            likes: likes.filter(id => id !== userId),
            updatedAt: serverTimestamp()
          });
        } else {
          // Adicionar like
          await updateDoc(commentRef, {
            likes: [...likes, userId],
            updatedAt: serverTimestamp()
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
      throw error;
    }
  },

  // Buscar comentários de um post
  async getPostComments(postId, limitCount = 50) {
    try {
      // Tenta usar Firebase primeiro
      const commentsRef = collection(db, 'comments');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        commentsRef,
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar comentários do post no lado do cliente
      const postComments = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(comment => comment.postId === postId);
      
      return postComments;
      
    } catch (error) {
      // Se for erro de índice, usar dados mockados
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando dados mockados');
        return mockComments
          .filter(comment => comment.postId === postId)
          .slice(0, limitCount);
      }
      
      // Para outros erros, logar e usar dados mockados
      console.warn('Erro ao buscar comentários do Firebase, usando dados mockados:', error);
      return mockComments
        .filter(comment => comment.postId === postId)
        .slice(0, limitCount);
    }
  }
};

// ===== SERVIÇOS DE SESSÕES DE TERAPIA =====

export const therapyService = {
  // Criar sessão de terapia
  async createTherapySession(sessionData) {
    try {
      const sessionsRef = collection(db, 'therapySessions');
      const docRef = await addDoc(sessionsRef, {
        ...sessionData,
        createdAt: serverTimestamp(),
        status: 'scheduled',
        updatedAt: serverTimestamp()
      });
      return { success: true, sessionId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar sessão de terapia:', error);
      throw error;
    }
  },

  // Buscar sessões do usuário
  async getUserTherapySessions(userId, role = 'client') {
    try {
      const sessionsRef = collection(db, 'therapySessions');
      
      // Consulta simples sem filtros complexos para evitar problemas de índice
      const q = query(
        sessionsRef,
        orderBy('scheduledAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Filtrar sessões do usuário no lado do cliente
      const userSessions = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(session => 
          (role === 'client' && session.clientId === userId) ||
          (role === 'therapist' && session.therapistId === userId)
        );
      
      return userSessions;
      
    } catch (error) {
      // Se for erro de índice, usar array vazio
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        console.warn('Índice não configurado no Firestore, usando array vazio');
        return [];
      }
      
      console.error('Erro ao buscar sessões de terapia:', error);
      return [];
    }
  },

  // Atualizar status da sessão
  async updateSessionStatus(sessionId, status, updates = {}) {
    try {
      const sessionRef = doc(db, 'therapySessions', sessionId);
      await updateDoc(sessionRef, {
        status,
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar status da sessão:', error);
      throw error;
    }
  },

  // Criar uma solicitação de sessão com status 'pending'
  async createSessionRequest(sessionRequestData) {
    try {
      const sessionRequestsRef = collection(db, 'sessionRequests');
      const docRef = await addDoc(sessionRequestsRef, {
        ...sessionRequestData,
        createdAt: serverTimestamp(),
        status: 'pending', // Status inicial da solicitação
        updatedAt: serverTimestamp()
      });
      return { success: true, requestId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar solicitação de sessão:', error);
      throw error;
    }
  },

  // Buscar solicitações de sessão para um psicólogo ou cliente
  async getSessionRequests(userId, role = 'client') {
    try {
      const sessionRequestsRef = collection(db, 'sessionRequests');
      let q;

      if (role === 'client') {
        q = query(sessionRequestsRef, where('clientId', '==', userId), orderBy('createdAt', 'desc'));
      } else if (role === 'psychologist') {
        q = query(sessionRequestsRef, where('psychologistId', '==', userId), orderBy('createdAt', 'desc'));
      } else {
        throw new Error('Função getSessionRequests: role inválido');
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar solicitações de sessão:', error);
      throw error;
    }
  },

  // Atualizar o status de uma solicitação de sessão (confirmar/rejeitar)
  async updateSessionRequestStatus(requestId, status, updates = {}) {
    try {
      const requestRef = doc(db, 'sessionRequests', requestId);
      await updateDoc(requestRef, {
        status,
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Se a solicitação for confirmada ou rejeitada, registrar no histórico do psicólogo
      if (status === 'confirmed' || status === 'rejected') {
        const requestDoc = await getDoc(requestRef);
        if (requestDoc.exists()) {
          const requestData = requestDoc.data();
          const psychologistId = requestData.psychologistId;
          const psychologistRef = doc(db, 'PsychologistAccount', psychologistId);
          
          await updateDoc(psychologistRef, {
            sessionHistory: arrayUnion({
              id: requestId,
              clientId: requestData.clientId,
              clientName: requestData.clientName,
              date: requestData.date,
              time: requestData.time,
              sessionType: requestData.sessionType,
              status: status,
              notes: requestData.notes || '',
              processedAt: serverTimestamp()
            })
          });
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar status da solicitação:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE CHAT =====

export const chatService = {
  // Enviar mensagem
  async sendMessage(chatData) {
    try {
      const messagesRef = collection(db, 'messages');
      const docRef = await addDoc(messagesRef, {
        ...chatData,
        createdAt: serverTimestamp(),
        read: false
      });
      return { success: true, messageId: docRef.id };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  // Buscar mensagens de um chat
  async getChatMessages(chatId, limitCount = 100) {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  },

  // Marcar mensagem como lida
  async markMessageAsRead(messageId) {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE DIÁRIO =====

export const diaryService = {
  // Criar entrada no diário
  async createDiaryEntry(entryData) {
    try {
      const diaryRef = collection(db, 'diaryEntries');
      const docRef = await addDoc(diaryRef, {
        ...entryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, entryId: docRef.id };
    } catch (error) {
      console.error('Erro ao criar entrada no diário:', error);
      throw error;
    }
  },

  // Buscar entradas do diário do usuário
  async getUserDiaryEntries(userId, limitCount = 50) {
    try {
      const diaryRef = collection(db, 'diaryEntries');
      
      // Primeiro, tentar com a consulta otimizada
      try {
        const q = query(
          diaryRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (indexError) {
        // Se der erro de índice, usar consulta simples e filtrar no cliente
        if (indexError.code === 'failed-precondition' || indexError.code === 'unimplemented') {
          console.warn('Índice não configurado no Firestore, usando consulta simples');
          
          const q = query(
            diaryRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount * 2) // Buscar mais para compensar a filtragem
          );
          const querySnapshot = await getDocs(q);
          
          // Filtrar por userId no lado do cliente
          const userEntries = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(entry => entry.userId === userId)
            .slice(0, limitCount);
          
          return userEntries;
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Erro ao buscar entradas do diário:', error);
      return []; // Retornar array vazio em caso de erro
    }
  },

  // Atualizar entrada do diário
  async updateDiaryEntry(entryId, updates) {
    try {
      const entryRef = doc(db, 'diaryEntries', entryId);
      await updateDoc(entryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar entrada do diário:', error);
      throw error;
    }
  },

  // Deletar entrada do diário
  async deleteDiaryEntry(entryId) {
    try {
      const entryRef = doc(db, 'diaryEntries', entryId);
      await deleteDoc(entryRef);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar entrada do diário:', error);
      throw error;
    }
  }
};

// ===== SERVIÇOS DE UPLOAD DE IMAGENS =====

export const imageUploadService = {
  // Upload de imagem para post
  async uploadPostImage(file, userId) {
    try {
      const { storage } = await import('../firebase');
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      
      // Validar arquivo
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }
      
      // Limitar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Imagem deve ter menos de 5MB');
      }
      
      // Criar nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `posts/${userId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload do arquivo
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        fileName: fileName,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw error;
    }
  },

  // Deletar imagem do storage
  async deletePostImage(fileName) {
    try {
      const { storage } = await import('../firebase');
      const { ref, deleteObject } = await import('firebase/storage');
      
      const imageRef = ref(storage, fileName);
      await deleteObject(imageRef);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      throw error;
    }
  },

  // Validar arquivo de imagem
  validateImageFile(file) {
    const errors = [];
    
    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      errors.push('Arquivo deve ser uma imagem');
    }
    
    // Verificar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('Imagem deve ter menos de 5MB');
    }
    
    // Verificar extensões permitidas
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push('Formato de imagem não suportado. Use: JPG, PNG, GIF ou WebP');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ===== FUNÇÕES UTILITÁRIAS =====

export const firebaseUtils = {
  // Converter timestamp do Firestore para Date
  convertTimestamp(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return timestamp;
  },

  // Formatar data para exibição
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const dateObj = date instanceof Date ? date : this.convertTimestamp(date);
    return dateObj.toLocaleDateString('pt-BR', { ...defaultOptions, ...options });
  },

  // Calcular tempo relativo (ex: "há 2 horas")
  getRelativeTime(date) {
    const now = new Date();
    const dateObj = date instanceof Date ? date : this.convertTimestamp(date);
    const diffInMs = now - dateObj;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return this.formatDate(dateObj, { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

// ===== SERVIÇOS DE AMIZADE =====

export const friendService = {
  async sendFriendRequest(senderId, senderName, senderPhotoURL, recipientId) {
    if (senderId === recipientId) {
      throw new Error("Não é possível enviar solicitação de amizade para si mesmo.");
    }

    const friendRequestsRef = collection(db, 'friendRequests');
    const q = query(
      friendRequestsRef,
      where('senderId', '==', senderId),
      where('recipientId', '==', recipientId),
      where('status', '==', 'pending')
    );
    const existingRequests = await getDocs(q);

    if (!existingRequests.empty) {
      throw new Error("Você já enviou uma solicitação de amizade para este usuário.");
    }

    const reverseQ = query(
      friendRequestsRef,
      where('senderId', '==', recipientId),
      where('recipientId', '==', senderId),
      where('status', '==', 'pending')
    );
    const reverseRequests = await getDocs(reverseQ);

    if (!reverseRequests.empty) {
      throw new Error("Este usuário já te enviou uma solicitação de amizade. Verifique suas solicitações.");
    }

    try {
      const docRef = await addDoc(friendRequestsRef, {
        senderId,
        senderName,
        senderPhotoURL: senderPhotoURL || null,
        recipientId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Opcional: Criar uma notificação para o destinatário
      await notificationService.createNotification({
        type: 'friend_request',
        recipientId,
        senderId,
        senderName,
        message: `${senderName} enviou uma solicitação de amizade.`, // Mensagem mais descritiva
        actionUrl: `/profile/${senderId}`, // Link para o perfil do remetente
        requestId: docRef.id // Adicionar o ID da solicitação de amizade
      });

      return { success: true, requestId: docRef.id };
    } catch (error) {
      console.error('Erro ao enviar solicitação de amizade:', error);
      throw error;
    }
  },

  async hasSentFriendRequest(senderId, recipientId) {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('senderId', '==', senderId),
        where('recipientId', '==', recipientId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { exists: true, requestId: querySnapshot.docs[0].id };
      }
      return { exists: false, requestId: null };
    } catch (error) {
      console.error('Erro ao verificar se solicitação foi enviada:', error);
      throw error;
    }
  },

  async hasReceivedFriendRequest(senderId, recipientId) {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('senderId', '==', senderId),
        where('recipientId', '==', recipientId),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { exists: true, requestId: querySnapshot.docs[0].id };
      }
      return { exists: false, requestId: null };
    } catch (error) {
      console.error('Erro ao verificar se solicitação foi recebida:', error);
      throw error;
    }
  },

  async acceptFriendRequest(requestId, currentUserId) {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Solicitação de amizade não encontrada.");
    }

    const requestData = requestDoc.data();
    if (requestData.recipientId !== currentUserId) {
      throw new Error("Você não tem permissão para aceitar esta solicitação.");
    }
    if (requestData.status !== 'pending') {
      throw new Error("Esta solicitação não está mais pendente.");
    }

    const batch = writeBatch(db);

    // 1. Atualizar status da solicitação para 'accepted'
    batch.update(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    // 2. Adicionar usuários como amigos um do outro (no perfil de ambos)
    const senderProfileRef = doc(db, 'users', requestData.senderId);
    const recipientProfileRef = doc(db, 'users', requestData.recipientId);

    batch.update(senderProfileRef, {
      friends: arrayUnion(requestData.recipientId)
    });
    batch.update(recipientProfileRef, {
      friends: arrayUnion(requestData.senderId)
    });

    try {
      await batch.commit();

      // Opcional: Criar notificação para o remetente
      await notificationService.createNotification({
        type: 'friend_accepted',
        recipientId: requestData.senderId,
        senderId: currentUserId,
        senderName: (await userService.getUserProfile(currentUserId))?.displayName || 'Um usuário',
        message: `${(await userService.getUserProfile(currentUserId))?.displayName || 'Um usuário'} aceitou sua solicitação de amizade.`, // Mensagem mais descritiva
        actionUrl: `/user-profile/${currentUserId}`
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao aceitar solicitação de amizade:', error);
      throw error;
    }
  },

  async rejectFriendRequest(requestId, currentUserId) {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Solicitação de amizade não encontrada.");
    }

    const requestData = requestDoc.data();
    if (requestData.recipientId !== currentUserId) {
      throw new Error("Você não tem permissão para rejeitar esta solicitação.");
    }
    if (requestData.status !== 'pending') {
      throw new Error("Esta solicitação não está mais pendente.");
    }

    try {
      await updateDoc(requestRef, {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Erro ao rejeitar solicitação de amizade:', error);
      throw error;
    }
  },

  async cancelFriendRequest(requestId) {
    try {
      const requestRef = doc(db, 'friendRequests', requestId);
      await deleteDoc(requestRef);
      return { success: true };
    } catch (error) {
      console.error('Erro ao cancelar solicitação de amizade:', error);
      throw error;
    }
  },

  async getPendingFriendRequests(userId) {
    try {
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('recipientId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar solicitações de amizade pendentes:', error);
      return [];
    }
  },

  async getFriends(userId) {
    try {
      const userProfile = await userService.getUserProfile(userId);
      if (!userProfile || !userProfile.friends || userProfile.friends.length === 0) {
        return [];
      }

      const friendUids = userProfile.friends;
      const friendsData = [];

      for (const friendUid of friendUids) {
        const friendProfile = await userService.getUserProfile(friendUid);
        if (friendProfile) {
          friendsData.push({
            uid: friendProfile.uid,
            displayName: friendProfile.displayName || 'Usuário Sereno',
            photoURL: friendProfile.photoURL || null,
            lastSeen: firebaseUtils.convertTimestamp(friendProfile.lastSeen) || null,
            // Adicione outros campos que você definiu na interface Friend
          });
        }
      }
      return friendsData;
    } catch (error) {
      console.error('Erro ao buscar lista de amigos:', error);
      return [];
    }
  },

  async isFriend(userId1, userId2) {
    try {
      const user1Profile = await userService.getUserProfile(userId1);
      return user1Profile?.friends?.includes(userId2) || false;
    } catch (error) {
      console.error('Erro ao verificar amizade:', error);
      return false;
    }
  },

  async searchUsers(searchTerm, currentUserId) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return [];
      }

      const usersRef = collection(db, 'users');
      const searchQuery = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(10) // Limita o número de resultados para otimização
      );

      const querySnapshot = await getDocs(searchQuery);
      const usersFound = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUserId); // Excluir o próprio usuário

      return usersFound;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
};

export default {
  userService,
  postService,
  groupService,
  moodService,
  notificationService,
  commentService,
  therapyService,
  chatService,
  diaryService,
  imageUploadService,
  firebaseUtils
};
