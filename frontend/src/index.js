import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// ULTRA AGGRESSIVE ResizeObserver error suppression
// Intercept at the lowest possible level

// 1. Patch ResizeObserver constructor itself
if (typeof window !== 'undefined') {
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        // Wrap callback to catch errors
        try {
          callback(entries, observer);
        } catch (error) {
          if (error.message && error.message.includes('ResizeObserver')) {
            // Silently ignore
            return;
          }
          throw error;
        }
      });
    }
  };
}

// 2. Override window.onerror (highest priority)
window.onerror = function(message, source, lineno, colno, error) {
  if (message && typeof message === 'string' && message.includes('ResizeObserver')) {
    return true; // Prevent default handling
  }
  return false;
};

// 3. Override error event in capture phase
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ResizeObserver')) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
}, true);

// 4. Override unhandledrejection
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

// 5. Override console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = function(...args) {
  const message = args[0];
  if (message && typeof message === 'string' && message.includes('ResizeObserver')) {
    return; // Suppress
  }
  if (message && message.message && message.message.includes('ResizeObserver')) {
    return; // Suppress error objects
  }
  originalConsoleError.apply(console, args);
};

console.warn = function(...args) {
  const message = args[0];
  if (message && typeof message === 'string' && message.includes('ResizeObserver')) {
    return; // Suppress
  }
  originalConsoleWarn.apply(console, args);
};

// 6. Create Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (error.message && error.message.includes('ResizeObserver')) {
      return { hasError: false }; // Don't show error UI
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message && error.message.includes('ResizeObserver')) {
      // Suppress ResizeObserver errors
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
