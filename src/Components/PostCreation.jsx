import React, { useState, useCallback } from 'react';
import { Globe, EyeOff, Image as ImageIcon, X, Send, Hash, Smile, Plus } from 'lucide-react';
import Card from './ui/Card';
import Input from './ui/Input';
import ErrorMessage from './ui/ErrorMessage';

const PostCreation = ({ onPostCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Feliz', value: 'happy', color: 'from-green-400 to-green-600' },
    { emoji: '😔', label: 'Triste', value: 'sad', color: 'from-blue-400 to-blue-600' },
    { emoji: '😡', label: 'Irritado', value: 'angry', color: 'from-red-400 to-red-600' },
    { emoji: '😰', label: 'Ansioso', value: 'anxious', color: 'from-yellow-400 to-yellow-600' },
    { emoji: '😌', label: 'Calmo', value: 'calm', color: 'from-purple-400 to-purple-600' },
    { emoji: '😴', label: 'Cansado', value: 'tired', color: 'from-gray-400 to-gray-600' },
    { emoji: '🤗', label: 'Agradecido', value: 'grateful', color: 'from-pink-400 to-pink-600' },
    { emoji: '😤', label: 'Determinado', value: 'determined', color: 'from-orange-400 to-orange-600' }
  ];

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('A imagem deve ter menos de 10MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Formato de imagem não suportado. Use JPEG, PNG, GIF ou WebP');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const addTag = useCallback((tag) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  }, [tags]);

  const removeTag = useCallback((tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleTagInputKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  }, [tagInput, addTag]);

  const handleSubmit = useCallback(async () => {
    if (!postText.trim()) {
      setError('Por favor, escreva algo antes de postar');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      // Simulação de API call - substitua pela sua lógica de backend
      const postData = {
        text: postText.trim(),
        isAnonymous,
        selectedMood,
        tags,
        image: selectedImage,
        timestamp: new Date().toISOString()
      };

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Chamar callback se fornecido
      if (onPostCreated) {
        onPostCreated(postData);
      }

      // Reset form
      setPostText('');
      setSelectedMood('');
      setTags([]);
      setSelectedImage(null);
      setImagePreview(null);
      setIsAnonymous(false);
      
      // Ocultar o formulário após criar o post
      setShowForm(false);
    } catch (error) {
      setError('Erro ao criar post. Tente novamente.');
    } finally {
      setIsPosting(false);
    }
  }, [postText, isAnonymous, selectedMood, tags, selectedImage, onPostCreated]);

  const resetForm = useCallback(() => {
    setPostText('');
    setSelectedMood('');
    setTags([]);
    setSelectedImage(null);
    setImagePreview(null);
    setIsAnonymous(false);
    setError('');
    setShowForm(false);
  }, []);

  // Se o formulário não estiver visível, mostrar apenas o botão
  if (!showForm) {
    return (
      <Card variant="glass" padding="lg" hover className="mb-8">
        <Card.Content className="text-center py-8">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-3 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black group"
          >
            <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-medium">Criar Novo Post</span>
          </button>
          <p className="text-white/60 mt-3 text-sm">
            Compartilhe seus pensamentos, sentimentos ou experiências com a comunidade
          </p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="lg" hover className="mb-8">
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <Card.Title>Criar Novo Post</Card.Title>
            <Card.Description>
              Compartilhe seus pensamentos, sentimentos ou experiências com a comunidade
            </Card.Description>
          </div>
          <button
            onClick={resetForm}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </Card.Header>

      <Card.Content>
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            variant="destructive"
            dismissible
            onDismiss={() => setError('')}
            className="mb-4"
          />
        )}

        {/* Post Text Input */}
        <div className="mb-6">
          <Input
            as="textarea"
            placeholder="O que você gostaria de compartilhar hoje?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            variant="glass"
            size="lg"
            className="min-h-[120px] resize-none"
            label="Seu post"
            helperText="Seja autêntico e respeitoso com a comunidade"
          />
        </div>

        {/* Mood Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Como você está se sentindo?
          </label>
          <div className="grid grid-cols-4 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black ${
                  selectedMood === mood.value
                    ? 'border-white/50 bg-white/10'
                    : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                }`}
                aria-label={`Selecionar humor: ${mood.label}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-white/70">{mood.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Adicionar imagem (opcional)
          </label>
          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/30 transition-colors">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg mx-auto"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Remover imagem"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div>
                <ImageIcon className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 mb-3">
                  Clique para selecionar uma imagem
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Selecionar Imagem
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Tags Input */}
        <div className="mb-6">
          <Input
            placeholder="Adicionar tags (pressione Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagInputKeyPress}
            variant="glass"
            size="default"
            label="Tags"
            helperText="Adicione até 5 tags para categorizar seu post"
            rightIcon={Hash}
            onRightIconClick={() => addTag(tagInput)}
          />
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 p-0.5 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={`Remover tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-white/50"
            />
            <div className="flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/70">Postar anonimamente</span>
            </div>
          </label>
        </div>
      </Card.Content>

      <Card.Footer>
        <button
          onClick={handleSubmit}
          disabled={isPosting || !postText.trim()}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
          aria-label={isPosting ? 'Criando post...' : 'Criar post'}
        >
          {isPosting ? (
            <>
              <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              <span>Criando...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Publicar Post</span>
            </>
          )}
        </button>
      </Card.Footer>
    </Card>
  );
};

export default PostCreation;