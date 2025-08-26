"use client";
import { useState, useEffect, useRef } from "react";
import { X, ExternalLink, AlertCircle, Instagram } from "lucide-react";

interface InstagramEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postUrl: string;
  title?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
}

export default function InstagramEmbedModal({ isOpen, onClose, postId, postUrl, title, thumbnailUrl, imageUrl }: InstagramEmbedModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Instagram embed URL
  const embedUrl = `https://www.instagram.com/p/${postId}/embed/`;

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setEmbedLoaded(false);
      
      // Reset state when modal opens
      const timer = setTimeout(() => {
        if (!embedLoaded) {
          setHasError(true);
          setIsLoading(false);
          // Show fallback image if available after embed fails
          if (thumbnailUrl || imageUrl) {
            setShowFallback(true);
          }
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    }
  }, [isOpen, postId, embedLoaded]);

  // Handle escape key and focus management
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      
      // Trap focus within modal
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      document.addEventListener('keydown', trapFocus);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', trapFocus);
      };
    }
  }, [isOpen, onClose]);

  const handleEmbedLoad = () => {
    setIsLoading(false);
    setEmbedLoaded(true);
    setHasError(false);
  };

  const handleEmbedError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        ref={modalRef}
        className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instagram-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-pink-400" />
            <h2 id="instagram-modal-title" className="text-white font-medium">
              {title || 'Instagram Post'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Open on Instagram"
              aria-label="Open post on Instagram"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mb-4"></div>
              <p className="text-white/80 text-sm">Loading Instagram post...</p>
              <p className="text-white/60 text-xs mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Error State with Fallback */}
          {hasError && (
            <div className="py-6 px-4">
              {/* Show fallback image if available */}
              {showFallback && (thumbnailUrl || imageUrl) ? (
                <div className="mb-6">
                  <div className="relative w-full h-64 bg-white/5 rounded-lg overflow-hidden mb-4">
                    <img
                      src={thumbnailUrl || imageUrl}
                      alt={title || 'Instagram post'}
                      className="w-full h-full object-cover"
                      onError={() => setShowFallback(false)}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
                        <Instagram className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                        <p className="text-gray-800 text-sm font-medium">Preview Image</p>
                        <p className="text-gray-600 text-xs">Embed unavailable</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 mb-6">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                  <h3 className="text-white font-medium mb-2">Unable to load embed</h3>
                </div>
              )}
              
              <div className="text-center">
                <p className="text-white/80 text-sm mb-4">
                  {retryCount > 0 
                    ? "Still having trouble loading the embed. This might be due to privacy settings, network issues, or Instagram's embed restrictions."
                    : "The Instagram post couldn't be embedded. This might be due to privacy settings or network issues."
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    View on Instagram
                  </a>
                  
                  {retryCount < 2 && (
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        setHasError(false);
                        setEmbedLoaded(false);
                        setShowFallback(false);
                        setRetryCount(prev => prev + 1);
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Try Again {retryCount > 0 && `(${retryCount + 1}/3)`}
                    </button>
                  )}
                  
                  {!showFallback && (thumbnailUrl || imageUrl) && (
                    <button
                      onClick={() => setShowFallback(true)}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                    >
                      Show Preview
                    </button>
                  )}
                </div>
                
                {retryCount >= 2 && (
                  <p className="text-white/60 text-xs mt-3">
                    💡 Tip: Some Instagram posts may not be embeddable due to privacy settings or account restrictions.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Instagram Embed */}
          {!hasError && (
            <div className="relative">
              <iframe
                src={embedUrl}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                onLoad={handleEmbedLoad}
                onError={handleEmbedError}
                className={`w-full transition-opacity duration-300 ${
                  isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                title={`Instagram post ${postId}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Instagram className="w-3 h-3" />
              <span>Content from Instagram</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Post ID: {postId}</span>
              <a
                href="https://help.instagram.com/581066165581870"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Embed Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}