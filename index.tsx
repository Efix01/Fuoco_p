import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import 'leaflet/dist/leaflet.css';

// Global Error Handler for non-React errors
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="color: red; padding: 20px; font-family: monospace; background: white; height: 100vh;">
        <h1>CRITICAL SYSTEM ERROR</h1>
        <h3>${message}</h3>
        <p>Source: ${source}:${lineno}:${colno}</p>
        <pre>${error?.stack || 'No stack trace'}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer; margin-top: 20px;">RELOAD SYSTEM</button>
      </div>
    `;
  }
  console.error("Global Catch:", error);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);