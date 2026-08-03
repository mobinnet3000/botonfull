import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './core/providers/AppProviders';
import { App } from './app/App';
import { AppErrorBoundary } from './shared/components/AppErrorBoundary';
import './core/theme/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>,
);