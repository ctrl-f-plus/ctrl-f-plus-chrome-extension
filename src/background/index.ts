// src/background/index.ts

import startListeners, { csLoaded } from './listeners';
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

  // if (csLoaded) {
  //   store.activeWindowStore.sendToContentScripts();
  // }
});
