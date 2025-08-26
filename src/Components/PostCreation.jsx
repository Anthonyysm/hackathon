import React, { useState } from 'react';
import { Globe, EyeOff } from 'lucide-react';

const PostCreation = () => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [postText, setPostText] = useState('');

  const moods = [
    { emoji: '😊', label: 'Feliz', value: 'happy' },
    { emoji: '😔', label: 'Triste', value: 'sad' },
    { emoji: '😡', label: 'Irritado', value: 'angry' },
    { emoji: '😰', label: 'Ansioso', value: 'anxious' },
    { emoji: '😌', label: 'Calmo', value: 'calm' },
    { emoji: '😴', label: 'Cansado', value: 'tired' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
      <div className="space-y-4">
        {/* Post Input */}
        <textarea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Compartilhe o que está sentindo hoje..."
          className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 min-h-[120px]"
        />

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
          <button className="bg-gradient-to-r from-white to-gray-200 text-black px-8 py-3 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:transform-none">
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCreation;