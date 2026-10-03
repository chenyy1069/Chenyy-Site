import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// For whoever opens DevTools.
console.log('%c🌀 ChenYY', 'font: italic 32px "Instrument Serif", serif; color: #7ee6ff;');
console.log('%cyou opened the back door. hi.  →  github.com/chenyy1069', 'font-family: monospace; color: #8a8a8a;');
