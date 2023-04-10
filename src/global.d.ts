// src/global.d.ts

declare global {
  interface Window {
    requestIdleCallback: (callback: () => void) => void;
  }
}

export {};
