// src/background/background.ts

import startListeners from './listeners';
import store from './store/databaseStore';

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

  store.activeWindowStore.sendToContentScripts();
});
