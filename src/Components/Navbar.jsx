import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = React.memo(({ scrolled, scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    setIsDropdownOpen(false);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, []);

  const navItems = useMemo(() => [
    { name: 'Início', path: '/', id: 'home' },
    { name: 'Recursos', path: '/resources', id: 'resources' },
    { name: 'Comunidade', path: '/community', id: 'community' },
    { name: 'Depoimentos', path: '/testimonials', id: 'testimonials' },
    { name: 'Missão', path: '/about', id: 'about' }
  ], []);

  const handleNavClick = useCallback((path) => {
    navigate(path);
    closeMenu();
  }, [navigate, closeMenu]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  }, [navigate, closeMenu]);

  const handleContactClick = useCallback(() => {
    scrollToSection('contact');
    closeMenu();
  }, [scrollToSection, closeMenu]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, closeMenu]);

  // Fechar menu ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen, closeMenu]);

  // Foco no primeiro item do menu quando aberto
  useEffect(() => {
    if (isMenuOpen && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    }
  }, [isMenuOpen]);

  // Prevenir scroll do body quando menu está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 md:px-6">
      <nav 
        ref={menuRef}
        className={`
          bg-white/5 border border-white/10 rounded-2xl 
          shadow-lg shadow-black/20 transition-all duration-500 backdrop-blur-md
          ${scrolled ? 'bg-white/8 border-white/15' : 'bg-white/5 border-white/20'}
        `}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          {/* Logo */}
          <button 
            onClick={handleLogoClick} 
            className="flex items-center space-x-3 md:space-x-4 group "
            aria-label="Ir para página inicial"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden bg-white/10 border border-white/20 backdrop-blur-md group-hover:bg-white/15 group-hover:border-white/30 group-hover:shadow-lg group-hover:shadow-white/10">
              <img 
                src="/Logo-Sereno3.png" 
                alt="Sereno Logo" 
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                loading="eager"
                width="48"
                height="48"
              />
            </div>
            <span className="text-lg md:text-xl font-light text-white tracking-wide group-hover:text-white/90 transition-colors">
              Sereno
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className="relative text-white/70 hover:text-white transition-all duration-300 text-sm font-light tracking-wide group "
                aria-label={`Navegar para ${item.name}`}
              >
                {item.name}
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></div>
              </button>
            ))}
            <button 
              onClick={handleContactClick}
              className="group relative bg-white text-black px-6 py-2 rounded-xl transition-all duration-300 text-sm font-light tracking-wide transform hover:bg-white/90 backdrop-blur-md "
              aria-label="Ir para seção de contato"
            >
              <span className="relative z-10">Começar Agora</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-300 backdrop-blur-md "
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="lg:hidden border-t border-white/10 px-4 py-4 bg-white/5 backdrop-blur-md"
            role="menu"
            aria-label="Menu de navegação móvel"
          >
            <div className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                <button
                  key={item.name}
                  ref={index === 0 ? firstMenuItemRef : null}
                  onClick={() => handleNavClick(item.path)}
                  className="text-white/70 hover:text-white transition-all duration-300 py-2 text-sm text-left font-light tracking-wide"
                  role="menuitem"
                  aria-label={`Navegar para ${item.name}`}
                >
                  {item.name}
                </button>
              ))}
              <button 
                onClick={handleContactClick}
                className="bg-white text-black px-6 py-3 rounded-xl hover:bg-white/90 transition-all duration-300 w-full text-sm font-light tracking-wide mt-3 backdrop-blur-md"
                role="menuitem"
                aria-label="Ir para seção de contato"
              >
                Começar Agora
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
