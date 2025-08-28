import React, { useState, useEffect } from 'react';
import { BookOpen, Send, ChevronRight, Edit, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { diaryService, firebaseUtils } from '../services/firebaseService';

const InteractiveDiary = () => {
  const { user } = useAuth();
  const [diaryEntry, setDiaryEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editContent, setEditContent] = useState('');

  const prompts = [
    "Como você se sentiu hoje?",
    "Qual foi o melhor momento do seu dia?",
    "O que você gostaria de melhorar amanhã?",
    "Por que você está grato hoje?",
    "Que desafio você enfrentou hoje?"
  ];

  // Carregar entradas existentes
  useEffect(() => {
    if (user) {
      loadDiaryEntries();
    }
  }, [user]);

  const loadDiaryEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const entries = await diaryService.getUserDiaryEntries(user.uid, 20);
      setRecentEntries(entries);
    } catch (error) {
      console.error('Erro ao carregar entradas do diário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!diaryEntry.trim() || !selectedPrompt || !user) return;
    
    try {
      setLoading(true);
      
      const entryData = {
        userId: user.uid,
        prompt: selectedPrompt,
        content: diaryEntry.trim(),
        userName: user.displayName || 'Usuário',
        userEmail: user.email
      };

      await diaryService.createDiaryEntry(entryData);
      
      // Recarregar entradas
      await loadDiaryEntries();
      
      // Limpar formulário
      setDiaryEntry('');
      setSelectedPrompt('');
      
      // Feedback visual
      const saveButton = document.querySelector('[data-save-entry]');
      if (saveButton) {
        saveButton.innerHTML = '<Check className="w-4 h-4" /><span>Salvo!</span>';
        setTimeout(() => {
          saveButton.innerHTML = '<Send className="w-4 h-4" /><span>Salvar Reflexão</span>';
        }, 2000);
      }
      
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
      alert('Erro ao salvar reflexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = async (entryId) => {
    if (!editContent.trim()) return;
    
    try {
      setLoading(true);
      await diaryService.updateDiaryEntry(entryId, {
        content: editContent.trim(),
        isEdited: true
      });
      
      // Recarregar entradas
      await loadDiaryEntries();
      
      // Sair do modo de edição
      setEditingEntry(null);
      setEditContent('');
      
    } catch (error) {
      console.error('Erro ao editar entrada:', error);
      alert('Erro ao editar reflexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Tem certeza que deseja excluir esta reflexão?')) return;
    
    try {
      setLoading(true);
      await diaryService.deleteDiaryEntry(entryId);
      
      // Recarregar entradas
      await loadDiaryEntries();
      
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      alert('Erro ao excluir reflexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (entry) => {
    setEditingEntry(entry.id);
    setEditContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditContent('');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    return firebaseUtils.formatDate(timestamp, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white/70 mb-2">Faça login para usar o diário</h3>
        <p className="text-white/50">Entre na sua conta para começar a escrever suas reflexões</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animation-initial animate-fade-in-up animation-delay-100">
      {/* Diary Writing */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <BookOpen className="w-6 h-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-white">Diário Evolutivo</h2>
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
            <button 
              onClick={handleSaveEntry}
              disabled={!diaryEntry.trim() || !selectedPrompt || loading}
              data-save-entry
              className="bg-gradient-to-r from-white to-gray-200 text-black px-6 py-2 rounded-lg font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Salvar Reflexão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Reflexões Recentes</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/50 mt-2">Carregando...</p>
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/70 mb-2">Nenhuma reflexão ainda</h3>
            <p className="text-white/50">Comece escrevendo sua primeira reflexão acima</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-800/30 rounded-lg p-4">
                {editingEntry === entry.id ? (
                  // Modo de edição
                  <div className="space-y-3">
                    <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                      <p className="text-gray-300 text-sm font-medium">{entry.prompt}</p>
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry.id)}
                        disabled={!editContent.trim() || loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm mb-2 font-medium">{entry.prompt}</p>
                        <p className="text-gray-300 text-sm leading-relaxed">{entry.content}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <p className="text-gray-500 text-xs">{formatDate(entry.createdAt)}</p>
                          {entry.isEdited && (
                            <span className="text-gray-500 text-xs bg-gray-700/50 px-2 py-1 rounded">Editado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => startEditing(entry)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDiary;