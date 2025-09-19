'use client';

import React from 'react';
import { useLoading } from '@/components/providers/LoadingProvider';

interface CircularTextLoaderProps {
  className?: string;
  size?: number;
  spinDuration?: number;
}

const CircularTextLoader: React.FC<CircularTextLoaderProps> = ({
  className = '',
  size = 200,
  spinDuration = 8,
}) => {
  const { isLoading } = useLoading();
  
  if (!isLoading) return null;

  const radius = (size - 40) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Text content for the circular loader - calculated to perfectly fill the circle
  const baseText = "AYORINDE • SYMCHE • JOHN";
  const separator = " • ";
  
  // Calculate how many repetitions we need to fill the circle
  const estimatedCharWidth = size * 0.06; // Approximate character width
  const charsNeeded = Math.ceil(circumference / estimatedCharWidth);
  const baseTextLength = baseText.length + separator.length;
  const repetitions = Math.ceil(charsNeeded / baseTextLength);
  
  const text = Array(repetitions).fill(baseText).join(separator) + separator;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Circular text loader */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="animate-spin"
          style={{
            animationDuration: `${spinDuration}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          <defs>
            {/* Define the circular path */}
            <path
              id="circle-path"
              d={`M ${center}, ${center} m -${radius}, 0 a ${radius}, ${radius} 0 1, 1 ${radius * 2}, 0 a ${radius}, ${radius} 0 1, 1 -${radius * 2}, 0`}
              fill="none"
            />
            
            {/* Gradient for the text */}
            <linearGradient id="text-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          
          {/* Circular text */}
          <text 
            className="text-sm font-bold tracking-[0.2em]"
            style={{ 
              fontSize: `${size * 0.08}px`,
              letterSpacing: `${size * 0.01}px`
            }}
          >
            <textPath
              href="#circle-path"
              startOffset="0%"
              fill="white"
              className="uppercase"
              textLength={circumference}
              lengthAdjust="spacingAndGlyphs"
            >
              {text}
            </textPath>
          </text>
        </svg>
        
        {/* Center dot/logo placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default CircularTextLoader;