"use client";
import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { RefObject, useState, useEffect } from 'react';

/**
 * Custom hook for parallax scroll tracking
 * Tracks scroll progress relative to a target element
 */
export function useParallaxScroll(targetRef: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start']
  });
  
  return scrollYProgress;
}

/**
 * Custom hook for layer transforms
 * Converts scroll progress to parallax transform values
 */
export function useParallaxTransform(
  scrollProgress: MotionValue<number>, 
  speed: number,
  range: number = 100
) {
  return useTransform(scrollProgress, [0, 1], [0, speed * -range]);
}

/**
 * Custom hook for smooth spring animations
 * Applies spring physics to motion values for natural movement
 */
export function useParallaxSpring(
  value: MotionValue<number>,
  config: {
    stiffness?: number;
    damping?: number;
    restDelta?: number;
  } = {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001
  }
) {
  return useSpring(value, config);
}

/**
 * Custom hook for responsive parallax scaling
 * Adjusts parallax intensity based on screen size
 */
export function useResponsiveParallax() {
  const [parallaxScale, setParallaxScale] = useState(1);
  
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setParallaxScale(0.3); // Minimal on mobile
      } else if (width < 1024) {
        setParallaxScale(0.6); // Reduced on tablet
      } else {
        setParallaxScale(1); // Full on desktop
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  
  return parallaxScale;
}

/**
 * Custom hook for motion preference detection
 * Respects user's reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return prefersReducedMotion;
}

/**
 * Custom hook for viewport visibility detection
 * Uses Intersection Observer for performance optimization
 */
export function useViewportVisibility(ref: RefObject<HTMLElement | null>) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return isVisible;
}