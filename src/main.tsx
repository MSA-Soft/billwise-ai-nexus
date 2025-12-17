import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { pwaService } from './services/pwaService'

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  pwaService.registerServiceWorker().then((registered) => {
    if (registered) {
      console.log('[PWA] Service worker registered successfully');
    }
  }).catch((error) => {
    console.warn('[PWA] Service worker registration failed:', error);
  });

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    (window as any).deferredPrompt = e;
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // In development, unregister any existing service workers to prevent caching issues
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then(() => {
        console.log('[PWA] Unregistered service worker in development mode');
      });
    });
  });

  // Also clear caches in development so old cached JS bundles can't cause "mystery refreshes"
  // or mixed-code behavior when returning to a backgrounded tab.
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName).then((deleted) => {
          if (deleted) {
            console.log('[PWA] Deleted cache in development mode:', cacheName);
          }
        });
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
