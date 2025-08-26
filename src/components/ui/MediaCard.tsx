"use client";
import Image from "next/image";
import { useState } from "react";

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
}

export default function MediaCard({
  source,
  title,
  text,
  url,
  imageUrl,
  thumbnailUrl,
  videoUrl,
  timestamp,
  onClick,
}: MediaCardProps & { onClick?: () => void }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const displayImage = imageUrl || thumbnailUrl;
  const isVideo = !!videoUrl;
  const isYouTube = source === "youtube";
  const isInstagram = source === "instagram";
  const isGitHub = source === "github";

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
    <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
      <div className="text-white/60 text-sm">
        {isYouTube && "📺"}
        {isInstagram && "📷"}
        {isGitHub && "💻"}
        <span className="ml-2">
          {isYouTube && "Video"}
          {isInstagram && (isVideo ? "Video" : "Image")}
          {isGitHub && "Activity"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-colors cursor-pointer" onClick={onClick}>
      {/* Media Section */}
      {displayImage && !imageError ? (
        <div className="relative w-full h-48 bg-white/5">
          {isLoading && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-t-lg" />
          )}
          <Image
            src={displayImage}
            alt={title || "Media content"}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={false}
            unoptimized={true}
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        renderPlaceholder()
      )}

      {/* Content Section */}
      <div className="p-4">
        {/* Source Badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isYouTube
                ? "bg-red-500/20 text-red-300"
                : isInstagram
                ? "bg-pink-500/20 text-pink-300"
                : "bg-purple-500/20 text-purple-300"
            }`}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </span>
          <span className="text-xs text-white/60">{formatDate(timestamp)}</span>
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

        {/* Action Button */}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors"
          >
            View {isYouTube ? "Video" : isInstagram ? "Post" : "Activity"}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}