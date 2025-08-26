import React from 'react';
import { Users, Plus } from 'lucide-react';

const SuggestedGroups = () => {
  const groups = [
    {
      id: 1,
      name: 'Ansiedade',
      description: 'Apoio para quem lida com ansiedade',
      members: 1247,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Sono',
      description: 'Dicas e apoio para melhor qualidade do sono',
      members: 892,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 3,
      name: 'Luto',
      description: 'Apoio em processos de luto e perda',
      members: 634,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 4,
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
            
            <button className="w-full bg-gradient-to-r from-white to-gray-200 text-black text-sm font-medium py-2 px-4 rounded-lg hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Participar</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedGroups;