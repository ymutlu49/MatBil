import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { initTelemetry } from './utils/telemetry';
import './styles/animations.css';
import './styles/game-animations.css';

// Telemetri — Sentry DSN tanımlıysa init (fire-and-forget, render'ı bekletmez)
initTelemetry().catch(() => {});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
