import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { pwaService } from './services/pwaService'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  pwaService.registerServiceWorker().then((registered) => {
    if (registered) {
      console.log('[PWA] Service worker registered successfully');
    }
  });

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    (window as any).deferredPrompt = e;
  });
}

createRoot(document.getElementById("root")!).render(<App />);
