import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Feature chunks
          'auth': ['./src/contexts/AuthContext.tsx', './src/components/ProtectedRoute.tsx'],
          'billing': ['./src/components/BillingWorkflow.tsx', './src/components/BillingModule.tsx'],
          'collections': ['./src/components/CollectionsManagement.tsx'],
          'analytics': ['./src/components/ReportsAnalytics.tsx'],
        },
      },
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
}));
