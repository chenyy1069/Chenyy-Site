import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Self-hosted fonts: Google Fonts is unreliable from mainland China.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-mono/latin-400.css';
import '@fontsource/dm-mono/latin-500.css';
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

// Chinese serif: ~100 unicode-range chunks, of which browsers fetch only those
// in use. Its @font-face list alone is ~50 KB, so load it off the critical path.
import('@fontsource/noto-serif-sc/400.css');

// For whoever opens DevTools.
const WORDMARK = 'font: 600 28px "DM Sans", sans-serif;';
console.log('%cchenyy%c.%ccc', WORDMARK, `${WORDMARK} color: #c44327;`, WORDMARK);
console.log('%cgithub.com/chenyy1069', 'font-family: monospace; color: #8a8a80;');
