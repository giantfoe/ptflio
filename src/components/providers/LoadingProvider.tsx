'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
  initialLoadingDuration?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  initialLoadingDuration = 3000, // 3 seconds default
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialLoadingDuration);

    return () => clearTimeout(timer);
  }, [initialLoadingDuration]);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const value: LoadingContextType = {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};