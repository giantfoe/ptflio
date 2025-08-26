'use client';

import React, { useState, useEffect } from 'react';
import { getAbstractImageUrl, getFallbackGradient } from '@/utils/abstractImageGenerator';

interface AbstractProjectImageProps {
  projectName: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function AbstractProjectImage({ 
  projectName, 
  className = '', 
  onClick, 
  children 
}: AbstractProjectImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const fallbackGradient = getFallbackGradient(projectName);
  
  useEffect(() => {
    // Generate the abstract image URL
    const url = getAbstractImageUrl(projectName);
    setImageUrl(url);
    
    // Preload the image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    img.src = url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [projectName]);
  
  const containerStyle = imageLoaded && !imageError 
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: fallbackGradient
      };
  
  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {/* Loading overlay */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Content overlay */}
      <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors duration-200">
        {children}
      </div>
      
      {/* Subtle texture overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
}

/**
 * Simplified version for smaller thumbnails or previews
 */
export function AbstractProjectThumbnail({ 
  projectName, 
  className = 'w-16 h-16 rounded-lg',
  onClick 
}: Pick<AbstractProjectImageProps, 'projectName' | 'className' | 'onClick'>) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const fallbackGradient = getFallbackGradient(projectName);
  
  useEffect(() => {
    const url = getAbstractImageUrl(projectName);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(false);
    };
    img.src = url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [projectName]);
  
  const containerStyle = imageLoaded && !imageError 
    ? {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: fallbackGradient
      };
  
  return (
    <div
      className={`relative overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
    </div>
  );
}