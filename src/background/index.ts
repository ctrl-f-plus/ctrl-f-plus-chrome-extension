// src/background/background.ts

import { startListeners } from './chromeListeners';
import store from './databaseStore';
import { sendStoreToContentScripts } from './store';

function updateStoreForTesting() {
  Object.keys(store.windowStores).forEach((windowId) => {
    const windowStore = store.windowStores[windowId];
    windowStore.toggleShowFields(true);
  });
}

store.init().then(() => {
  if (process.env.E2E_TESTING === 'true') {
    updateStoreForTesting();
  }

  startListeners();
  sendStoreToContentScripts(store.activeWindowStore);
});
