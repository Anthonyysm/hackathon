import React from 'react';
import { Search, Home, MessageCircle, Users, Calendar, BarChart3, Settings, Flower } from 'lucide-react';

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-lg">
              <Flower className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Sereno
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar posts, grupos, pessoas..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-full py-3 pl-12 pr-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;