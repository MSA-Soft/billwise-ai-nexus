// Performance utilities for BillWise AI Nexus

// Virtual scrolling for large lists
export const createVirtualScrollConfig = (
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => ({
  itemHeight,
  containerHeight,
  overscan,
  getVisibleRange: (scrollTop: number) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      start + overscan
    );
    return { start, end };
  },
});

// Image optimization utilities
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!url) return url;
  
  // For external images, you might want to use a service like Cloudinary
  // For now, return the original URL
  return url;
};

// Bundle size optimization
export const createChunkConfig = () => ({
  // Split vendor chunks
  vendor: ['react', 'react-dom', '@supabase/supabase-js'],
  
  // Split UI components
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  
  // Split heavy components
  heavy: ['chart.js', 'date-fns', 'lodash'],
});

// Memory management
export const createMemoryManager = () => {
  const cache = new Map();
  const maxSize = 100; // Maximum number of cached items

  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: any) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    clear: () => cache.clear(),
    size: () => cache.size,
  };
};

// Performance monitoring
export const performanceMonitor = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
  },
  
  measure: (label: string, fn: () => void) => {
    performanceMonitor.start(label);
    const result = fn();
    performanceMonitor.end(label);
    return result;
  },
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Data pagination
export const createPagination = <T>(
  data: T[],
  pageSize: number = 10
) => {
  const totalPages = Math.ceil(data.length / pageSize);
  
  return {
    getPage: (page: number) => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return data.slice(start, end);
    },
    totalPages,
    totalItems: data.length,
    pageSize,
  };
};

// Search optimization
export const createSearchIndex = <T>(
  data: T[],
  searchFields: (keyof T)[]
) => {
  const index = new Map<string, T[]>();
  
  data.forEach((item) => {
    searchFields.forEach((field) => {
      const value = String(item[field]).toLowerCase();
      const words = value.split(/\s+/);
      
      words.forEach((word) => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word)!.push(item);
      });
    });
  });
  
  return {
    search: (query: string): T[] => {
      const words = query.toLowerCase().split(/\s+/);
      const results = new Set<T>();
      
      words.forEach((word) => {
        const matches = index.get(word) || [];
        matches.forEach((item) => results.add(item));
      });
      
      return Array.from(results);
    },
  };
};
