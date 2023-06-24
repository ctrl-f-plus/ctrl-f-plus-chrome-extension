// src/background/databaseStore.ts

import { WindowStore, createWindowStore } from './windowStore';

type DatabaseStore = {
  lastFocusedWindowId: chrome.windows.Window['id'];
  windowStores: {
    [K in number]: WindowStore;
  };

  init: () => Promise<void>;
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
        this.lastFocusedWindowId = window.id;
      }
    });
  },
};

export default databaseStore;
