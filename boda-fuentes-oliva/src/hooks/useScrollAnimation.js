import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para animar elementos cuando entran/salen del viewport
 * @param {Object} options - Opciones de Intersection Observer
 * @param {boolean} startVisible - Si el elemento debe empezar visible (true) o invisible (false)
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = (options = {}, startVisible = false) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(startVisible);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const defaultOptions = {
      threshold: 0.15,
      rootMargin: '0px',
      ...options,
    };

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, defaultOptions);

    observer.observe(element);
    
    // Trigger inicial solo si no empezamos visibles
    if (!startVisible) {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.top < viewportHeight * 0.85) {
        setIsVisible(true);
      }
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, startVisible]);

  return { ref, isVisible };
};

/**
 * Hook para animar múltiples elementos con delays escalonados
 * @param {number} itemCount - Número de elementos a animar
 * @param {Object} options - Opciones de Intersection Observer
 * @returns {Object} - { containerRef, itemsVisible }
 */
export const useStaggeredAnimation = (itemCount, options = {}) => {
  const containerRef = useRef(null);
  const [itemsVisible, setItemsVisible] = useState(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = parseInt(entry.target.dataset.index);
        
        setItemsVisible((prev) => {
          const newVisible = [...prev];
          newVisible[index] = entry.isIntersecting;
          return newVisible;
        });
      });
    }, defaultOptions);

    // Observar cada elemento hijo con data-index
    const items = container.querySelectorAll('[data-index]');
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [itemCount, options.threshold, options.rootMargin]);

  return { containerRef, itemsVisible };
};
