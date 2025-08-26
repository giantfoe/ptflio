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
}

interface LazyMediaGridProps {
  items: MediaItem[];
  className?: string;
  onItemClick?: (id: string) => void;
}

interface LazyMediaItemProps {
  item: MediaItem;
  onItemClick?: (id: string) => void;
}

function LazyMediaItem({ item, onItemClick }: LazyMediaItemProps) {
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
        <MediaCard {...item} onClick={onItemClick ? () => onItemClick(item.id) : undefined} />
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

export default function LazyMediaGrid({ items, className = "", onItemClick }: LazyMediaGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {items.map((item) => (
        <LazyMediaItem key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}