import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ComponentCacheContextType {
  getCachedComponent: (key: string, factory: () => ReactNode) => ReactNode;
  clearCache: (key?: string) => void;
}

const ComponentCacheContext = createContext<ComponentCacheContextType | undefined>(undefined);

export const ComponentCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Map<string, ReactNode>>(new Map());

  const getCachedComponent = (key: string, factory: () => ReactNode): ReactNode => {
    if (!cache.has(key)) {
      const component = factory();
      setCache(prev => new Map(prev).set(key, component));
      return component;
    }
    return cache.get(key)!;
  };

  const clearCache = (key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    } else {
      setCache(new Map());
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

