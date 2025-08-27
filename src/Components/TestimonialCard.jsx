import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialCard = React.memo(({ name, role, content }) => {
  return (
    <div 
      className="glass-card p-8"
      role="article"
      aria-labelledby="testimonial-author"
    >
      {/* Quote icon */}
      <div className="flex justify-end mb-4">
        <Quote className="w-6 h-6 text-white/40" aria-hidden="true" />
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4" role="img" aria-label="Avaliação de 5 estrelas">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className="w-4 h-4 text-white/80 fill-current" 
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-white/70 mb-4 italic text-base leading-relaxed font-light">
        <p className="relative">
          <span className="text-2xl text-white/30 absolute -left-2 -top-2">"</span>
          {content}
          <span className="text-2xl text-white/30 absolute -right-2 -bottom-2">"</span>
        </p>
      </blockquote>

      {/* Author */}
      <footer className="flex items-center justify-between">
        <div>
          <p 
            id="testimonial-author"
            className="font-light text-base text-white tracking-wide"
          >
            {name}
          </p>
          <p className="text-white/50 text-sm font-light">
            {role}
          </p>
        </div>
        
        {/* Decorative element */}
        <div className="w-8 h-px bg-white/20"></div>
      </footer>
    </div>
  );
});

TestimonialCard.displayName = 'TestimonialCard';

export default TestimonialCard;
