import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const cleanupService = {
  // Limpar posts anônimos antigos (mais de 24 horas)
  async cleanupAnonymousPosts() {
    try {
      const postsRef = collection(db, 'posts');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Buscar posts anônimos criados há mais de 24 horas
      const q = query(
        postsRef,
        where('isAnonymous', '==', true),
        where('createdAt', '<', twentyFourHoursAgo)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Nenhum post anônimo antigo encontrado para limpeza');
        return { deletedCount: 0 };
      }
      
      // Deletar posts e comentários relacionados
      const deletePromises = querySnapshot.docs.map(async (postDoc) => {
        const postId = postDoc.id;
        
        // Deletar comentários relacionados
        const commentsRef = collection(db, 'comments');
        const commentsQuery = query(commentsRef, where('postId', '==', postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const commentDeletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(commentDeletePromises);
        
        // Deletar o post
        await deleteDoc(postDoc.ref);
        
        return postId;
      });
      
      const deletedPostIds = await Promise.all(deletePromises);
      
      console.log(`Limpeza concluída: ${deletedPostIds.length} posts anônimos antigos foram deletados`);
      
      return { 
        deletedCount: deletedPostIds.length,
        deletedPostIds 
      };
      
    } catch (error) {
      console.error('Erro durante limpeza de posts anônimos:', error);
      throw error;
    }
  },

  // Limpar posts privados antigos (mais de 7 dias)
  async cleanupPrivatePosts() {
    try {
      const postsRef = collection(db, 'posts');
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Buscar posts privados criados há mais de 7 dias
      const q = query(
        postsRef,
        where('visibility', '==', 'private'),
        where('createdAt', '<', sevenDaysAgo)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('Nenhum post privado antigo encontrado para limpeza');
        return { deletedCount: 0 };
      }
      
      // Deletar posts e comentários relacionados
      const deletePromises = querySnapshot.docs.map(async (postDoc) => {
        const postId = postDoc.id;
        
        // Deletar comentários relacionados
        const commentsRef = collection(db, 'comments');
        const commentsQuery = query(commentsRef, where('postId', '==', postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        
        const commentDeletePromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(commentDeletePromises);
        
        // Deletar o post
        await deleteDoc(postDoc.ref);
        
        return postId;
      });
      
      const deletedPostIds = await Promise.all(deletePromises);
      
      console.log(`Limpeza concluída: ${deletedPostIds.length} posts privados antigos foram deletados`);
      
      return { 
        deletedCount: deletedPostIds.length,
        deletedPostIds 
      };
      
    } catch (error) {
      console.error('Erro durante limpeza de posts privados:', error);
      throw error;
    }
  },

  // Executar todas as limpezas
  async runAllCleanups() {
    try {
      console.log('Iniciando processo de limpeza...');
      
      const [anonymousResult, privateResult] = await Promise.all([
        this.cleanupAnonymousPosts(),
        this.cleanupPrivatePosts()
      ]);
      
      const totalDeleted = anonymousResult.deletedCount + privateResult.deletedCount;
      
      console.log(`Limpeza completa: ${totalDeleted} posts foram deletados`);
      
      return {
        anonymousPosts: anonymousResult,
        privatePosts: privateResult,
        totalDeleted
      };
      
    } catch (error) {
      console.error('Erro durante processo de limpeza:', error);
      throw error;
    }
  }
};

// Executar limpeza automaticamente a cada hora
if (typeof window !== 'undefined') {
  // Apenas no navegador
  setInterval(() => {
    cleanupService.runAllCleanups().catch(error => {
      console.error('Erro na limpeza automática:', error);
    });
  }, 60 * 60 * 1000); // A cada hora
  
  // Executar limpeza inicial após 5 minutos
  setTimeout(() => {
    cleanupService.runAllCleanups().catch(error => {
      console.error('Erro na limpeza inicial:', error);
    });
  }, 5 * 60 * 1000); // Após 5 minutos
}
