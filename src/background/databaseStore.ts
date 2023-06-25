// src/background/databaseStore.ts

import { WindowStore, createWindowStore } from './windowStore';

type DatabaseStore = {
  lastFocusedWindowId: chrome.windows.Window['id'];
  windowStores: { [K in string]: WindowStore };
  activeWindowStore: WindowStore;

  init: () => Promise<void>;
  setLastFocusedWindowId: (
    lastFocusedWindowId: chrome.windows.Window['id']
  ) => void;
};

async function getAllOpenWindows(): Promise<chrome.windows.Window[]> {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(windows);
      }
    });
  });
}

async function getLastFocusedWindow(): Promise<chrome.windows.Window> {
  return new Promise((resolve, reject) => {
    chrome.windows.getLastFocused((window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(window);
      }
    });
  });
}

const databaseStore: DatabaseStore = {
  lastFocusedWindowId: -1,
  windowStores: {},
  activeWindowStore: createWindowStore(),

  async init() {
    const windows = await getAllOpenWindows();

    windows.forEach((window) => {
      if (window.id !== undefined) {
        this.windowStores[window.id] = createWindowStore();
      }
    });

    const lastFocusedWindow = await getLastFocusedWindow();
    this.setLastFocusedWindowId(lastFocusedWindow.id);
  },

  setLastFocusedWindowId(lastFocusedWindowId) {
    if (lastFocusedWindowId === undefined) {
      throw new Error('No active window');
    }

    this.lastFocusedWindowId = lastFocusedWindowId;
    this.activeWindowStore = this.windowStores[this.lastFocusedWindowId];
  },
};

export default databaseStore;
