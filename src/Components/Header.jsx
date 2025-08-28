import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Search, Home, MessageCircle, Calendar, BarChart3, Settings, Menu, X, Bell, BookOpen, HelpCircle, User, LogOut, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import Input from './ui/Input';

const Header = React.memo(({ activeTab, setActiveTab, onStartTour }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    setIsDropdownOpen(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
    setIsMobileMenuOpen(false);
  }, []);

  const closeAllMenus = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, []);

  const navItems = useMemo(() => {
    const items = [
      { name: 'Início', tab: 'home', icon: Home, path: '/home' },
      { name: 'Chat', tab: 'chat', icon: MessageCircle, path: '/home/chat' },
      { name: 'Diário', tab: 'diary', icon: BookOpen, path: '/home/diary' },
      { name: 'Humor', tab: 'humor', icon: BarChart3, path: '/home/humor' },
      { name: 'Grupos', tab: 'groups', icon: Calendar, path: '/home/groups' },
      { name: 'Amigos', tab: 'friends', icon: Users, path: '/home/friends' }, // New Friends tab
      { name: 'Notificações', tab: 'notifications', icon: Bell, path: '/home/notifications' },
      { name: 'Configurações', tab: 'settings', icon: Settings, path: '/home/settings' },
      { name: 'Meu Perfil', tab: 'profile', icon: User, path: '/home/profile' },
    ];
    return items;
  }, []);

  const handleNavClick = useCallback((item) => {
    navigate(item.path);
    closeAllMenus();
  }, [navigate, closeAllMenus]);

  const handleLogout = useCallback(async () => {
    try {
      const { auth } = await import('../firebase');
      await auth.signOut();
      navigate('/login');
      closeAllMenus();
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    }
  }, [navigate, closeAllMenus]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementar busca
      console.log('Searching for:', searchQuery);
    }
  }, [searchQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllMenus();
      }
    };

    if (isMobileMenuOpen || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, isDropdownOpen, closeAllMenus]);

  // Fechar menus ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeAllMenus();
      }
    };

    if (isMobileMenuOpen || isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, isDropdownOpen, closeAllMenus]);

  // Prevenir scroll do body quando menu está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (loading) {
    return (
      <header className="bg-black border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white/70">Carregando...</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black border-b border-white/20 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Button - Only on Mobile */}
            <button
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label="Abrir menu de navegação"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            {/* Logo */}
            <button 
              onClick={() => navigate('/home')} 
              className="flex items-center space-x-3 group"
              aria-label="Ir para página inicial"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <img 
                  src="/Logo-Sereno3.png" 
                  alt="Sereno Logo" 
                  className="w-5 h-5 object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="eager"
                />
              </div>
              <span className="text-white font-semibold text-lg group-hover:text-white/90 transition-colors duration-200">
                Sereno
              </span>
            </button>
            
            {/* Search Bar - Hidden on Mobile */}
            <div className="hidden lg:block ml-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Pesquisar posts, grupos, pessoas..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="glass"
                  size="sm"
                  radius="xl"
                  className="w-80"
                  leftIcon={Search}
                  onLeftIconClick={() => handleSearch({ preventDefault: () => {} })}
                  aria-label="Pesquisar na plataforma"
                />
              </form>
            </div>
          </div>
          
          {/* Right Section - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-5">
              {navItems.slice(0, 4).map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    activeTab === item.tab 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  aria-label={`Navegar para ${item.name}`}
                  aria-current={activeTab === item.tab ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                </button>
              ))}
              
              {/* Notifications Button */}
              <button
                onClick={() => handleNavClick(navItems.find(item => item.tab === 'notifications'))}
                className={`p-2 rounded-lg transition-colors duration-200 relative ${
                  activeTab === 'notifications' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Ver notificações"
                aria-current={activeTab === 'notifications' ? 'page' : undefined}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Settings Button */}
              <button
                onClick={() => handleNavClick(navItems.find(item => item.tab === 'settings'))}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label="Configurações"
                aria-current={activeTab === 'settings' ? 'page' : undefined}
              >
                <Settings className="w-5 h-5" aria-hidden="true" />
              </button>
              
              {/* Help Button */}
              <button
                onClick={onStartTour}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Iniciar tour do aplicativo"
                aria-label="Iniciar tour do aplicativo"
              >
                <HelpCircle className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            {/* User Section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
                  onClick={toggleDropdown}
                  aria-label="Menu do usuário"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Usuário'} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold text-sm">
                      {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                    </div>
                  )}
                  <span className="text-sm font-light">
                    {user.displayName || 'Usuário'}
                  </span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-white/20 rounded-lg shadow-lg py-1 z-50">
                    <button 
                      onClick={() => {
                        navigate('/home/profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2"
                      aria-label="Ver meu perfil"
                    >
                      <User className="w-4 h-4" aria-hidden="true" />
                      <span>Meu Perfil</span>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/home/settings');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2"
                      aria-label="Configurações do perfil"
                    >
                      <Settings className="w-4 h-4" aria-hidden="true" />
                      <span>Configurações</span>
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-2"
                      aria-label="Sair da conta"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                aria-label="Fazer login"
              >
                Login
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Sidebar */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={closeAllMenus}
              style={{ 
                opacity: isMobileMenuOpen ? 1 : 0,
                transition: 'opacity 150ms ease-in-out',
                pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
              }}
            />
            
            {/* Sidebar */}
            <div 
              ref={mobileMenuRef}
              className="fixed left-0 top-0 h-full w-80 bg-black/95 border-r border-white/20 z-50 lg:hidden transform transition-transform duration-200 ease-in-out flex flex-col"
              style={{
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                pointerEvents: isMobileMenuOpen ? 'auto' : 'none'
              }}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <img 
                      src="/Logo-Sereno3.png" 
                      alt="Sereno Logo" 
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg">Sereno</span>
                </div>
                <button 
                  onClick={closeAllMenus}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-white/20 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Usuário'} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg">
                        {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate text-sm">
                        {user.displayName || 'Usuário'}
                      </div>
                      <div className="text-white/60 text-xs truncate">
                        {user.email || ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Bar in Mobile Menu */}
              <div className="p-4 border-b border-white/20 flex-shrink-0">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="glass"
                    size="sm"
                    radius="xl"
                    className="w-full"
                    leftIcon={Search}
                    onLeftIconClick={() => handleSearch({ preventDefault: () => {} })}
                    aria-label="Pesquisar na plataforma"
                  />
                </form>
              </div>
              
              {/* Navigation Items - Scrollable */}
              <div className="flex-1 overflow-y-auto py-4 min-h-0">
                <div className="space-y-1 px-4">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                        activeTab === item.tab 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={`Navegar para ${item.name}`}
                      aria-current={activeTab === item.tab ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          activeTab === item.tab ? 'bg-white/20' : 'bg-white/10'
                        }`}>
                          <item.icon className={`w-4 h-4 ${
                            activeTab === item.tab ? 'text-white' : 'text-white/70'
                          }`} aria-hidden="true" />
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40" aria-hidden="true" />
                    </button>
                  ))}
                  
                  {/* Help Button */}
                  <button
                    onClick={() => {
                      onStartTour();
                      closeAllMenus();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                    aria-label="Ajuda e tour do aplicativo"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white/10">
                        <HelpCircle className="w-4 h-4 text-white/70" aria-hidden="true" />
                      </div>
                      <span className="font-medium text-sm">Ajuda e Tour</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              {/* Logout/Login Button - Fixed at Bottom */}
              <div className="p-4 border-t border-white/20 flex-shrink-0">
                {user ? (
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Sair da conta"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      navigate('/login');
                      closeAllMenus();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Fazer login"
                  >
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';
export default Header;