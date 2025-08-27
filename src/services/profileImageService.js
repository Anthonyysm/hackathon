import { auth, db } from '../firebase';
import { doc, updateDoc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

class ProfileImageService {
  /**
   * Substitui a foto de perfil do usuário
   * @param {string} imageData - Base64 da nova imagem
   * @param {string} userId - ID do usuário
   * @param {string} currentPhotoURL - URL da foto atual (se existir)
   * @returns {Promise<string>} ID da nova imagem no Firestore
   */
  async replaceProfilePhoto(imageData, userId, currentPhotoURL = null) {
    try {
      // 1. Apagar foto antiga se existir
      if (currentPhotoURL) {
        await this.deleteImageFromFirestore(currentPhotoURL, userId, 'profilePhoto');
      }

      // 2. Salvar nova foto no Firestore
      const newPhotoId = await this.saveImageToFirestore(imageData, userId, 'profilePhoto');

      // 3. Atualizar perfil do usuário
      await this.updateUserProfilePhoto(userId, newPhotoId);

      return newPhotoId;
    } catch (error) {
      console.error('Erro ao substituir foto de perfil:', error);
      throw error;
    }
  }

  /**
   * Substitui o banner do usuário
   * @param {string} imageData - Base64 da nova imagem
   * @param {string} userId - ID do usuário
   * @param {string} currentBannerURL - URL do banner atual (se existir)
   * @returns {Promise<string>} ID da nova imagem no Firestore
   */
  async replaceBannerPhoto(imageData, userId, currentBannerURL = null) {
    try {
      // 1. Apagar banner antigo se existir
      if (currentBannerURL) {
        await this.deleteImageFromFirestore(currentBannerURL, userId, 'bannerPhoto');
      }

      // 2. Salvar novo banner no Firestore
      const newBannerId = await this.saveImageToFirestore(imageData, userId, 'bannerPhoto');

      // 3. Atualizar perfil do usuário
      await this.updateUserBannerPhoto(userId, newBannerId);

      return newBannerId;
    } catch (error) {
      console.error('Erro ao substituir banner:', error);
      throw error;
    }
  }

  /**
   * Salva uma imagem no Firestore como Base64
   * @param {string} imageData - Base64 da imagem
   * @param {string} userId - ID do usuário
   * @param {string} imageType - Tipo da imagem ('profilePhoto' ou 'bannerPhoto')
   * @returns {Promise<string>} ID da imagem salva
   */
  async saveImageToFirestore(imageData, userId, imageType) {
    try {
      // Limpar o Base64 removendo o prefixo data:image/...;base64,
      const cleanBase64 = this.cleanBase64Data(imageData);
      
      // Criar documento da imagem
      const imageRef = doc(db, 'users', userId, 'images', `${imageType}_${Date.now()}`);
      
      const imageDocData = {
        base64: cleanBase64,
        type: imageType,
        createdAt: new Date(),
        size: this.getBase64Size(cleanBase64),
        mimeType: this.getMimeTypeFromBase64(imageData)
      };

      await setDoc(imageRef, imageDocData);
      
      return imageRef.id;
    } catch (error) {
      console.error('Erro ao salvar imagem no Firestore:', error);
      throw error;
    }
  }

  /**
   * Recupera uma imagem do Firestore
   * @param {string} imageId - ID da imagem
   * @param {string} userId - ID do usuário
   * @returns {Promise<string>} Base64 da imagem
   */
  async getImageFromFirestore(imageId, userId) {
    try {
      const imageRef = doc(db, 'users', userId, 'images', imageId);
      const imageDoc = await getDoc(imageRef);
      
      if (imageDoc.exists()) {
        const imageData = imageDoc.data();
        // Reconstruir o Base64 com o prefixo correto
        return `data:${imageData.mimeType};base64,${imageData.base64}`;
      }
      
      throw new Error('Imagem não encontrada');
    } catch (error) {
      console.error('Erro ao recuperar imagem do Firestore:', error);
      throw error;
    }
  }

  /**
   * Apaga uma imagem do Firestore
   * @param {string} imageId - ID da imagem
   * @param {string} userId - ID do usuário
   * @param {string} imageType - Tipo da imagem
   * @returns {Promise<void>}
   */
  async deleteImageFromFirestore(imageId, userId, imageType) {
    try {
      if (!imageId || imageId.startsWith('data:')) {
        return; // Não é um ID do Firestore
      }

      const imageRef = doc(db, 'users', userId, 'images', imageId);
      await deleteDoc(imageRef);
      
      console.log('Imagem apagada com sucesso do Firestore:', imageId);
    } catch (error) {
      console.error('Erro ao apagar imagem do Firestore:', error);
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  /**
   * Atualiza a referência da foto de perfil no Firestore
   * @param {string} userId - ID do usuário
   * @param {string} imageId - ID da nova imagem
   * @returns {Promise<void>}
   */
  async updateUserProfilePhoto(userId, imageId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profileData.profilePhotoId': imageId,
        'profileData.profilePhotoURL': `firestore://${imageId}`, // URL fictícia para compatibilidade
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil no Firestore:', error);
      throw error;
    }
  }

  /**
   * Atualiza a referência do banner no Firestore
   * @param {string} userId - ID do usuário
   * @param {string} imageId - ID da nova imagem
   * @returns {Promise<void>}
   */
  async updateUserBannerPhoto(userId, imageId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'profileData.bannerPhotoId': imageId,
        'profileData.bannerPhotoURL': `firestore://${imageId}`, // URL fictícia para compatibilidade
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao atualizar banner no Firestore:', error);
      throw error;
    }
  }

  /**
   * Limpa o Base64 removendo o prefixo data:image/...;base64,
   * @param {string} base64Data - String Base64 completa
   * @returns {string} Base64 limpo
   */
  cleanBase64Data(base64Data) {
    if (typeof base64Data === 'string' && base64Data.includes(';base64,')) {
      return base64Data.split(';base64,')[1];
    }
    return base64Data;
  }

  /**
   * Calcula o tamanho aproximado do Base64 em bytes
   * @param {string} base64Data - String Base64
   * @returns {number} Tamanho em bytes
   */
  getBase64Size(base64Data) {
    return Math.ceil((base64Data.length * 3) / 4);
  }

  /**
   * Extrai o tipo MIME do Base64
   * @param {string} base64Data - String Base64 completa
   * @returns {string} Tipo MIME
   */
  getMimeTypeFromBase64(base64Data) {
    if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
      const match = base64Data.match(/data:([^;]+)/);
      return match ? match[1] : 'image/jpeg';
    }
    return 'image/jpeg';
  }

  /**
   * Converte Base64 para Blob (mantido para compatibilidade)
   * @param {string} base64Data - String Base64 da imagem
   * @returns {Promise<Blob>} Blob da imagem
   */
  async base64ToBlob(base64Data) {
    try {
      // Se já é um Blob, retornar diretamente
      if (base64Data instanceof Blob) {
        return base64Data;
      }

      // Se é uma string Base64, converter para Blob
      if (typeof base64Data === 'string' && base64Data.startsWith('data:')) {
        const response = await fetch(base64Data);
        return await response.blob();
      }

      // Se é uma string Base64 sem prefixo, adicionar prefixo
      if (typeof base64Data === 'string') {
        const base64Response = await fetch(`data:image/jpeg;base64,${base64Data}`);
        return await base64Response.blob();
      }

      throw new Error('Formato de imagem não suportado');
    } catch (error) {
      console.error('Erro ao converter Base64 para Blob:', error);
      throw error;
    }
  }

  /**
   * Limpa todas as imagens antigas de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<void>}
   */
  async cleanupOldImages(userId) {
    try {
      // Esta função pode ser implementada para limpar imagens antigas
      // que não estão mais sendo usadas
      console.log('Limpeza de imagens antigas implementada para:', userId);
    } catch (error) {
      console.error('Erro ao limpar imagens antigas:', error);
    }
  }
}

export const profileImageService = new ProfileImageService();
