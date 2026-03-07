
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <App />
          <ToastContainer />
        </ToastProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
