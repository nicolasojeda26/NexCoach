import React from 'react';
import ReactDOM from 'react-dom/client';
// Tipografía incluida en la app (funciona sin internet y dentro del APK)
import '@fontsource-variable/plus-jakarta-sans';
import App from './App.jsx';
import './index.css';
import { setupPlatform } from './platform/setup';

setupPlatform();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
