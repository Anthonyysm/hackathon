import React, { useState } from 'react';
import { BookOpen, Send, ChevronRight } from 'lucide-react';

const InteractiveDiary = () => {
  const [diaryEntry, setDiaryEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const prompts = [
    "Como você se sentiu hoje?",
    "Qual foi o melhor momento do seu dia?",
    "O que você gostaria de melhorar amanhã?",
    "Por que você está grato hoje?",
    "Que desafio você enfrentou hoje?"
  ];

  const recentEntries = [
    {
      date: "Hoje",
      preview: "Hoje foi um dia desafiador, mas consegui...",
      mood: "😌"
    },
    {
      date: "Ontem",
      preview: "Me senti mais confiante durante a apresentação...",
      mood: "😊"
    },
    {
      date: "2 dias atrás",
      preview: "Pratiquei meditação pela manhã e isso me ajudou...",
      mood: "😌"
    }
  ];

  return (
    <div className="space-y-6 animation-initial animate-fade-in-up animation-delay-100">
      {/* Diary Writing */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Diário Interativo</h2>
        </div>

        {/* Prompts */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-3">Escolha uma reflexão para começar:</p>
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedPrompt === prompt
                    ? 'bg-white/10 border border-white/20 text-white'
                    : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-300'
                }`}
              >
                <span className="text-sm">{prompt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Writing Area */}
        <div className="space-y-4">
          {selectedPrompt && (
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="text-gray-300 text-sm font-medium">{selectedPrompt}</p>
            </div>
          )}
          
          <textarea
            value={diaryEntry}
            onChange={(e) => setDiaryEntry(e.target.value)}
            placeholder="Escreva seus pensamentos e sentimentos aqui..."
            className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 min-h-[120px]"
          />
          
          <div className="flex justify-end">
            <button className="bg-gradient-to-r from-white to-gray-200 text-black px-6 py-2 rounded-lg font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Salvar Reflexão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Reflexões Recentes</h3>
        <div className="space-y-3">
          {recentEntries.map((entry, index) => (
            <button
              key={index}
              className="w-full bg-white/5 border border-gray-200/20 rounded-lg p-4 hover:bg-white/10 hover:border-gray-300/20 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{entry.mood}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{entry.date}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{entry.preview}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDiary;