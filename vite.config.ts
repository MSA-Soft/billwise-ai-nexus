import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// No longer needed - React is in main bundle

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure React resolves to a single instance
    dedupe: ['react', 'react-dom'],
  },
  // Optimize dependencies to prevent multiple React instances
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Force pre-bundling of React to ensure single instance
    esbuildOptions: {
      resolveExtensions: ['.jsx', '.js', '.ts', '.tsx'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // AGGRESSIVE APPROACH: Keep ALL React and React-dependent packages in main bundle
          // Only split truly safe, non-React dependencies
          if (id.includes('node_modules')) {
            // Keep React core in main bundle - don't split it
            if (id.includes('/react/') || 
                id.includes('/react-dom/') ||
                id.includes('\\react\\') ||
                id.includes('\\react-dom\\') ||
                id.includes('react/jsx-runtime') ||
                id.includes('react/jsx-dev-runtime') ||
                id.includes('scheduler')) {
              return undefined; // Keep in main bundle
            }
            
            // AGGRESSIVE: Keep ALL packages that could potentially use React
            // This includes any package with "react" in the name, UI libraries, hooks, etc.
            if (id.includes('react') ||
                id.includes('@radix-ui') ||
                id.includes('@tanstack') ||
                id.includes('react-router') ||
                id.includes('react-hook-form') ||
                id.includes('@hookform') ||
                id.includes('react-day-picker') ||
                id.includes('react-resizable-panels') ||
                id.includes('react-remove-scroll') ||
                id.includes('react-transition-group') ||
                id.includes('react-smooth') ||
                id.includes('sonner') ||
                id.includes('vaul') ||
                id.includes('next-themes') ||
                id.includes('embla-carousel') ||
                id.includes('input-otp') ||
                id.includes('cmdk') ||
                id.includes('lucide-react') ||
                id.includes('recharts') ||
                id.includes('use-') ||  // Any package with "use-" prefix (likely hooks)
                id.includes('@floating-ui') ||  // Used by Radix UI
                id.includes('@dnd-kit') ||  // Drag and drop (might use React)
                id.includes('framer-motion') ||  // Animation library (uses React)
                id.includes('zustand') ||  // State management (might use React)
                id.includes('jotai') ||  // State management (uses React)
                id.includes('recoil') ||  // State management (uses React)
                id.includes('mobx-react') ||  // State management (uses React)
                id.includes('redux-react') ||  // State management (uses React)
                id.includes('react-query') ||
                id.includes('react-window') ||
                id.includes('react-virtual') ||
                id.includes('react-beautiful-dnd') ||
                id.includes('react-dnd') ||
                id.includes('react-select') ||
                id.includes('react-datepicker') ||
                id.includes('react-dropzone') ||
                id.includes('react-hot-toast') ||
                id.includes('react-toastify') ||
                id.includes('react-modal') ||
                id.includes('react-portal') ||
                id.includes('react-helmet') ||
                id.includes('react-helmet-async')) {
              return undefined; // Keep in main bundle with React
            }
            
            // Only split truly safe, non-React dependencies
            // These are known to NOT use React at all
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor';
            }
            
            // Keep everything else in main bundle to be safe
            // Only split if we're 100% certain it doesn't use React
            return undefined; // Keep in main bundle by default
          }
          
          // Feature chunks - split large components
          if (id.includes('/src/components/')) {
            if (id.includes('EligibilityVerification') || id.includes('eligibility')) {
              return 'eligibility';
            }
            if (id.includes('EnhancedClaims') || id.includes('EnhancedClaim')) {
              return 'enhanced-claims';
            }
            if (id.includes('Authorization') || id.includes('authorization')) {
              return 'authorization';
            }
            if (id.includes('Billing') || id.includes('billing')) {
              return 'billing';
            }
            if (id.includes('ReportsAnalytics') || id.includes('analytics')) {
              return 'analytics';
            }
            if (id.includes('Collections') || id.includes('collections')) {
              return 'collections';
            }
            if (id.includes('Patient') || id.includes('patient')) {
              return 'patient';
            }
            if (id.includes('Schedule') || id.includes('scheduling')) {
              return 'scheduling';
            }
          }
          
          // Service chunks
          if (id.includes('/src/services/')) {
            return 'services';
          }
        },
        // Ensure React vendor chunk loads before other chunks
        chunkFileNames: (chunkInfo) => {
          // React vendor must be named first to ensure it loads first
          if (chunkInfo.name === 'react-vendor') {
            return 'assets/react-vendor-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // Ensure proper chunk dependencies
        // This tells Rollup that vendor chunk depends on react-vendor
        // However, we'll handle loading order in the HTML transform plugin
        // Ensure proper entry point order
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    // Enable source maps for debugging (disable in production for smaller builds)
    sourcemap: mode === 'development',
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure proper module resolution
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
}));
