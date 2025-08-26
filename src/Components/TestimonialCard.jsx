import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard = React.memo(({ name, role, content }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-white/80 fill-current" />
        ))}
      </div>
      <p className="text-white/70 mb-4 italic text-base leading-relaxed font-light">"{content}"</p>
      <div>
        <p className="font-light text-base text-white tracking-wide">{name}</p>
        <p className="text-white/50 text-sm font-light">{role}</p>
      </div>
    </div>
  );
});

export default TestimonialCard;
