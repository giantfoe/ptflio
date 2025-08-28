"use client";
import Image from "next/image";
import { useState } from "react";
import { ExternalLink, Instagram, Youtube, Github, Play } from "lucide-react";
import { LiquidGlassEffects } from './liquid-glass-effects';

interface MediaCardProps {
  id: string;
  source: "youtube" | "instagram" | "github";
  title?: string;
  text?: string;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  variant?: "default" | "featured" | "large";
  onClick?: () => void;
  onVideoClick?: (videoUrl: string) => void;
  onInstagramEmbed?: (postId: string, url: string) => void;
  isManual?: boolean;
}

export default function MediaCard({
  id,
  source,
  title,
  text,
  url,
  imageUrl,
  thumbnailUrl,
  videoUrl,
  timestamp,
  variant = "default",
  onClick,
  onVideoClick,
  onInstagramEmbed,
  isManual = false,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const displayImage = imageUrl || thumbnailUrl;
  const isVideo = !!videoUrl;
  const isYouTube = source === "youtube";
  const isInstagram = source === "instagram";
  const isGitHub = source === "github";
  
  // Extract Instagram post ID from URL for embed functionality
  const getInstagramPostId = (url: string) => {
    if (!url) return null;
    const match = url.match(/\/p\/([A-Za-z0-9_-]+)\//); 
    return match ? match[1] : null;
  };
  
  const instagramPostId = isInstagram ? getInstagramPostId(url || '') : null;
  
  // Determine card size based on variant
  const getCardClasses = () => {
    const baseClasses = "relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-lg border border-white/20 overflow-hidden hover:border-white/30 transition-all duration-500 cursor-pointer backdrop-blur-md group";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-white/10`;
      case "large":
        return `${baseClasses} col-span-2 row-span-2`;
      default:
        return `${baseClasses} hover:shadow-md hover:shadow-white/5`;
    }
  };
  
  const getImageHeight = () => {
    switch (variant) {
      case "large":
        return "h-64 md:h-80";
      case "featured":
        return "h-56";
      default:
        return "h-48";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const renderPlaceholder = () => (
    <div className={`w-full ${getImageHeight()} bg-white/10 rounded-lg flex items-center justify-center`}>
      <div className="text-white/60 text-center">
        <div className="mb-2">
          {isYouTube && <Youtube className="w-8 h-8 mx-auto" />}
          {isInstagram && <Instagram className="w-8 h-8 mx-auto" />}
          {isGitHub && <Github className="w-8 h-8 mx-auto" />}
        </div>
        <span className="text-sm">
          {isYouTube && "Video"}
          {isInstagram && (isVideo ? "Video" : "Image")}
          {isGitHub && "Activity"}
        </span>
      </div>
    </div>
  );
  
  const handleInstagramClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInstagram && instagramPostId && onInstagramEmbed) {
      onInstagramEmbed(instagramPostId, url || '');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <article 
      className={getCardClasses()}
      onClick={isInstagram ? handleInstagramClick : onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isInstagram) {
            // Create a synthetic mouse event for handleInstagramClick
            const syntheticEvent = {
              preventDefault: () => {},
              stopPropagation: () => {}
            } as React.MouseEvent;
            handleInstagramClick(syntheticEvent);
          } else if (onClick) {
            onClick();
          }
        }
      }}
      aria-label={`${source} post: ${title || 'Media content'}${variant === 'featured' ? ' (Featured)' : ''}${isVideo ? ' (Video)' : ''}${isInstagram && instagramPostId ? ' (Embeddable)' : ''}`}
      aria-describedby={`card-${id}-description`}
    >
      <LiquidGlassEffects className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-500">
        <></>
      </LiquidGlassEffects>
      {/* Media Section */}
      {displayImage && !imageError ? (
        <div className={`relative w-full ${getImageHeight()} bg-white/5 z-10`}>
          {isLoading && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-t-lg" />
          )}
          <Image
            src={displayImage}
            alt={title || "Media content"}
            fill
            className="object-cover rounded-t-lg"
            sizes={variant === "large" ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={variant === "featured"}
            unoptimized={true}
          />
          
          {/* Video Play Button */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-all duration-300 hover:scale-110 border border-white/20 hover:border-white/40">
                <Play className="w-6 h-6 text-white fill-current" />
              </div>
            </div>
          )}
          
          {/* Instagram Embed Indicator */}
          {isInstagram && instagramPostId && (
            <div className="absolute top-3 right-3">
              <div 
                className="bg-pink-500/80 backdrop-blur-sm rounded-full p-2 hover:bg-pink-500 transition-all duration-300 hover:scale-110 border border-pink-300/30 hover:border-pink-300/60" 
                title="Click to view Instagram embed"
                role="img"
                aria-label="Instagram embed available"
              >
                <Instagram className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
            </div>
          )}
          
          {/* Featured Badge */}
          {variant === "featured" && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500/90 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            </div>
          )}
        </div>
      ) : (
        renderPlaceholder()
      )}

      {/* Content Section */}
      <div className="p-4 relative z-10">
        {/* Hidden description for screen readers */}
        <div id={`card-${id}-description`} className="sr-only">
          {`${source} content from ${formatDate(timestamp)}. ${text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : 'No description available.'}`}
        </div>
        {/* Source Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                isYouTube
                  ? "bg-red-500/20 text-red-300"
                  : isInstagram
                  ? "bg-pink-500/20 text-pink-300"
                  : "bg-purple-500/20 text-purple-300"
              }`}
            >
              {isYouTube && <Youtube className="w-3 h-3" />}
              {isInstagram && <Instagram className="w-3 h-3" />}
              {isGitHub && <Github className="w-3 h-3" />}
              {source.charAt(0).toUpperCase() + source.slice(1)}
            </span>
            {isInstagram && instagramPostId && (
              <span className="text-xs text-pink-300/80 bg-pink-500/10 px-2 py-1 rounded-full">
                Embeddable
              </span>
            )}
            {isManual && (
              <span className="text-xs text-blue-300/80 bg-blue-500/10 px-2 py-1 rounded-full">
                Manual
              </span>
            )}
          </div>
          <time className="text-xs text-white/60" dateTime={timestamp}>
            {formatDate(timestamp)}
          </time>
        </div>

        {/* Title */}
        {title && (
          <h3 className="text-white font-medium mb-2 line-clamp-2 leading-tight">
            {title}
          </h3>
        )}

        {/* Text Content */}
        {text && text !== title && (
          <p className="text-white/80 text-sm line-clamp-3 mb-3">{text}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Open ${source} post in new tab`}
            >
              View {isYouTube ? "Video" : isInstagram ? "Post" : "Activity"}
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
          
          {/* Instagram Embed Button */}
          {isInstagram && instagramPostId && onInstagramEmbed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstagramEmbed(instagramPostId, url || '');
              }}
              className="inline-flex items-center text-sm text-pink-300 hover:text-pink-200 transition-colors bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={`Open Instagram embed for ${title || 'this post'}`}
              aria-describedby={`embed-help-${id}`}
            >
              <Instagram className="w-4 h-4 mr-1" aria-hidden="true" />
              Embed
            </button>
          )}
          
          {/* Hidden help text for embed button */}
          {isInstagram && instagramPostId && onInstagramEmbed && (
            <span id={`embed-help-${id}`} className="sr-only">
              Opens Instagram post in an embedded modal view
            </span>
          )}
        </div>
      </div>
    </article>
  );
}