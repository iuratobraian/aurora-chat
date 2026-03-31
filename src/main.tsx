
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { registerServiceWorker } from '../lib/serviceWorker';
import logger from './utils/logger';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { CONFIGS } from './config';

const convexUrl = CONFIGS.convex.url;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL is not configured. Please set it in your .env file.');
}
const convex = new ConvexReactClient(convexUrl);

if (import.meta.env.PROD) {
  registerServiceWorker();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la app.");
}

window.onerror = (message, source, lineno, colno, error) => {
  logger.error('Global window error:', { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  logger.error('Unhandled promise rejection:', event.reason);
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ConvexProvider client={convex}>
          <GlobalErrorHandler>
            <App />
          </GlobalErrorHandler>
        </ConvexProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      logger.error('SW registration failed:', error);
    });
  });
}
