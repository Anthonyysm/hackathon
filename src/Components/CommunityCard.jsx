import React, { useCallback, useState } from 'react';

const CommunityCard = React.memo(({ title, desc, icon: Icon, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    // Adicionar funcionalidade de clique se necessário
    console.log(`Community group clicked: ${title}`);
  }, [title]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl aspect-square bg-white/5 border border-white/10 transition-all duration-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 backdrop-blur-md cursor-pointer"
      style={{ animationDelay: `${index * 200}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Grupo de comunidade: ${title}. ${desc}`}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20 backdrop-blur-md transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
            <Icon className="w-8 h-8 text-white/80 transition-all duration-300 group-hover:scale-110" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-light mb-2 text-white tracking-wide transition-all duration-300 group-hover:text-white/90">
            {title}
          </h3>
          <p className="text-white/70 text-base font-light transition-all duration-300 group-hover:text-white/80">
            {desc}
          </p>
        </div>
      </div>
      
      {/* Overlay de hover com botão */}
      <div className={`absolute inset-0 bg-black/80 transition-all duration-500 flex items-end p-6 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <button 
          className="w-full bg-white text-black py-3 rounded-xl font-light transform transition-all duration-500 text-base tracking-wide backdrop-blur-md hover:bg-white/90 "
          style={{ 
            transform: isHovered ? 'translateY(0)' : 'translateY(4px)'
          }}
          aria-label={`Participar do grupo ${title}`}
        >
          Participar
        </button>
      </div>

      {/* Indicador de hover sutil */}
      <div className={`absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full transition-all duration-300 ${
        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`}></div>
    </div>
  );
});

CommunityCard.displayName = 'CommunityCard';

export default CommunityCard;
