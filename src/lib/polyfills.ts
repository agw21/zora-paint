
// Polyfill for Node.js process in browser environment
if (typeof window !== 'undefined' && !window.process) {
  window.process = { env: {} } as any;
}

// Ensure global is available
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}
