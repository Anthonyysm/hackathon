import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../hooks/usePosts';
import { Image, Hash, Eye, EyeOff, Send, X, Trash2, Upload } from 'lucide-react';

const PostCreation = ({ onPostCreated, onCancel, isModal = false }) => {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public'); // public, private
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // const [selectedImage, setSelectedImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);
  // const [isUploadingImage, setIsUploadingImage] = useState(false);
  // const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Por favor, escreva algo para postar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        content: content.trim(),
        tags: tags.trim() ? tags.trim().split(',').map(tag => tag.trim().replace('#', '')) : [],
        visibility: visibility,
        userId: user.uid,
        author: user.displayName || user.email || 'Usuário',
        avatar: user.photoURL || (
          user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()
        ),
        image: null 
      };

      const success = await createPost(postData);
      
      if (success) {
        // Limpar formulário
        setContent('');
        setTags('');
        setVisibility('public');
        // setSelectedImage(null); // This line is removed
        // setImagePreview(null); // This line is removed
        
        // Chamar callback se fornecido
        if (onPostCreated) {
          onPostCreated(postData);
        }
      }
    } catch (err) {
      setError('Erro ao criar post. Tente novamente.');
      console.error('Erro ao criar post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility);
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public':
        return <Eye className="w-4 h-4" />;
      case 'private':
        return <EyeOff className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'public':
        return 'Público';
      case 'private':
        return 'Privado';
      default:
        return 'Público';
    }
  };

  const getVisibilityDescription = () => {
    switch (visibility) {
      case 'public':
        return 'Todos podem ver este post';
      case 'private':
        return 'Apenas você pode ver este post';
      default:
        return 'Todos podem ver este post';
    }
  };

  return (
    <div className={`${isModal ? '' : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6'}`}>
      {!isModal && (
        <h3 className="text-xl font-semibold text-white mb-4">Compartilhe algo...</h3>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que você gostaria de compartilhar hoje?"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white/50">
              {content.length}/500 caracteres
            </span>
          </div>
        </div>

        {/* Image Preview */}
        {/* {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview da imagem"
              className="w-full max-h-64 object-cover rounded-lg border border-white/20"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
              aria-label="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )} */}

        {/* Tags Input */}
        <div>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Adicione tags (separadas por vírgula)"
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
            />
          </div>
          <p className="text-xs text-white/50 mt-1">
            Ex: ansiedade, terapia, bem-estar
          </p>
        </div>

        {/* Visibility Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80">
            Visibilidade do Post
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'public', label: 'Público', icon: <Eye className="w-4 h-4" /> },
              { value: 'private', label: 'Privado', icon: <EyeOff className="w-4 h-4" /> }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleVisibilityChange(option.value)}
                className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center space-y-2 ${
                  visibility === option.value
                    ? 'border-white/50 bg-white/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {option.icon}
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          
          <p className="text-xs text-white/60">
            {getVisibilityDescription()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            {/* Image Upload Button */}
            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full transition-all duration-200 ${
                // selectedImage 
                //   ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' 
                //   : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              disabled={isSubmitting} // Changed from isUploadingImage to isSubmitting
              title="Adicionar imagem"
            >
              {/* {isUploadingImage ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : selectedImage ? (
                <Image className="w-5 h-5" />
              ) : (
                <Upload className="w-5 h-5" />
              )} */}
            {/* </button> */}
            
            {/* <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              disabled={isSubmitting} // Changed from isUploadingImage to isSubmitting
            /> */}
            
            {/* Remove Image Button */}
            {/* {selectedImage && ( // This block is removed
              <button
                type="button"
                onClick={removeImage}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full transition-all duration-200"
                disabled={isSubmitting || isUploadingImage}
                title="Remover imagem"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )} */}
          </div>

          <div className="flex items-center space-x-3">
            {isModal && onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                disabled={isSubmitting} // Changed from isUploadingImage to isSubmitting
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()} // Changed from isUploadingImage to isSubmitting
              className="px-6 py-2 bg-white text-black rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:bg-white/30 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>{isSubmitting ? 'Postando...' : 'Postar'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Postar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostCreation;