import React, { useCallback } from 'react';

const FeatureCard = React.memo(({ icon: Icon, title, description, delay, inView }) => {
  const handleClick = useCallback(() => {
    // Adicionar funcionalidade de clique se necessário
    console.log(`Feature clicked: ${title}`);
  }, [title]);

  return (
    <div
      className={`glass-card p-6 transition-all duration-700 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-white/5 backdrop-blur-md cursor-pointer ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Recurso: ${title}. ${description}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 backdrop-blur-md group-hover:bg-white/10 transition-all duration-300">
        <Icon className="w-6 h-6 text-white/80 group-hover:text-white transition-colors duration-300" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-light mb-3 text-white tracking-wide group-hover:text-white/90 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-white/70 leading-relaxed text-sm font-light group-hover:text-white/80 transition-colors duration-300">
        {description}
      </p>
      
      {/* Indicador de hover sutil */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-px bg-white/30"></div>
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
