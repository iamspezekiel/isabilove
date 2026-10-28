import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Intercept and suppress benign browser-extension / disconnected-port messaging errors
// (e.g. "Could not establish connection. Receiving end does not exist.")
if (typeof window !== 'undefined') {
  const isExtensionMessageError = (msg: string) => {
    return (
      msg.includes('Could not establish connection. Receiving end does not exist') ||
      msg.includes('message channel closed') ||
      msg.includes('The message port closed before a response was received') ||
      msg.includes('ResizeObserver loop completed with undelivered notifications') ||
      msg.includes('ResizeObserver loop limit exceeded')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (typeof reason === 'string' ? reason : reason?.message || '') + '';
    if (isExtensionMessageError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isExtensionMessageError(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
