"use client";
import { Parallax } from "react-scroll-parallax";
import { useEffect, useRef, useState } from "react";

interface SectionTransitionProps {
  fromSection: 'hero' | 'projects' | 'streams';
  toSection: 'hero' | 'projects' | 'streams';
  className?: string;
}

export default function SectionTransition({ fromSection, toSection, className = '' }: SectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const transitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (transitionRef.current) {
      observer.observe(transitionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getGradientClasses = () => {
    if (fromSection === 'hero' && toSection === 'projects') {
      return 'from-black/30 via-slate-900/40 to-slate-800/50';
    }
    if (fromSection === 'projects' && toSection === 'streams') {
      return 'from-slate-800/50 via-slate-700/40 to-slate-600/30';
    }
    return 'from-transparent via-slate-800/20 to-transparent';
  };

  return (
    <div 
      ref={transitionRef}
      className={`relative h-32 overflow-hidden ${className}`}
    >
      {/* Main gradient transition */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getGradientClasses()}`} />
      
      {/* Animated floating elements */}
      <Parallax speed={-8} className="absolute top-4 left-1/4 opacity-20">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-lg transition-all duration-1000 ${
          isVisible ? 'scale-100 opacity-20' : 'scale-75 opacity-0'
        }`} />
      </Parallax>
      
      <Parallax speed={-12} className="absolute top-8 right-1/3 opacity-15">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-500/25 to-blue-500/25 blur-md transition-all duration-1200 delay-200 ${
          isVisible ? 'scale-100 opacity-15' : 'scale-50 opacity-0'
        }`} />
      </Parallax>
      
      <Parallax speed={-6} className="absolute bottom-4 left-2/3 opacity-25">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-sm transition-all duration-800 delay-400 ${
          isVisible ? 'scale-100 opacity-25' : 'scale-125 opacity-0'
        }`} />
      </Parallax>
      
      {/* Decorative line divider */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-1000 ${
          isVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'
        }`} />
      </div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
    </div>
  );
}