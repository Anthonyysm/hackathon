import React from 'react';

const CommunityCard = ({ title, desc, icon: Icon, index }) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl aspect-square bg-white/5 border border-white/10 transition-all duration-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 backdrop-blur-md"
      style={{ animationDelay: `${index * 200}ms` }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/20 backdrop-blur-md">
            <Icon className="w-8 h-8 text-white/80" />
          </div>
          <h3 className="text-xl font-light mb-2 text-white tracking-wide">{title}</h3>
          <p className="text-white/70 text-base font-light">{desc}</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
        <button className="w-full bg-white text-black py-3 rounded-xl font-light transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-base tracking-wide backdrop-blur-md">
          Participar
        </button>
      </div>
    </div>
  );
};

export default CommunityCard;
