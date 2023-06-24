// src/background/databaseStore.ts

import { WindowStore, createWindowStore } from './windowStore';

type DatabaseStore = {
  lastFocusedWindowId: chrome.windows.Window['id'];
  windowStores: { [K in number]: WindowStore };
  activeWindowStore: WindowStore;
  latest?: number;

  init: () => Promise<void>;
  getActiveWindowStore: () => WindowStore;
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

const databaseStore: DatabaseStore = {
  lastFocusedWindowId: -1,
  windowStores: {},

  async init() {
    const windows = await getAllOpenWindows();

    windows.forEach((window) => {
      if (window.id !== undefined) {
        this.windowStores[window.id] = createWindowStore();
        // this.lastFocusedWindowId = window.id;
        this.setLastFocusedWindowId(window.id); // FIXME: this should not happen in the loop
      }
    });
  },

  getActiveWindowStore(): WindowStore {
    if (this.lastFocusedWindowId === undefined) {
      throw new Error('No active window');
    }

    return this.windowStores[this.lastFocusedWindowId];
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
