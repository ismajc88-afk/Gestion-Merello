
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';
import { PWABadge } from './components/PWABadge';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <App />
          <ToastContainer />
          <PWABadge />
        </ToastProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
