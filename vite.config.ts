import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to ensure React vendor loads first
const reactFirstPlugin = () => ({
  name: 'react-first',
  transformIndexHtml(html: string) {
    // Reorder modulepreload links to ensure react-vendor loads first
    const reactVendorRegex = /<link rel="modulepreload"[^>]*react-vendor[^>]*>/i;
    const reactVendorMatch = html.match(reactVendorRegex);
    if (reactVendorMatch) {
      // Remove react-vendor from its current position
      html = html.replace(reactVendorRegex, '');
      // Insert it right after the main script tag
      html = html.replace(
        /(<script[^>]*index[^>]*><\/script>)/i,
        `$1\n    ${reactVendorMatch[0]}`
      );
    }
    return html;
  }
});

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
    reactFirstPlugin(),
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
          // CRITICAL: React and React-DOM must be in their own chunk that loads FIRST
          // This ensures React is available before any other chunks that depend on it
          if (id.includes('node_modules')) {
            // Put React in its own chunk that will load first
            if (id.includes('/react/') || 
                id.includes('/react-dom/') ||
                id.includes('\\react\\') ||
                id.includes('\\react-dom\\') ||
                id.includes('react/jsx-runtime') ||
                id.includes('react/jsx-dev-runtime')) {
              return 'react-vendor'; // Separate chunk for React
            }
            
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
            // Other node_modules (but NOT react/react-dom)
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
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
}));
