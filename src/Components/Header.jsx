import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Search, Home, MessageCircle, Users, Calendar, BarChart3, Settings, Flower, Menu, X, LogOut, User as UserIcon, Bell, Compass, BookOpen, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Header = ({ activeTab, setActiveTab, onStartTour }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser({ ...currentUser, role: userSnap.data().role });
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    setIsMenuOpen(false);
  }, []);

  const navItems = useMemo(() => {
    const items = [
      { name: 'Início', tab: 'home', icon: Home },
      { name: 'Chat', tab: 'chat', icon: MessageCircle },
      { name: 'Diário', tab: 'diary', icon: BookOpen },
      { name: 'Humor', tab: 'humor', icon: BarChart3 },
    ];

    if (user && user.role === 'psicologo') {
      items.splice(2, 0, { name: 'Sessões', tab: 'sessions', icon: Users });
    } else if (user && user.role === 'cliente') {
      items.splice(2, 0, { name: 'Sessões', tab: 'sessions', icon: Calendar });
    }

    return items;
  }, [user]);

  const handleNavClick = useCallback((tabName) => {
    setActiveTab(tabName);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [setActiveTab]);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      navigate('/login');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    }
  }, [navigate]);

  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Mobile Menu Button, Logo and Search Bar */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300 backdrop-blur-md"
              onClick={toggleMenu}
              aria-label="Abrir menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <button onClick={() => setActiveTab('home')} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md group-hover:bg-white/15 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-white/10">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
              </div>
              <span className="text-xl font-bold text-white tracking-wide group-hover:text-white/90 transition-colors ">
                Sereno
              </span>
            </button>
            
            {/* Search Bar - Visible on desktop, takes up central space */}
            <div className="relative hidden sm:block flex-1 max-w-xl ml-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar posts, grupos, pessoas..."
                className="w-full bg-black/50 border border-s-white rounded-full py-2 pl-12 pr-6 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Right Section: Desktop Navigation Icons and User/Logout */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation Icons (only icons as per image) */}
            <div className="hidden lg:flex items-center space-x-5">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.tab)}
                  className={`relative text-white/70 hover:text-white transition-all duration-300 group p-2 rounded-full ${activeTab === item.tab ? 'bg-white/20' : 'hover:bg-white/10'}`}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
              
              {/* Notifications Button */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative text-white/70 hover:text-white transition-all duration-300 group p-2 rounded-full hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`relative text-white/70 hover:text-white transition-all duration-300 group p-2 rounded-full hover:bg-white/10 ${activeTab === 'settings' ? 'bg-white/20' : ''}`}
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Help Button */}
              <button
                onClick={onStartTour}
                className="text-white/70 hover:text-white transition-all duration-300 group p-2 rounded-full hover:bg-white/10"
                title="Iniciar tour do aplicativo"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile and Logout */}
            {user ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors"
                  onClick={toggleDropdown}
                >
                  <UserIcon className="w-5 h-5" />
                  <span 
                    onClick={() => navigate('/user/' + user.uid)}
                    className="hidden md:block text-sm font-light hover:text-white transition-colors cursor-pointer"
                  >
                    {user.displayName || 'Usuário'}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-md shadow-lg py-1 z-60">
                    <button 
                      onClick={() => navigate('/user/' + user.uid)} 
                      className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </button>
                    <button 
                      onClick={() => handleNavClick('settings')} 
                      className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-black px-4 py-2 rounded-xl text-sm font-light hover:bg-white/90 transition-all duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40" onClick={toggleMenu}></div>
        )}
        {isMenuOpen && (
          <div className="lg:hidden fixed top-0 left-0 h-full w-64 bg-black/95 border-r border-white/10 p-4 pt-16 z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.tab)}
                  className={`text-white/80 hover:text-white transition-colors text-lg text-left font-light flex items-center space-x-3 ${activeTab === item.tab ? 'text-white' : ''}`}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.name}</span>
                </button>
              ))}
              
              {/* Notifications in mobile menu */}
              <button
                onClick={() => navigate('/notifications')}
                className="text-white/80 hover:text-white transition-colors text-lg text-left font-light flex items-center space-x-3"
              >
                <Bell className="w-6 h-6" />
                <span>Notificações</span>
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  3
                </span>
              </button>

              {/* Settings in mobile menu */}
              <button
                onClick={() => handleNavClick('settings')}
                className={`text-white/80 hover:text-white transition-colors text-lg text-left font-light flex items-center space-x-3 ${activeTab === 'settings' ? 'text-white' : ''}`}
              >
                <Settings className="w-6 h-6" />
                <span>Configurações</span>
              </button>

              {/* Help in mobile menu */}
              <button
                onClick={onStartTour}
                className="text-white/80 hover:text-white transition-colors text-lg text-left font-light flex items-center space-x-3"
              >
                <HelpCircle className="w-6 h-6" />
                <span>Ajuda e Tour</span>
              </button>
              {user ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sair
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-4 px-4 py-2 bg-white text-black rounded-md hover:bg-white/90 transition-all duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;