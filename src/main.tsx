import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import { initPwa } from './pwa/pwa';
import { PwaPrompts } from './pwa/PwaPrompts';

// Before React mounts: Chrome fires beforeinstallprompt early and only once.
initPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <PwaPrompts />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
