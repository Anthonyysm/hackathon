import React from 'react';

const FeatureCard = React.memo(({ icon: Icon, title, description, delay, inView }) => {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-700 transform hover:-translate-y-2 hover:shadow-lg hover:shadow-white/5 backdrop-blur-md ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
        <Icon className="w-6 h-6 text-white/80" />
      </div>
      <h3 className="text-lg font-light mb-3 text-white tracking-wide">{title}</h3>
      <p className="text-white/70 leading-relaxed text-sm font-light">{description}</p>
    </div>
  );
});

export default FeatureCard;
