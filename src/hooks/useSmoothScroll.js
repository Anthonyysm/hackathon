import { useCallback } from 'react';

export const useSmoothScroll = () => {
  const scrollTo = useCallback((target, options = {}) => {
    const {
      duration = 800,
      easing = 'easeInOutCubic',
      offset = 0
    } = options;

    // Funções de easing
    const easingFunctions = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInQuart: t => t * t * t * t,
      easeOutQuart: t => 1 - (--t) * t * t * t,
      easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    };

    const easingFunction = easingFunctions[easing] || easingFunctions.easeInOutCubic;

    // Obter posição do alvo
    let targetPosition;
    if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) return;
      targetPosition = element.offsetTop - offset;
    } else if (typeof target === 'number') {
      targetPosition = target - offset;
    } else if (target instanceof Element) {
      targetPosition = target.offsetTop - offset;
    } else {
      return;
    }

    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = currentTime => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easingFunction(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }, []);

  const scrollToTop = useCallback((options = {}) => {
    scrollTo(0, options);
  }, [scrollTo]);

  const scrollToElement = useCallback((selector, options = {}) => {
    scrollTo(selector, options);
  }, [scrollTo]);

  const scrollToPosition = useCallback((position, options = {}) => {
    scrollTo(position, options);
  }, [scrollTo]);

  return {
    scrollTo,
    scrollToTop,
    scrollToElement,
    scrollToPosition
  };
};

export default useSmoothScroll;
