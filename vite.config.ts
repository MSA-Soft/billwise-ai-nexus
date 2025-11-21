import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Plugin to ensure React vendor loads first
const reactFirstPlugin = () => ({
  name: 'react-first',
  transformIndexHtml: {
    enforce: 'post',
    transform(html: string) {
      // Find all modulepreload links
      const modulepreloadRegex = /<link rel="modulepreload"[^>]*>/gi;
      const modulepreloadMatches = html.match(modulepreloadRegex) || [];
      
      // Separate react-vendor from others
      const reactVendorLinks: string[] = [];
      const otherLinks: string[] = [];
      
      modulepreloadMatches.forEach(link => {
        if (link.includes('react-vendor')) {
          reactVendorLinks.push(link);
        } else {
          otherLinks.push(link);
        }
      });
      
      // Remove all modulepreload links
      html = html.replace(modulepreloadRegex, '');
      
      // Find the main script tag
      const scriptMatch = html.match(/(<script[^>]*type="module"[^>]*><\/script>)/i);
      if (scriptMatch && reactVendorLinks.length > 0) {
        // Insert react-vendor links FIRST, then other links, then the script
        const newLinks = [...reactVendorLinks, ...otherLinks].join('\n    ');
        html = html.replace(
          scriptMatch[0],
          `${newLinks}\n    ${scriptMatch[0]}`
        );
      } else if (reactVendorLinks.length > 0) {
        // If no script tag found, insert before closing body tag
        html = html.replace(
          '</body>',
          `    ${reactVendorLinks.join('\n    ')}\n    ${otherLinks.join('\n    ')}\n  </body>`
        );
      }
      
      return html;
    }
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
            
            // Don't put React-dependent libraries in vendor chunk
            // They should be in separate chunks that depend on react-vendor
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
            // Other node_modules (but NOT react/react-dom or React-dependent libs)
            // IMPORTANT: Don't put anything that uses React in the vendor chunk
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
