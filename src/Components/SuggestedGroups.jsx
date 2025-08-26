import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Check } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const SuggestedGroups = () => {
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState(new Set());

  useEffect(() => {
    const fetchJoined = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const set = new Set((data.joinedGroups || []).map(String));
          setJoinedGroups(set);
        }
      } catch {}
    };
    fetchJoined();
  }, []);

  const joinGroup = async (groupId) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (joinedGroups.has(groupId)) {
      // Se já está no grupo, só navega para a comunidade
      navigate(`/community/${groupId}`);
      return;
    }
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { joinedGroups: arrayUnion(groupId) });
      setJoinedGroups((prev) => new Set(prev).add(groupId));
      // Remove o redirecionamento automático - usuário fica na página atual
      // navigate(`/community/${groupId}`);
    } catch (e) {
      // Em caso de erro, ainda atualiza o estado local para feedback visual
      setJoinedGroups((prev) => new Set(prev).add(groupId));
      console.error('Erro ao entrar no grupo:', e);
    }
  };
  
  const groups = [
    {
      id: 'ansiedade-estresse',
      name: 'Ansiedade & Estresse',
      description: 'Apoio para quem lida com ansiedade e estresse no dia a dia',
      members: 1247,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sono-qualidade',
      description: 'Dicas e apoio para melhor qualidade do sono',
      members: 892,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'luto-apoio',
      name: 'Luto & Apoio',
      description: 'Apoio em processos de luto e perda',
      members: 634,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'autoconfiança',
      name: 'Autoconfiança',
      description: 'Construindo autoestima e confiança',
      members: 1156,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-semibold text-white">Grupos Sugeridos</h2>
      </div>
      
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white/5 border border-gray-200/20 rounded-xl p-4 hover:bg-white/10 hover:border-gray-300/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{group.name}</h3>
                  <p className="text-sm text-gray-400">{group.members.toLocaleString()} membros</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{group.description}</p>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => navigate(`/community/${group.id}`)}
                className="flex-1 bg-white/10 border border-white/30 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Ver Grupo</span>
              </button>
              <button onClick={() => joinGroup(group.id)} disabled={joinedGroups.has(group.id)} className={`text-black text-sm font-medium py-2 px-3 rounded-lg transform transition-all duration-200 ${joinedGroups.has(group.id) ? 'bg-green-300 cursor-default' : 'bg-gradient-to-r from-white to-gray-200 hover:from-gray-200 hover:to-gray-300 hover:scale-105'}`}>
                {joinedGroups.has(group.id) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedGroups;