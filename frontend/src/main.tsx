import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 注册service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}