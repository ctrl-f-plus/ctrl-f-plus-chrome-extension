// src/background/index.ts

import {
  startListeners,
  csLoaded,
  startOnInstalledListener,
} from './listeners';
import store from './store/databaseStore';
import updateStoreForTesting from './utils/testUtils';

startOnInstalledListener();

store.init().then(() => {
  if (process.env.E2E_TESTING === 'true') {
    updateStoreForTesting();
  }

  startListeners();

  if (csLoaded) {
    store.activeWindowStore.sendToContentScripts();
  }
});
