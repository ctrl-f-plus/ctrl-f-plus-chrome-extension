// src/background/background.ts

import {} from '../types/Store.types';
import { startListeners } from './chromeListeners';
import { sendStoreToContentScripts } from './store';
import store from './databaseStore';

function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];

    windowStore.toggleShowFileds(true);
  });
}

store.init().then(() => {
  const lastFocusedWindowId = store?.lastFocusedWindowId;

  if (lastFocusedWindowId === undefined) {
    return;
  }

  // const activeWindowStore = getActiveWindowStore(); //FIXME: refactor/DRY as this is the same as the next line
  const lastFocusedWindowStore = store.windowStores[lastFocusedWindowId];

  if (process.env.E2E_TESTING === 'true') {
    updateStoreForTesting();
  }
  sendStoreToContentScripts(lastFocusedWindowStore);

  startListeners();
});
