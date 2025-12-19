
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Main entry point for the HueHarmony AI Boutique application.
 * Renders the modular App component which contains the application logic and routing.
 */
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
