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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // SIMPLIFIED: Keep React in main bundle to avoid loading order issues
          // Only split large non-React dependencies
          if (id.includes('node_modules')) {
            // Keep React in main bundle - don't split it
            if (id.includes('/react/') || 
                id.includes('/react-dom/') ||
                id.includes('\\react\\') ||
                id.includes('\\react-dom\\') ||
                id.includes('react/jsx-runtime') ||
                id.includes('react/jsx-dev-runtime')) {
              return undefined; // Keep in main bundle
            }
            
            // Split other large vendors
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Put other node_modules in vendor chunk
            return 'vendor';
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
