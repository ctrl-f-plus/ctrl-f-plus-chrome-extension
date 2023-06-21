// src/background/background.ts

import { Store } from '../types/Store.types';
import { startListeners } from './chromeListeners';
import { initStore, sendStoreToContentScripts, updateStore } from './store';

let store: Store;

function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];

    updateStore(windowStore, {
      showLayover: true,
      showMatches: true,
    });
  });
}

initStore().then((initializedStore) => {
  store = initializedStore;

  const lastFocusedWindowId = store?.lastFocusedWindowId;

  if (lastFocusedWindowId === undefined) {
    return;
  }

  // const activeWindowStore = getActiveWindowStore(); //FIXME: refactor/DRY as this is the same as the next line
  const lastFocusedWindowStore = store.windowStores[lastFocusedWindowId];
  // TODO: verify that `lastFocusedWindowStore` will never be undefined
  // if (lastFocusedWindowStore) {
  //   return;
  // }

  if (process.env.E2E_TESTING === 'true') {
    updateStoreForTesting();
  }
  sendStoreToContentScripts(lastFocusedWindowStore);

  startListeners(store);
});
