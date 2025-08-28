"use client";
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { 
  useParallaxScroll, 
  useParallaxTransform, 
  useParallaxSpring,
  useResponsiveParallax,
  useReducedMotion
} from '@/hooks/useParallax';

interface ParallaxBackgroundProps {
  className?: string;
}

export default function ParallaxBackground({ className = '' }: ParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useParallaxScroll(containerRef);
  const parallaxScale = useResponsiveParallax();
  const prefersReducedMotion = useReducedMotion();
  
  // Layer transforms with different speeds
  const layer1Y = useParallaxTransform(scrollProgress, 0.2 * parallaxScale, 150);
  const layer2Y = useParallaxTransform(scrollProgress, 0.4 * parallaxScale, 100);
  const layer3Y = useParallaxTransform(scrollProgress, 0.6 * parallaxScale, 75);
  const layer4Y = useParallaxTransform(scrollProgress, 0.8 * parallaxScale, 50);
  
  // Apply spring physics for smooth movement
  const smoothLayer1Y = useParallaxSpring(layer1Y);
  const smoothLayer2Y = useParallaxSpring(layer2Y);
  const smoothLayer3Y = useParallaxSpring(layer3Y);
  const smoothLayer4Y = useParallaxSpring(layer4Y);
  
  // Disable parallax if user prefers reduced motion
  const motionProps = prefersReducedMotion ? {} : {
    style: { y: smoothLayer1Y }
  };
  
  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black opacity-90" />
      
      {/* Parallax Layer 1 - Slowest, furthest back */}
      <motion.div
        className="absolute inset-0 opacity-30"
        {...(prefersReducedMotion ? {} : { style: { y: smoothLayer1Y } })}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-3xl" />
      </motion.div>
      
      {/* Parallax Layer 2 - Medium speed */}
      <motion.div
        className="absolute inset-0 opacity-40"
        {...(prefersReducedMotion ? {} : { style: { y: smoothLayer2Y } })}
      >
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-cyan-400/25 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-radial from-indigo-400/25 to-transparent rounded-full blur-2xl" />
      </motion.div>
      
      {/* Parallax Layer 3 - Faster speed */}
      <motion.div
        className="absolute inset-0 opacity-50"
        {...(prefersReducedMotion ? {} : { style: { y: smoothLayer3Y } })}
      >
        <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-gradient-radial from-teal-300/30 to-transparent rounded-full blur-xl" />
        <div className="absolute bottom-1/2 right-1/2 w-56 h-56 bg-gradient-radial from-violet-300/30 to-transparent rounded-full blur-xl" />
      </motion.div>
      
      {/* Parallax Layer 4 - Fastest, closest to viewer */}
      <motion.div
        className="absolute inset-0 opacity-60"
        {...(prefersReducedMotion ? {} : { style: { y: smoothLayer4Y } })}
      >
        <div className="absolute top-2/3 left-1/4 w-32 h-32 bg-gradient-radial from-emerald-200/35 to-transparent rounded-full blur-lg" />
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-gradient-radial from-rose-200/35 to-transparent rounded-full blur-lg" />
      </motion.div>
      
      {/* Noise texture overlay for depth */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
    </div>
  );
}