import { useState, useEffect, useCallback } from 'react';
import { profileImageService } from '../services/profileImageService';

export const useImages = (userId) => {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [bannerPhoto, setBannerPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para carregar uma imagem específica
  const loadImage = useCallback(async (imageId, imageType) => {
    if (!imageId || !userId) return null;
    
    try {
      const imageData = await profileImageService.getImageFromFirestore(imageId, userId);
      return imageData;
    } catch (error) {
      console.error(`Erro ao carregar ${imageType}:`, error);
      return null;
    }
  }, [userId]);

  // Função para carregar todas as imagens do usuário
  const loadUserImages = useCallback(async (profileData) => {
    if (!userId || !profileData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const promises = [];
      
      // Carregar foto de perfil
      if (profileData.profilePhotoId) {
        promises.push(
          loadImage(profileData.profilePhotoId, 'profilePhoto')
            .then(data => ({ type: 'profilePhoto', data }))
        );
      }
      
      // Carregar banner
      if (profileData.bannerPhotoId) {
        promises.push(
          loadImage(profileData.bannerPhotoId, 'bannerPhoto')
            .then(data => ({ type: 'bannerPhoto', data }))
        );
      }
      
      const results = await Promise.all(promises);
      
      results.forEach(({ type, data }) => {
        if (type === 'profilePhoto') {
          setProfilePhoto(data);
        } else if (type === 'bannerPhoto') {
          setBannerPhoto(data);
        }
      });
      
    } catch (error) {
      console.error('Erro ao carregar imagens do usuário:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, loadImage]);

  // Função para atualizar uma imagem específica
  const updateImage = useCallback(async (imageData, imageType, currentImageId = null) => {
    if (!userId) return null;
    
    try {
      let newImageId;
      
      if (imageType === 'profilePhoto') {
        newImageId = await profileImageService.replaceProfilePhoto(imageData, userId, currentImageId);
        // Recarregar a imagem atualizada
        const updatedImage = await loadImage(newImageId, imageType);
        setProfilePhoto(updatedImage);
      } else if (imageType === 'bannerPhoto') {
        newImageId = await profileImageService.replaceBannerPhoto(imageData, userId, currentImageId);
        // Recarregar a imagem atualizada
        const updatedImage = await loadImage(newImageId, imageType);
        setBannerPhoto(updatedImage);
      }
      
      return newImageId;
    } catch (error) {
      console.error(`Erro ao atualizar ${imageType}:`, error);
      throw error;
    }
  }, [userId, loadImage]);

  // Função para limpar cache das imagens
  const clearImages = useCallback(() => {
    setProfilePhoto(null);
    setBannerPhoto(null);
    setError(null);
  }, []);

  return {
    profilePhoto,
    bannerPhoto,
    loading,
    error,
    loadUserImages,
    updateImage,
    clearImages
  };
};
