// src/background/background.ts

import {} from '../types/Store.types';
import { startListeners } from './chromeListeners';
import store from './databaseStore';
import { sendStoreToContentScripts } from './store';

function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];

    windowStore.toggleShowFileds(true);
  });
}

store.init().then(() => {
  if (process.env.E2E_TESTING === 'true') {
    updateStoreForTesting();
  }

  sendStoreToContentScripts(store.activeWindowStore);
  startListeners();
});
