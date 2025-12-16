import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';

interface ComponentCacheContextType {
  getCachedComponent: (key: string, factory: () => ReactNode) => ReactNode;
  clearCache: (key?: string) => void;
}

const ComponentCacheContext = createContext<ComponentCacheContextType | undefined>(undefined);

export const ComponentCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use ref to store cache - no state updates during render
  const cacheRef = useRef<Map<string, ReactNode>>(new Map());
  const [, forceUpdate] = useState({});

  const getCachedComponent = (key: string, factory: () => ReactNode): ReactNode => {
    // Check ref synchronously (no state update during render)
    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }
    
    // If not in cache, create component and store in ref
    const component = factory();
    cacheRef.current.set(key, component);
    
    // Schedule a state update after render to trigger re-render if needed
    // This is safe because it's deferred
    setTimeout(() => {
      forceUpdate({});
    }, 0);
    
    return component;
  };

  const clearCache = (key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        cacheRef.current.delete(key);
        return newCache;
      });
    } else {
      setCache(new Map());
      cacheRef.current.clear();
      pendingUpdatesRef.current.clear();
    }
  };

  return (
    <ComponentCacheContext.Provider value={{ getCachedComponent, clearCache }}>
      {children}
    </ComponentCacheContext.Provider>
  );
};

export const useComponentCache = () => {
  const context = useContext(ComponentCacheContext);
  if (!context) {
    throw new Error('useComponentCache must be used within ComponentCacheProvider');
  }
  return context;
};

