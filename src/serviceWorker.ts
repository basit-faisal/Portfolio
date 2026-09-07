import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    registerSW({
      onNeedRefresh() {
        // Handle PWA update available
        if (confirm('New content available. Reload?')) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }
} 