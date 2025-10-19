import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Suppress ResizeObserver errors (harmless React warnings)
const resizeObserverErrFilter = (error) => {
  if (
    error.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    error.message === 'ResizeObserver loop limit exceeded'
  ) {
    return;
  }
  console.error(error);
};

// Override console.error
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
    return;
  }
  originalError.apply(console, args);
};

// Add global error handler
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
