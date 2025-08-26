import React from 'react';
import { Home, MessageCircle, Users, Calendar, BarChart3, Settings } from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'sessions', icon: Users, label: 'Sessões' },
    { id: 'diary', icon: Calendar, label: 'Diário' },
    { id: 'humor', icon: BarChart3, label: 'Humor' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'options', icon: Settings, label: 'Opções' }
  ];

  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'text-white bg-white/10'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;