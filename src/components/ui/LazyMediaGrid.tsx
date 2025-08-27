"use client";
import { useEffect, useRef, useState } from "react";
import MediaCard from "./MediaCard";

interface MediaItem {
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
  isManual?: boolean;
}

interface LazyMediaGridProps {
  items: MediaItem[];
  className?: string;
  onItemClick?: (item: MediaItem) => void;
  onVideoClick?: (videoUrl: string) => void;
  onInstagramEmbed?: (postId: string, postUrl: string, title?: string) => void;
  prominentInstagram?: boolean;
  featuredPostIds?: string[];
}

interface LazyMediaItemProps {
  item: MediaItem;
  onItemClick?: (item: MediaItem) => void;
  onVideoClick?: (videoUrl: string) => void;
  onInstagramEmbed?: (postId: string, postUrl: string, title?: string) => void;
  prominentInstagram: boolean;
  featuredPostIds: string[];
}

function LazyMediaItem({ item, onItemClick, onVideoClick, onInstagramEmbed, prominentInstagram, featuredPostIds }: LazyMediaItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setIsVisible(true);
          setHasBeenVisible(true);
          // Once visible, we don't need to observe anymore
          if (currentRef) {
            observer.unobserve(currentRef);
          }
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before the element comes into view
        threshold: 0.1,
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasBeenVisible]);

  return (
    <div ref={ref} className="w-full">
      {isVisible || hasBeenVisible ? (
        <MediaCard 
          {...item} 
          onClick={onItemClick ? () => onItemClick(item) : undefined}
          onVideoClick={onVideoClick}
          onInstagramEmbed={onInstagramEmbed}
          variant={featuredPostIds.includes(item.id) ? 'featured' : (prominentInstagram && item.source === 'instagram' ? 'large' : 'default')}
          isManual={item.isManual}
        />
      ) : (
        // Placeholder with same height to prevent layout shift
        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          <div className="w-full h-48 bg-white/10 animate-pulse" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse" />
              <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse mb-1" />
            <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-3" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function LazyMediaGrid({ 
  items, 
  className = "", 
  onItemClick, 
  onVideoClick, 
  onInstagramEmbed,
  prominentInstagram = false,
  featuredPostIds = []
}: LazyMediaGridProps) {
  // Sort items to prioritize featured Instagram posts
  const sortedItems = [...items].sort((a, b) => {
    const aIsFeatured = featuredPostIds.includes(a.id) && a.source === 'instagram';
    const bIsFeatured = featuredPostIds.includes(b.id) && b.source === 'instagram';
    const aIsInstagram = a.source === 'instagram';
    const bIsInstagram = b.source === 'instagram';
    
    // Featured Instagram posts first
    if (aIsFeatured && !bIsFeatured) return -1;
    if (!aIsFeatured && bIsFeatured) return 1;
    
    // If prominentInstagram is enabled, Instagram posts come next
    if (prominentInstagram) {
      if (aIsInstagram && !bIsInstagram) return -1;
      if (!aIsInstagram && bIsInstagram) return 1;
    }
    
    // Maintain original order for same priority items
    return 0;
  });

  const getItemVariant = (item: MediaItem): 'default' | 'featured' | 'large' => {
    if (prominentInstagram && item.source === 'instagram') {
      const index = sortedItems.findIndex(sortedItem => sortedItem.id === item.id);
      if (index === 0) return 'large';
      if (index === 1) return 'featured';
    }
    
    return 'default';
  };

  const getGridClasses = () => {
    if (prominentInstagram || featuredPostIds.length > 0) {
      // Use a more flexible grid that can accommodate different sizes
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max';
    }
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  };

  const getItemClasses = (item: MediaItem) => {
    const variant = getItemVariant(item);
    
    if (variant === 'featured') {
      // Featured posts span 2 columns on larger screens
      return 'md:col-span-2 lg:col-span-2 xl:col-span-2';
    }
    if (variant === 'large') {
      // Large Instagram posts occasionally span 2 columns
      const shouldSpan = Math.random() > 0.7; // 30% chance for variety
      return shouldSpan ? 'lg:col-span-2' : '';
    }
    return '';
  };

  return (
    <div 
      className={`${getGridClasses()} ${className}`}
      role="grid"
      aria-label="Media content grid"
    >
      {sortedItems.map((item) => (
          <div key={item.id} className={getItemClasses(item)}>
            <LazyMediaItem 
              item={item}
              onItemClick={onItemClick}
              onVideoClick={onVideoClick}
              onInstagramEmbed={onInstagramEmbed}
              prominentInstagram={prominentInstagram}
              featuredPostIds={featuredPostIds}
            />
            </div>
        ))}
    </div>
  );
}