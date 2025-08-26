import React, { useState } from 'react';
import { Globe, EyeOff, Image as ImageIcon, X, Send } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const PostCreation = ({ onPostCreated }) => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const moods = [
    { emoji: '😊', label: 'Feliz', value: 'happy' },
    { emoji: '😔', label: 'Triste', value: 'sad' },
    { emoji: '😡', label: 'Irritado', value: 'angry' },
    { emoji: '😰', label: 'Ansioso', value: 'anxious' },
    { emoji: '😌', label: 'Calmo', value: 'calm' },
    { emoji: '😴', label: 'Cansado', value: 'tired' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('A imagem deve ter menos de 5MB');
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
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!postText.trim()) {
      setError('Por favor, escreva algo para compartilhar');
      return;
    }

    if (!auth.currentUser) {
      setError('Você precisa estar logado para criar um post');
      return;
    }

    setIsPosting(true);
    setError('');

    try {
      let imageUrl = null;
      
      // TODO: Implement image upload to Firebase Storage
      if (selectedImage) {
        // Simulate upload for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        imageUrl = 'https://via.placeholder.com/400x300'; // Placeholder
      }

      // Fetch author display name if not anonymous
      let authorName = 'Usuário';
      if (!isAnonymous) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            authorName = snap.data().displayName || authorName;
          }
        } catch {}
      }

      const postData = {
        userId: auth.currentUser.uid,
        author: authorName,
        content: postText.trim(),
        mood: selectedMood ? { emoji: '🙂', label: selectedMood } : undefined,
        isAnonymous,
        image: imageUrl,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Reset form
      setPostText('');
      setSelectedMood('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated({
          id: docRef.id,
          ...postData
        });
      }
      
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Erro ao criar post. Tente novamente.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Post Input */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Compartilhe o que está sentindo hoje..."
          className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 min-h-[120px]"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Privacy Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAnonymous(false)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                !isAnonymous
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Público</span>
            </button>
            <button
              onClick={() => setIsAnonymous(true)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isAnonymous
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>Anônimo</span>
            </button>
          </div>

          {/* Image Upload */}
          <label className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/30 hover:bg-gray-700/30 text-gray-300 hover:text-white transition-all duration-200 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <ImageIcon className="w-4 h-4" />
            <span>Imagem</span>
          </label>
        </div>

        {/* Mood Selector */}
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Como você está se sentindo?</p>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`flex flex-col items-center space-y-1 p-3 rounded-xl transition-all duration-200 min-w-[70px] ${
                  selectedMood === mood.value
                    ? 'bg-white/10 border border-white/20 scale-105'
                    : 'bg-gray-800/30 hover:bg-gray-700/30 hover:scale-105'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs text-gray-400">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isPosting || !postText.trim()}
            className="bg-gradient-to-r from-white to-gray-200 text-black px-8 py-3 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
          >
            {isPosting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Postando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCreation;